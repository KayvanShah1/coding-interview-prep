---
title: "Apple Product Counts"
description: "Reduce device events to one flag per user."
chapter: "practice"
order: 5
sequence: 1305
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

Assume one `playbook_users` row per user. Only users with at least one event belong in the population used in this example.

```sql
WITH user_flags AS (
    SELECT user_id,
           MAX(CASE
               WHEN LOWER(device) IN ('macbook pro', 'iphone 5s', 'ipad air')
               THEN 1 ELSE 0
           END) AS used_apple
    FROM playbook_events
    GROUP BY user_id
)
SELECT u.language,
       SUM(f.used_apple) AS apple_users,
       COUNT(*) AS total_users
FROM user_flags f
JOIN playbook_users u ON u.user_id = f.user_id
GROUP BY u.language
ORDER BY total_users DESC, u.language;
```

`MAX(CASE...)` implements an “ever used one of these devices” flag. A user with 20 matching events still contributes one Apple user. A user with both Apple and non-Apple events also contributes one.

| User | Events | Apple-user contribution | Total-user contribution |
|---|---|---:|---:|
| 1 | Two `iphone 5s`, one other device | 1 | 1 |
| 2 | One non-Apple device | 0 | 1 |
| 3 | No events | Excluded | Excluded |

An alternative is `COUNT(DISTINCT CASE WHEN ... THEN user_id END)` over joined events. Both can be correct. The flag CTE makes the user-level intermediate result explicit; it is not a universal performance winner.
