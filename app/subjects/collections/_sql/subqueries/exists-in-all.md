---
title: "EXISTS, IN, ANY & ALL"
description: "Match related rows and understand null-sensitive membership."
chapter: "subqueries"
order: 1
sequence: 501
level: "Core"
references: [{"title":"PostgreSQL subquery expressions","url":"https://www.postgresql.org/docs/current/functions-subquery.html"}]
---

## EXISTS: at least one related row

```sql
SELECT c.*
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.status = 'paid'
);
```

The inner query refers to `c.customer_id`, making it correlated. Think of it as a yes/no test for each customer. The optimizer need not literally run it separately for every row.

`SELECT 1` is conventional: `EXISTS` tests whether a row exists, not the value selected. Right-side duplicates do not multiply the output. Duplicates already in the outer table are not removed.

## Worked example: all posts that received a heart reaction

Assume `facebook_posts(post_id, ...)` and `facebook_reactions(post_id, reaction, ...)`.

```sql
SELECT p.*
FROM facebook_posts p
WHERE EXISTS (
    SELECT 1
    FROM facebook_reactions r
    WHERE r.post_id = p.post_id
      AND r.reaction = 'heart'
);
```

If a post has five heart reactions, the outer post still appears once, assuming `post_id` is unique in `facebook_posts`.

An equivalent membership query is:

```sql
SELECT p.*
FROM facebook_posts p
WHERE p.post_id IN (
    SELECT r.post_id
    FROM facebook_reactions r
    WHERE r.reaction = 'heart'
);
```

`DISTINCT` inside this `IN` is unnecessary for correctness. A CTE can name the set if that improves readability, but it is not inherently better or faster.

## NOT EXISTS: no related row

```sql
SELECT c.*
FROM customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

This is an anti-join pattern: customers with no orders.

## NOT IN and NULL

```sql
SELECT 3 NOT IN (1, 2, NULL);
-- Unknown, not TRUE.
```

A null in a `NOT IN` subquery prevents a nonmatching candidate from evaluating to true. Prefer `NOT EXISTS` when nullable keys are possible. An outer null also needs an explicit business rule: equality-based `NOT EXISTS` treats it as unmatched, while `NOT IN` against a nonempty set generally evaluates to unknown.

## ANY / SOME and ALL

```sql
-- Salary exceeds at least one non-null salary in department 10.
SELECT employee_id, salary
FROM employees
WHERE salary > ANY (
    SELECT salary
    FROM employees
    WHERE department_id = 10 AND salary IS NOT NULL
);

-- Salary exceeds every non-null salary in department 10.
SELECT employee_id, salary
FROM employees
WHERE salary > ALL (
    SELECT salary
    FROM employees
    WHERE department_id = 10 AND salary IS NOT NULL
);
```

`= ANY(subquery)` behaves like `IN`; `SOME` is a synonym for `ANY`. With non-null candidates and a nonempty, non-null comparison set, `> ANY` corresponds to `> MIN`, and `> ALL` to `> MAX`. Empty sets differ: `ANY` returns false and `ALL` returns true, whereas an aggregate over an empty input usually returns null. Unfiltered nulls can produce unknown results.
