---
title: "Filtering & expressions"
nav_title: "Overview"
description: "Select the right rows and reason carefully about missing values."
chapter: "filtering"
order: 0
sequence: 100
level: "Chapter overview"
---

## Which rows should survive?

Filtering defines the population every later operation sees. Learn inclusive boundaries, membership, pattern matching, and three-valued null logic together: a predicate that becomes unknown can remove rows you expected to keep.


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

## Try breaking the predicate

Test the same filter with a boundary value, a null, and a timestamp near midnight. If one of those changes the population unexpectedly, the predicate needs another look.
