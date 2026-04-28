import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';

const BASE_URL = 'http://localhost';

const makeDashboardResponse = (overrides = {}) => ({
  month: '2026-04',
  summary: {
    total_income: 10000000,
    total_expense: 3500000,
    balance: 6500000,
    transaction_count: 25,
  },
  spending_limits: [],
  category_breakdown: [
    { category_id: 'cat1', category_name: 'Ăn uống', amount: 1500000, percentage: 43 },
    { category_id: 'cat2', category_name: 'Di chuyển', amount: 800000, percentage: 23 },
    { category_id: 'cat3', category_name: 'Mua sắm', amount: 1200000, percentage: 34 },
  ],
  monthly_trend: [
    { month: '2026-02', income: 10000000, expense: 3000000 },
    { month: '2026-03', income: 10000000, expense: 3200000 },
    { month: '2026-04', income: 10000000, expense: 3500000 },
  ],
  ...overrides,
});

describe('Dashboard API integration', () => {
  beforeEach(() => {
    server.use(
      http.get(`${BASE_URL}/api/dashboard`, ({ request }) => {
        const url = new URL(request.url);
        const month = url.searchParams.get('month');
        return HttpResponse.json(makeDashboardResponse({ month: month ?? '2026-04' }));
      }),
    );
  });

  it('returns dashboard data for current month', async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard`);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.summary).toBeDefined();
    expect(data.summary.total_income).toBe(10000000);
    expect(data.summary.total_expense).toBe(3500000);
    expect(data.summary.balance).toBe(6500000);
    expect(data.summary.transaction_count).toBe(25);
  });

  it('returns dashboard data for specified month', async () => {
    server.use(
      http.get(`${BASE_URL}/api/dashboard`, ({ request }) => {
        const url = new URL(request.url);
        const month = url.searchParams.get('month');
        if (month === '2026-03') {
          return HttpResponse.json(
            makeDashboardResponse({
              month: '2026-03',
              summary: {
                total_income: 9000000,
                total_expense: 3200000,
                balance: 5800000,
                transaction_count: 20,
              },
            }),
          );
        }
        return HttpResponse.json(makeDashboardResponse());
      }),
    );

    const res = await fetch(`${BASE_URL}/api/dashboard?month=2026-03`);
    const data = await res.json();

    expect(data.month).toBe('2026-03');
    expect(data.summary.total_income).toBe(9000000);
  });

  it('returns category breakdown', async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard`);
    const data = await res.json();

    expect(data.category_breakdown).toHaveLength(3);
    expect(data.category_breakdown[0]).toHaveProperty('category_name');
    expect(data.category_breakdown[0]).toHaveProperty('percentage');
  });

  it('returns monthly trend for last 3 months', async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard`);
    const data = await res.json();

    expect(data.monthly_trend).toHaveLength(3);
    expect(data.monthly_trend[0]).toHaveProperty('month');
    expect(data.monthly_trend[0]).toHaveProperty('income');
    expect(data.monthly_trend[0]).toHaveProperty('expense');
  });

  it('returns empty state when no transactions', async () => {
    server.use(
      http.get(`${BASE_URL}/api/dashboard`, () => {
        return HttpResponse.json(
          makeDashboardResponse({
            summary: {
              total_income: 0,
              total_expense: 0,
              balance: 0,
              transaction_count: 0,
            },
            category_breakdown: [],
            monthly_trend: [],
          }),
        );
      }),
    );

    const res = await fetch(`${BASE_URL}/api/dashboard`);
    const data = await res.json();

    expect(data.summary.transaction_count).toBe(0);
    expect(data.category_breakdown).toHaveLength(0);
  });

  it('returns 401 when not authenticated', async () => {
    server.use(
      http.get(`${BASE_URL}/api/dashboard`, () => {
        return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }),
    );

    const res = await fetch(`${BASE_URL}/api/dashboard`);
    expect(res.status).toBe(401);
  });
});
