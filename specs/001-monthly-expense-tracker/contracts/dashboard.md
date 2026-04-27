# API Contracts: Dashboard

**Base URL**: `/api/dashboard`
**Auth**: Required (JWT token in header)

## GET /

Get aggregated dashboard data for a specific month.

**Query Parameters**:
- `month` (optional): YYYY-MM format — defaults to current month

**Response** (200 OK):
```json
{
  "month": "2026-04",
  "summary": {
    "total_income": 10000000,
    "total_expense": 3500000,
    "balance": 6500000,
    "transaction_count": 25
  },
  "spending_limits": [
    {
      "id": "uuid",
      "type": "monthly_total",
      "limit_amount": 5000000,
      "spent_amount": 3500000,
      "percentage": 70,
      "status": "warning",
      "category": null
    },
    {
      "id": "uuid-2",
      "type": "per_category",
      "category": {
        "id": "cat-uuid",
        "name": "Giải trí"
      },
      "limit_amount": 1000000,
      "spent_amount": 1200000,
      "percentage": 120,
      "status": "exceeded"
    }
  ],
  "category_breakdown": [
    {
      "category_id": "uuid-cat1",
      "category_name": "Ăn uống",
      "amount": 1500000,
      "percentage": 43
    },
    {
      "category_id": "uuid-cat2",
      "category_name": "Di chuyển",
      "amount": 800000,
      "percentage": 23
    },
    {
      "category_id": "uuid-cat3",
      "category_name": "Mua sắm",
      "amount": 1200000,
      "percentage": 34
    }
  ],
  "monthly_trend": [
    {
      "month": "2026-02",
      "income": 10000000,
      "expense": 3000000
    },
    {
      "month": "2026-03",
      "income": 10000000,
      "expense": 3200000
    },
    {
      "month": "2026-04",
      "income": 10000000,
      "expense": 3500000
    }
  ]
}
```

**Field Descriptions**:
- `status`: "normal" (< 80%), "warning" (80-100%), "exceeded" (> 100%)
- `percentage`: (spent / limit) * 100
- `category_breakdown`: Percentage breakdown of expenses by category
- `monthly_trend`: Last 3 months of income/expense for trend visualization

**Note**: All monetary values are in base currency units (e.g., VND).
