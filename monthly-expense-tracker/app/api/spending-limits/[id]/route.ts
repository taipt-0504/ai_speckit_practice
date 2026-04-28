import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withActiveUserAuth, type AuthRequest } from '@/lib/auth/middleware';
import { SpendingLimitUpdateSchema } from '@/lib/utils/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const { id } = await params;
      const limit = await prisma.spendingLimit.findUnique({
        where: { id },
        include: { category: { select: { id: true, name: true } } },
      });

      if (!limit || limit.userId !== req.user!.id) {
        return NextResponse.json({ error: 'Spending limit not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: limit.id,
        limitType: limit.limitType,
        amount: limit.amount,
        month: limit.month,
        year: limit.year,
        categoryId: limit.categoryId,
        category: limit.category,
        createdAt: limit.createdAt,
        updatedAt: limit.updatedAt,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get spending limit';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });

  return handler(request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const { id } = await params;
      const limit = await prisma.spendingLimit.findUnique({ where: { id } });

      if (!limit || limit.userId !== req.user!.id) {
        return NextResponse.json({ error: 'Spending limit not found' }, { status: 404 });
      }

      const body: unknown = await request.json();
      const parsed = SpendingLimitUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
          { status: 400 }
        );
      }

      const updated = await prisma.spendingLimit.update({
        where: { id },
        data: parsed.data,
        include: { category: { select: { id: true, name: true } } },
      });

      return NextResponse.json({
        id: updated.id,
        limitType: updated.limitType,
        amount: updated.amount,
        month: updated.month,
        year: updated.year,
        categoryId: updated.categoryId,
        category: updated.category,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update spending limit';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });

  return handler(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const { id } = await params;
      const limit = await prisma.spendingLimit.findUnique({ where: { id } });

      if (!limit || limit.userId !== req.user!.id) {
        return NextResponse.json({ error: 'Spending limit not found' }, { status: 404 });
      }

      await prisma.spendingLimit.delete({ where: { id } });

      return NextResponse.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete spending limit';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });

  return handler(request);
}
