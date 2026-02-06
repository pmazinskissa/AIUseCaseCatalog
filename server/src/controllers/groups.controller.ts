import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function listGroups(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const where = req.auth.isAdmin
    ? {}
    : {
        memberships: {
          some: { userId: req.auth.userId }
        }
      };

  try {
    const groups = await prisma.group.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true }
    });

    return res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Failed to list groups:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export async function createGroup(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { name, slug } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ success: false, error: 'Name and slug are required' });
  }

  try {
    const group = await prisma.group.create({
      data: { name, slug: slug.toLowerCase() },
      select: { id: true, name: true, slug: true }
    });

    return res.status(201).json({ success: true, data: group });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Group slug already exists' });
    }
    console.error('Failed to create group:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export async function deleteGroup(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { id } = req.params;

  try {
    await prisma.group.delete({ where: { id } });
    return res.json({ success: true, data: { message: 'Group deleted successfully' } });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }
    console.error('Failed to delete group:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export async function addUserToGroup(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { groupId, userId } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({ success: false, error: 'groupId and userId are required' });
  }

  try {
    const membership = await prisma.groupMembership.create({
      data: { groupId, userId },
      select: {
        id: true,
        user: { select: { id: true, email: true, name: true } },
        group: { select: { id: true, name: true, slug: true } }
      }
    });

    return res.status(201).json({ success: true, data: membership });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'User is already a member of this group' });
    }
    console.error('Failed to add user to group:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export async function removeUserFromGroup(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { groupId, userId } = req.params;

  try {
    await prisma.groupMembership.delete({
      where: {
        userId_groupId: { userId, groupId }
      }
    });

    return res.json({ success: true, data: { message: 'User removed from group' } });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Membership not found' });
    }
    console.error('Failed to remove user from group:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
