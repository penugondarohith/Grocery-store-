import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { categoryController } from '../controllers/controllers';
import { orderController } from '../controllers/controllers';
import { paymentController } from '../controllers/controllers';
import { authenticate } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { paymentLimiter } from '../middleware/rateLimiter.middleware';
import {
  createProductSchema, updateProductSchema,
  createCategorySchema, updateCategorySchema,
  createOrderSchema, updateOrderStatusSchema,
  createPaymentSchema, verifyPaymentSchema,
  uuidParamSchema,
} from '../schemas';

// ----------------------------------------------------------------
// Products  /api/v1/products
// ----------------------------------------------------------------
export const productRouter = Router();

productRouter.get('/', productController.list.bind(productController));
productRouter.get('/:id', validate(uuidParamSchema), productController.getById.bind(productController));
productRouter.post('/', authenticate, adminOnly, validate(createProductSchema), productController.create.bind(productController));
productRouter.put('/:id', authenticate, adminOnly, validate(updateProductSchema), productController.update.bind(productController));
productRouter.delete('/:id', authenticate, adminOnly, validate(uuidParamSchema), productController.delete.bind(productController));

// ----------------------------------------------------------------
// Categories  /api/v1/categories
// ----------------------------------------------------------------
export const categoryRouter = Router();

categoryRouter.get('/', categoryController.list.bind(categoryController));
categoryRouter.post('/', authenticate, adminOnly, validate(createCategorySchema), categoryController.create.bind(categoryController));
categoryRouter.put('/:id', authenticate, adminOnly, validate(updateCategorySchema), categoryController.update.bind(categoryController));
categoryRouter.delete('/:id', authenticate, adminOnly, validate(uuidParamSchema), categoryController.delete.bind(categoryController));

// ----------------------------------------------------------------
// Orders  /api/v1/orders
// ----------------------------------------------------------------
export const orderRouter = Router();

orderRouter.use(authenticate); // all order routes require auth
orderRouter.post('/', validate(createOrderSchema), orderController.create.bind(orderController));
orderRouter.get('/', orderController.list.bind(orderController));
orderRouter.get('/:id', validate(uuidParamSchema), orderController.getById.bind(orderController));
orderRouter.patch('/:id/status', adminOnly, validate(updateOrderStatusSchema), orderController.updateStatus.bind(orderController));
orderRouter.delete('/:id', validate(uuidParamSchema), orderController.cancel.bind(orderController));

// ----------------------------------------------------------------
// Payments  /api/v1/payments
// ----------------------------------------------------------------
export const paymentRouter = Router();

paymentRouter.use(authenticate);
paymentRouter.post('/create', paymentLimiter, validate(createPaymentSchema), paymentController.create.bind(paymentController));
paymentRouter.post('/verify', paymentLimiter, validate(verifyPaymentSchema), paymentController.verify.bind(paymentController));
paymentRouter.post('/refund/:orderId', adminOnly, validate(uuidParamSchema), paymentController.refund.bind(paymentController));
