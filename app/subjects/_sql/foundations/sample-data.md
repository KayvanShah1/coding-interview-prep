---
title: "Practice dataset & example conventions"
description: "Use a small, deterministic PostgreSQL dataset to run the handbook's core queries."
chapter: "foundations"
order: 5
sequence: 5
level: "Core"
references: []
---

## Get the dataset

The repository includes [sample-data.sql]({{ '/assets/sql/sample-data.sql' | relative_url }}), with customers, orders, items, payments, employees, daily sales, and activity events. It creates and seeds tables in the current schema. Run it in a fresh practice database or schema.

```sql
CREATE SCHEMA interview_practice;
SET search_path TO interview_practice;
-- Run the downloaded sample-data.sql here.
```

In psql, use `\i path/to/sample-data.sql` after selecting the schema. The file is also suitable for pasting into a PostgreSQL SQL editor.

## What the dataset deliberately includes

| Case | Why it is present |
|---|---|
| A customer with no orders | Outer joins and anti-joins |
| More than one order per customer | Aggregation and windows |
| Tied salaries | Ranking semantics |
| Multiple events on one date | Deduplicate before day streaks |
| Missing activity dates | Calendar versus row adjacency |
| Multiple items and payments on an order | Join multiplication |

Some lessons use standalone `WITH ... VALUES` examples or introduce a separate illustrative schema. Their stated input overrides the shared dataset. DDL examples should be run in an isolated schema because they may create names already used by the dataset.

## A first result to predict

```sql
SELECT customer_id, COUNT(*) AS orders, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
ORDER BY customer_id;
```

| customer_id | orders | revenue |
|---:|---:|---:|
| 1 | 2 | 300 |
| 2 | 1 | 50 |

Customer 3 has no orders, so they do not appear. To include them with zero, start with customers and use a left join with the paid condition in the matching clause.
