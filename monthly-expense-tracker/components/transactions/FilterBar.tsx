'use client';

import { SearchBox } from './SearchBox';

export interface FilterBarState {
  month: string;
  type: '' | 'income' | 'expense';
  category_id: string;
  search: string;
  start_date: string;
  end_date: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface FilterBarProps {
  value: FilterBarState;
  categories: CategoryOption[];
  onChange: (value: FilterBarState) => void;
}

export function FilterBar({ value, categories, onChange }: FilterBarProps) {
  return (
    <section className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label htmlFor="filter-month" className="mb-1 block text-sm font-medium text-gray-700">
          Month
        </label>
        <input
          id="filter-month"
          type="month"
          value={value.month}
          onChange={(event) => onChange({ ...value, month: event.target.value })}
        />
      </div>

      <div>
        <label htmlFor="filter-type" className="mb-1 block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="filter-type"
          value={value.type}
          onChange={(event) =>
            onChange({ ...value, type: event.target.value as '' | 'income' | 'expense' })
          }
        >
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div>
        <label htmlFor="filter-category" className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="filter-category"
          value={value.category_id}
          onChange={(event) => onChange({ ...value, category_id: event.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-start-date" className="mb-1 block text-sm font-medium text-gray-700">
          Start date
        </label>
        <input
          id="filter-start-date"
          type="date"
          value={value.start_date}
          onChange={(event) => onChange({ ...value, start_date: event.target.value })}
        />
      </div>

      <div>
        <label htmlFor="filter-end-date" className="mb-1 block text-sm font-medium text-gray-700">
          End date
        </label>
        <input
          id="filter-end-date"
          type="date"
          value={value.end_date}
          onChange={(event) => onChange({ ...value, end_date: event.target.value })}
        />
      </div>

      <div>
        <label
          htmlFor="transaction-search"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Search
        </label>
        <SearchBox value={value.search} onChange={(search) => onChange({ ...value, search })} />
      </div>
    </section>
  );
}
