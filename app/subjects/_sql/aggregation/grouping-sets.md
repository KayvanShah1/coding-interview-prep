---
title: "GROUPING SETS, ROLLUP & CUBE"
description: "Produce several aggregation levels without hand-writing separate queries."
chapter: "aggregation"
order: 2
sequence: 302
level: "Advanced"
references: [{"title":"PostgreSQL grouping sets","url":"https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUPING-SETS"}]
---

## Several grouping levels in one query

Assume `sales(region, product, amount)`. You need region-product totals, region subtotals, and a grand total.

```sql
WITH sales(region, product, amount) AS (
    VALUES ('West', 'A', 10), ('West', 'B', 20), ('East', 'A', 5)
)
SELECT region, product, SUM(amount) AS revenue,
       GROUPING(region, product) AS grouping_mask
FROM sales
GROUP BY GROUPING SETS ((region, product), (region), ())
ORDER BY grouping_mask, region, product;
```

Detail rows total 10, 20, and 5. Region subtotals are 30 and 5; the grand total is 35. The empty grouping set `()` means all input rows together.

## Understand the shorthand

| Expression | Grouping sets |
|---|---|
| `ROLLUP(region, product)` | `(region, product)`, `(region)`, `()` |
| `CUBE(region, product)` | `(region, product)`, `(region)`, `(product)`, `()` |

`ROLLUP` follows a hierarchy. `CUBE` generates every subset, which grows exponentially with the number of dimensions. Choose only the levels needed.

## Null can mean two different things

A subtotal row has null for a dimension that was aggregated away. But the input might also contain a genuinely null region. Use `GROUPING(region)` to distinguish them: 1 means the dimension is absent from this grouping set; 0 means it participated, even if its value is null.

Do not label every null as “All regions” without inspecting the grouping indicator. That can mislabel missing data as a subtotal.

## Interview check

Can the same output be produced with `UNION ALL` of multiple grouped queries? Yes. Grouping sets express the aggregation levels together; the engine decides the physical work. Use `UNION ALL` if preserving separate subtotal rows rather than deduplicating them is the desired behavior.
