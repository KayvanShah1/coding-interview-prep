---
title: "LAG, LEAD & period comparisons"
description: "Compare values in sequence without assuming dates are complete."
chapter: "windows"
order: 5
sequence: 605
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

`LAG` accesses a previous row's value. `LEAD` accesses a following row's value. They select a value at an offset; they do not aggregate a frame.

```sql
SELECT sale_date, revenue,
       LAG(revenue) OVER (ORDER BY sale_date) AS previous_revenue,
       LEAD(revenue) OVER (ORDER BY sale_date) AS next_revenue,
       LAG(revenue, 2) OVER (ORDER BY sale_date) AS two_rows_back
FROM daily_sales
ORDER BY sale_date;
```

In PostgreSQL, changing the frame does not restrict which row `LAG` or `LEAD` accesses. Their default offset is one. A third argument supplies a fallback when that offset lies outside the partition; it does not replace an existing row's null value.

## Month-over-month growth

```sql
WITH monthly AS (
    SELECT DATE_TRUNC('month', order_ts)::date AS month,
           SUM(amount) AS revenue
    FROM orders
    WHERE status = 'paid'
    GROUP BY DATE_TRUNC('month', order_ts)::date
), compared AS (
    SELECT month, revenue,
           LAG(month) OVER (ORDER BY month) AS previous_month,
           LAG(revenue) OVER (ORDER BY month) AS previous_revenue
    FROM monthly
)
SELECT month, revenue,
       CASE
           WHEN month = (previous_month + INTERVAL '1 month')::date
           THEN ROUND(
               100.0 * (revenue - previous_revenue)
               / NULLIF(previous_revenue, 0), 2
           )
       END AS growth_pct
FROM compared
ORDER BY month;
```

The adjacency check avoids calling January-to-March change “month-over-month” when February is missing. If missing months mean zero revenue, construct a complete calendar first.
