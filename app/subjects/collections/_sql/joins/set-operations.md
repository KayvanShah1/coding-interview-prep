---
title: "Set operations & all-item matches"
description: "Combine result sets and express every-required-item conditions."
chapter: "joins"
order: 2
sequence: 402
level: "Core"
references: [{"title":"PostgreSQL subquery expressions","url":"https://www.postgresql.org/docs/current/functions-subquery.html"}]
---

## UNION versus UNION ALL

```sql
SELECT customer_id FROM online_customers
UNION
SELECT customer_id FROM store_customers;
```

| Operator | Behavior |
|---|---|
| `UNION ALL` | Append rows, preserving duplicates |
| `UNION` | Append, then remove duplicate output rows |
| `INTERSECT` | Distinct rows present in both inputs |
| `EXCEPT` | Distinct rows in the first input but not the second |

These comparisons apply to the entire selected row. Inputs need the same number of columns with compatible types. Use `UNION ALL` when every input event should survive; use `UNION` when set semantics are intended.

## Bought both A and B

Assume `purchases(customer_id, product_id)`.

```sql
SELECT customer_id
FROM purchases
WHERE product_id IN ('A', 'B')
GROUP BY customer_id
HAVING COUNT(DISTINCT product_id) = 2;
```

Repeated purchases of A do not count as buying B.

## Bought every required product

Assume `required_products(product_id)` contains a unique set of required IDs.

```sql
SELECT c.customer_id
FROM customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM required_products r
    WHERE NOT EXISTS (
        SELECT 1
        FROM purchases p
        WHERE p.customer_id = c.customer_id
          AND p.product_id = r.product_id
    )
);
```

Read this as: there is no required product that the customer has failed to purchase. If the required set is empty, every customer qualifies. If that is not the intended rule, add an existence check on `required_products`.
