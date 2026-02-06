import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getMe(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        memberships: {
          select: {
            group: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.role === 'ADMIN',
        isCommittee: user.role === 'COMMITTEE' || user.role === 'ADMIN',
        groups: user.memberships.map((m) => m.group)
      }
    });
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
