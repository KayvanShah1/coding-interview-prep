---
title: "Running totals & moving averages"
description: "Build cumulative metrics, trailing calculations, and shares."
chapter: "windows"
order: 7
sequence: 607
level: "Core"
references: [{"title":"PostgreSQL window-frame syntax","url":"https://www.postgresql.org/docs/current/sql-expressions.html"}]
---

## Running revenue per customer

```sql
SELECT order_id, customer_id, order_ts, amount,
       SUM(amount) OVER (
           PARTITION BY customer_id
           ORDER BY order_ts, order_id
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_revenue
FROM orders
WHERE status = 'paid'
ORDER BY customer_id, order_ts, order_id;
```

Only paid rows participate because `WHERE` runs before the window calculation.

## Three-row average, only after three observations exist

```sql
WITH rolling AS (
    SELECT sale_date, revenue,
           AVG(revenue) OVER (
               ORDER BY sale_date
               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
           ) AS moving_average,
           COUNT(*) OVER (
               ORDER BY sale_date
               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
           ) AS rows_in_frame
    FROM daily_sales
)
SELECT sale_date, moving_average
FROM rolling
WHERE rows_in_frame = 3
ORDER BY sale_date;
```

If you require three non-null revenue observations, use `COUNT(revenue)` instead. Three rows do not guarantee three consecutive dates.

## Customer share of total revenue

```sql
WITH customer_revenue AS (
    SELECT customer_id, SUM(amount) AS revenue
    FROM orders
    WHERE status = 'paid'
    GROUP BY customer_id
)
SELECT customer_id, revenue,
       ROUND(100.0 * revenue / NULLIF(SUM(revenue) OVER (), 0), 2)
           AS revenue_share_pct
FROM customer_revenue;
```

The CTE makes one row per customer. `OVER ()` then totals those customer rows. This two-stage form is easier to explain than embedding an aggregate inside a window aggregate.
