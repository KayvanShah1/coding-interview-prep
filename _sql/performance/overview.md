---
title: "Performance"
nav_title: "Overview"
description: "Read plans, choose indexes, and reduce unnecessary work."
chapter: "performance"
order: 0
sequence: 1100
dialect: Cross-engine concepts
level: "Chapter overview"
---

## Investigate the work behind the result

Performance starts with a correct result and a measurable symptom. This chapter moves from plans and access paths to reproducible experiments, then contrasts transactional engines with analytical warehouses.

**Suggested route:** Follow workflow → plans → indexes → statistics → joins and predicates. Run the index and partition labs before jumping to engine-specific guidance.

**By the end:** Form a hypothesis from a plan, verify unchanged results, and measure a change without claiming universal speedups.

## Decision reference

| Symptom | First lesson |
|---|---|
| Unclear source of slowness | When and where to optimize |
| Much input, tiny output | Plans and access paths |
| Estimates differ from reality | Statistics and skew |
| Large joins or spills | Joins, sorting, and memory |
| Broad time scans | Predicates and partition pruning |
| Warehouse scan or shuffle cost | Warehouse performance |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/performance/workflow/' | relative_url }}">When and where to optimize</a><span>Turn a performance complaint into a measurable question before changing SQL or infrastructure.</span></li>
<li><a href="{{ '/sql/performance/explain/' | relative_url }}">Reading EXPLAIN plans</a><span>Follow data flow, compare estimates to reality, and find expensive work.</span></li>
<li><a href="{{ '/sql/performance/indexes/' | relative_url }}">Indexes and access paths</a><span>Choose indexes from predicates, ordering, and workload rather than a checklist.</span></li>
<li><a href="{{ '/sql/performance/statistics/' | relative_url }}">Statistics, cardinality, and skew</a><span>Explain why an optimizer can choose a poor plan even when a useful index exists.</span></li>
<li><a href="{{ '/sql/performance/joins-sorts/' | relative_url }}">Joins, sorting, and memory</a><span>Relate physical operators to input size, repeated work, and intermediate results.</span></li>
<li><a href="{{ '/sql/performance/sargability/' | relative_url }}">Predicates and query rewrites</a><span>Make restrictions usable while preserving dates, null behavior, and the intended population.</span></li>
<li><a href="{{ '/sql/performance/common-mistakes/' | relative_url }}">Correctness & optimization traps</a><span>Check semantics before comparing query performance.</span></li>
<li><a href="{{ '/sql/performance/partitioning/' | relative_url }}">Partitioning & pruning</a><span>Separate physical data layout from window partitions and logical grouping.</span></li>
<li><a href="{{ '/sql/performance/pagination/' | relative_url }}">Pagination: OFFSET and keysets</a><span>Return stable pages without repeatedly skipping an ever-growing prefix.</span></li>
<li><a href="{{ '/sql/performance/index-lab/' | relative_url }}">Lab: investigate an order lookup</a><span>Capture a baseline, add a candidate index, and compare results and actual plans on PostgreSQL.</span></li>
<li><a href="{{ '/sql/performance/partition-lab/' | relative_url }}">Lab: prove partition pruning</a><span>Compare a time-bounded request with an asset-only request and inspect the partitions actually accessed.</span></li>
<li><a href="{{ '/sql/performance/warehouses/' | relative_url }}">Warehouse performance: BigQuery, Redshift, Athena</a><span>Investigate pruning, data movement, and file layout using the warehouse's own evidence.</span></li>
<li><a href="{{ '/sql/performance/sql-server/' | relative_url }}">SQL Server performance investigation</a><span>Connect actual plans, logical reads, waits, and Query Store history to a specific regression.</span></li>
</ul>

## How to study

Use the suggested route above. For each lesson, explain the decision in your own words, test its example, and identify a situation where a different approach would be needed.
