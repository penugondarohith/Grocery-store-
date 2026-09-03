// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') ?? '30d'; // today | 7d | 30d | 3m | 6m | 1y

    const now = new Date();
    let startDate: Date;
    switch (range) {
      case 'today': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
      case '7d': startDate = new Date(now.getTime() - 7 * 86400000); break;
      case '3m': startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); break;
      case '6m': startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1); break;
      case '1y': startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1); break;
      default: startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); // 30d
    }

    // Revenue trends
    const revenueData = await prisma.$queryRaw<{ period: string; revenue: number; orders: bigint }[]>`
      SELECT 
        DATE_TRUNC(${range === 'today' ? 'hour' : range === '7d' ? 'day' : 'week'}, placed_at AT TIME ZONE 'Asia/Kolkata')::text AS period,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(*)::bigint AS orders
      FROM orders
      WHERE placed_at >= ${startDate}
        AND status NOT IN ('cancelled', 'refunded')
        AND deleted_at IS NULL
      GROUP BY period
      ORDER BY period
    `;

    // Order status distribution
    const orderStatusDist = await prisma.order.groupBy({
      by: ['status'],
      where: { placedAt: { gte: startDate }, deletedAt: null },
      _count: { _all: true },
    });

    // Top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productVariantId', 'productName'],
      where: { order: { placedAt: { gte: startDate }, deletedAt: null, status: { notIn: ['cancelled', 'refunded'] } } },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 10,
    });

    // Revenue summary
    const revenueSummary = await prisma.order.aggregate({
      where: { placedAt: { gte: startDate }, deletedAt: null, status: { notIn: ['cancelled', 'refunded'] } },
      _sum: { totalAmount: true, discountAmount: true, deliveryFee: true, subtotal: true },
      _count: { _all: true },
      _avg: { totalAmount: true },
    });

    // Category performance
    const categoryRevenue = await prisma.$queryRaw<{ category: string; revenue: number; order_count: bigint }[]>`
      SELECT 
        c.name AS category,
        COALESCE(SUM(oi.total_price), 0) AS revenue,
        COUNT(DISTINCT o.id)::bigint AS order_count
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN product_variants pv ON pv.id = oi.product_variant_id
      JOIN products p ON p.id = pv.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE o.placed_at >= ${startDate}
        AND o.status NOT IN ('cancelled', 'refunded')
        AND o.deleted_at IS NULL
      GROUP BY c.name
      ORDER BY revenue DESC
      LIMIT 8
    `;

    // New vs returning customers
    const newCustomers = await prisma.user.count({
      where: { role: 'customer', createdAt: { gte: startDate }, deletedAt: null },
    });

    return NextResponse.json({
      range,
      startDate,
      revenueTrend: revenueData.map(r => ({
        period: r.period,
        revenue: Number(r.revenue),
        orders: Number(r.orders),
      })),
      orderStatusDistribution: orderStatusDist.map(d => ({
        status: d.status,
        count: d._count._all,
      })),
      topProducts: topProducts.map(p => ({
        name: p.productName,
        unitsSold: Number(p._sum.quantity ?? 0),
        revenue: Number(p._sum.totalPrice ?? 0),
      })),
      summary: {
        totalRevenue: Number(revenueSummary._sum.totalAmount ?? 0),
        totalOrders: revenueSummary._count._all,
        avgOrderValue: Number(revenueSummary._avg.totalAmount ?? 0),
        totalDiscount: Number(revenueSummary._sum.discountAmount ?? 0),
        deliveryRevenue: Number(revenueSummary._sum.deliveryFee ?? 0),
        grossRevenue: Number(revenueSummary._sum.subtotal ?? 0),
        netRevenue: Number(revenueSummary._sum.totalAmount ?? 0) - Number(revenueSummary._sum.discountAmount ?? 0),
      },
      categoryPerformance: categoryRevenue.map(c => ({
        category: c.category,
        revenue: Number(c.revenue),
        orderCount: Number(c.order_count),
      })),
      newCustomers,
    });
  } catch (err) {
    console.error('[Admin Analytics]', err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
