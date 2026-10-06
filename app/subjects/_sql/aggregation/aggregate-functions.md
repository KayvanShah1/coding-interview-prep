---
title: "Counts, totals & conditional aggregation"
description: "Choose the counting unit and calculate defensible rates."
chapter: "aggregation"
order: 1
sequence: 301
level: "Core"
references: [{"title":"PostgreSQL aggregates","url":"https://www.postgresql.org/docs/current/functions-aggregate.html"}]
---

## COUNT variants

Count the entity the question asks about. A row can represent an order, a line item, a user, or an event. Joining tables can change that unit before an aggregate runs. State the population and grain first, then choose the counting expression.

For values `10, 10, NULL, 20`:

| Expression | Result |
|---|---:|
| `COUNT(*)` | 4 |
| `COUNT(value)` | 3 |
| `COUNT(DISTINCT value)` | 2 |
| `SUM(value)` | 40 |
| `AVG(value)` | 13.333… |

`AVG` uses the three non-null values. `AVG(COALESCE(value, 0))` would instead produce 10, which answers a different question.

## Group and filter

`WHERE` removes input rows before totals are calculated. `HAVING` decides which completed groups remain. In the example below, unpaid orders never contribute to revenue; the final population contains only customers whose paid revenue exceeds 1000.

```sql
SELECT customer_id, COUNT(*) AS paid_orders, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING SUM(amount) > 1000;
```

## Conditional counts and percentages

```sql
SELECT customer_id,
       COUNT(*) AS total_orders,
       SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_orders,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
       ROUND(
           100.0 * SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)
           / NULLIF(COUNT(*), 0),
           2
       ) AS paid_percentage
FROM orders
GROUP BY customer_id;
```

**Trap:** `COUNT(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)` counts every row because both 1 and 0 are non-null. Use `SUM` or omit the `ELSE` inside `COUNT`.

PostgreSQL also supports:

```sql
SELECT customer_id,
       COUNT(*) FILTER (WHERE status = 'paid') AS paid_orders
FROM orders
GROUP BY customer_id;
```

## Weighted average

```sql
SELECT product_id,
       SUM(quantity * unit_price) / NULLIF(SUM(quantity), 0)
           AS weighted_average_price
FROM order_items
GROUP BY product_id;
```

If you sell one unit at 100 and nine units at 10, the weighted average is 19, not 55. Ensure the numerator is decimal when both source columns are integers.
