import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { UpdateUserInput, UserQueryInput } from '../validators/user.validator';

export class UserService {
  async findAll(query: UserQueryInput) {
    const { page, limit, search, role } = query;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              submittedUseCases: true,
              ownedUseCases: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            submittedUseCases: true,
            ownedUseCases: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async update(id: string, input: UpdateUserInput) {
    await this.findById(id);

    const data: Prisma.UserUpdateInput = {};

    if (input.email) {
      const existing = await prisma.user.findFirst({
        where: { email: input.email, NOT: { id } },
      });
      if (existing) {
        throw new Error('Email already in use');
      }
      data.email = input.email;
    }

    if (input.name) data.name = input.name;
    if (input.role) data.role = input.role;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async delete(id: string) {
    await this.findById(id);

    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async getCommitteeAndAdmins() {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['COMMITTEE', 'ADMIN'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });

    return users;
  }
}

export const userService = new UserService();
