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

## Predict the cardinality before the join

Suppose one order has three item rows and two payment rows. Joining both child tables directly does not give five rows. It gives six: every item can pair with every payment.

That is the question to ask before writing a join: **for one row on the left, how many rows can match on the right?** Repeat the question at every join. A query can be syntactically correct and still inflate measures because its intermediate grain changed.

| Relationship | One left row can produce |
|---|---|
| one-to-one | at most one matched row |
| one-to-many | several rows |
| many-to-many | a product of matching rows unless constrained |

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


## Generate every expected combination, including zeros

Assume `students(student_id)`, `subjects(subject_name)`, and `examinations(student_id, subject_name)`, with one row per attendance.

```sql
SELECT s.student_id, sub.subject_name,
       COUNT(e.student_id) AS attendance_count
FROM students s
CROSS JOIN subjects sub
LEFT JOIN examinations e
  ON e.student_id = s.student_id
 AND e.subject_name = sub.subject_name
GROUP BY s.student_id, sub.subject_name;
```

The `CROSS JOIN` creates the expected student × subject population. The `LEFT JOIN` attaches observations while preserving combinations with no attendance. The same shape works for customer × month and store × date grids. Check the grid size first: M × N expected combinations are created before observations are attached.
