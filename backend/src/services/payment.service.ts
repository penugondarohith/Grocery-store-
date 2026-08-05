import crypto from 'crypto';
import prisma from '../config/database';
import { env } from '../config/env';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class PaymentService {
  /** Create a Razorpay order (or return COD confirmation) */
  async createPayment(orderId: string, method: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
      include: { payment: true },
    });
    if (!order) throw new NotFoundError('Order');

    if (method === 'cod') {
      await prisma.payment.update({
        where: { orderId },
        data: { method: 'cod', status: 'pending' },
      });
      await prisma.order.update({ where: { id: orderId }, data: { status: 'confirmed' } });
      return { method: 'cod', message: 'Order confirmed. Pay on delivery.' };
    }

    // For Razorpay — in production integrate Razorpay SDK
    const gatewayOrderId = `pay_${crypto.randomBytes(12).toString('hex')}`;
    await prisma.payment.update({
      where: { orderId },
      data: { method: method as 'upi' | 'card', gatewayOrderId, status: 'processing' },
    });

    return {
      gatewayOrderId,
      amount: Number(order.totalAmount) * 100, // paise
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
    };
  }

  /** Verify Razorpay payment signature */
  async verifyPayment(data: {
    orderId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }) {
    const payment = await prisma.payment.findFirst({ where: { orderId: data.orderId } });
    if (!payment) throw new NotFoundError('Payment');

    // Verify HMAC signature
    const body = `${data.razorpayOrderId}|${data.razorpayPaymentId}`;
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET ?? '')
      .update(body)
      .digest('hex');

    if (expected !== data.razorpaySignature) {
      await prisma.payment.update({
        where: { orderId: data.orderId },
        data: { status: 'failed', gatewayResponse: data },
      });
      throw new BadRequestError('Payment verification failed — signature mismatch');
    }

    // Mark payment paid and order confirmed
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId: data.orderId },
        data: {
          status: 'paid',
          transactionId: data.razorpayPaymentId,
          gatewayResponse: data,
          paidAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: data.orderId },
        data: { status: 'confirmed' },
      }),
    ]);

    return { message: 'Payment verified successfully' };
  }

  /** Process refund */
  async refund(orderId: string) {
    const payment = await prisma.payment.findFirst({ where: { orderId } });
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status !== 'paid') throw new BadRequestError('Payment is not in a refundable state');

    // In production: call Razorpay refund API
    await prisma.$transaction([
      prisma.payment.update({ where: { orderId }, data: { status: 'refunded' } }),
      prisma.order.update({ where: { id: orderId }, data: { status: 'refunded' } }),
    ]);

    return { message: 'Refund initiated successfully' };
  }
}

export const paymentService = new PaymentService();
