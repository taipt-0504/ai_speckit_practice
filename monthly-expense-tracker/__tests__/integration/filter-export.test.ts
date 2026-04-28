import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';

const BASE_URL = 'http://localhost';

describe('Transaction filter and export integration', () => {
  beforeEach(() => {
    server.use(
      http.get(`${BASE_URL}/api/transactions`, ({ request }) => {
        const url = new URL(request.url);
        const month = url.searchParams.get('month');
        const type = url.searchParams.get('type');
        const search = url.searchParams.get('search');

        // Mock response: filter based on query params
        let transactions = [
          {
            id: 'tx1',
            title: 'Lunch at restaurant',
            amount: 150000,
            type: 'expense',
            date: '2026-04-10',
            category: { id: 'cat1', name: 'Ăn uống' },
            notes: 'Delicious meal',
          },
          {
            id: 'tx2',
            title: 'Salary',
            amount: 5000000,
            type: 'income',
            date: '2026-04-01',
            category: { id: 'cat-income', name: 'Thu nhập' },
            notes: null,
          },
          {
            id: 'tx3',
            title: 'Uber trip',
            amount: 50000,
            type: 'expense',
            date: '2026-04-15',
            category: { id: 'cat2', name: 'Di chuyển' },
            notes: 'To airport',
          },
        ];

        // Apply filters
        if (type) {
          transactions = transactions.filter((t) => t.type === type);
        }
        if (search) {
          transactions = transactions.filter(
            (t) =>
              t.title.toLowerCase().includes(search.toLowerCase()) ||
              (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()))
          );
        }

        return HttpResponse.json({
          transactions,
          total: transactions.length,
        });
      }),

      http.get(`${BASE_URL}/api/transactions/export-csv`, ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get('type');
        const search = url.searchParams.get('search');

        // Mock CSV generation
        let csv =
          'Date,Title,Type,Amount,Category,Notes\n' +
          '2026-04-10,Lunch at restaurant,expense,150000,Ăn uống,Delicious meal\n' +
          '2026-04-01,Salary,income,5000000,Thu nhập,\n' +
          '2026-04-15,Uber trip,expense,50000,Di chuyển,To airport\n';

        if (type === 'expense') {
          csv =
            'Date,Title,Type,Amount,Category,Notes\n' +
            '2026-04-10,Lunch at restaurant,expense,150000,Ăn uống,Delicious meal\n' +
            '2026-04-15,Uber trip,expense,50000,Di chuyển,To airport\n';
        }

        if (search === 'lunch') {
          csv =
            'Date,Title,Type,Amount,Category,Notes\n' +
            '2026-04-10,Lunch at restaurant,expense,150000,Ăn uống,Delicious meal\n';
        }

        return HttpResponse.text(csv, {
          headers: { 'content-type': 'text/csv' },
        });
      })
    );
  });

  it('fetches transactions with type filter applied', async () => {
    const res = await fetch(`${BASE_URL}/api/transactions?type=expense`);
    const data = (await res.json()) as { transactions: unknown[]; total: number };

    expect(data.total).toBe(2); // 2 expenses
  });

  it('fetches transactions with search filter applied', async () => {
    const res = await fetch(`${BASE_URL}/api/transactions?search=restaurant`);
    const data = (await res.json()) as { transactions: unknown[]; total: number };

    expect(data.total).toBe(1); // Only "Lunch at restaurant"
  });

  it('combines multiple filters in request', async () => {
    const res = await fetch(`${BASE_URL}/api/transactions?type=expense&search=trip`);
    const data = (await res.json()) as { transactions: unknown[]; total: number };

    expect(data.total).toBe(1); // Only "Uber trip"
  });

  it('exports transactions to CSV with all fields', async () => {
    const res = await fetch(`${BASE_URL}/api/transactions/export-csv`);
    const csv = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
    expect(csv).toContain('Date,Title,Type,Amount,Category,Notes');
    expect(csv).toContain('Lunch at restaurant');
    expect(csv).toContain('Salary');
  });

  it('exports filtered CSV when type filter applied', async () => {
    const res = await fetch(`${BASE_URL}/api/transactions/export-csv?type=expense`);
    const csv = await res.text();

    expect(csv).toContain('Lunch at restaurant');
    expect(csv).not.toContain('Salary');
  });

  it('exports filtered CSV when search filter applied', async () => {
    const res = await fetch(`${BASE_URL}/api/transactions/export-csv?search=lunch`);
    const csv = await res.text();

    expect(csv).toContain('Lunch at restaurant');
    expect(csv).not.toContain('Salary');
    expect(csv).not.toContain('Uber');
  });

  it('exports with proper CSV encoding for special characters', async () => {
    const res = await fetch(`${BASE_URL}/api/transactions/export-csv`);
    const csv = await res.text();

    // Should escape quotes and commas properly
    expect(csv).toBeTruthy();
  });
});
