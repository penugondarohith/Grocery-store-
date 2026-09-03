// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// GET /api/admin/offers
export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const now = new Date();
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        productOffers: {
          include: { product: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
    });

    return NextResponse.json({
      offers: offers.map(o => ({
        id: o.id,
        title: o.title,
        description: o.description,
        discountPercent: Number(o.discountPercent),
        bannerUrl: o.bannerUrl,
        validFrom: o.validFrom,
        validUntil: o.validUntil,
        isActive: o.isActive,
        isExpired: o.validUntil <= now,
        createdAt: o.createdAt,
        products: o.productOffers.map(po => ({
          id: po.product.id,
          name: po.product.name,
          imageUrl: po.product.imageUrl,
        })),
      })),
    });
  } catch (err) {
    console.error('[Admin Offers GET]', err);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

// POST /api/admin/offers
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { title, description, discountPercent, bannerUrl, validFrom, validUntil, isActive, productIds } = body;

    if (!title || discountPercent === undefined || !validUntil) {
      return NextResponse.json({ error: 'title, discountPercent, validUntil are required' }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        description: description || null,
        discountPercent,
        bannerUrl: bannerUrl || null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: new Date(validUntil),
        isActive: isActive ?? true,
        ...(productIds?.length && {
          productOffers: {
            create: productIds.map((pid: string) => ({ productId: pid })),
          },
        }),
      },
      include: { productOffers: { include: { product: { select: { id: true, name: true } } } } },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (err) {
    console.error('[Admin Offers POST]', err);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}
