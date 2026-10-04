---
title: "Subqueries & CTEs"
description: "Use intermediate results to make a query easier to reason about."
chapter: "subqueries"
order: 2
sequence: 502
level: "Core"
references: [{"title":"PostgreSQL WITH queries","url":"https://www.postgresql.org/docs/current/queries-with.html"}]
---

## Scalar subquery: one value

Before selecting a subquery form, say what the inner question returns: one value, a set of rows, or merely whether a row exists. That choice determines how the outer query can use the answer. A CTE adds a name to a stage; it does not change the required grain.

```sql
SELECT employee_id, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

A scalar subquery must return at most one row and one column. Zero rows produce null; multiple rows cause an error.

## Correlated subquery: compare within the current row's group

```sql
SELECT e.employee_id, e.department_id, e.salary
FROM employees e
WHERE e.salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    WHERE e2.department_id = e.department_id
);
```

## CTE: give an intermediate result a name

```sql
WITH customer_spend AS (
    SELECT customer_id, SUM(amount) AS revenue
    FROM orders
    WHERE status = 'paid'
    GROUP BY customer_id
)
SELECT customer_id, revenue
FROM customer_spend
WHERE revenue > (SELECT AVG(revenue) FROM customer_spend);
```

This asks which purchasing customers spend more than the average purchasing customer. Customers with no paid orders are absent; start from `customers` with a left join if they belong in the denominator.

Use CTEs for stages such as deduplicate, aggregate, rank, and filter. Avoid adding a CTE to every simple query. PostgreSQL can fold or materialize CTEs depending on the query and usage; `WITH` is not a guarantee that a result is cached or that a query is faster.
