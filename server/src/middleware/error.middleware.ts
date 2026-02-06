import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    return errorResponse(res, 'Database operation failed', 400);
  }

  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  return errorResponse(res, 'Internal server error', 500);
}

export function notFoundHandler(req: Request, res: Response) {
  return errorResponse(res, 'Route not found', 404);
}
