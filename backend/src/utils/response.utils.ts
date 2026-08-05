import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: PaginationMeta
): Response => {
  const response: ApiResponse<T> = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created successfully'): Response =>
  sendSuccess(res, data, message, 201);

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code?: string
): Response =>
  res.status(statusCode).json({ success: false, message, code });

export const buildPagination = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});

export const parsePagination = (
  pageStr?: string,
  limitStr?: string
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(pageStr ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(limitStr ?? '20', 10)));
  return { page, limit, skip: (page - 1) * limit };
};
