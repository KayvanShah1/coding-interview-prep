---
title: "ROW_NUMBER, RANK & DENSE_RANK"
description: "Control ties and select the top rows or distinct values."
chapter: "windows"
order: 2
sequence: 602
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

For salaries `120, 100, 100, 80` sorted descending:

| Salary | ROW_NUMBER | RANK | DENSE_RANK |
|---:|---:|---:|---:|
| 120 | 1 | 1 | 1 |
| 100 | 2 | 2 | 2 |
| 100 | 3 | 2 | 2 |
| 80 | 4 | 4 | 3 |

`ROW_NUMBER` assigns different positions to tied rows; which tied row comes first needs a tie-breaker. `RANK` leaves gaps after ties. `DENSE_RANK` numbers distinct ordering values without gaps.

## Let the wording choose the tie policy

These prompts are not equivalent:

- **Top 3 employees per department** usually needs at most three rows, so start with `ROW_NUMBER()` and a deterministic tie-breaker.
- **Top 3 salary levels per department** preserves everyone tied at one of the three distinct salary values, so use `DENSE_RANK()` on salary.
- **Competition rank** is the case for `RANK()` when positions after a tie should skip numbers.

Before choosing the function, ask whether the limit applies to **rows**, **distinct values**, or **rank positions**.

## Three highest distinct salaries in every department

```sql
WITH ranked AS (
    SELECT employee_id, department_id, salary,
           DENSE_RANK() OVER (
               PARTITION BY department_id
               ORDER BY salary DESC
           ) AS salary_rank
    FROM employees
    WHERE salary IS NOT NULL
)
SELECT employee_id, department_id, salary
FROM ranked
WHERE salary_rank <= 3;
```

This can return more than three employees per department. For at most three employees, use `ROW_NUMBER()` and a tie-breaker such as `employee_id`.

**Do not add `employee_id` to the `DENSE_RANK` ordering** when equal salaries should tie. It would rank the salary/ID combination instead.

## Second-highest distinct salary, returning NULL if absent

```sql
SELECT MAX(salary) AS second_highest_salary
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
```

The aggregate returns one row even if no qualifying salary exists. An alternative using `DENSE_RANK() = 2` naturally returns every employee at that salary, which is a different output shape.
