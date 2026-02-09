import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { UpdateUserInput, UserQueryInput } from '../validators/user.validator';

export class UserController {
  async findAll(req: Request, res: Response) {
    try {
      const query = req.query as unknown as UserQueryInput;
      const { users, total, page, limit } = await userService.findAll(query);
      return paginatedResponse(res, users, total, page, limit);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      return errorResponse(res, message, 400);
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);
      return successResponse(res, user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user';
      const status = message === 'User not found' ? 404 : 400;
      return errorResponse(res, message, status);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const input: UpdateUserInput = req.body;
      const user = await userService.update(id, input);
      return successResponse(res, user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      return errorResponse(res, message, 400);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (req.auth?.userId === id) {
        return errorResponse(res, 'Cannot delete your own account', 400);
      }

      const result = await userService.delete(id);
      return successResponse(res, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      const status = message === 'User not found' ? 404 : 400;
      return errorResponse(res, message, status);
    }
  }

  async getOwnerCandidates(req: Request, res: Response) {
    try {
      const users = await userService.getCommitteeAndAdmins();
      return successResponse(res, users);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      return errorResponse(res, message, 400);
    }
  }
}

export const userController = new UserController();
