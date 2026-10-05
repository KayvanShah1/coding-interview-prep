---
title: "Joins & row multiplication"
description: "Keep unmatched rows and avoid inflated totals."
chapter: "joins"
order: 1
sequence: 301
level: "Core"
references: [{"title":"PostgreSQL table expressions","url":"https://www.postgresql.org/docs/current/queries-table-expressions.html"}]
---

| Join | What it returns |
|---|---|
| `INNER JOIN` | Matching pairs |
| `LEFT JOIN` | Matching pairs, plus unmatched left rows with null right columns |
| `FULL OUTER JOIN` | Matches and unmatched rows from both sides |
| `CROSS JOIN` | Every possible pair |
| Self join | A table joined to another alias of itself |

## Preserve customers with zero paid orders

```sql
SELECT c.customer_id,
       COUNT(o.order_id) AS paid_orders
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.customer_id
 AND o.status = 'paid'
GROUP BY c.customer_id;
```

Put the paid-order condition in `ON` to retain customers without matches. Moving it to `WHERE o.status = 'paid'` discards the unmatched rows. Count `o.order_id`, not `COUNT(*)`, so an unmatched customer receives zero.

## Self join: employee earning more than their manager

```sql
SELECT e.employee_id, e.salary, m.salary AS manager_salary
FROM employees e
JOIN employees m ON m.employee_id = e.manager_id
WHERE e.salary > m.salary;
```

## Avoid joining two independent one-to-many tables directly

An order with three items and two payments produces six rows when both child tables are joined on `order_id`. Summing afterward duplicates both amounts.

Aggregate each child first:

```sql
WITH item_totals AS (
    SELECT order_id, SUM(quantity * unit_price) AS item_total
    FROM order_items
    GROUP BY order_id
), payment_totals AS (
    SELECT order_id, SUM(amount) AS paid_total
    FROM payments
    GROUP BY order_id
)
SELECT o.order_id,
       COALESCE(i.item_total, 0) AS item_total,
       COALESCE(p.paid_total, 0) AS paid_total
FROM orders o
LEFT JOIN item_totals i ON i.order_id = o.order_id
LEFT JOIN payment_totals p ON p.order_id = o.order_id;
```

`SUM(DISTINCT amount)` is not a general fix: two legitimate payments can have the same amount.
