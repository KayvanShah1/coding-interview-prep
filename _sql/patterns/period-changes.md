---
title: "Period changes and missing months"
description: "Aggregate to calendar grain before LAG, and make missing periods explicit."
chapter: patterns
order: 7
sequence: 707
level: Intermediate
references:
  - title: PostgreSQL window functions
    url: https://www.postgresql.org/docs/current/functions-window.html
  - title: PostgreSQL series-generating functions
    url: https://www.postgresql.org/docs/current/functions-srf.html
---

## Read the word previous carefully

Revenue was 100 in January and 150 in March; there were no sales rows in February. Applying `LAG` to the two observed months compares March with January. That answers “previous observed month,” not “previous calendar month.”

If the business confirms that no sales rows means zero revenue, create the calendar, attach monthly totals, and then compare adjacent months. If missing rows could mean an incomplete load, do not silently turn them into zero.

## Build the query in stages

```sql
WITH sales(sale_date, amount) AS (
    VALUES (DATE '2026-01-05', 40), (DATE '2026-01-20', 60),
           (DATE '2026-03-02', 150)
), months AS (
    SELECT d::date AS month_start
    FROM generate_series(TIMESTAMP '2026-01-01', TIMESTAMP '2026-03-01',
                         INTERVAL '1 month') AS g(d)
), totals AS (
    SELECT DATE_TRUNC('month', sale_date)::date AS month_start,
           SUM(amount) AS revenue
    FROM sales GROUP BY 1
), complete AS (
    SELECT m.month_start, COALESCE(t.revenue, 0) AS revenue
    FROM months m LEFT JOIN totals t USING (month_start)
), compared AS (
    SELECT *, LAG(revenue) OVER (ORDER BY month_start) AS previous_revenue
    FROM complete
)
SELECT month_start, revenue, previous_revenue,
       revenue - previous_revenue AS absolute_change,
       ROUND(100.0 * (revenue - previous_revenue)
             / NULLIF(previous_revenue, 0), 1) AS pct_change
FROM compared ORDER BY month_start;
```

| Month | Revenue | Previous | Absolute change | Percent change |
|---|---:|---:|---:|---:|
| January | 100 | NULL | NULL | NULL |
| February | 0 | 100 | -100 | -100.0 |
| March | 150 | 0 | 150 | NULL |

March's percentage is undefined under this formula because the denominator is zero. Labeling it 100% would invent a different metric.

## Explain why each stage exists

`totals` changes the grain from sales to months. `months` defines the required reporting population. `complete` preserves months without facts. `compared` can now treat the previous row as the previous month. The final step performs arithmetic after the comparison value exists.

To extend this to customers, construct the required customer-month population and partition the window by customer. Define when a customer becomes eligible; generating months before signup can create misleading zero activity.

## Correctness before optimization

Aggregate before joining the calendar so multiple sales cannot multiply reporting rows. For production data, filter the fact scan to the necessary period plus any preceding period required for comparison. Filtering away the previous month before computing `LAG` destroys its input.

Keep enough history to calculate the metric, then restrict the displayed period in an outer query. Inspect partition pruning or date access paths once these semantics are correct.

## Exercise

The dashboard displays only March but must compare it with February. Where should the March-only filter go?

<details markdown="1"><summary>Answer</summary>

After the window calculation, in the final query. Keep February in the input to `compared`. Separately, limit the underlying scan to the smallest range that still supplies every required comparison period.

</details>
