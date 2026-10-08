---
title: "Percentiles, WITHIN GROUP, and thresholds"
description: "Work out the percentile by hand, compare continuous and observed values, and handle tied thresholds."
chapter: aggregation
order: 3
sequence: 303
level: Intermediate
references:
  - title: PostgreSQL aggregate functions
    url: https://www.postgresql.org/docs/current/functions-aggregate.html
---

## Decide what the output represents

“Find p95 latency” asks for a threshold summarizing a population. “Return the slowest 5% of requests” asks for rows and needs a tie policy. “Place each request into a percentile” asks for a per-row distribution measure. Those requests can produce different answers on the same data.

Start with four observed latencies: 10, 20, 30, and 100 milliseconds. For the median, an interpolated answer is 25. If the answer must be an observed value, the discrete median is 20.

## Run a complete example

```sql
WITH requests(service, latency_ms) AS (
    VALUES ('search', 10.0), ('search', 20.0),
           ('search', 30.0), ('search', 100.0),
           ('checkout', 5.0), ('checkout', 5.0)
)
SELECT service,
       COUNT(*) AS requests,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) AS median_cont,
       PERCENTILE_DISC(0.5) WITHIN GROUP (ORDER BY latency_ms) AS median_disc
FROM requests
GROUP BY service
ORDER BY service;
```

| service | requests | median_cont | median_disc |
|---|---:|---:|---:|
| checkout | 2 | 5 | 5 |
| search | 4 | 25 | 20 |

`GROUP BY` defines one population per service. `WITHIN GROUP` specifies the value order used by the ordered-set aggregate. The final `ORDER BY service` only sorts output rows. Naming these three roles prevents a common syntax-memory mistake.

## Understand the interpolation

For four ordered values, the halfway position lies between the second and third values, giving 25. At p95, the continuous position is 1 + 0.95 × (4 − 1) = 3.85, so interpolation between 30 and 100 gives 89.5. The discrete p95 is 100 because it selects an observed value at the required cumulative position.

For these PostgreSQL aggregates, null input values are ignored. Decide whether missing latency means an absent observation, an instrumentation failure, or a request that should be tracked separately. Replacing null with zero changes the population's meaning.

## Combine a threshold with detail rows

Compute one threshold per group, then join it back when the task requires the original rows. Using `>= threshold` can return more than a fixed percentage when values tie. Choosing an exact quota instead requires a row-count rule, rounding policy, and deterministic tie-breaker.

Do not substitute `NTILE(20)` and assume the first or last bucket has identical percentile-threshold semantics. Compare [thresholds and quotas]({{ '/sql/practice/top-percent/' | relative_url }}) and [window distribution functions]({{ '/sql/windows/distribution/' | relative_url }}).

## Practice before revealing

Change 100 to 30. What happens to the continuous median, discrete median, and p95?

<details markdown="1"><summary>Expected reasoning</summary>

The ordered values become 10, 20, 30, 30. The continuous median remains 25 and the discrete median remains 20. Both p95 variants become 30. A `>= 30` threshold returns two of four rows, showing why a percentile threshold need not select exactly 5% of rows.

</details>
