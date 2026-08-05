import { Response, NextFunction } from 'express';
import { AuthRequest, ProductFilterQuery } from '../types';
import { productService } from '../services/product.service';
import { sendSuccess, sendCreated } from '../utils/response.utils';

export class ProductController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await productService.list(req.query as ProductFilterQuery);
      sendSuccess(res, result.products, 'Products fetched', 200, result.pagination);
    } catch (err) { next(err); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);
      sendSuccess(res, product, 'Product fetched');
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      sendCreated(res, product, 'Product created');
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(req.params.id, req.body);
      sendSuccess(res, product, 'Product updated');
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await productService.softDelete(req.params.id);
      sendSuccess(res, null, 'Product deleted');
    } catch (err) { next(err); }
  }
}

export const productController = new ProductController();
