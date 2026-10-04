---
title: "Statistics, cardinality, and skew"
description: "Explain why an optimizer can choose a poor plan even when a useful index exists."
chapter: performance
order: 4
sequence: 1104
level: Intermediate
references:
  - title: PostgreSQL planner statistics
    url: https://www.postgresql.org/docs/current/planner-stats.html
---

## The optimizer makes predictions

Before execution, the optimizer estimates how many rows each operation will produce. Those estimates influence access paths and joins. An index offers an option; the optimizer still needs to judge whether using it is worthwhile.

Imagine 100 customers with equal activity, then a new customer imports half a million historical orders. “One customer” no longer describes how much data a request selects. Test the small and large customer separately.

## Diagnose the estimate

Locate a meaningful estimated-versus-actual row mismatch and trace its input. A mismatch near a scan may come from a filter estimate; a mismatch after a join may come from key multiplicity. Refreshing statistics cannot fix an incorrect assumption of uniqueness.

After substantial changes, inspect whether statistics collection has caught up. PostgreSQL's `ANALYZE` samples the table, so estimates remain approximate. Extended statistics describe selected relationships between columns; they are not a general repair for every join estimate.

```sql
ANALYZE coretrail_lab.orders;

SELECT attname, n_distinct, null_frac
FROM pg_stats
WHERE schemaname = 'coretrail_lab'
  AND tablename = 'orders';
```

Use this with the [lab dataset]({{ '/sql/performance/index-lab/' | relative_url }}). How many customer IDs did you create? Are nulls permitted? Do the estimates reflect that shape?

## Correlation changes the reasoning

A customer table stores country and city. Treating `country = 'India'` and `city = 'Mumbai'` as independent restrictions can underestimate their joint result. On that illustrative schema, a candidate investigation is:

```sql
CREATE STATISTICS customer_location_stats (dependencies, mcv)
ON country, city FROM customers;
ANALYZE customers;
```

Confirm that the problematic predicates are supported by the statistics kind, and inspect the changed estimate. Do not create statistics objects for every column combination. The illustrative `customers` table above is separate from the lab fixture.

## Skew affects more than estimates

A large customer can concentrate work on one shard or warehouse worker. An accurate estimate does not remove that imbalance. Separate “the planner misunderstood the data” from “the data itself concentrates work.”

Record the distribution of requests too. An optimization for a rare report may hurt frequent writes or ordinary lookups. Evaluate the workload that matters to the product.

## Interview exercise

“A query is quick for most tenants and slow for one. Should we add another index?”

<details markdown="1"><summary>Build a stronger answer</summary>

Compare row counts, actual plans, waits, and requested ranges. Check whether a reused plan suits both parameter values. Inspect the existing index and fraction of data requested. A large result may need pagination, a different query contract, or precomputed summaries. Add an index when it addresses identified work, and test both tenants.

</details>
