import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { env } from '../config/env';
import { parsePagination, buildPagination } from '../utils/response.utils';
import { DeliveryType, OrderStatus, PaymentMethod, Prisma } from '@prisma/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface CreateOrderInput {
  addressId?: string;
  couponCode?: string;
  deliveryType: 'door_delivery' | 'self_pickup';
  deliverySlot?: string;
  paymentMethod: string;
  notes?: string;
  items: OrderItemInput[];
}

interface OrderItemInput {
  productVariantId: string;
  quantity: number;
}

interface OrderItemCreateData {
  productVariantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  totalPrice: Prisma.Decimal;
}

interface CouponResult {
  couponId: string;
  discount: number;
  freeDelivery: boolean;
}

// ── Service ──────────────────────────────────────────────────────────────────

export class OrderService {
  // ── Public methods ──────────────────────────────────────────────────────

  async create(userId: string, data: CreateOrderInput) {
    // Step 1 — subtotal
    const subtotalRaw = await this.calculateSubtotal(data.items);

    // Step 2 — stock check
    await this.validateStock(data.items);

    // Step 3 — delivery fee
    let deliveryFee =
      data.deliveryType === 'door_delivery'
        ? subtotalRaw >= env.FREE_DELIVERY_THRESHOLD
          ? 0
          : env.DELIVERY_FEE
        : 0;

    // Step 4 — coupon
    let couponId: string | undefined;
    let discountAmount = 0;

    if (data.couponCode) {
      const couponResult = await this.applyCoupon(data.couponCode, userId, subtotalRaw);
      couponId = couponResult.couponId;
      discountAmount = couponResult.discount;
      if (couponResult.freeDelivery) deliveryFee = 0;
    }

    // Step 5 — totals
    const taxableAmount = subtotalRaw - discountAmount;
    const taxAmount = parseFloat((taxableAmount * env.TAX_RATE).toFixed(2));
    const totalAmount = parseFloat((taxableAmount + deliveryFee + taxAmount).toFixed(2));

    // Step 6 — enum casts (safe — validated by Zod schema upstream)
    const deliveryTypeEnum = data.deliveryType as DeliveryType;
    const paymentMethodEnum = data.paymentMethod as PaymentMethod;

    // Step 7 — order number
    const orderNumber = `GM${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;

    // Step 8 — build item snapshots
    const orderItemsData = await this.buildOrderItems(data.items);

    // Step 9 — persist in a single transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: data.addressId ?? null,
          couponId: couponId ?? null,
          deliveryType: deliveryTypeEnum,
          deliverySlot: data.deliverySlot ?? null,
          subtotal: new Prisma.Decimal(subtotalRaw),
          deliveryFee: new Prisma.Decimal(deliveryFee),
          taxAmount: new Prisma.Decimal(taxAmount),
          discountAmount: new Prisma.Decimal(discountAmount),
          totalAmount: new Prisma.Decimal(totalAmount),
          notes: data.notes ?? null,
          estimatedDeliveryAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          orderItems: { create: orderItemsData },
          payment: {
            create: {
              method: paymentMethodEnum,
              amount: new Prisma.Decimal(totalAmount),
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
          data: {
            couponId,
            userId,
            orderId: created.id,
            discountApplied: new Prisma.Decimal(discountAmount),
          },
        });
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear cart
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      // Admin notification
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { fullName: true, avatarUrl: true },
      });

      const itemCount = data.items.reduce((sum, i) => sum + i.quantity, 0);

      await tx.adminNotification.create({
        data: {
          orderId: created.id,
          userId,
          userName: user?.fullName ?? 'Customer',
          userAvatar: user?.avatarUrl ?? null,
          orderAmount: new Prisma.Decimal(totalAmount),
          itemCount,
          paymentMethod: paymentMethodEnum,
        },
      });

      return created;
    });

    return order;
  }

  async getUserOrders(
    userId: string,
    query: { page?: string; limit?: string; status?: string }
  ) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.OrderWhereInput = {
      userId,
      deletedAt: null,
      ...(query.status ? { status: query.status as OrderStatus } : {}),
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
          address: {
            select: { city: true, pincode: true, addressLine1: true },
          },
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
      ...(userId ? { userId } : {}),
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
    // Verify order exists
    await this.getById(orderId);

    const statusEnum = data.status as OrderStatus;

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: statusEnum,
          ...(statusEnum === OrderStatus.delivered ? { deliveredAt: new Date() } : {}),
        },
      }),
      prisma.orderTracking.create({
        data: {
          orderId,
          status: statusEnum,
          description: data.description ?? null,
          location: data.location ?? null,
        },
      }),
    ]);
  }

  async cancel(orderId: string, userId: string) {
    const order = await this.getById(orderId, userId);

    const cancellable: OrderStatus[] = [OrderStatus.pending, OrderStatus.confirmed];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestError('Order cannot be cancelled at this stage');
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.cancelled },
    });
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  private async calculateSubtotal(items: OrderItemInput[]): Promise<number> {
    let subtotal = 0;
    for (const item of items) {
      const variant = await prisma.productVariant.findFirst({
        where: { id: item.productVariantId, isActive: true },
      });
      if (!variant) {
        throw new NotFoundError(`Product variant ${item.productVariantId}`);
      }
      subtotal += Number(variant.price) * item.quantity;
    }
    return parseFloat(subtotal.toFixed(2));
  }

  private async validateStock(items: OrderItemInput[]): Promise<void> {
    for (const item of items) {
      const inv = await prisma.inventory.findFirst({
        where: { productVariantId: item.productVariantId },
      });
      const available = (inv?.quantity ?? 0) - (inv?.reservedQuantity ?? 0);
      if (!inv || available < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for variant ${item.productVariantId} (available: ${available})`
        );
      }
    }
  }

  private async applyCoupon(
    code: string,
    userId: string,
    subtotal: number
  ): Promise<CouponResult> {
    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), isActive: true, validUntil: { gt: new Date() } },
    });

    if (!coupon) throw new BadRequestError('Invalid or expired coupon code');

    const minOrder = Number(coupon.minOrderAmount);
    if (subtotal < minOrder) {
      throw new BadRequestError(`Minimum order amount ₹${minOrder} required for this coupon`);
    }

    const usageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (usageCount >= coupon.perUserLimit) {
      throw new BadRequestError('You have reached the usage limit for this coupon');
    }

    if (coupon.totalUsageLimit !== null && coupon.usedCount >= coupon.totalUsageLimit) {
      throw new BadRequestError('This coupon has been fully redeemed');
    }

    let discount = 0;
    let freeDelivery = false;

    switch (coupon.type) {
      case 'percentage':
        discount = (subtotal * Number(coupon.value)) / 100;
        if (coupon.maxDiscountAmount) {
          discount = Math.min(discount, Number(coupon.maxDiscountAmount));
        }
        break;
      case 'fixed_amount':
        discount = Math.min(Number(coupon.value), subtotal);
        break;
      case 'free_delivery':
        freeDelivery = true;
        break;
    }

    return {
      couponId: coupon.id,
      discount: parseFloat(discount.toFixed(2)),
      freeDelivery,
    };
  }

  private async buildOrderItems(items: OrderItemInput[]): Promise<OrderItemCreateData[]> {
    const result: OrderItemCreateData[] = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId },
        include: { product: { select: { name: true } } },
      });

      if (!variant) throw new NotFoundError('Product variant');

      const unitPrice = new Prisma.Decimal(Number(variant.price));
      const totalPrice = new Prisma.Decimal(Number(variant.price) * item.quantity);

      result.push({
        productVariantId: item.productVariantId,
        productName: variant.product.name,
        variantName: variant.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    return result;
  }
}

export const orderService = new OrderService();
