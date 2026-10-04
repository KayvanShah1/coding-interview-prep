---
title: "Largest Olympics"
description: "Count distinct athletes, then keep every tied maximum."
chapter: "practice"
order: 4
sequence: 1404
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

Assume `olympics_athletes_events(id, games, event, ...)`, with potentially several rows per athlete per games because an athlete can enter several events.

```sql
WITH participation AS (
    SELECT games, COUNT(DISTINCT id) AS athletes_count
    FROM olympics_athletes_events
    GROUP BY games
)
SELECT games, athletes_count
FROM participation
WHERE athletes_count = (
    SELECT MAX(athletes_count) FROM participation
)
ORDER BY games;
```

For `(Athlete 1, Games A, Event X)`, `(Athlete 1, Games A, Event Y)`, and `(Athlete 2, Games A, Event X)`, there are **three event rows but two athletes**.

If Games A and Games B each have two athletes, both should survive. `ORDER BY athletes_count DESC LIMIT 1` loses a tied winner. Ranking the aggregated counts and retaining rank 1 is another valid approach, but the maximum comparison is sufficient for this question.
