---
title: "Aggregation"
nav_title: "Overview"
description: "Summarize data and define meaningful denominators."
chapter: "aggregation"
order: 0
sequence: 300
level: "Chapter overview"
---

## What exactly are you counting?

Aggregation changes grain. Counts, rates, percentiles, and subtotals are reliable only when their populations are clear. Use the command map below as a route into worked examples rather than as a list to memorize.


## Quick reference

| Syntax | Use when | Common combination |
|---|---|---|
| `WHERE` | Filter input rows before aggregation | predicates, date/status filters |
| `COUNT(*)` | Count input rows | `GROUP BY` |
| `COUNT(column)` | Count non-null values | `LEFT JOIN` match counts |
| `COUNT(DISTINCT x)` | Count unique values | `GROUP BY`, `HAVING` |
| `SUM / AVG / MIN / MAX` | Summarize numeric values | `GROUP BY` |
| `HAVING` | Filter groups after aggregation | `GROUP BY + COUNT/SUM` |
| `CASE WHEN` | Conditional logic | conditional counts, rates, pivots |
| `FILTER (WHERE ...)` | PostgreSQL conditional aggregate | `COUNT`, `SUM`, `AVG` |
| `STRING_AGG` | Combine grouped strings | `DISTINCT`, ordered output |
| `ARRAY_AGG` | Collect grouped values into an array | `DISTINCT`, `ORDER BY` |
| `PERCENTILE_CONT` | Continuous percentile with interpolation | `WITHIN GROUP (ORDER BY ...)` |
| `PERCENTILE_DISC` | Percentile that must be an observed value | `WITHIN GROUP` |
| `MODE()` | Most frequent value | `WITHIN GROUP` |
| `GROUPING SETS / ROLLUP / CUBE` | Multiple aggregation levels | subtotal and reporting queries |

> **WHERE vs HAVING:** `WHERE` decides which rows enter the aggregation. `HAVING` decides which aggregated groups remain.
>
> ```sql
> WHERE status = 'paid'
> GROUP BY customer_id
> HAVING SUM(amount) > 1000
> ```

## Ordered-set aggregates: WITHIN GROUP

`WITHIN GROUP` supplies the ordering **inside an ordered-set aggregate**.

```sql
PERCENTILE_CONT(0.95)
WITHIN GROUP (ORDER BY latency_ms)
```

Use `PERCENTILE_CONT` for interpolated percentiles such as median, p90, p95, or p99. Use `PERCENTILE_DISC` when the result must be an observed value.

```sql
SELECT service_name,
       PERCENTILE_CONT(0.95)
           WITHIN GROUP (ORDER BY latency_ms) AS p95_latency
FROM requests
GROUP BY service_name;
```

Mental model:

| Clause | What it controls |
|---|---|
| `GROUP BY` | Which rows belong to each aggregate group |
| `WITHIN GROUP (ORDER BY ...)` | Ordering of values inside an ordered-set aggregate |
| `OVER (...)` | Window of rows used by a window function while retaining row detail |

## High-value combinations

**Conditional count**

```sql
COUNT(*) FILTER (WHERE status = 'paid')
```

Portable form:

```sql
SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)
```

**Percentage of total: aggregate first, then window**

```sql
WITH customer_revenue AS (
    SELECT customer_id, SUM(amount) AS revenue
    FROM orders
    GROUP BY customer_id
)
SELECT customer_id,
       revenue,
       100.0 * revenue / NULLIF(SUM(revenue) OVER (), 0) AS pct_total
FROM customer_revenue;
```

**Require several categories**

```sql
GROUP BY user_id
HAVING COUNT(DISTINCT category) = 3
```

Useful for wording such as “has all three”, after restricting the input to the three required categories.

## Common traps

- `COUNT(CASE WHEN condition THEN 1 ELSE 0 END)` counts both 1 and 0. Use `SUM` or omit the `ELSE`.
- `AVG` ignores null inputs. `AVG(COALESCE(x, 0))` answers a different question.
- After a `LEFT JOIN`, `COUNT(*)` counts the null-extended row. Count a non-null right-side key to count matches.
- Always identify the denominator before computing a rate.
- `PERCENTILE_CONT`, `PERCENT_RANK`, `CUME_DIST`, and `NTILE` answer different questions.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/aggregation/aggregate-functions/' | relative_url }}">Counts, totals & conditional aggregation</a><span>Choose the counting unit and calculate defensible rates.</span></li>
<li><a href="{{ '/sql/aggregation/grouping-sets/' | relative_url }}">GROUPING SETS, ROLLUP & CUBE</a><span>Produce several aggregation levels without hand-writing separate queries.</span></li>
<li><a href="{{ '/sql/aggregation/percentiles/' | relative_url }}">Percentiles, WITHIN GROUP, and thresholds</a><span>Work out the percentile by hand, compare continuous and observed values, and handle tied thresholds.</span></li>
</ul>

## Before you trust the number

Name the population, numerator, denominator, and grain. Then add a duplicate, a null, or a tie and check whether the metric still means the same thing.
