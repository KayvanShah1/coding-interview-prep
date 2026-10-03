---
title: "Retention & missing dates"
description: "Define observation windows and construct complete calendars."
chapter: "patterns"
order: 4
sequence: 704
level: "Core"
references: [{"title":"PostgreSQL date and time","url":"https://www.postgresql.org/docs/current/functions-datetime.html"}]
---

## Useful PostgreSQL date expressions

| Expression | Purpose |
|---|---|
| `order_ts::date` | Extract date using the applicable timezone semantics |
| `DATE_TRUNC('month', order_ts)` | Start of the month |
| `EXTRACT(YEAR FROM order_ts)` | Year number |
| `DATE '2026-01-10' + 1` | Next date |
| `DATE '2026-01-10' - DATE '2026-01-07'` | Three days |
| `event_ts + INTERVAL '30 minutes'` | Timestamp 30 minutes later |

For `timestamptz` stored as instants, `(event_ts AT TIME ZONE 'Asia/Kolkata')::date` obtains the India calendar date. A plain timestamp and a timezone-aware timestamp do not have identical conversion semantics.

## Next-day retention after first observed activity

```sql
WITH activity AS (
    SELECT DISTINCT user_id, event_ts::date AS activity_date
    FROM events
    WHERE event_ts IS NOT NULL
), first_activity AS (
    SELECT user_id, MIN(activity_date) AS first_date
    FROM activity
    GROUP BY user_id
), eligible AS (
    SELECT *
    FROM first_activity
    WHERE first_date < DATE '2026-01-31'
), labeled AS (
    SELECT f.user_id,
           CASE WHEN EXISTS (
               SELECT 1
               FROM activity a
               WHERE a.user_id = f.user_id
                 AND a.activity_date = f.first_date + 1
           ) THEN 1 ELSE 0 END AS returned_next_day
    FROM eligible f
)
SELECT ROUND(
           100.0 * SUM(returned_next_day) / NULLIF(COUNT(*), 0), 2
       ) AS day_1_retention_pct
FROM labeled;
```

Assume observations are complete through January 31. Excluding first activity on January 31 gives every included user a fully observed following day. “First observed activity” is not necessarily signup; use the signup table if that is the intended cohort definition.

## Include zero-sales dates with a calendar spine

```sql
WITH calendar AS (
    SELECT d::date AS sale_date
    FROM GENERATE_SERIES(
        TIMESTAMP '2026-01-01',
        TIMESTAMP '2026-01-31',
        INTERVAL '1 day'
    ) AS s(d)
), daily AS (
    SELECT order_ts::date AS sale_date, SUM(amount) AS revenue
    FROM orders
    WHERE status = 'paid'
      AND order_ts >= TIMESTAMP '2026-01-01'
      AND order_ts < TIMESTAMP '2026-02-01'
    GROUP BY order_ts::date
)
SELECT c.sale_date, COALESCE(d.revenue, 0) AS revenue
FROM calendar c
LEFT JOIN daily d ON d.sale_date = c.sale_date
ORDER BY c.sale_date;
```

Once every date exists exactly once, a seven-row window also represents seven calendar dates. Generate enough earlier history if the first displayed date needs a complete trailing window. Fill absent sales with zero only when absence means no sales, not an ingestion failure.
