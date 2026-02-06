import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { errorResponse } from '../utils/response';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const userRole = req.user.role as Role;

    if (!allowedRoles.includes(userRole)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(Role.ADMIN)(req, res, next);
}

export function requireCommitteeOrAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(Role.COMMITTEE, Role.ADMIN)(req, res, next);
}
