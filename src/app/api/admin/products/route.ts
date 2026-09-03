import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// GET /api/admin/products — list all products (including inactive)
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const categoryId = searchParams.get('categoryId') ?? '';
    const status = searchParams.get('status') ?? ''; // 'active' | 'inactive' | ''
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
          variants: {
            where: { isDefault: true },
            include: { inventory: true },
            take: 1,
          },
          reviews: { where: { isApproved: true }, select: { rating: true } },
          _count: { select: { variants: true, reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map(p => {
        const defaultVariant = p.variants[0];
        const avgRating =
          p.reviews.length > 0
            ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
            : 0;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          brand: p.brand,
          description: p.description,
          imageUrl: p.imageUrl,
          imageUrls: p.imageUrls,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          isPopular: p.isPopular,
          category: p.category,
          subcategory: p.subcategory,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          variantCount: p._count.variants,
          reviewCount: p._count.reviews,
          avgRating: Math.round(avgRating * 10) / 10,
          defaultVariant: defaultVariant
            ? {
                id: defaultVariant.id,
                name: defaultVariant.name,
                price: Number(defaultVariant.price),
                originalPrice: Number(defaultVariant.originalPrice),
                discountPercent: Number(defaultVariant.discountPercent),
                stock: defaultVariant.inventory?.quantity ?? 0,
                reservedQuantity: defaultVariant.inventory?.reservedQuantity ?? 0,
                lowStockThreshold: defaultVariant.inventory?.lowStockThreshold ?? 10,
                inventoryStatus: defaultVariant.inventory?.status ?? 'out_of_stock',
              }
            : null,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[Admin Products GET]', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/admin/products — create product
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const {
      name, slug, sku, brand, description, categoryId, subcategoryId,
      imageUrl, imageUrls, isActive, isFeatured, isPopular,
      variants,
    } = body;

    if (!name || !slug || !sku || !categoryId || !variants?.length) {
      return NextResponse.json({ error: 'Missing required fields: name, slug, sku, categoryId, variants' }, { status: 400 });
    }

    const existing = await prisma.product.findFirst({
      where: { OR: [{ slug }, { sku }], deletedAt: null },
    });
    if (existing) {
      return NextResponse.json({
        error: existing.slug === slug ? 'Slug already in use' : 'SKU already in use',
      }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: {
        name, slug, sku, brand, description, categoryId,
        subcategoryId: subcategoryId || null,
        imageUrl: imageUrl || null,
        imageUrls: imageUrls || [],
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isPopular: isPopular ?? false,
        variants: {
          create: variants.map((v: {
            name: string; weight?: number; unit?: string;
            price: number; originalPrice: number; discountPercent?: number;
            isDefault?: boolean; stock?: number;
          }) => ({
            name: v.name,
            weight: v.weight || null,
            unit: v.unit || null,
            price: v.price,
            originalPrice: v.originalPrice,
            discountPercent: v.discountPercent ?? 0,
            isDefault: v.isDefault ?? false,
            inventory: {
              create: {
                quantity: v.stock ?? 0,
                status: (v.stock ?? 0) === 0 ? 'out_of_stock' : 'in_stock',
              },
            },
          })),
        },
      },
      include: {
        category: true,
        subcategory: true,
        variants: { include: { inventory: true } },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('[Admin Products POST]', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

