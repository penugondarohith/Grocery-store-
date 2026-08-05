import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated } from '../utils/response.utils';
import { NotFoundError } from '../utils/errors';
import prisma from '../config/database';

export class CategoryController {
  async list(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        include: { subcategories: { where: { isActive: true, deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
      });
      sendSuccess(res, categories, 'Categories fetched');
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await prisma.category.create({ data: req.body });
      sendCreated(res, category, 'Category created');
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exists = await prisma.category.findFirst({ where: { id: req.params.id, deletedAt: null } });
      if (!exists) throw new NotFoundError('Category');
      const updated = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
      sendSuccess(res, updated, 'Category updated');
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exists = await prisma.category.findFirst({ where: { id: req.params.id, deletedAt: null } });
      if (!exists) throw new NotFoundError('Category');
      await prisma.category.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), isActive: false } });
      sendSuccess(res, null, 'Category deleted');
    } catch (err) { next(err); }
  }
}

export class OrderController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderService } = await import('../services/order.service');
      const order = await orderService.create(req.user!.id, req.body);
      sendCreated(res, order, 'Order placed successfully');
    } catch (err) { next(err); }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderService } = await import('../services/order.service');
      const result = await orderService.getUserOrders(req.user!.id, req.query as Record<string, string>);
      sendSuccess(res, result.orders, 'Orders fetched', 200, result.pagination);
    } catch (err) { next(err); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderService } = await import('../services/order.service');
      const isAdmin = ['admin', 'super_admin'].includes(req.user!.role);
      const order = await orderService.getById(req.params.id, isAdmin ? undefined : req.user!.id);
      sendSuccess(res, order, 'Order fetched');
    } catch (err) { next(err); }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderService } = await import('../services/order.service');
      await orderService.updateStatus(req.params.id, req.body);
      sendSuccess(res, null, 'Order status updated');
    } catch (err) { next(err); }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderService } = await import('../services/order.service');
      await orderService.cancel(req.params.id, req.user!.id);
      sendSuccess(res, null, 'Order cancelled');
    } catch (err) { next(err); }
  }
}

export class PaymentController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { paymentService } = await import('../services/payment.service');
      const result = await paymentService.createPayment(req.body.orderId, req.body.method);
      sendSuccess(res, result, 'Payment initiated');
    } catch (err) { next(err); }
  }

  async verify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { paymentService } = await import('../services/payment.service');
      const result = await paymentService.verifyPayment(req.body);
      sendSuccess(res, result, 'Payment verified');
    } catch (err) { next(err); }
  }

  async refund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { paymentService } = await import('../services/payment.service');
      const result = await paymentService.refund(req.params.orderId);
      sendSuccess(res, result, 'Refund initiated');
    } catch (err) { next(err); }
  }
}

export const categoryController = new CategoryController();
export const orderController = new OrderController();
export const paymentController = new PaymentController();
