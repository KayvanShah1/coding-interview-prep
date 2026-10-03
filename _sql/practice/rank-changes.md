---
title: "Country rank changes"
description: "Rank each period separately before comparing countries."
chapter: "practice"
order: 7
sequence: 1307
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

Assume `country_month_comments(country, month_start, comment_count)` has one row per country per month.

```sql
WITH ranked AS (
    SELECT country, month_start, comment_count,
           DENSE_RANK() OVER (
               PARTITION BY month_start
               ORDER BY comment_count DESC
           ) AS country_rank
    FROM country_month_comments
    WHERE month_start IN (DATE '2019-12-01', DATE '2020-01-01')
)
SELECT jan.country,
       dec.country_rank AS december_rank,
       jan.country_rank AS january_rank,
       dec.country_rank - jan.country_rank AS places_improved
FROM ranked dec
JOIN ranked jan ON jan.country = dec.country
WHERE dec.month_start = DATE '2019-12-01'
  AND jan.month_start = DATE '2020-01-01'
  AND jan.country_rank < dec.country_rank;
```

Rank 2 is better than rank 5, so an improvement is a **smaller rank number**. If starting from raw comments, aggregate to country-month before applying the window. This inner join compares countries present in both periods; including new entrants needs a separate missing-rank rule.

Do not filter to one target country before ranking: that would change the ranking population.
