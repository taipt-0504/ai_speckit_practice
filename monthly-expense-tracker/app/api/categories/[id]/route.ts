import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withActiveUserAuth, type AuthRequest } from '@/lib/auth/middleware';
import { CategorySchema, canAccessCategory } from '@/lib/utils/validation';
import { AppError, getErrorMessage, getErrorStatus } from '@/lib/utils/errors';

async function getCategoryOrThrow(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  return category;
}

function ensureCanManageCategory(
  category: { isDefault: boolean; ownerId: string | null },
  user: { id: string; role: string }
) {
  if (category.isDefault) {
    throw new AppError('Cannot modify system default categories', 403);
  }

  if (!canAccessCategory(category.isDefault, category.ownerId, user.id, user.role)) {
    throw new AppError('Forbidden', 403);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const category = await getCategoryOrThrow(id);
      ensureCanManageCategory(category, req.user!);

      const parsed = CategorySchema.partial().safeParse(await request.json());
      if (!parsed.success) {
        throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request body', 400);
      }

      const updated = await prisma.category.update({
        where: { id },
        data: {
          name: parsed.data.name,
        },
      });

      return NextResponse.json(
        {
          id: updated.id,
          name: updated.name,
          is_default: updated.isDefault,
          updated_at: updated.updatedAt,
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: getErrorMessage(error, 'Failed to update category') },
        { status: getErrorStatus(error, 400) }
      );
    }
  });

  return handler(request);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const category = await getCategoryOrThrow(id);
      ensureCanManageCategory(category, req.user!);

      const body = (await request.json()) as { targetCategoryId?: string };
      if (!body.targetCategoryId) {
        throw new AppError('targetCategoryId is required', 400);
      }

      const target = await getCategoryOrThrow(body.targetCategoryId);
      if (!canAccessCategory(target.isDefault, target.ownerId, req.user!.id, req.user!.role)) {
        throw new AppError('Target category does not belong to current user', 403);
      }

      const result = await prisma.transaction.updateMany({
        where: {
          userId: req.user!.id,
          categoryId: id,
        },
        data: {
          categoryId: body.targetCategoryId,
        },
      });

      return NextResponse.json(
        { message: 'Transactions reassigned successfully', updated_count: result.count },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: getErrorMessage(error, 'Failed to reassign transactions') },
        { status: getErrorStatus(error, 400) }
      );
    }
  });

  return handler(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const category = await getCategoryOrThrow(id);
      ensureCanManageCategory(category, req.user!);

      const relatedCount = await prisma.transaction.count({
        where: {
          userId: req.user!.id,
          categoryId: id,
        },
      });

      if (relatedCount > 0) {
        throw new AppError(
          'Category has associated transactions. Please reassign them first.',
          400
        );
      }

      await prisma.category.delete({ where: { id } });
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return NextResponse.json(
        { error: getErrorMessage(error, 'Failed to delete category') },
        { status: getErrorStatus(error, 400) }
      );
    }
  });

  return handler(request);
}
