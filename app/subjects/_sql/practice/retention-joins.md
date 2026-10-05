---
title: "Retention and the denominator"
description: "Understand why an outer join can be necessary."
chapter: "practice"
order: 10
sequence: 1410
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

Assume `monthly_activity(user_id, month_start)` contains unique user-month rows.

```sql
SELECT COUNT(*) AS january_users,
       COUNT(feb.user_id) AS returned_in_february,
       ROUND(100.0 * COUNT(feb.user_id) / NULLIF(COUNT(*), 0), 2)
           AS retention_pct
FROM monthly_activity jan
LEFT JOIN monthly_activity feb
  ON feb.user_id = jan.user_id
 AND feb.month_start = DATE '2026-02-01'
WHERE jan.month_start = DATE '2026-01-01';
```

The denominator is all January users. An inner join retains only returners, so both counts would count returners and produce 100% whenever any exist. The left join preserves January non-returners, whose February user ID is null.

This does not mean retention always requires a left join. An `EXISTS` flag per January user, followed by an aggregate, preserves the same population without one. If the task is only to list returning users, an inner join may be sufficient. The metric decides the join.
