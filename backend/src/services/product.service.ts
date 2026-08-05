import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { parsePagination, buildPagination } from '../utils/response.utils';
import { ProductFilterQuery } from '../types';
import { Prisma } from '@prisma/client';

export class ProductService {
  async list(query: ProductFilterQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.subcategoryId && { subcategoryId: query.subcategoryId }),
      ...(query.brand && { brand: { contains: query.brand, mode: 'insensitive' } }),
      ...(query.isFeatured === 'true' && { isFeatured: true }),
      ...(query.isPopular === 'true' && { isPopular: true }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { brand: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.minPrice || query.maxPrice
        ? {
            variants: {
              some: {
                isDefault: true,
                isActive: true,
                price: {
                  ...(query.minPrice && { gte: new Prisma.Decimal(query.minPrice) }),
                  ...(query.maxPrice && { lte: new Prisma.Decimal(query.maxPrice) }),
                },
              },
            },
          }
        : {}),
      ...(query.inStock === 'true'
        ? { variants: { some: { inventory: { quantity: { gt: 0 } } } } }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
          variants: {
            where: { isDefault: true, isActive: true },
            include: { inventory: true },
          },
          reviews: {
            where: { isApproved: true, deletedAt: null },
            select: { rating: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, pagination: buildPagination(page, limit, total) };
  }

  async getById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        subcategory: true,
        variants: {
          where: { isActive: true },
          include: { inventory: true },
          orderBy: { isDefault: 'desc' },
        },
        reviews: {
          where: { isApproved: true, deletedAt: null },
          include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        productOffers: {
          include: { offer: true },
          where: { offer: { isActive: true, validUntil: { gt: new Date() } } },
        },
      },
    });
    if (!product) throw new NotFoundError('Product');
    return product;
  }

  async create(data: {
    name: string; slug: string; description?: string; brand?: string; sku: string;
    categoryId: string; subcategoryId?: string; imageUrl?: string; imageUrls?: string[];
    isActive?: boolean; isFeatured?: boolean; isPopular?: boolean;
    variants: {
      name: string; weight?: number; unit?: string; price: number; originalPrice: number;
      discountPercent?: number; isDefault?: boolean; stock?: number;
    }[];
  }) {
    const existing = await prisma.product.findFirst({ where: { OR: [{ slug: data.slug }, { sku: data.sku }] } });
    if (existing) throw new ConflictError(existing.slug === data.slug ? 'Slug already used' : 'SKU already used');

    const { variants, ...productData } = data;
    return prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants.map((v) => ({
            name: v.name,
            weight: v.weight,
            unit: v.unit,
            price: v.price,
            originalPrice: v.originalPrice,
            discountPercent: v.discountPercent ?? 0,
            isDefault: v.isDefault ?? false,
            inventory: { create: { quantity: v.stock ?? 0 } },
          })),
        },
      },
      include: { variants: { include: { inventory: true } } },
    });
  }

  async update(id: string, data: Partial<{
    name: string; description: string; brand: string; categoryId: string;
    subcategoryId: string; imageUrl: string; imageUrls: string[];
    isActive: boolean; isFeatured: boolean; isPopular: boolean;
  }>) {
    await this.getById(id); // throws if not found
    return prisma.product.update({ where: { id }, data, include: { variants: true } });
  }

  async softDelete(id: string) {
    await this.getById(id);
    await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }
}

export const productService = new ProductService();
