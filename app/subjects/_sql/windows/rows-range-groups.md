---
title: "ROWS, RANGE & GROUPS"
description: "Separate row positions, value distances, and peer groups."
chapter: "windows"
order: 4
sequence: 604
level: "Core"
references: [{"title":"PostgreSQL window-frame syntax","url":"https://www.postgresql.org/docs/current/sql-expressions.html"}]
---

| Mode | What the offset measures | Typical use |
|---|---|---|
| `ROWS` | Row positions | Previous three records |
| `RANGE` | Ordering-value distance; peer rows share boundaries | Previous six calendar days plus today |
| `GROUPS` | Groups of equal ordering values | Previous distinct score group |

## Why ties matter

Suppose transactions are `(id, amount) = (1,10), (2,10), (3,20)`:

```sql
WITH t(id, amount) AS (VALUES (1, 10), (2, 10), (3, 20))
SELECT id, amount,
       SUM(amount) OVER (
           ORDER BY amount, id
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS row_total,
       SUM(amount) OVER (
           ORDER BY amount
           RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS peer_total
FROM t
ORDER BY amount, id;
```

| id | amount | row_total | peer_total |
|---:|---:|---:|---:|
| 1 | 10 | 10 | 20 |
| 2 | 10 | 20 | 20 |
| 3 | 20 | 40 | 40 |

The `RANGE` result includes both equal-amount rows together. PostgreSQL's default ordered frame has this peer-inclusive behavior. Specify `ROWS` explicitly for a running total that advances one record at a time.

## Seven calendar dates, including the current date

```sql
SELECT sale_date, revenue,
       SUM(revenue) OVER (
           ORDER BY sale_date
           RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW
       ) AS revenue_last_7_dates
FROM daily_sales
ORDER BY sale_date;
```

Assume `sale_date` is a `DATE`. This includes observed dates from `sale_date - 6` through `sale_date`, even if intermediate dates are absent. In contrast, `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` can reach farther back when dates are missing.

For a timestamp ordering key, an interval range is a time-distance window; it is not automatically a calendar-date bucket. PostgreSQL requires one ordering expression for offset-based `RANGE` frames. `GROUPS` and interval-frame support differ across databases.
