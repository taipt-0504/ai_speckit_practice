import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withActiveUserAuth, type AuthRequest } from '@/lib/auth/middleware';
import { CategorySchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    const categories = await prisma.category.findMany({
      where: {
        OR: [{ isDefault: true }, { ownerId: req.user!.id }],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    const formatted = categories.map((item) => ({
      id: item.id,
      name: item.name,
      is_default: item.isDefault,
      is_custom: !item.isDefault,
    }));

    return NextResponse.json(
      {
        default: formatted.filter((item) => item.is_default),
        custom: formatted.filter((item) => item.is_custom),
      },
      { status: 200 }
    );
  });

  return handler(request);
}

export async function POST(request: NextRequest) {
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const parsed = CategorySchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
          { status: 400 }
        );
      }

      const existing = await prisma.category.findFirst({
        where: {
          name: parsed.data.name,
          ownerId: req.user!.id,
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
      }

      const created = await prisma.category.create({
        data: {
          name: parsed.data.name,
          isDefault: false,
          ownerId: req.user!.id,
        },
      });

      return NextResponse.json(
        {
          id: created.id,
          name: created.name,
          is_default: created.isDefault,
          is_custom: !created.isDefault,
          created_at: created.createdAt,
        },
        { status: 201 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create category';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });

  return handler(request);
}
