import { Request, Response } from 'express';
import { toolService } from '../services/tool.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import {
  CreateToolInput,
  UpdateToolInput,
  ToolQueryInput,
} from '../validators/tool.validator';

export class ToolController {
  async create(req: Request, res: Response) {
    try {
      const input: CreateToolInput = req.body;
      const tool = await toolService.create(input);
      return successResponse(res, tool, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create tool';
      return errorResponse(res, message, 400);
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const query = req.query as unknown as ToolQueryInput;
      const { tools, total, page, limit } = await toolService.findAll(query);
      return paginatedResponse(res, tools, total, page, limit);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tools';
      return errorResponse(res, message, 400);
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tool = await toolService.findById(id);
      return successResponse(res, tool);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tool';
      const status = message === 'Tool not found' ? 404 : 400;
      return errorResponse(res, message, status);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const input: UpdateToolInput = req.body;
      const tool = await toolService.update(id, input);
      return successResponse(res, tool);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tool';
      const status = message === 'Tool not found' ? 404 : 400;
      return errorResponse(res, message, status);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await toolService.delete(id);
      return successResponse(res, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete tool';
      const status = message === 'Tool not found' ? 404 : 400;
      return errorResponse(res, message, status);
    }
  }
}

export const toolController = new ToolController();
