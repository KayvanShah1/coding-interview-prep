---
title: "LATERAL and per-row subqueries"
description: "Use a preceding table's values inside a FROM-clause subquery."
chapter: "subqueries"
order: 4
sequence: 504
level: "Advanced"
references: [{"title":"PostgreSQL LATERAL subqueries","url":"https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-LATERAL"}]
---

## A subquery parameterized by a row

Suppose every customer should appear with their two latest orders. A lateral join lets the inner query use the current customer's ID.

```sql
SELECT c.customer_id, recent.order_id, recent.order_ts
FROM customers c
LEFT JOIN LATERAL (
    SELECT o.order_id, o.order_ts
    FROM orders o
    WHERE o.customer_id = c.customer_id
    ORDER BY o.order_ts DESC, o.order_id DESC
    LIMIT 2
) recent ON TRUE
ORDER BY c.customer_id, recent.order_ts DESC, recent.order_id DESC;
```

The subquery's limit is per customer. A plain global `LIMIT 2` after joining would limit the entire result to two rows.

## Why LEFT JOIN and ON TRUE?

The subquery already expresses the matching condition. `ON TRUE` accepts its returned rows. A left join also preserves customers for whom it returns nothing, with null order columns.

For customer A with three orders and customer B with none, the output has two rows for A and one null-extended row for B. With `CROSS JOIN LATERAL`, B would disappear.

## Compare with a window function

You can also rank orders by customer using `ROW_NUMBER`, filter to `rn <= 2`, and join that result to customers. Both express useful solutions. An index beginning with customer ID and matching the order can make a bounded lookup efficient, but there is no universal winner: compare plans and data distributions.

`LATERAL` is a scope rule, not a promise about physical execution. The planner can transform a query while preserving its semantics.
