# Monthly Expense Tracker — Documentation

> Ứng dụng theo dõi chi tiêu hàng tháng — Full-stack web application built with Next.js 16, TypeScript, Prisma & SQLite.

## Table of Contents

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | Tech stack, project structure, data model, auth flow |
| [API Reference](./api-reference.md) | All REST endpoints with request/response examples |
| [Developer Guide](./developer-guide.md) | Local setup, dev workflow, testing, database management |
| [User Guide](./user-guide.md) | Feature walkthrough for end users |

## Quick Summary

### What It Does

Monthly Expense Tracker lets users:
- Register and await admin approval before gaining access
- Record income and expense transactions with categories, dates, and notes
- View a monthly dashboard with totals, category breakdowns, and multi-month trends
- Filter and search transactions by date, type, category, or keyword
- Export transactions to CSV
- Set spending limits per month or per category, with visual alerts (warning / exceeded)

### Who Uses It

| Role | Capabilities |
|------|-------------|
| **Admin** | Approve/reject pending user registrations; all regular user capabilities |
| **Active User** | Full transaction, category, spending limit, dashboard, and export access |
| **Pending User** | Registered but awaiting approval — cannot access the app |

### Tech Stack at a Glance

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes (TypeScript) |
| Database | SQLite via Prisma ORM |
| Auth | JWT (HttpOnly cookie) + Session table |
| Testing | Vitest 4, Testing Library, MSW 2 |
| Containerization | Docker + Docker Compose |
