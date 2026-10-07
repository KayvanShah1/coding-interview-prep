---
title: "Joins, sorting, and memory"
description: "Relate physical operators to input size, repeated work, and intermediate results."
chapter: performance
order: 5
sequence: 1105
level: Intermediate
references:
  - title: PostgreSQL planner method configuration
    url: https://www.postgresql.org/docs/current/runtime-config-query.html
  - title: PostgreSQL resource consumption
    url: https://www.postgresql.org/docs/current/runtime-config-resource.html
---

## Start with the input size

An order has three line items and two payments. Joining both children directly produces six combinations. A subsequent sum can be incorrect and expensive. Aggregating each child to one row per order before joining fixes the grain when the requested measures allow it.

That is a stronger first step than asking whether a hash join is faster than a nested loop: the query was handing the join the wrong logical problem.

## Understand physical choices

| Strategy | Approach | Situation to investigate |
|---|---|---|
| Nested loop | For each outer row, search the inner input | Small outer input with inexpensive inner lookups |
| Hash join | Build a hash structure, then probe it | Compatible equality joins over substantial inputs |
| Merge join | Advance through suitably ordered inputs | Existing order or a justified sorting step |

The choice depends on estimates, indexes, ordering, memory, and predicates. A nested loop over 20 customers can be sensible. The same lookup repeated millions of times deserves investigation. A hash join can incur additional work when its build input does not fit the available memory.

## Sorting is often downstream of a data problem

Ranking, `ORDER BY`, deduplication, and some aggregate strategies need order or memory. Before increasing memory, ask whether you can reduce rows or row width without changing the result.

To rank stores by monthly revenue, aggregate to store-month first, then rank the totals. Ranking individual sales first answers a different question and handles more rows. See [period comparisons]({{ '/sql/patterns/period-changes/' | relative_url }}) for a complete aggregation-to-window example.

An index can sometimes supply useful order, but intervening operations can lose that order. Inspect the actual plan for the sort you intended to remove.

## Memory has a concurrency cost

PostgreSQL's work memory settings apply to execution operations. One query can contain several memory-consuming operations, with further effects from parallelism. Raising a global setting because one report spills can expose the server to much higher aggregate demand.

In a controlled lab, compare smaller intermediate results with a larger memory allowance. Record sort/hash behavior, runtime, and concurrency assumptions. A spill is evidence to investigate; eliminating every spill is not itself a business requirement.

## Exercise: a misleading fix

An engineer adds `DISTINCT` after joining customers, orders, and items. The customer output now looks correct. What remains to examine?

<details markdown="1"><summary>Discussion</summary>

If the query only needs to know that a matching item exists, `EXISTS` can express that result without asking for combinations to deduplicate. Verify that filters still refer to the same related rows, compare results, and inspect the plans. Do not claim `EXISTS` must be faster: an optimizer can transform equivalent formulations.

</details>
