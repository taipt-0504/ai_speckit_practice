# User Guide

## Getting Started

### 1. Register an account

1. Open the application at [http://localhost:3000](http://localhost:3000) — you will be redirected to the login page.
2. Click **Register** to go to the sign-up form.
3. Enter a valid email address and a password (minimum 8 characters, at least one uppercase letter and one number).
4. Submit the form. You will see a **waiting for approval** screen.

> Your account is created with status **Pending**. You cannot access the application until an administrator approves your registration.

### 2. Wait for admin approval

Once registered, you will see a notice screen. An administrator must approve your account before you can log in. If you try to log in while pending, you will see:

> *"Account status is pending. Please wait for admin approval."*

### 3. Log in

After your account is approved:

1. Go to the **Login** page.
2. Enter your email and password.
3. Click **Login**. You will be redirected to the Dashboard.

### 4. Log out

Click the **Logout** button in the top-right area of the header. This clears your session and returns you to the login screen.

---

## Navigating the App

The application has a **sidebar** (left panel) and a **header** (top bar).

### Header

- Displays your **email address** and **role** (user / admin).
- Contains the **Logout** button.
- On mobile, shows the **menu toggle** (hamburger icon) to open/close the sidebar.

### Sidebar navigation

| Link | Destination |
|------|-------------|
| Dashboard | Monthly overview with charts |
| Transactions | Full transaction list with filters |
| Categories | Manage categories |
| Spending Limits | Manage spending limits |
| Admin Users | (Admin only) Approve/reject registrations |

---

## Dashboard

The Dashboard gives you a financial overview of the selected month.

### Monthly selector

Use the **month picker** at the top of the dashboard to switch between months. All numbers and charts update to reflect the selected month.

### Summary cards

| Card | Description |
|------|-------------|
| Total Income | Sum of all income transactions in the month |
| Total Expense | Sum of all expense transactions in the month |
| Balance | Total Income − Total Expense |

### Category Breakdown chart

A pie or bar chart showing how your expenses are distributed across categories for the selected month. Each segment shows the category name and percentage of total expenses.

### Income vs Expense trend

A bar chart showing the last 3 months of income and expense totals side by side, so you can visualize trends over time.

### Spending limit alerts

If you have spending limits configured for the month, alert badges appear in the dashboard:

| Colour | Meaning |
|--------|---------|
| Green | Under 80% of limit (Normal) |
| Yellow/Orange | Between 80–100% of limit (Warning) |
| Red | Over 100% of limit (Exceeded) |

---

## Transactions

### Viewing transactions

Go to **Transactions** in the sidebar. By default, you see all transactions for the current month, newest first.

### Filtering and searching

Use the **filter bar** at the top:

| Filter | Options |
|--------|---------|
| Month | Select any YYYY-MM to view that month's transactions |
| Type | All / Income / Expense |
| Category | Select a specific category |
| Date Range | Set a custom start date and end date |
| Search | Type keywords to match transaction title or notes |

Multiple filters can be combined. Results update automatically.

### Adding a transaction

1. Click **New Transaction** (or the **+** button).
2. Fill in the form:
   - **Title**: Short description (required, max 255 characters)
   - **Amount**: Positive number in base currency (required)
   - **Type**: Income or Expense (required)
   - **Date**: Transaction date (required)
   - **Category**: Select from the list (required)
   - **Notes**: Optional additional details
3. Click **Save**. The transaction appears in the list immediately.

### Editing a transaction

1. Click the **edit icon** on any transaction row.
2. Modify the fields you want to change.
3. Click **Save** to apply the changes.

### Deleting a transaction

1. Click the **delete icon** on the transaction row.
2. Confirm the deletion when prompted.

> **Note**: Deleting a transaction is permanent and immediately affects all totals and dashboard figures.

### Exporting to CSV

1. Apply any filters you want (date range, type, category, etc.).
2. Click the **Export CSV** button.
3. A file named `transactions-YYYY-MM.csv` is downloaded with the following columns:

```
date, title, type, category, amount, notes
```

---

## Categories

### Viewing categories

Go to **Categories** in the sidebar. You will see two sections:
- **Default categories**: System-provided, cannot be deleted or renamed.
- **My categories**: Your own custom categories.

**Default categories**: Ăn uống, Di chuyển, Nhà ở, Giải trí, Sức khỏe, Mua sắm, Thu nhập, Khác.

### Creating a custom category

1. Click **Add Category**.
2. Enter a name (unique for your account).
3. Optionally pick a colour (hex code) for visual identification in charts.
4. Click **Save**.

### Editing a custom category

Click the **edit icon** next to a custom category to rename it or change its colour. Default categories cannot be edited.

### Deleting a custom category

Click the **delete icon** on a custom category. 

> If transactions are assigned to this category, you must **reassign** them to another category first. The UI will prompt you to select a replacement category before deleting.

---

## Spending Limits

Spending limits let you cap how much you spend in a given month — either in total or per category. The dashboard shows real-time progress toward each limit.

### Setting a total monthly limit

1. Go to **Spending Limits**.
2. Click **Add Limit**.
3. Select the month (e.g., `2026-05`).
4. Leave the **Category** field blank (this creates a total monthly cap).
5. Enter the limit amount.
6. Click **Save**.

### Setting a per-category limit

1. Click **Add Limit**.
2. Select the month.
3. Choose a **Category** from the dropdown.
4. Enter the limit amount.
5. Click **Save**.

> Only one limit per `(month, category)` combination is allowed. To change a limit, edit the existing one rather than creating a new one.

### Editing a limit

Click the **edit icon** on any limit row and update the amount.

### Deleting a limit

Click the **delete icon** to remove the cap. This does not delete any transactions — it just removes the alert threshold.

### Limit status indicators

Limits are shown on the dashboard with a progress bar and colour indicator:

- **Green** — Spending is under 80% of the limit.
- **Yellow** — Spending is between 80% and 100% (approaching the limit).
- **Red** — Spending has exceeded the limit.

---

## Admin: Managing Users

*(Available only to accounts with the Admin role)*

### Viewing pending registrations

1. Click **Admin Users** in the sidebar.
2. You will see a list of accounts awaiting approval, with their email and registration date.

### Approving a user

Click **Approve** next to a pending user. Their status changes to **Active** and they can log in immediately.

### Rejecting a user

Click **Reject** next to a pending user. Their status changes to **Rejected** and they will be blocked from logging in.

> Status transitions are final — a rejected user cannot be re-approved through the UI. They would need to register with a different email.

---

## Frequently Asked Questions

**Q: I registered but cannot log in.**  
A: Your account is waiting for admin approval. Check the waiting screen or contact the administrator.

**Q: I deleted a category and now my transactions show no category.**  
A: You can only delete a category after reassigning all its transactions. The UI guides you through this before confirming the deletion.

**Q: My dashboard shows "0" even though I have transactions.**  
A: Make sure the **month selector** on the dashboard is set to the month containing your transactions.

**Q: The CSV export is empty.**  
A: The export respects all active filters. If a filter returns no transactions (e.g., a specific date range with no data), the CSV will be empty. Reset filters and try again.

**Q: Can I change my email or password?**  
A: Account settings are not available in the current version. Contact the administrator for account changes.
