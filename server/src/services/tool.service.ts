import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateToolInput,
  UpdateToolInput,
  ToolQueryInput,
} from '../validators/tool.validator';

export class ToolService {
  async create(input: CreateToolInput) {
    const tool = await prisma.tool.create({
      data: input,
    });
    return tool;
  }

  async findAll(query: ToolQueryInput) {
    const { page, limit, search } = query;

    const where: Prisma.ToolWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tool.count({ where }),
    ]);

    return { tools, total, page, limit };
  }

  async findById(id: string) {
    const tool = await prisma.tool.findUnique({
      where: { id },
    });

    if (!tool) {
      throw new Error('Tool not found');
    }

    return tool;
  }

  async update(id: string, input: UpdateToolInput) {
    await this.findById(id);

    const updated = await prisma.tool.update({
      where: { id },
      data: input,
    });

    return updated;
  }

  async delete(id: string) {
    await this.findById(id);

    await prisma.tool.delete({
      where: { id },
    });

    return { message: 'Tool deleted successfully' };
  }
}

export const toolService = new ToolService();
