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
