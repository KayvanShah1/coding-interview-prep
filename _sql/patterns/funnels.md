---
title: "Ordered funnels"
description: "Require the right sequence of events instead of merely counting users with each event."
chapter: "patterns"
order: 6
sequence: 706
level: "Intermediate"
references: [{"title":"PostgreSQL aggregates","url":"https://www.postgresql.org/docs/current/functions-aggregate.html"}]
---

## Define the conversion

This example asks which users viewed an item, then added to cart, then purchased at a strictly later time. The stages are user-level and can involve different items; add product or session keys when those must match.

```sql
WITH viewed AS (
    SELECT user_id, MIN(event_ts) AS viewed_at
    FROM events WHERE event_type = 'view'
    GROUP BY user_id
), carted AS (
    SELECT v.user_id, v.viewed_at, MIN(e.event_ts) AS carted_at
    FROM viewed v
    LEFT JOIN events e ON e.user_id = v.user_id
      AND e.event_type = 'cart' AND e.event_ts > v.viewed_at
    GROUP BY v.user_id, v.viewed_at
), purchased AS (
    SELECT c.user_id, c.carted_at, MIN(e.event_ts) AS purchased_at
    FROM carted c
    LEFT JOIN events e ON e.user_id = c.user_id
      AND e.event_type = 'purchase' AND e.event_ts > c.carted_at
    GROUP BY c.user_id, c.carted_at
)
SELECT COUNT(*) AS viewers,
       COUNT(carted_at) AS cart_users,
       COUNT(purchased_at) AS purchasing_users,
       100.0 * COUNT(purchased_at) / NULLIF(COUNT(*), 0) AS conversion_pct
FROM purchased;
```

The left joins retain users who drop out so the denominator remains all viewers. Each stage reduces to one row per user before the next join.

## What must be specified

Should stages occur in one session? Within seven days? For the same product? Are equal timestamps permitted, and is there an event sequence number to break ties? The query above answers only the explicitly stated version.

Three independent counts of users with a view, cart, and purchase do not prove the events occurred in order. They may count a purchase that happened before the user's first view.
