---
title: "CREATE, ALTER, DROP & TRUNCATE"
description: "Distinguish changing a table's structure from changing its rows."
chapter: "schema"
order: 2
sequence: 902
level: "Core"
references: [{"title":"PostgreSQL ALTER TABLE","url":"https://www.postgresql.org/docs/current/sql-altertable.html"},{"title":"PostgreSQL TRUNCATE","url":"https://www.postgresql.org/docs/current/sql-truncate.html"}]
---

## Evolve a schema

```sql
CREATE TABLE inventory (
    product_id integer PRIMARY KEY,
    quantity integer NOT NULL DEFAULT 0
);
ALTER TABLE inventory ADD COLUMN updated_at timestamptz;
ALTER TABLE inventory ADD CONSTRAINT quantity_nonnegative CHECK (quantity >= 0);
```

Adding a constraint to existing data can fail when old rows violate it. Plan how to inspect and repair data before applying a rule. Some alterations rewrite a table or acquire locks; assess large production tables separately from tiny interview examples.

## DELETE versus TRUNCATE versus DROP

| Statement | What changes | Can filter rows? |
|---|---|---|
| `DELETE FROM inventory WHERE ...` | Matching rows | Yes |
| `TRUNCATE inventory` | All rows | No |
| `DROP TABLE inventory` | The table object itself | No |

PostgreSQL `TRUNCATE` is transactional and takes a strong table lock. “TRUNCATE cannot be rolled back” is not a portable rule. Identity reset behavior is configurable with `RESTART IDENTITY` or `CONTINUE IDENTITY`.

`DELETE` and `TRUNCATE` also have different trigger and foreign-key behavior. Do not describe them as interchangeable just because both can leave an empty table.

## Temporary tables

```sql
CREATE TEMP TABLE selected_products (product_id integer PRIMARY KEY);
INSERT INTO selected_products VALUES (10), (20);
SELECT * FROM selected_products ORDER BY product_id;
```

A temporary table is useful when intermediate data needs an explicit table lifecycle, indexing, or reuse across statements. A CTE is scoped to its statement; a temporary table has session or transaction-related lifetime depending on its options.
