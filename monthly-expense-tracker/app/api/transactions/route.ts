import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withActiveUserAuth, type AuthRequest } from '@/lib/auth/middleware';
import { TransactionSchema } from '@/lib/utils/validation';
import { canAccessCategory } from '@/lib/utils/validation';
import { parseDateInput, parseMonthRange } from '@/lib/utils/date';

function mapTransaction(row: {
  id: string;
  title: string;
  amount: number;
  date: Date;
  type: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string };
}) {
  return {
    id: row.id,
    title: row.title,
    amount: row.amount,
    date: row.date.toISOString().slice(0, 10),
    type: row.type,
    category: row.category,
    notes: row.notes,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const month = searchParams.get('month') ?? undefined;
      const type = searchParams.get('type');
      const categoryId = searchParams.get('category_id') ?? searchParams.get('categoryId');
      const search = searchParams.get('search')?.trim();
      const startDate = parseDateInput(searchParams.get('start_date'));
      const endDate = parseDateInput(searchParams.get('end_date'));
      const limit = Number(searchParams.get('limit') ?? '50');
      const offset = Number(searchParams.get('offset') ?? '0');

      const monthRange = !startDate && !endDate ? parseMonthRange(month) : null;
      const dateFrom = startDate ?? monthRange?.start;
      const dateTo = endDate ?? monthRange?.end;

      const where = {
        userId: req.user!.id,
        ...(type === 'income' || type === 'expense' ? { type } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(dateFrom || dateTo
          ? {
              date: {
                ...(dateFrom ? { gte: dateFrom } : {}),
                ...(dateTo ? { lt: dateTo } : {}),
              },
            }
          : {}),
      };

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: { category: { select: { id: true, name: true } } },
          orderBy: { date: 'desc' },
          skip: search ? 0 : offset,
          take: search ? undefined : limit,
        }),
        prisma.transaction.count({ where }),
      ]);

      // Apply search filter in memory (SQLite doesn't support insensitive mode)
      let filtered = transactions;
      let filteredTotal = total;
      if (search) {
        const query = search.toLowerCase();
        filtered = transactions.filter((tx) => {
          return (
            tx.title.toLowerCase().includes(query) ||
            (tx.notes ?? '').toLowerCase().includes(query)
          );
        });
        filteredTotal = filtered.length;
        filtered = filtered.slice(offset, offset + limit);
      }

      return NextResponse.json(
        {
          transactions: filtered.map(mapTransaction),
          total: filteredTotal,
          limit,
          offset,
        },
        { status: 200 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list transactions';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });

  return handler(request);
}

export async function POST(request: NextRequest) {
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const body = await request.json();
      const parsed = TransactionSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
          { status: 400 }
        );
      }

      const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      if (!canAccessCategory(category.isDefault, category.ownerId, req.user!.id, req.user!.role)) {
        return NextResponse.json(
          { error: 'Category does not belong to current user' },
          { status: 403 }
        );
      }

      const created = await prisma.transaction.create({
        data: {
          title: parsed.data.title,
          amount: parsed.data.amount,
          type: parsed.data.type,
          date: parsed.data.date,
          categoryId: parsed.data.categoryId,
          notes: parsed.data.notes,
          userId: req.user!.id,
        },
        include: { category: { select: { id: true, name: true } } },
      });

      return NextResponse.json(mapTransaction(created), { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create transaction';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  });

  return handler(request);
}
