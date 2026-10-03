---
title: "BETWEEN, IN & pattern matching"
description: "Filter ranges, alternatives, and text without boundary mistakes."
chapter: "filtering"
order: 1
sequence: 101
level: "Core"
references: [{"title":"PostgreSQL comparison operators","url":"https://www.postgresql.org/docs/current/functions-comparison.html"}]
---

## BETWEEN includes both endpoints

```sql
SELECT *
FROM orders
WHERE amount BETWEEN 100 AND 500;
```

This includes amounts of 100 and 500. It is equivalent to `amount >= 100 AND amount <= 500`.

## Use a half-open interval for timestamp periods

```sql
SELECT *
FROM orders
WHERE order_ts >= TIMESTAMP '2026-01-01 00:00:00'
  AND order_ts <  TIMESTAMP '2026-02-01 00:00:00';
```

This includes every January timestamp. An upper bound of `'2026-01-31'` means midnight at the start of January 31 when interpreted as a timestamp, so it misses the rest of that day. Half-open intervals also avoid counting a boundary twice across adjacent periods.

## IN is membership

```sql
SELECT *
FROM customers
WHERE city IN ('Mumbai', 'Pune', 'Delhi');
```

Use `IN` for alternatives on the same expression. Use `AND` when both conditions must hold.

```sql
SELECT *
FROM orders
WHERE status = 'paid'
  AND (amount > 1000 OR customer_id = 42);
```

`AND` has higher precedence than `OR`. Parentheses make the intended grouping explicit.

## LIKE is a string pattern

```sql
SELECT *
FROM customers
WHERE name LIKE 'Ka%';
```

| Pattern | Meaning |
|---|---|
| `'Ka%'` | Starts with `Ka` |
| `'%an'` | Ends with `an` |
| `'%ay%'` | Contains `ay` |
| `'_ay%'` | Exactly one character, then `ay`, then anything |

`%` matches zero or more characters; `_` matches one character. PostgreSQL `ILIKE` provides case-insensitive pattern matching. Case behavior in other engines can depend on collation.
