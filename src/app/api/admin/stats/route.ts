import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  const { user, error } = await requireAdmin();
  if (error) return error;
  void user;

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      // Revenue
      todayRevenue, weekRevenue, monthRevenue, totalRevenue,
      // Orders
      todayOrders, pendingOrders, processingOrders, completedOrders, cancelledOrders, totalOrders,
      // Customers
      totalCustomers, newCustomers,
      // Products
      totalProducts, activeProducts, lowStock, outOfStock,
    ] = await Promise.all([
      // Revenue aggregates
      prisma.order.aggregate({ where: { placedAt: { gte: todayStart }, status: { notIn: ['cancelled', 'refunded'] } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { placedAt: { gte: weekStart }, status: { notIn: ['cancelled', 'refunded'] } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { placedAt: { gte: monthStart }, status: { notIn: ['cancelled', 'refunded'] } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: { notIn: ['cancelled', 'refunded'] } }, _sum: { totalAmount: true } }),
      // Order counts
      prisma.order.count({ where: { placedAt: { gte: todayStart } } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'processing' } }),
      prisma.order.count({ where: { status: 'delivered' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
      prisma.order.count({ where: { deletedAt: null } }),
      // Customers
      prisma.user.count({ where: { role: 'customer', deletedAt: null } }),
      prisma.user.count({ where: { role: 'customer', createdAt: { gte: monthStart }, deletedAt: null } }),
      // Products
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { isActive: true, deletedAt: null } }),
      prisma.inventory.count({ where: { status: 'low_stock' } }),
      prisma.inventory.count({ where: { status: 'out_of_stock' } }),
    ]);

    // Recent orders for dashboard widget
    const recentOrders = await prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { placedAt: 'desc' },
      take: 5,
      include: {
        user: { select: { fullName: true, email: true, avatarUrl: true } },
        orderItems: { take: 1 },
      },
    });

    // Low stock alerts
    const lowStockItems = await prisma.inventory.findMany({
      where: { status: { in: ['low_stock', 'out_of_stock'] } },
      take: 5,
      include: {
        productVariant: {
          include: { product: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
    });

    // Weekly orders chart (last 7 days)
    const weeklyOrdersRaw = await prisma.$queryRaw<{ day: string; count: bigint; revenue: number }[]>`
      SELECT 
        DATE(placed_at AT TIME ZONE 'Asia/Kolkata')::text AS day,
        COUNT(*)::bigint AS count,
        COALESCE(SUM(total_amount), 0) AS revenue
      FROM orders
      WHERE placed_at >= ${weekStart}
        AND status NOT IN ('cancelled', 'refunded')
        AND deleted_at IS NULL
      GROUP BY DATE(placed_at AT TIME ZONE 'Asia/Kolkata')
      ORDER BY day
    `;

    return NextResponse.json({
      revenue: {
        today: Number(todayRevenue._sum.totalAmount ?? 0),
        weekly: Number(weekRevenue._sum.totalAmount ?? 0),
        monthly: Number(monthRevenue._sum.totalAmount ?? 0),
        total: Number(totalRevenue._sum.totalAmount ?? 0),
      },
      orders: {
        today: todayOrders,
        pending: pendingOrders,
        processing: processingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        total: totalOrders,
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock,
        outOfStock,
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.user.fullName,
        customerEmail: o.user.email,
        amount: Number(o.totalAmount),
        status: o.status,
        placedAt: o.placedAt,
        itemCount: o.orderItems.length,
      })),
      lowStockAlerts: lowStockItems.map(i => ({
        id: i.id,
        productId: i.productVariant.product.id,
        productName: i.productVariant.product.name,
        variantName: i.productVariant.name,
        imageUrl: i.productVariant.product.imageUrl,
        quantity: i.quantity,
        threshold: i.lowStockThreshold,
        status: i.status,
      })),
      weeklyChart: weeklyOrdersRaw.map(r => ({
        day: r.day,
        orders: Number(r.count),
        revenue: Number(r.revenue),
      })),
    });
  } catch (err) {
    console.error('[Admin Stats]', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
