---
title: "Rates, populations, and weighted averages"
description: "Define numerator and denominator at the same grain before dividing."
chapter: patterns
order: 8
sequence: 708
level: Core
references:
  - title: PostgreSQL conditional expressions
    url: https://www.postgresql.org/docs/current/functions-conditional.html
---

## Start with the population

“What percentage of users purchased?” is incomplete until you define eligible users, purchase status, and time window. Counting purchases and dividing by users mixes event and entity grain. Joining users to orders can also multiply the denominator.

Reduce each eligible user to a flag, then aggregate those flags. The numerator and denominator now describe the same unit.

```sql
WITH users(user_id) AS (VALUES (1), (2), (3)),
orders(user_id, status) AS (
    VALUES (1, 'paid'), (1, 'paid'), (2, 'pending')
), flags AS (
    SELECT u.user_id,
           EXISTS (SELECT 1 FROM orders o
                   WHERE o.user_id = u.user_id AND o.status = 'paid') AS purchased
    FROM users u
)
SELECT COUNT(*) AS eligible_users,
       COUNT(*) FILTER (WHERE purchased) AS purchasing_users,
       ROUND(100.0 * COUNT(*) FILTER (WHERE purchased)
             / NULLIF(COUNT(*), 0), 2) AS purchase_pct
FROM flags;
```

The result is **3 eligible users, 1 purchasing user, 33.33%**. Two paid orders from user 1 still contribute one purchasing user. User 3 remains in the population despite having no orders.

## Explain the wrong answer

Joining paid orders to users and counting rows produces two matched rows. Dividing that by three gives 66.67%, which measures neither the share of users nor a meaningful conversion rate. `COUNT(DISTINCT user_id)` can repair particular counts, but defining grain explicitly makes the whole query easier to audit.

## Combine group rates correctly

Suppose group A has 1 success out of 2 attempts and group B has 9 out of 90. Averaging 50% and 10% gives 30%. The overall attempt success rate is 10 / 92, about 10.87%.

```sql
WITH groups(successes, attempts) AS (VALUES (1, 2), (9, 90))
SELECT ROUND(100.0 * SUM(successes) / NULLIF(SUM(attempts), 0), 2) AS overall_pct
FROM groups;
```

The weights are attempt counts because the question asks about all attempts. If the question instead asks for the average group's success rate, equal weighting may be intentional. State that distinction before selecting a formula.

## Edge cases to test

Test repeated events, an eligible entity with no events, null status, an empty population, and a zero denominator. Decide whether incomplete tracking should be excluded, labeled unknown, or treated as failure. SQL cannot choose that business rule for you.

## Practice

Change the requirement from “percentage of users with a paid order” to “percentage of orders that are paid.” What changes?

<details markdown="1"><summary>Answer</summary>

The population becomes orders, and each order counts once. The three example orders contain two paid orders, so the rate is 66.67%. User 3 no longer adds a denominator row because this metric is about orders. The same percentage that was wrong for the user question is correct for this different question.

</details>
