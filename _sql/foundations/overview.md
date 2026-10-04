---
title: "Foundations"
nav_title: "Overview"
description: "Understand tables, keys, data types, and how a query is evaluated."
chapter: "foundations"
order: 0
sequence: 0
level: "Chapter overview"
---

## Start with what one row means

SQL becomes easier when you can name the input population and required output grain before choosing syntax. This chapter connects tables, keys, types, and logical query order so later joins and windows have a clear foundation.

**Suggested route:** Read grain and query order first. Use the practice dataset to predict results, then test the effect of duplicate and missing rows.

**By the end:** Explain why a query returns one row per customer rather than one row per order; distinguish logical evaluation from physical execution.

## Decision reference

| Question | Construct |
|---|---|
| Which rows are eligible? | FROM, JOIN, WHERE |
| What is the reporting grain? | GROUP BY and aggregates |
| Which groups qualify? | HAVING |
| Which comparisons retain detail? | Window functions |
| Which rows are displayed first? | Final ORDER BY, LIMIT |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/foundations/grain/' | relative_url }}">Think in rows and grain</a><span>Establish what one input and output row represents.</span></li>
<li><a href="{{ '/sql/foundations/query-order/' | relative_url }}">Query structure & execution order</a><span>Understand WHERE, HAVING, windows, and why aliases have limits.</span></li>
<li><a href="{{ '/sql/foundations/relational-basics/' | relative_url }}">Relational databases & SQL commands</a><span>Understand relations, keys, and the jobs different SQL statements perform.</span></li>
<li><a href="{{ '/sql/foundations/data-types/' | relative_url }}">Data types & casting</a><span>Choose representations that preserve precision and meaning.</span></li>
<li><a href="{{ '/sql/foundations/sample-data/' | relative_url }}">Practice dataset & example conventions</a><span>Use a small, deterministic PostgreSQL dataset to run the handbook's core queries.</span></li>
</ul>

## How to study

Use the suggested route above. For each lesson, explain the decision in your own words, test its example, and identify a situation where a different approach would be needed.
