---
title: "Dates, intervals & timezones"
description: "Define calendar periods correctly and avoid timestamp boundary errors."
chapter: "functions"
order: 3
sequence: 203
level: "Core"
references: [{"title":"PostgreSQL date/time functions","url":"https://www.postgresql.org/docs/current/functions-datetime.html"}]
---

## Calendar units are not all fixed durations

```sql
SELECT DATE '2026-01-10' + 7 AS next_week,
       DATE '2026-01-10' - DATE '2026-01-01' AS days_apart,
       DATE_TRUNC('month', TIMESTAMP '2026-03-17 11:20:00') AS month_start;
```

Expected: January 17, 9 days, and March 1 at midnight. A month has a variable number of days. A local day can have a different elapsed duration across daylight-saving transitions.

## Use the business timezone before taking a date

```sql
SELECT (TIMESTAMPTZ '2026-01-01 21:00:00+00'
        AT TIME ZONE 'Asia/Kolkata')::date AS india_date;
```

The India date is January 2. Grouping the same instant by its UTC date produces January 1.

## Bound the period directly

```sql
SELECT order_id, order_ts
FROM orders
WHERE order_ts >= TIMESTAMP '2026-01-01'
  AND order_ts <  TIMESTAMP '2026-02-01';
```

Use bounds with the appropriate type and timezone for the column. Half-open intervals avoid missed end-of-day events and duplicate boundary events between adjacent periods.

## Extracting is not truncating

`EXTRACT(MONTH FROM ts)` returns 1–12. Grouping by that alone combines January across all years. `DATE_TRUNC('month', ts)` retains a year-specific month boundary.

`AGE` expresses a symbolic difference using years, months, and days. For elapsed seconds, subtract timestamps and extract epoch from the resulting interval.

## Try it yourself

You have events on January 1, January 3, and January 10. Does `LAG(event_date)` on January 10 return January 9?

<details markdown="1"><summary>Show the answer</summary>

No. It returns January 3, the previous recorded date. Join to a calendar or explicitly verify adjacency when a metric requires the preceding calendar day.

</details>
