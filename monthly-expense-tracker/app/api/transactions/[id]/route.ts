import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withActiveUserAuth, type AuthRequest } from '@/lib/auth/middleware';
import { TransactionUpdateSchema } from '@/lib/utils/validation';
import { canAccessCategory } from '@/lib/utils/validation';

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    });

    if (!transaction || transaction.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(mapTransaction(transaction), { status: 200 });
  });

  return handler(request);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const existing = await prisma.transaction.findUnique({ where: { id } });
      if (!existing || existing.userId !== req.user!.id) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      const parsed = TransactionUpdateSchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
          { status: 400 }
        );
      }

      if (parsed.data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: parsed.data.categoryId },
        });
        if (!category) {
          return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        if (
          !canAccessCategory(category.isDefault, category.ownerId, req.user!.id, req.user!.role)
        ) {
          return NextResponse.json(
            { error: 'Category does not belong to current user' },
            { status: 403 }
          );
        }
      }

      const updated = await prisma.transaction.update({
        where: { id },
        data: parsed.data,
        include: { category: { select: { id: true, name: true } } },
      });

      return NextResponse.json(mapTransaction(updated), { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update transaction';
      return NextResponse.json({ error: message }, { status: 400 });
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
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.transaction.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  });

  return handler(request);
}
