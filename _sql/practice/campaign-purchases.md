---
title: "Later purchases of new products"
description: "Compare later purchases with the complete first-day product set."
chapter: "practice"
order: 9
sequence: 1309
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

Assume `campaign_purchases(user_id, purchase_date, product_id)` has non-null dates and product IDs.

Definition here: a user qualifies if they buy, on a later calendar day, a product they did **not** buy on their first purchase day.

```sql
WITH first_days AS (
    SELECT user_id, MIN(purchase_date) AS first_date
    FROM campaign_purchases
    GROUP BY user_id
)
SELECT COUNT(*) AS qualifying_users
FROM first_days f
WHERE EXISTS (
    SELECT 1
    FROM campaign_purchases later
    WHERE later.user_id = f.user_id
      AND later.purchase_date > f.first_date
      AND NOT EXISTS (
          SELECT 1
          FROM campaign_purchases initial
          WHERE initial.user_id = f.user_id
            AND initial.purchase_date = f.first_date
            AND initial.product_id = later.product_id
      )
);
```

First-day products are a **set**, not just the first row. If a user buys A and B on day one and B on day two, they do not qualify. Buying C on day two qualifies. Merely checking that two rows have different products would incorrectly count the first case by comparing day-two B with day-one A.

The query identifies a purchase pattern; it does not establish that a campaign caused the purchase.
