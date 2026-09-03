import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// GET /api/admin/inventory — list all inventory with stock status
export async function GET(req: NextRequest) {
  const { error, user } = await requireAdmin();
  if (error) return error;
  void user;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const status = searchParams.get('status') ?? ''; // in_stock | low_stock | out_of_stock
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      ...(status && { status: status as 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' }),
      productVariant: {
        isActive: true,
        product: {
          deletedAt: null,
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
      },
    };

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { quantity: 'asc' },
        include: {
          productVariant: {
            include: {
              product: {
                select: {
                  id: true, name: true, sku: true, brand: true,
                  imageUrl: true, category: { select: { name: true } },
                },
              },
              inventoryLogs: {
                orderBy: { createdAt: 'desc' },
                take: 3,
              },
            },
          },
        },
      }),
      prisma.inventory.count({ where }),
    ]);

    // Summary stats
    const [inStockCount, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.inventory.count({ where: { status: 'in_stock' } }),
      prisma.inventory.count({ where: { status: 'low_stock' } }),
      prisma.inventory.count({ where: { status: 'out_of_stock' } }),
    ]);

    const totalQuantity = await prisma.inventory.aggregate({ _sum: { quantity: true } });

    return NextResponse.json({
      inventory: inventory.map(i => ({
        id: i.id,
        productVariantId: i.productVariantId,
        quantity: i.quantity,
        reservedQuantity: i.reservedQuantity,
        availableQuantity: i.quantity - i.reservedQuantity,
        lowStockThreshold: i.lowStockThreshold,
        status: i.status,
        lastRestockedAt: i.lastRestockedAt,
        updatedAt: i.updatedAt,
        variantName: i.productVariant.name,
        product: {
          id: i.productVariant.product.id,
          name: i.productVariant.product.name,
          sku: i.productVariant.product.sku,
          brand: i.productVariant.product.brand,
          imageUrl: i.productVariant.product.imageUrl,
          category: i.productVariant.product.category.name,
        },
        recentLogs: i.productVariant.inventoryLogs,
      })),
      summary: {
        totalItems: total,
        totalQuantity: Number(totalQuantity._sum.quantity ?? 0),
        inStock: inStockCount,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[Admin Inventory GET]', err);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

