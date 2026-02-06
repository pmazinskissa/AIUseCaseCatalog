import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { useCaseService } from '../services/usecase.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import {
  CreateUseCaseInput,
  UpdateUseCaseInput,
  ScoreUseCaseInput,
  UseCaseQueryInput,
} from '../validators/usecase.validator';

export class UseCaseController {
  async create(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return errorResponse(res, 'Not authenticated', 401);
      }

      const input: CreateUseCaseInput = req.body;
      const useCase = await useCaseService.create(input, req.auth.userId);
      return successResponse(res, useCase, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create use case';
      return errorResponse(res, message, 400);
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return errorResponse(res, 'Not authenticated', 401);
      }

      const query: UseCaseQueryInput = req.query as any;
      const { useCases, total, page, limit } = await useCaseService.findAll(query, req.auth);
      return paginatedResponse(res, useCases, total, page, limit);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch use cases';
      return errorResponse(res, message, 400);
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const useCase = await useCaseService.findById(id);
      return successResponse(res, useCase);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch use case';
      const status = message === 'Use case not found' ? 404 : 400;
      return errorResponse(res, message, status);
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return errorResponse(res, 'Not authenticated', 401);
      }

      const { id } = req.params;
      const input: UpdateUseCaseInput = req.body;
      const useCase = await useCaseService.update(
        id,
        input,
        req.auth.userId,
        req.auth.role as Role
      );
      return successResponse(res, useCase);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update use case';
      const status = message.includes('permission') ? 403 : 400;
      return errorResponse(res, message, status);
    }
  }

  async score(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return errorResponse(res, 'Not authenticated', 401);
      }

      const { id } = req.params;
      const input: ScoreUseCaseInput = req.body;
      const useCase = await useCaseService.score(id, input, req.auth.role as Role);
      return successResponse(res, useCase);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to score use case';
      const status = message.includes('Only committee') ? 403 : 400;
      return errorResponse(res, message, status);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await useCaseService.delete(id);
      return successResponse(res, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete use case';
      const status = message === 'Use case not found' ? 404 : 400;
      return errorResponse(res, message, status);
    }
  }
}

export const useCaseController = new UseCaseController();
