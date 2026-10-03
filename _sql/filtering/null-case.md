---
title: "NULL, CASE & conditional expressions"
description: "Reason about unknown values and express conditional logic."
chapter: "filtering"
order: 2
sequence: 102
level: "Core"
references: [{"title":"PostgreSQL comparison operators","url":"https://www.postgresql.org/docs/current/functions-comparison.html"}]
---

`NULL` represents a missing or unknown value. It is not zero or an empty string.

```sql
SELECT * FROM employees WHERE manager_id IS NULL;
SELECT * FROM employees WHERE manager_id IS NOT NULL;
```

Do not write `manager_id = NULL`. Ordinary comparisons with null yield unknown. `WHERE` keeps only true conditions, so unknown conditions are excluded.

| Expression | Result |
|---|---|
| `NULL = NULL` | Unknown |
| `NULL IS NULL` | True |
| `5 <> NULL` | Unknown |
| `FALSE AND NULL` | False |
| `TRUE OR NULL` | True |

## COALESCE: first non-null value

```sql
SELECT customer_id,
       COALESCE(city, 'Unknown') AS city_label
FROM customers;
```

Only replace missing values when the replacement is meaningful. Unknown revenue is not automatically zero revenue.

## NULLIF: avoid division by zero

```sql
SELECT 100.0 * 3 / NULLIF(0, 0) AS percentage;
-- Returns NULL rather than a division-by-zero error.
```

`NULLIF(a, b)` returns null if the values are equal; otherwise it returns `a`. A zero denominator usually means an undefined rate. Apply `COALESCE(..., 0)` only if the business definition calls for zero.

## CASE: classify rows

```sql
SELECT order_id,
       CASE
           WHEN amount IS NULL THEN 'unknown'
           WHEN amount >= 1000 THEN 'high'
           WHEN amount >= 500 THEN 'medium'
           ELSE 'low'
       END AS order_band
FROM orders;
```

The first true branch wins. Put specific or higher-threshold conditions first.
