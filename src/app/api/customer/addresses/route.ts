import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// GET /api/customer/addresses
export async function GET(_req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error('[Addresses GET]', err);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

// POST /api/customer/addresses
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } = body;

    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Required fields: fullName, phone, line1, city, state, pincode' }, { status: 400 });
    }

    // Map label → AddressType enum
    const typeMap: Record<string, 'home' | 'office' | 'other'> = {
      Home: 'home', Work: 'office', Office: 'office', Other: 'other',
    };
    const type = typeMap[label] ?? 'home';

    // If setting as default, unset others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user!.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user!.id,
        fullName,
        phone,
        addressLine1: line1,
        addressLine2: line2 || null,
        city,
        state,
        pincode,
        type,
        isDefault: isDefault ?? false,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (err) {
    console.error('[Addresses POST]', err);
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
  }
}
