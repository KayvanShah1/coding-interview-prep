---
title: "Sessions & changes in state"
description: "Turn boundary flags into groups with a cumulative sum."
chapter: "patterns"
order: 3
sequence: 703
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

**Question:** Start a new session when a user's gap between events exceeds 30 minutes. Exactly 30 minutes remains in the same session here.

```sql
WITH previous AS (
    SELECT event_id, user_id, event_ts,
           LAG(event_ts) OVER (
               PARTITION BY user_id ORDER BY event_ts, event_id
           ) AS previous_ts
    FROM events
    WHERE event_ts IS NOT NULL
), boundaries AS (
    SELECT *,
           CASE
               WHEN previous_ts IS NULL
                 OR event_ts - previous_ts > INTERVAL '30 minutes'
               THEN 1 ELSE 0
           END AS new_session
    FROM previous
), assigned AS (
    SELECT *,
           SUM(new_session) OVER (
               PARTITION BY user_id
               ORDER BY event_ts, event_id
               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
           ) AS session_number
    FROM boundaries
)
SELECT user_id, session_number,
       MIN(event_ts) AS session_start,
       MAX(event_ts) AS session_end,
       COUNT(*) AS event_count
FROM assigned
GROUP BY user_id, session_number;
```

The reusable technique is: **compare to the previous row, flag a boundary, cumulatively sum boundary flags, then aggregate each group**. It also works for runs of the same status and consecutive values where simple date subtraction is unsuitable.

For nullable status values, PostgreSQL `status IS DISTINCT FROM previous_status` detects a change while treating two nulls as equal. Flag the first row explicitly too.
