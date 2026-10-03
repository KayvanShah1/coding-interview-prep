---
title: "Performance"
nav_title: "Overview"
description: "Read plans, choose indexes, and reduce unnecessary work."
chapter: "performance"
order: 0
sequence: 1100
level: "Chapter overview"
---

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/performance/common-mistakes/' | relative_url }}">Correctness & optimization traps</a><span>Check semantics before comparing query performance.</span></li>
<li><a href="{{ '/sql/performance/indexes/' | relative_url }}">Indexes and access paths</a><span>Choose indexes from predicates, ordering, and workload rather than a checklist.</span></li>
<li><a href="{{ '/sql/performance/explain/' | relative_url }}">Reading EXPLAIN plans</a><span>Follow data flow, compare estimates to reality, and find expensive work.</span></li>
<li><a href="{{ '/sql/performance/partitioning/' | relative_url }}">Partitioning & pruning</a><span>Separate physical data layout from window partitions and logical grouping.</span></li>
<li><a href="{{ '/sql/performance/pagination/' | relative_url }}">Pagination: OFFSET and keysets</a><span>Return stable pages without repeatedly skipping an ever-growing prefix.</span></li>
</ul>

## How to study

Read the explanation, predict the query output, then run the example. Change one input row to create a tie, a missing value, or a duplicate and explain what changes.
