---
title: "Query structure & execution order"
description: "Understand WHERE, HAVING, windows, and why aliases have limits."
chapter: "foundations"
order: 2
sequence: 2
level: "Core"
references: [{"title":"PostgreSQL table expressions","url":"https://www.postgresql.org/docs/current/queries-table-expressions.html"}]
---

```sql
SELECT customer_id,
       COUNT(*) AS order_count,
       SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING COUNT(*) >= 3
ORDER BY revenue DESC, customer_id
LIMIT 10;
```

Read this as: retain paid orders, group by customer, retain customers with at least three orders, and return the ten largest revenues.

A useful logical sequence is:

1. `FROM` / `JOIN`: build the input rows.
2. `WHERE`: filter individual rows.
3. `GROUP BY` and aggregates: summarize groups.
4. `HAVING`: filter groups.
5. Window calculations: operate on the surviving rows or groups.
6. `SELECT`: produce output expressions.
7. `DISTINCT`: remove duplicate output rows, if requested.
8. `ORDER BY`: sort the result.
9. `LIMIT` / `OFFSET`: select a portion of it.

This explains query semantics; the optimizer can use a different physical execution plan.

| Need | Clause |
|---|---|
| Paid orders only | `WHERE status = 'paid'` |
| Customers whose total spending exceeds 1,000 | `HAVING SUM(amount) > 1000` |
| First ranked row per customer | Outer query filtering a window result |

You cannot use `WHERE SUM(amount) > 1000` or filter `ROW_NUMBER()` in the same query's `WHERE`. A select-list alias also generally cannot be referenced by another expression in that same select list. Put the intermediate calculation in a CTE when needed.
