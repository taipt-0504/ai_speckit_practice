import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withActiveUserAuth, type AuthRequest } from '@/lib/auth/middleware';
import { parseMonthRange, parseDateInput } from '@/lib/utils/date';
import { serializeTransactionsToCsv } from '@/lib/utils/csv';

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

      // Fetch transactions with category info
      const transactions = await prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
      });

      // Build category map for CSV
      const categoryMap: Record<string, string> = {};
      for (const tx of transactions) {
        if (tx.category && !categoryMap[tx.categoryId]) {
          categoryMap[tx.categoryId] = tx.category.name;
        }
      }

      // Convert to Transaction type for CSV serialization
      const txsForCsv = transactions.map((tx) => ({
        ...tx,
        type: tx.type as 'income' | 'expense',
      }));

      // Apply search filter in memory (title and notes)
      let filtered = txsForCsv;
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter((tx) => {
          const titleMatch = tx.title.toLowerCase().includes(query);
          const notesMatch = (tx.notes ?? '').toLowerCase().includes(query);
          return titleMatch || notesMatch;
        });
      }

      // Generate CSV
      const csv = serializeTransactionsToCsv(filtered, categoryMap);

      // Return as CSV file
      const filename = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      console.error('CSV export error:', error);
      return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
    }
  });

  return handler(request);
}
