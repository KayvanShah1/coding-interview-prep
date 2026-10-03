---
title: "Interview patterns"
nav_title: "Overview"
description: "Recognize recurring problems and choose a reliable approach."
chapter: "patterns"
order: 0
sequence: 700
level: "Chapter overview"
---

## Wording → first technique

| Interview wording | First technique to consider |
|---|---|
| latest / earliest row | `ROW_NUMBER` or PostgreSQL `DISTINCT ON` |
| exactly top N rows per group | `ROW_NUMBER` |
| top N distinct values / levels | `DENSE_RANK` |
| previous / next observed value | `LAG / LEAD` |
| month-over-month / period change | aggregate → `LAG` |
| percentage of total | aggregate → `SUM(...) OVER ()` |
| at least one related row | `EXISTS` |
| never / no matching row | `NOT EXISTS` |
| every required item | double `NOT EXISTS` or `HAVING COUNT(DISTINCT ...)` |
| both/all requested categories | conditional aggregation / `HAVING` |
| consecutive dates | deduplicate → row-number island key |
| new session after gap | `LAG` → boundary flag → cumulative `SUM` |
| state/run changes | `LAG` → changed flag → cumulative `SUM` |
| missing dates / zero-activity periods | calendar spine → `LEFT JOIN` |
| first event then later event | first-event CTE → join/existence after timestamp |
| ordered funnel | stage timestamps / ordered existence checks |
| median / p95 / p99 | `PERCENTILE_CONT ... WITHIN GROUP` |
| actual observed percentile value | `PERCENTILE_DISC ... WITHIN GROUP` |
| bucket users into quartiles/deciles | `NTILE` |
| relative rank of each row | `PERCENT_RANK` / `CUME_DIST` |
| pivot categories to columns | conditional aggregation |
| overlapping intervals | self join + overlap condition |
| all entity × period combinations | `CROSS JOIN` + `LEFT JOIN` |

## High-value composition patterns

### Aggregate → window

Use whenever a comparison should happen **after** reducing data to the reporting grain.

```text
raw rows
→ GROUP BY period/entity
→ window over aggregated rows
```

Examples: MoM revenue, rank stores by total visits, percentage of total, cumulative monthly sales.

### LAG → arithmetic

```text
current metric
- previous metric
= absolute change
```

```text
(current - previous) / previous
= percentage change
```

Protect a zero previous value with `NULLIF`.

### LAG → flag → cumulative SUM

```text
ordered events
→ LAG(previous event/state)
→ CASE boundary = 1
→ SUM(boundary) OVER (...)
→ session/island/run id
```

Use for sessions, state changes, event runs, and many gaps-and-islands problems.

### ROW_NUMBER → filter

```text
PARTITION BY business key
ORDER BY preferred survivor
→ rn
→ rn = 1
```

Use for latest records and deterministic deduplication.

### Calendar → LEFT JOIN

```text
generate expected dates
→ aggregate observed data
→ LEFT JOIN
→ fill zero only when semantically correct
```

Needed when “no row” must appear explicitly as a date with zero activity.

### CROSS JOIN → LEFT JOIN

```text
expected entity set × expected category/date set
→ attach observations
```

Use for students × subjects, stores × days, customers × months.

### First event → later event

```text
find MIN(event_time) per entity
→ establish first-event attributes
→ search/join for events after first_time
```

Useful for first purchase, repeat purchase, activation, campaign follow-up, and retention questions.

## Percentile decision map

| Question | Use |
|---|---|
| “What is the p95 threshold?” | `PERCENTILE_CONT(0.95) WITHIN GROUP` |
| “Give an actual observed value at the percentile” | `PERCENTILE_DISC` |
| “Where does each row rank from 0–1?” | `PERCENT_RANK()` |
| “What fraction is at or below this row?” | `CUME_DIST()` |
| “Split rows into 10 groups” | `NTILE(10)` |

## Output-grain checks

Before writing the query, state:

1. What does one input row represent?
2. What should one output row represent?
3. Are duplicates meaningful?
4. Can dates/periods be absent?
5. How should ties be handled?
6. Does “previous” mean previous row or previous calendar period?
7. What population belongs in the denominator?

These decisions usually determine the correct SQL pattern before syntax does.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/patterns/deduplication/' | relative_url }}">Duplicates & latest records</a><span>Find repeated business keys and choose one version deterministically.</span></li>
<li><a href="{{ '/sql/patterns/gaps-islands/' | relative_url }}">Consecutive days & streaks</a><span>Group runs using deduplicated dates and row numbers.</span></li>
<li><a href="{{ '/sql/patterns/sessions/' | relative_url }}">Sessions & changes in state</a><span>Turn boundary flags into groups with a cumulative sum.</span></li>
<li><a href="{{ '/sql/patterns/retention-calendar/' | relative_url }}">Retention & missing dates</a><span>Define observation windows and construct complete calendars.</span></li>
<li><a href="{{ '/sql/patterns/mixed-patterns/' | relative_url }}">Pivots, medians & interval overlaps</a><span>Recognize several useful extensions of the core patterns.</span></li>
<li><a href="{{ '/sql/patterns/funnels/' | relative_url }}">Ordered funnels</a><span>Require the right sequence of events instead of merely counting users with each event.</span></li>
</ul>

## How to study

Read the wording column and try to name the technique before looking right. In an interview, write the output grain and edge case before writing syntax.
