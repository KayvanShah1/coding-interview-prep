---
title: "Revision drills"
description: "Work through a deliberate sequence of query challenges."
chapter: "practice"
order: 2
sequence: 1402
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

This is a suggested learning order, not a measured frequency ranking of interview questions.

| Pass | Topics | Practice task |
|---|---|---|
| 1 | Filtering, nulls, aggregation | Count paid orders and compute a cancellation rate |
| 2 | Joins, `EXISTS`, `NOT EXISTS` | Customers without orders; posts with heart reactions |
| 3 | CTEs, ranking, deduplication | Latest order and top three distinct salaries per department |
| 4 | Frames, `LAG`, `LEAD` | Running revenue, trailing average, month-over-month change |
| 5 | Dates and gaps | Three-day streaks, sessions, next-day retention |
| 6 | Mixed patterns | Missing-date reports, all-products buyers, overlapping intervals |

## Solve these without looking at the examples

Work through the drills without opening the answer hints first. After each query works, change the fixture in a way that targets that problem: add a salary tie to a ranking query, a duplicate event to a streak, a missing month to a period comparison, or an entity with no related row to an outer-join problem.


1. Return customers with at least two paid orders in January 2026.
2. Return customers who placed orders but never a paid order.
3. Return all posts with at least one heart reaction without duplicating posts.
4. Return the second-highest distinct salary, including null if it does not exist.
5. Return exactly up to two employees per department, breaking salary ties by employee ID.
6. Return all employees in the two highest distinct salary levels per department.
7. Return the latest order per customer.
8. Compute the sum of the previous three orders, excluding the current order.
9. Compute the sum of the current order and next two orders.
10. Compute seven-calendar-date revenue when dates can be missing.
11. Return every active streak of at least three days, including its start and end.
12. Start a new session after an inactivity gap greater than 30 minutes.
13. Compute the proportion of users active the day after their first observed activity.
14. Return customers who purchased every required product.
15. Return every student-subject pair, including pairs with zero attendances.

## Answer hints

| Task | Key idea |
|---|---|
| 1 | Timestamp bounds + paid filter + `GROUP BY` + `HAVING COUNT(*) >= 2` |
| 2 | One `EXISTS` for any order plus one `NOT EXISTS` for paid orders |
| 3 | Correlated `EXISTS` |
| 4 | `MAX(salary)` below the overall maximum |
| 5 | `ROW_NUMBER` ordered by salary descending and employee ID |
| 6 | `DENSE_RANK` ordered by salary only |
| 7 | `ROW_NUMBER` per customer ordered by timestamp descending and ID |
| 8 | `ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING` |
| 9 | `ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING` |
| 10 | Date `RANGE` from six days preceding through current date |
| 11 | Deduplicate days, form islands, aggregate each island |
| 12 | `LAG`, flag a gap, cumulative sum of flags |
| 13 | First date per user + next-day existence; complete observation window |
| 14 | No required product is missing: double `NOT EXISTS` |
| 15 | `CROSS JOIN` the expected pairs, then `LEFT JOIN` attendance |

## Five fast self-checks

**Does `BETWEEN 1 AND 3` include 3?** Yes.

**Does `2 PRECEDING AND CURRENT ROW` mean two rows total?** No, up to three.

**Does `LAG` mean yesterday?** No, the previous row in the specified order.

**Does `EXISTS` deduplicate the outer table?** No. It avoids multiplying an outer row by its number of inner matches.

**Is a CTE always materialized?** No. It depends on the engine, query, and applicable optimization rules.

## Platform practice

These are places to apply the patterns, not claims about exact employer interview frequency:

- [LeetCode SQL 50](https://leetcode.com/studyplan/top-sql-50/){:target="_blank" rel="noopener noreferrer"}: a structured set of SQL exercises. Look for joins, aggregation, subqueries, and ranking problems.
- [DataLemur SQL questions](https://datalemur.com/questions?category=SQL){:target="_blank" rel="noopener noreferrer"}: use the question catalog for analytical exercises such as rolling averages and rates.
- [LeetCode Students and Examinations](https://leetcode.com/problems/students-and-examinations/){:target="_blank" rel="noopener noreferrer"}: practice constructing expected pairs and preserving zero counts.

For a few drills, solve the same requirement a second way and compare the outputs on a deliberately awkward fixture. The useful part is finding where two plausible queries stop being equivalent.
