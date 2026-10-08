---
title: "INSERT, UPDATE & DELETE"
description: "Change exactly the intended rows and inspect the results."
chapter: "schema"
order: 3
sequence: 903
level: "Core"
references: [{"title":"PostgreSQL INSERT","url":"https://www.postgresql.org/docs/current/sql-insert.html"},{"title":"PostgreSQL UPDATE","url":"https://www.postgresql.org/docs/current/sql-update.html"}]
---

## Insert with an explicit column list

```sql
INSERT INTO customers (customer_id, name, city)
VALUES (40, 'Mira', 'Mumbai'), (41, 'Arun', 'Pune')
RETURNING customer_id, name;
```

Explicit columns make the mapping clear and reduce coupling to table column order. `INSERT ... SELECT` uses query output as the source instead of literal rows.

## Update with a predicate

```sql
UPDATE orders
SET status = 'paid'
WHERE order_id = 101 AND status = 'pending'
RETURNING order_id, status;
```

This transitions only the intended pending order. Without `WHERE`, an update affects all rows. A predicate involving the old state can support optimistic concurrency, but the application must check the affected-row count.

## Delete matching rows

```sql
DELETE FROM orders
WHERE status = 'cancelled'
  AND order_ts < TIMESTAMP '2025-01-01'
RETURNING order_id;
```

In practice, inspect the selection and dependent records before deletion. `RETURNING` exposes affected rows, but it is not a substitute for a correct predicate or transaction design.

## UPDATE FROM and duplicate matches

```sql
UPDATE products p
SET category = s.category
FROM product_updates s
WHERE s.product_id = p.product_id;
```

Assume `product_updates` has at most one row per product. Multiple matches make the source value ambiguous; deduplicate or aggregate first with a stated policy.

## Exercise

An ingestion job retries the same insert twice. Why might the second attempt fail? How can you make retry behavior explicit?

<details markdown="1"><summary>Show the answer</summary>

A primary or unique key can reject the repeated row. Choose a stable idempotency key and define whether an existing row should be ignored, updated, or rejected. In PostgreSQL, `ON CONFLICT` expresses the first two cases.

</details>
