import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { env } from '../config/env';
import { parsePagination, buildPagination } from '../utils/response.utils';
import { DeliveryType, OrderStatus, PaymentMethod, Prisma } from '@prisma/client';

export class OrderService {
  async create(
    userId: string,
    data: {
      addressId?: string;
      couponCode?: string;
      deliveryType: 'door_delivery' | 'self_pickup';
      deliverySlot?: string;
      paymentMethod: string;
      notes?: string;
      items: { productVariantId: string; quantity: number }[];
    }
  ) {
    // 1. Calculate subtotal
    const subtotalRaw = await this.calculateSubtotal(data.items);

    // 2. Validate stock
    await this.validateAndReserveStock(data.items);

    // 3. Delivery fee
    let deliveryFee =
      data.deliveryType === 'door_delivery'
        ? subtotalRaw >= env.FREE_DELIVERY_THRESHOLD
          ? 0
          : env.DELIVERY_FEE
        : 0;

    // 4. Apply coupon
    let couponId: string | undefined;
    let discountAmount = 0;

    if (data.couponCode) {
      const couponResult = await this.applyCoupon(data.couponCode, userId, subtotalRaw);
      couponId = couponResult.couponId;
      discountAmount = couponResult.discount;
      if (couponResult.freeDelivery) deliveryFee = 0;
    }

    // 5. Calculate totals
    const taxAmount = parseFloat(((subtotalRaw - discountAmount) * env.TAX_RATE).toFixed(2));
    const totalAmount = parseFloat(
      (subtotalRaw - discountAmount + deliveryFee + taxAmount).toFixed(2)
    );

    // 6. Validate enum values
    const deliveryTypeEnum = data.deliveryType as DeliveryType;
    const paymentMethodEnum = data.paymentMethod as PaymentMethod;

    // 7. Order number
    const orderNumber = `GM${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;

    // 8. Build order items
    const orderItemsData = await this.buildOrderItems(data.items);

    // 9. Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: data.addressId,
          couponId,
          deliveryType: deliveryTypeEnum,
          deliverySlot: data.deliverySlot,
          subtotal: subtotalRaw,
          deliveryFee,
          taxAmount,
          discountAmount,
          totalAmount,
          notes: data.notes,
          estimatedDeliveryAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          orderItems: { create: orderItemsData },
          payment: {
            create: {
              method: paymentMethodEnum,
              amount: totalAmount,
              status: 'pending',
            },
          },
          orderTracking: {
            create: {
              status: OrderStatus.pending,
              description: 'Order placed successfully',
            },
          },
        },
        include: { orderItems: true, payment: true },
      });

      // Record coupon usage
      if (couponId) {
        await tx.couponUsage.create({
          data: { couponId, userId, orderId: created.id, discountApplied: discountAmount },
        });
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear user cart
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      // Create admin notification
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { fullName: true, avatarUrl: true },
      });
      await tx.adminNotification.create({
        data: {
          orderId: created.id,
          userId,
          userName: user?.fullName ?? 'Customer',
          userAvatar: user?.avatarUrl,
          orderAmount: totalAmount,
          itemCount: data.items.reduce((s, i) => s + i.quantity, 0),
          paymentMethod: paymentMethodEnum,
        },
      });

      return created;
    });

    return order;
  }

  async getUserOrders(userId: string, query: { page?: string; limit?: string; status?: string }) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Prisma.OrderWhereInput = {
      userId,
      deletedAt: null,
      ...(query.status && { status: query.status as OrderStatus }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { placedAt: 'desc' },
        include: {
          orderItems: true,
          payment: true,
          address: { select: { city: true, pincode: true, addressLine1: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, pagination: buildPagination(page, limit, total) };
  }

  async getById(orderId: string, userId?: string) {
    const where: Prisma.OrderWhereInput = {
      id: orderId,
      deletedAt: null,
      ...(userId && { userId }),
    };
    const order = await prisma.order.findFirst({
      where,
      include: {
        orderItems: true,
        payment: true,
        address: true,
        orderTracking: { orderBy: { trackedAt: 'desc' } },
      },
    });
    if (!order) throw new NotFoundError('Order');
    return order;
  }

  async updateStatus(
    orderId: string,
    data: { status: string; description?: string; location?: string }
  ) {
    await this.getById(orderId);
    const statusEnum = data.status as OrderStatus;

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: statusEnum,
          ...(statusEnum === OrderStatus.delivered && { deliveredAt: new Date() }),
        },
      }),
      prisma.orderTracking.create({
        data: {
          orderId,
          status: statusEnum,
          description: data.description,
          location: data.location,
        },
      }),
    ]);
  }

  async cancel(orderId: string, userId: string) {
    const order = await this.getById(orderId, userId);
    const cancellableStatuses: OrderStatus[] = [OrderStatus.pending, OrderStatus.confirmed];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestError('Order cannot be cancelled at this stage');
    }
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.cancelled },
    });
  }

  // ── private helpers ──────────────────────────────────────────

  private async calculateSubtotal(
    items: { productVariantId: string; quantity: number }[]
  ): Promise<number> {
    let subtotal = 0;
    for (const item of items) {
      const variant = await prisma.productVariant.findFirst({
        where: { id: item.productVariantId, isActive: true },
      });
      if (!variant) throw new NotFoundError(`Product variant ${item.productVariantId}`);
      subtotal += Number(variant.price) * item.quantity;
    }
    return parseFloat(subtotal.toFixed(2));
  }

  private async validateAndReserveStock(
    items: { productVariantId: string; quantity: number }[]
  ): Promise<void> {
    for (const item of items) {
      const inv = await prisma.inventory.findFirst({
        where: { productVariantId: item.productVariantId },
      });
      if (!inv || inv.quantity - inv.reservedQuantity < item.quantity) {
        throw new BadRequestError(`Insufficient stock for variant ${item.productVariantId}`);
      }
    }
  }

  private async applyCoupon(code: string, userId: string, subtotal: number) {
    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), isActive: true, validUntil: { gt: new Date() } },
    });
    if (!coupon) throw new BadRequestError('Invalid or expired coupon');
    if (Number(coupon.minOrderAmount) > subtotal) {
      throw new BadRequestError(
        `Minimum order amount ₹${coupon.minOrderAmount} required`
      );
    }

    const usageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (usageCount >= coupon.perUserLimit) {
      throw new BadRequestError('Coupon usage limit reached');
    }

    let discount = 0;
    let freeDelivery = false;

    if (coupon.type === 'percentage') {
      discount = (subtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, Number(coupon.maxDiscountAmount));
      }
    } else if (coupon.type === 'fixed_amount') {
      discount = Math.min(Number(coupon.value), subtotal);
    } else if (coupon.type === 'free_delivery') {
      freeDelivery = true;
    }

    return { couponId: coupon.id, discount: parseFloat(discount.toFixed(2)), freeDelivery };
  }

  private async buildOrderItems(items: { productVariantId: string; quantity: number }[]) {
    const result = [];
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId },
        include: { product: { select: { name: true } } },
      });
      if (!variant) throw new NotFoundError('Product variant');
      result.push({
        productVariantId: item.productVariantId,
        productName: variant.product.name,
        variantName: variant.name,
        quantity: item.quantity,
        unitPrice: variant.price,
        totalPrice: new Prisma.Decimal(Number(variant.price) * item.quantity),
      });
    }
    return result;
  }
}

export const orderService = new OrderService();
