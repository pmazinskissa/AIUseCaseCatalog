import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const input: RegisterInput = req.body;
      const user = await authService.register(input);
      return successResponse(res, user, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return errorResponse(res, message, 400);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const input: LoginInput = req.body;
      const result = await authService.login(input);
      return successResponse(res, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return errorResponse(res, message, 401);
    }
  }

  async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Not authenticated', 401);
      }
      const user = await authService.getCurrentUser(req.user.userId);
      return successResponse(res, user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user';
      return errorResponse(res, message, 400);
    }
  }
}

export const authController = new AuthController();
