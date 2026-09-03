import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// GET /api/admin/products/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        subcategory: true,
        variants: {
          include: { inventory: true, inventoryLogs: { orderBy: { createdAt: 'desc' }, take: 5 } },
          orderBy: { isDefault: 'desc' },
        },
        reviews: {
          include: { user: { select: { fullName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        productOffers: { include: { offer: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error('[Admin Product GET]', err);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/admin/products/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const {
      name, brand, description, categoryId, subcategoryId,
      imageUrl, imageUrls, isActive, isFeatured, isPopular,
    } = body;

    const exists = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(brand !== undefined && { brand }),
        ...(description !== undefined && { description }),
        ...(categoryId !== undefined && { categoryId }),
        ...(subcategoryId !== undefined && { subcategoryId: subcategoryId || null }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imageUrls !== undefined && { imageUrls }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isPopular !== undefined && { isPopular }),
      },
      include: {
        category: true,
        subcategory: true,
        variants: { include: { inventory: true } },
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error('[Admin Product PUT]', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — soft delete
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const exists = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('[Admin Product DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
