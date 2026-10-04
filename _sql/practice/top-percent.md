---
title: "Top 5%: thresholds & quotas"
description: "Distinguish percentile cutoffs from a fixed count of rows."
chapter: "practice"
order: 8
sequence: 1408
level: "Core"
references: [{"title":"PostgreSQL window functions","url":"https://www.postgresql.org/docs/current/functions-window.html"}]
---

Assume `claims(claim_id, state, fraud_score)`.

**At or above the 95th percentile score:**

```sql
WITH thresholds AS (
    SELECT state,
           PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY fraud_score)
               AS score_threshold
    FROM claims
    WHERE fraud_score IS NOT NULL
    GROUP BY state
)
SELECT c.claim_id, c.state, c.fraud_score
FROM claims c
JOIN thresholds t ON t.state = c.state
WHERE c.fraud_score >= t.score_threshold;
```

Assume state is non-null. Ties at the threshold can produce more than 5% of rows.

**A quota of 5% of rows, rounded up, with deterministic tie-breaking:**

```sql
WITH ranked AS (
    SELECT claim_id, state, fraud_score,
           ROW_NUMBER() OVER (
               PARTITION BY state ORDER BY fraud_score DESC, claim_id
           ) AS rn,
           COUNT(*) OVER (PARTITION BY state) AS state_count
    FROM claims
    WHERE fraud_score IS NOT NULL
)
SELECT claim_id, state, fraud_score
FROM ranked
WHERE rn <= CEIL(0.05 * state_count);
```

For 21 claims, the quota returns two. If all 21 claims share the same score, the percentile-threshold query returns all 21. The rounding policy must be agreed upon for a row quota.

`PERCENT_RANK()` is another concept: `(RANK - 1) / (partition row count - 1)`, with 0 for a single-row partition. With ascending scores, `PERCENT_RANK() >= 0.95` is not interchangeable with the two definitions above. In an all-equal partition, every row has percent rank 0. Explain the requested meaning before choosing the function.
