import { prisma } from '../lib/prisma';
import { Role, Prisma } from '@prisma/client';
import { AuthContext } from '../types/auth';
import { buildVisibilityWhere } from '../middleware/auth.middleware';
import {
  CreateUseCaseInput,
  UpdateUseCaseInput,
  ScoreUseCaseInput,
  UseCaseQueryInput,
} from '../validators/usecase.validator';

function calculateCompositeScore(
  businessImpact?: number | null,
  feasibility?: number | null,
  strategicAlignment?: number | null
): number | null {
  if (businessImpact == null || feasibility == null || strategicAlignment == null) {
    return null;
  }
  return (businessImpact + feasibility + strategicAlignment) / 3;
}

export class UseCaseService {
  async create(input: CreateUseCaseInput, submitterId: string) {
    const { toolIds, ...useCaseData } = input;

    const useCase = await prisma.$transaction(async (tx) => {
      const created = await tx.useCase.create({
        data: {
          ...useCaseData,
          submitterId,
        },
      });

      if (toolIds && toolIds.length > 0) {
        await tx.useCaseTool.createMany({
          data: toolIds.map((toolId) => ({
            useCaseId: created.id,
            toolId,
          })),
        });
      }

      return tx.useCase.findUnique({
        where: { id: created.id },
        include: {
          submitter: {
            select: { id: true, name: true, email: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
          tools: {
            include: {
              tool: true,
            },
          },
        },
      });
    });

    if (!useCase) {
      throw new Error('Failed to create use case');
    }

    return {
      ...useCase,
      tools: useCase.tools.map((ut) => ut.tool),
    };
  }

  async findAll(query: UseCaseQueryInput, auth?: AuthContext) {
    const { page, limit, search, status, approvalStatus, submitterId, ownerId, sortBy, sortOrder } = query;

    const where: Prisma.UseCaseWhereInput = {};

    // Apply visibility filtering if auth context provided
    if (auth) {
      const visibilityWhere = buildVisibilityWhere(auth);
      if (visibilityWhere.OR) {
        where.AND = [visibilityWhere];
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { problemStatement: { contains: search, mode: 'insensitive' } },
        { clientProject: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (approvalStatus) where.approvalStatus = approvalStatus;
    if (submitterId) where.submitterId = submitterId;
    if (ownerId) where.ownerId = ownerId;

    const [useCases, total] = await Promise.all([
      prisma.useCase.findMany({
        where,
        include: {
          submitter: {
            select: { id: true, name: true, email: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
          tools: {
            include: {
              tool: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.useCase.count({ where }),
    ]);

    // Transform tools relation to flat array
    const transformedUseCases = useCases.map((uc) => ({
      ...uc,
      tools: uc.tools.map((ut) => ut.tool),
    }));

    return { useCases: transformedUseCases, total, page, limit };
  }

  async findById(id: string) {
    const useCase = await prisma.useCase.findUnique({
      where: { id },
      include: {
        submitter: {
          select: { id: true, name: true, email: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
        tools: {
          include: {
            tool: true,
          },
        },
      },
    });

    if (!useCase) {
      throw new Error('Use case not found');
    }

    return {
      ...useCase,
      tools: useCase.tools.map((ut) => ut.tool),
    };
  }

  async update(
    id: string,
    input: UpdateUseCaseInput,
    userId: string,
    userRole: Role
  ) {
    const useCase = await this.findById(id);

    // Check permissions: owner can edit own, committee/admin can edit any
    const isOwner = useCase.submitterId === userId;
    const canEditAny = userRole === Role.COMMITTEE || userRole === Role.ADMIN;

    if (!isOwner && !canEditAny) {
      throw new Error('You do not have permission to edit this use case');
    }

    const { toolIds, ...useCaseData } = input;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.useCase.update({
        where: { id },
        data: useCaseData,
      });

      if (toolIds !== undefined) {
        // Delete existing tool associations
        await tx.useCaseTool.deleteMany({
          where: { useCaseId: id },
        });

        // Create new associations
        if (toolIds.length > 0) {
          await tx.useCaseTool.createMany({
            data: toolIds.map((toolId) => ({
              useCaseId: id,
              toolId,
            })),
          });
        }
      }

      return tx.useCase.findUnique({
        where: { id },
        include: {
          submitter: {
            select: { id: true, name: true, email: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
          tools: {
            include: {
              tool: true,
            },
          },
        },
      });
    });

    if (!updated) {
      throw new Error('Failed to update use case');
    }

    return {
      ...updated,
      tools: updated.tools.map((ut) => ut.tool),
    };
  }

  async score(id: string, input: ScoreUseCaseInput, userRole: Role) {
    // Only committee and admin can score
    if (userRole !== Role.COMMITTEE && userRole !== Role.ADMIN) {
      throw new Error('Only committee members and admins can score use cases');
    }

    const useCase = await this.findById(id);

    const newBusinessImpact = input.businessImpact ?? useCase.businessImpact;
    const newFeasibility = input.feasibility ?? useCase.feasibility;
    const newStrategicAlignment = input.strategicAlignment ?? useCase.strategicAlignment;
    const compositeScore = calculateCompositeScore(newBusinessImpact, newFeasibility, newStrategicAlignment);

    const updated = await prisma.useCase.update({
      where: { id },
      data: {
        businessImpact: input.businessImpact,
        feasibility: input.feasibility,
        strategicAlignment: input.strategicAlignment,
        approvalStatus: input.approvalStatus,
        ownerId: input.ownerId,
        notes: input.notes,
        compositeScore,
      },
      include: {
        submitter: {
          select: { id: true, name: true, email: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
        tools: {
          include: {
            tool: true,
          },
        },
      },
    });

    return {
      ...updated,
      tools: updated.tools.map((ut) => ut.tool),
    };
  }

  async delete(id: string) {
    await this.findById(id);

    await prisma.useCase.delete({
      where: { id },
    });

    return { message: 'Use case deleted successfully' };
  }
}

export const useCaseService = new UseCaseService();
