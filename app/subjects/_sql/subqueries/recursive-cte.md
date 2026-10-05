---
title: "Recursive CTEs & hierarchies"
description: "Walk parent-child relationships with an anchor, a recursive step, and a stopping rule."
chapter: "subqueries"
order: 3
sequence: 503
level: "Advanced"
references: [{"title":"PostgreSQL recursive queries","url":"https://www.postgresql.org/docs/current/queries-with.html"}]
---

## Start small, then expand

A recursive CTE has an initial result, often called the anchor, and a recursive term that uses the previous result to discover more rows.

```sql
WITH RECURSIVE numbers(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM numbers WHERE n < 5
)
SELECT n FROM numbers ORDER BY n;
```

The output is 1, 2, 3, 4, 5. Without a terminating condition, the query can continue indefinitely.

## Walk an organization tree

Assume `employees(employee_id, manager_id, ...)`. Track visited IDs so malformed cycles do not repeat forever.

```sql
WITH RECURSIVE org AS (
    SELECT employee_id, manager_id, 0 AS depth,
           ARRAY[employee_id] AS path
    FROM employees
    WHERE employee_id = 1
    UNION ALL
    SELECT e.employee_id, e.manager_id, o.depth + 1,
           o.path || e.employee_id
    FROM employees e
    JOIN org o ON e.manager_id = o.employee_id
    WHERE NOT e.employee_id = ANY(o.path)
)
SELECT employee_id, manager_id, depth
FROM org
ORDER BY depth, employee_id;
```

The path check detects repeated nodes along a branch. A depth limit can provide an additional operational guard but can also truncate legitimate deep hierarchies.

## Common mistakes

`UNION` deduplicates complete rows. It does not automatically solve a cycle when a depth or path column changes on every iteration. Also, the recursion's traversal does not promise final row ordering; use an explicit `ORDER BY`.

Typical uses include reporting hierarchies, bill-of-materials expansion, category trees, and graph reachability. For simple date generation, PostgreSQL `GENERATE_SERIES` is usually easier to read.
