import type { Transaction } from '@/types/forms';

export function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const stringValue = String(value);

  // Check if value needs to be quoted (contains comma, newline, or quote)
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    // Escape quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return stringValue;
}

export interface CsvExportOptions {
  includeNotes?: boolean;
}

export function serializeTransactionsToCsv(
  transactions: Transaction[],
  categoryMap: Record<string, string>,
  options: CsvExportOptions = {}
): string {
  const { includeNotes = true } = options;

  // CSV header
  const headers = ['Date', 'Title', 'Type', 'Amount', 'Category'];
  if (includeNotes) {
    headers.push('Notes');
  }
  const headerRow = headers.map(formatCsvValue).join(',');

  // Transaction rows
  const rows = transactions.map((tx) => {
    const categoryName = categoryMap[tx.categoryId] ?? '';
    const dateStr = tx.date instanceof Date ? tx.date.toISOString().slice(0, 10) : tx.date;
    const row = [
      formatCsvValue(dateStr),
      formatCsvValue(tx.title),
      formatCsvValue(tx.type),
      formatCsvValue(tx.amount),
      formatCsvValue(categoryName),
    ];

    if (includeNotes) {
      row.push(formatCsvValue(tx.notes ?? ''));
    }

    return row.join(',');
  });

  return [headerRow, ...rows].join('\n');
}
