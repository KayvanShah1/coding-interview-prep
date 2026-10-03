---
title: "Pivots, medians & interval overlaps"
description: "Recognize several useful extensions of the core patterns."
chapter: "patterns"
order: 5
sequence: 705
level: "Core"
references: [{"title":"PostgreSQL aggregates","url":"https://www.postgresql.org/docs/current/functions-aggregate.html"}]
---

## Above the departmental average, using a window

```sql
WITH compared AS (
    SELECT employee_id, department_id, salary,
           AVG(salary) OVER (PARTITION BY department_id) AS department_average
    FROM employees
)
SELECT employee_id, department_id, salary
FROM compared
WHERE salary > department_average;
```

This is an alternative to the correlated subquery in section 8. It keeps the comparison value available for display too.

## Pivot categories into columns

Assume `channel_sales(sale_date, channel, revenue)`.

```sql
SELECT sale_date,
       SUM(CASE WHEN channel = 'web' THEN revenue ELSE 0 END) AS web_revenue,
       SUM(CASE WHEN channel = 'app' THEN revenue ELSE 0 END) AS app_revenue
FROM channel_sales
GROUP BY sale_date;
```

This is conditional aggregation, so it transfers well across engines without a dedicated `PIVOT` operator.

## Median

```sql
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) AS median_salary
FROM employees
WHERE salary IS NOT NULL;
```

PostgreSQL `PERCENTILE_CONT` can interpolate. For `10, 20, 30, 100`, the median is 25. `PERCENTILE_DISC` returns an observed value; at 0.5 for this set, it returns 20. Other databases use different percentile syntax.

## Generate all combinations, including zero counts

Assume `students(student_id)`, `subjects(subject_name)`, and `examinations(student_id, subject_name)`, with one examination row per attendance.

```sql
SELECT s.student_id, sub.subject_name,
       COUNT(e.student_id) AS attendance_count
FROM students s
CROSS JOIN subjects sub
LEFT JOIN examinations e
  ON e.student_id = s.student_id
 AND e.subject_name = sub.subject_name
GROUP BY s.student_id, sub.subject_name;
```

Start with the complete set of expected pairs, then attach observed events. The same approach supports customer-month and store-date grids. Be aware that a cross join of M and N rows produces M × N rows.

## Overlapping time intervals

Assume `bookings(booking_id, room_id, starts_at, ends_at)` uses valid, nonempty half-open intervals `[start, end)`.

```sql
SELECT a.booking_id AS booking_a, b.booking_id AS booking_b
FROM bookings a
JOIN bookings b
  ON a.room_id = b.room_id
 AND a.booking_id < b.booking_id
 AND a.starts_at < b.ends_at
 AND b.starts_at < a.ends_at;
```

The ID comparison prevents self-matches and duplicate pairs. A booking ending exactly when another starts does not overlap under this definition.
