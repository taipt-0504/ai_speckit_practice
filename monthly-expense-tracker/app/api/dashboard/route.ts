import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withActiveUserAuth, type AuthRequest } from '@/lib/auth/middleware';
import { parseMonthRange } from '@/lib/utils/date';
import {
  calculateTotals,
  calculateCategoryBreakdown,
  calculateSpendingLimitStatus,
} from '@/lib/utils/calculations';

export async function GET(request: NextRequest) {
  const handler = withActiveUserAuth(async (req: AuthRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const month = searchParams.get('month') ?? undefined;

      // Validate month format
      if (month && !/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json(
          { error: 'Invalid month format. Expected YYYY-MM' },
          { status: 400 }
        );
      }

      const monthRange = parseMonthRange(month);
      const userId = req.user!.id;

      // Determine month label (YYYY-MM)
      const monthLabel =
        month ??
        `${monthRange.start.getFullYear()}-${String(monthRange.start.getMonth() + 1).padStart(2, '0')}`;

      // Fetch current month transactions with category
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: monthRange.start, lt: monthRange.end },
        },
        include: { category: true },
        orderBy: { date: 'desc' },
      });

      // Summary
      const totals = calculateTotals(transactions as Parameters<typeof calculateTotals>[0]);
      const summary = {
        total_income: totals.income,
        total_expense: totals.expense,
        balance: totals.income - totals.expense,
        transaction_count: transactions.length,
      };

      // Category breakdown (expenses only)
      const categoryBreakdown = calculateCategoryBreakdown(
        transactions as Parameters<typeof calculateCategoryBreakdown>[0]
      ).map((item) => ({
        category_id: item.categoryId,
        category_name: item.categoryName,
        amount: item.amount,
        percentage: item.percentage,
      }));

      // Spending limits
      const [year, monthNum] = monthLabel.split('-').map(Number);
      const limits = await prisma.spendingLimit.findMany({
        where: { userId, year, month: monthNum },
        include: { category: true },
      });

      const spendingLimits = await Promise.all(
        limits.map(async (limit) => {
          let spentAmount: number;

          if (limit.categoryId) {
            // Per-category limit: sum expenses in that category for the month
            const result = await prisma.transaction.aggregate({
              where: {
                userId,
                type: 'expense',
                categoryId: limit.categoryId,
                date: { gte: monthRange.start, lt: monthRange.end },
              },
              _sum: { amount: true },
            });
            spentAmount = result._sum.amount ?? 0;
          } else {
            // Monthly total limit
            spentAmount = totals.expense;
          }

          const { percentage, status } = calculateSpendingLimitStatus(spentAmount, limit.amount);

          return {
            id: limit.id,
            type: limit.limitType === 'monthly_total' ? 'monthly_total' : 'per_category',
            limit_amount: limit.amount,
            spent_amount: spentAmount,
            percentage,
            status,
            category: limit.category ? { id: limit.category.id, name: limit.category.name } : null,
          };
        })
      );

      // Monthly trend: last 3 months including current
      const trendMonths: { start: Date; end: Date; label: string }[] = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(monthRange.start);
        d.setMonth(d.getMonth() - i);
        const tStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const tEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const label = `${tStart.getFullYear()}-${String(tStart.getMonth() + 1).padStart(2, '0')}`;
        trendMonths.push({ start: tStart, end: tEnd, label });
      }

      const monthlyTrend = await Promise.all(
        trendMonths.map(async ({ start, end, label }) => {
          const result = await prisma.transaction.groupBy({
            by: ['type'],
            where: {
              userId,
              date: { gte: start, lt: end },
            },
            _sum: { amount: true },
          });

          const income = result.find((r) => r.type === 'income')?._sum.amount ?? 0;
          const expense = result.find((r) => r.type === 'expense')?._sum.amount ?? 0;

          return { month: label, income, expense };
        })
      );

      return NextResponse.json({
        month: monthLabel,
        summary,
        spending_limits: spendingLimits,
        category_breakdown: categoryBreakdown,
        monthly_trend: monthlyTrend,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid month format')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      console.error('Dashboard API error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });

  return handler(request);
}
