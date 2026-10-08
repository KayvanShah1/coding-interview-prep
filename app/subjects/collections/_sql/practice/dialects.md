---
title: "SQL dialect differences"
description: "Translate common operations between PostgreSQL, BigQuery, and MySQL."
chapter: "practice"
order: 3
sequence: 1403
level: "Core"
references: [{"title":"PostgreSQL date functions","url":"https://www.postgresql.org/docs/current/functions-datetime.html"}]
---

## Small translation table

| Need | PostgreSQL | BigQuery | MySQL 8+ |
|---|---|---|---|
| Date from timestamp | `ts::date` | `DATE(ts)`; timezone argument when needed | `DATE(ts)` |
| Add one day to date | `d + 1` | `DATE_ADD(d, INTERVAL 1 DAY)` | `DATE_ADD(d, INTERVAL 1 DAY)` |
| Difference in whole dates | `d2 - d1` | `DATE_DIFF(d2, d1, DAY)` | `DATEDIFF(d2, d1)` |
| Month start from date | `DATE_TRUNC('month', d)::date` | `DATE_TRUNC(d, MONTH)` | `CAST(DATE_FORMAT(d, '%Y-%m-01') AS DATE)` |
| Conditional count | `COUNT(*) FILTER (WHERE condition)` | `COUNTIF(condition)` | `SUM(CASE WHEN condition THEN 1 ELSE 0 END)` |
| Filter window output | CTE or subquery | `QUALIFY` or CTE | CTE or subquery |

For BigQuery, latest order per customer can be written as:

```sql
-- BigQuery / GoogleSQL
SELECT order_id, customer_id, order_ts, amount
FROM orders
QUALIFY ROW_NUMBER() OVER (
    PARTITION BY customer_id
    ORDER BY order_ts DESC, order_id DESC
) = 1;
```

For BigQuery `RANGE` over calendar dates, use a numeric ordering key:

```sql
-- BigQuery / GoogleSQL
SELECT sale_date,
       SUM(revenue) OVER (
           ORDER BY UNIX_DATE(sale_date)
           RANGE BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS revenue_last_7_dates
FROM daily_sales;
```

Do not mix PostgreSQL interval syntax, MySQL `DATEDIFF`, and BigQuery `QUALIFY` in one answer. Confirm the platform's selected dialect before starting.
