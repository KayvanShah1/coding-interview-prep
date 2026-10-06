---
title: "Gaps & Islands: consecutive days & streaks"
description: "Recognize the gaps-and-islands pattern and group consecutive runs using deduplicated dates and row numbers."
chapter: "patterns"
order: 2
sequence: 702
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

**Question:** Which users were active on at least three consecutive calendar days?

Assume `sf_events(user_id, record_date)`, where `record_date` is a date or a timestamp interpreted in the intended reporting timezone.

```sql
WITH days AS (
    SELECT DISTINCT user_id, record_date::date AS activity_date
    FROM sf_events
    WHERE record_date IS NOT NULL
), numbered AS (
    SELECT user_id, activity_date,
           ROW_NUMBER() OVER (
               PARTITION BY user_id ORDER BY activity_date
           )::int AS rn
    FROM days
), grouped AS (
    SELECT user_id, activity_date, activity_date - rn AS streak_key
    FROM numbered
), runs AS (
    SELECT user_id, streak_key,
           MIN(activity_date) AS streak_start,
           MAX(activity_date) AS streak_end,
           COUNT(*) AS streak_length
    FROM grouped
    GROUP BY user_id, streak_key
)
SELECT DISTINCT user_id
FROM runs
WHERE streak_length >= 3;
```

## Why subtracting ROW_NUMBER works

For one user's deduplicated dates:

| activity_date | rn | activity_date minus rn days |
|---|---:|---|
| 2026-01-10 | 1 | 2026-01-09 |
| 2026-01-11 | 2 | 2026-01-09 |
| 2026-01-12 | 3 | 2026-01-09 |
| 2026-01-15 | 4 | 2026-01-11 |
| 2026-01-16 | 5 | 2026-01-11 |

Inside a streak, both the date and row number increase by one, so their difference stays constant. A gap changes that difference.

The final `DISTINCT user_id` matters: one user could have several qualifying streaks. To show the streaks themselves, select the start, end, and length from `runs` instead.

**Essential:** Deduplicate dates before assigning row numbers. Several events on one day must not consume several positions in a day-level streak. This technique assumes a fixed one-day step; business-day streaks require a business calendar.

## Alternative for exactly the threshold of three

```sql
WITH days AS (
    SELECT DISTINCT user_id, record_date::date AS activity_date
    FROM sf_events
    WHERE record_date IS NOT NULL
), compared AS (
    SELECT user_id, activity_date,
           LAG(activity_date, 2) OVER (
               PARTITION BY user_id ORDER BY activity_date
           ) AS two_dates_back
    FROM days
)
SELECT DISTINCT user_id
FROM compared
WHERE activity_date - two_dates_back = 2;
```

With unique ordered dates, three observations spanning two days must be consecutive. The gaps-and-islands version is more useful when asked for every streak or the longest streak.
