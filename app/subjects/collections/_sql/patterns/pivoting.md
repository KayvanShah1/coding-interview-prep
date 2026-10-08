---
title: "Conditional aggregation & pivots"
description: "Turn category values into columns while keeping the grouping grain explicit."
chapter: "patterns"
order: 5
sequence: 705
level: "Core"
references: [{"title":"PostgreSQL aggregate functions","url":"https://www.postgresql.org/docs/current/functions-aggregate.html"}]
---

## Pivot categories into columns

Assume `channel_sales(sale_date, channel, revenue)`.

```sql
SELECT sale_date,
       SUM(CASE WHEN channel = 'web' THEN revenue ELSE 0 END) AS web_revenue,
       SUM(CASE WHEN channel = 'app' THEN revenue ELSE 0 END) AS app_revenue
FROM channel_sales
GROUP BY sale_date;
```

This is conditional aggregation: each category gets its own conditional measure while the `GROUP BY` keeps one row per reporting grain. It transfers well across engines without requiring a dedicated `PIVOT` operator.

## Check the grain before adding columns

If the source contains several rows per sale or joins multiply rows before this step, each pivoted measure can be inflated. Fix that grain first rather than adding `DISTINCT` inside every aggregate.

Use `ELSE 0` when absence should contribute zero to a sum. For counts, `COUNT(*) FILTER (WHERE ...)` or `SUM(CASE ... THEN 1 ELSE 0 END)` makes the counting rule explicit.

## More than one metric

You can repeat the condition for several measures:

```sql
SELECT sale_date,
       SUM(CASE WHEN channel = 'web' THEN revenue ELSE 0 END) AS web_revenue,
       COUNT(*) FILTER (WHERE channel = 'web') AS web_orders,
       SUM(CASE WHEN channel = 'app' THEN revenue ELSE 0 END) AS app_revenue,
       COUNT(*) FILTER (WHERE channel = 'app') AS app_orders
FROM channel_sales
GROUP BY sale_date;
```

If categories are dynamic or numerous, application-side shaping or an engine-specific pivot feature may be more appropriate than hard-coding a column per category.
