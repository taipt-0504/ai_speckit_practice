import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withActiveUserAuth, type AuthRequest } from '@/lib/auth/middleware';
import { SpendingLimitSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const monthParam = searchParams.get('month'); // YYYY-MM format

      const where: { userId: string; year?: number; month?: number } = {
        userId: req.user!.id,
      };

      if (monthParam) {
        const [yearStr, monthStr] = monthParam.split('-');
        const year = parseInt(yearStr ?? '', 10);
        const month = parseInt(monthStr ?? '', 10);
        if (!isNaN(year) && !isNaN(month)) {
          where.year = year;
          where.month = month;
        }
      }

      const limits = await prisma.spendingLimit.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(
        {
          limits: limits.map((l) => ({
            id: l.id,
            limitType: l.limitType,
            amount: l.amount,
            month: l.month,
            year: l.year,
            categoryId: l.categoryId,
            category: l.category,
            createdAt: l.createdAt,
            updatedAt: l.updatedAt,
          })),
        },
        { status: 200 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list spending limits';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });

  return handler(request);
}

export async function POST(request: NextRequest) {
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const body: unknown = await request.json();
      const parsed = SpendingLimitSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
          { status: 400 }
        );
      }

      const { limitType, amount, month, year, categoryId } = parsed.data;

      // Enforce: category type must have categoryId, monthly_total must not
      if (limitType === 'category' && !categoryId) {
        return NextResponse.json(
          { error: 'categoryId is required for category-type limits' },
          { status: 400 }
        );
      }

      // Check for duplicate (unique per user + month + year + categoryId)
      const existing = await prisma.spendingLimit.findFirst({
        where: {
          userId: req.user!.id,
          year,
          month,
          categoryId: categoryId ?? null,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'A spending limit for this period already exists' },
          { status: 409 }
        );
      }

      const created = await prisma.spendingLimit.create({
        data: {
          userId: req.user!.id,
          limitType,
          amount,
          month,
          year,
          categoryId: categoryId ?? null,
        },
        include: { category: { select: { id: true, name: true } } },
      });

      return NextResponse.json(
        {
          id: created.id,
          limitType: created.limitType,
          amount: created.amount,
          month: created.month,
          year: created.year,
          categoryId: created.categoryId,
          category: created.category,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
        { status: 201 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create spending limit';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });

  return handler(request);
}
