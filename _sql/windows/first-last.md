---
title: "FIRST_VALUE & LAST_VALUE"
description: "Understand why the frame changes what last means."
chapter: "windows"
order: 6
sequence: 606
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

`FIRST_VALUE` and `LAST_VALUE` select values from the current frame. This makes the frame especially important for `LAST_VALUE`.

```sql
SELECT order_id, customer_id, order_ts, amount,
       FIRST_VALUE(amount) OVER (
           PARTITION BY customer_id
           ORDER BY order_ts, order_id
           ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) AS first_order_amount,
       LAST_VALUE(amount) OVER (
           PARTITION BY customer_id
           ORDER BY order_ts, order_id
           ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) AS latest_order_amount
FROM orders;
```

Without the full-partition ending boundary, `LAST_VALUE` often returns the current row's value under unique ordering, because the default frame ends at the current peer group.

If you need just one latest row per customer, `ROW_NUMBER()` and `rn = 1` is usually clearer. `MAX(amount)` means the largest amount, not the amount on the latest order.
