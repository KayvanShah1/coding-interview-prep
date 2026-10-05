---
title: "Filtering & expressions"
nav_title: "Overview"
description: "Select the right rows and reason carefully about missing values."
chapter: "filtering"
order: 0
sequence: 100
level: "Chapter overview"
---

## Choose the rows before transforming them

Filtering defines the population every later operation sees. Learn inclusive boundaries, membership, pattern matching, and three-valued null logic together: a predicate that becomes unknown can remove rows you expected to keep.

**Suggested route:** Start with predicates, then compare null behavior in CASE, IN, and NOT IN. Follow existence questions into the subqueries chapter.

**By the end:** Explain a date boundary and a null-containing comparison set using concrete rows.

## Decision reference

| Need | Construct and check |
|---|---|
| Inclusive range | BETWEEN; both boundaries included |
| Whole timestamp day | >= start AND < next start |
| Membership | IN; check null semantics |
| Missing values | IS NULL / IS NOT NULL |
| Conditional expression | CASE; decide ELSE behavior |
| Text match | LIKE / ILIKE / regex; dialect and pattern semantics |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/filtering/predicates/' | relative_url }}">BETWEEN, IN & pattern matching</a><span>Filter ranges, alternatives, and text without boundary mistakes.</span></li>
<li><a href="{{ '/sql/filtering/null-case/' | relative_url }}">NULL, CASE & conditional expressions</a><span>Reason about unknown values and express conditional logic.</span></li>
</ul>

## How to study

Use the suggested route above. For each lesson, explain the decision in your own words, test its example, and identify a situation where a different approach would be needed.
