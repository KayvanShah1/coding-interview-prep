---
title: "The OVER clause"
description: "Keep row detail while computing group-level values."
chapter: "windows"
order: 1
sequence: 601
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

```sql
SELECT order_id, customer_id, amount,
       SUM(amount) OVER (PARTITION BY customer_id) AS customer_total
FROM orders;
```

`GROUP BY customer_id` reduces orders to one row per customer. `SUM(...) OVER (...)` keeps each order and adds the customer's total.

## Follow the result row by row

Suppose customer 1 has orders for 40 and 60, and customer 2 has one order for 25. Grouping by customer returns two rows: totals 100 and 25. A window total returns three rows: `(40, 100)`, `(60, 100)`, and `(25, 25)` when showing amount alongside customer total.

Use the grouped form when the report needs one row per customer. Use the window form when each order must remain visible, for example to calculate its share of customer spending. The choice follows output grain, not a preference for shorter syntax.

Adding window `ORDER BY` changes the calculation context and can introduce a default frame. A whole-customer total and a running customer total are different metrics. Make that intention explicit before using the frame recipes.

## When can you filter a window result?

In PostgreSQL, compute the window result in a subquery or CTE, then filter it in an outer query. `WHERE` in the same query level cannot refer to the newly computed window value. Other dialects can offer `QUALIFY`; label that syntax rather than mixing it into a PostgreSQL answer.

For “latest order is paid,” rank all orders first. For “latest paid order,” filter to paid orders first. Test both phrases against a customer with a newer unpaid order to see why filter placement matters.

The three parts to recognize:

| Part | Question it answers |
|---|---|
| `PARTITION BY customer_id` | Which rows belong together? |
| `ORDER BY order_ts, order_id` | In what sequence are they considered? |
| `ROWS BETWEEN ... AND ...` | Which nearby rows feed this calculation? |

Without `PARTITION BY`, all input rows belong to one partition. Window ordering does not guarantee final output ordering; use a query-level `ORDER BY` too.

## Filter the result in another query layer

```sql
WITH ranked AS (
    SELECT o.*,
           ROW_NUMBER() OVER (
               PARTITION BY customer_id
               ORDER BY order_ts DESC, order_id DESC
           ) AS rn
    FROM orders o
)
SELECT order_id, customer_id, order_ts, amount
FROM ranked
WHERE rn = 1;
```

Assume `order_ts` is non-null here. `order_id` breaks timestamp ties deterministically.
