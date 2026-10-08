---
title: "Think in rows and grain"
description: "Establish what one input and output row represents."
chapter: "foundations"
order: 1
sequence: 1
level: "Core"
references: [{"title":"PostgreSQL table expressions","url":"https://www.postgresql.org/docs/current/queries-table-expressions.html"}]
---

Before writing SQL, state **what one input row represents** and **what one output row should represent**.

Examples used throughout:

| Table | Columns used | One row represents |
|---|---|---|
| `customers` | `customer_id`, `name`, `city` | One customer |
| `orders` | `order_id`, `customer_id`, `order_ts`, `amount`, `status` | One order |
| `order_items` | `order_id`, `product_id`, `quantity`, `unit_price` | One order line |
| `payments` | `payment_id`, `order_id`, `amount` | One payment, possibly partial |
| `employees` | `employee_id`, `department_id`, `manager_id`, `salary` | One employee |
| `events` | `event_id`, `user_id`, `event_ts`, `event_type` | One user event |
| `daily_sales` | `sale_date`, `revenue` | One observed date |
| `products` | `product_id`, `category` | One product |

Assume identifiers are non-null and unique at the stated grain, timestamps use a consistent timezone, and monetary values use a numeric type. Other tables are introduced where needed. Tables are illustrative; the guide is not one script to execute from top to bottom.

Ask these questions:

1. Do I need one row per customer, per order, or per customer per month?
2. Should customers with no orders appear?
3. Do ties count? Does “second highest” mean the second distinct value?
4. Does “7 days” mean calendar dates or 168 hours?
5. Should duplicates, missing dates, or null values affect the result?

**Example:** “Customers with at least one paid order” needs one row per customer. `EXISTS` expresses that directly. Joining every paid order creates one row per matching order unless you reduce the result afterward.
