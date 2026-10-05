---
title: "Interview patterns"
nav_title: "Overview"
description: "Recognize recurring problems and choose a reliable approach."
chapter: "patterns"
order: 0
sequence: 700
level: "Chapter overview"
mermaid: true
---

## Recognize a problem, then compose a solution

Interview questions often combine a few operations across different grains. The wording map suggests a starting point; the worked lessons show why the stages are needed and where a plausible shortcut breaks.

**Suggested route:** Try a pattern with a tiny fixture, then change the population or tie rule. Use mixed practice when you can identify a technique without its label.

**By the end:** Describe the sequence of transformations and reject an alternative with a concrete counterexample.

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

{% capture diagram_code %}
flowchart LR
accTitle: Aggregate before applying a window
A["Raw rows"] --> B["GROUP BY period or entity"] --> C["Window over aggregated rows"]
click B href "{{ '/sql/aggregation/aggregate-functions/' | relative_url }}" "Open GROUP BY period or entity" _self
click C href "{{ '/sql/windows/introduction/' | relative_url }}" "Open Window over aggregated rows" _self
{% endcapture %}
{% capture diagram_fallback %}
1. Raw rows
2. [GROUP BY period or entity]({{ '/sql/aggregation/aggregate-functions/' | relative_url }})
3. [Window over aggregated rows]({{ '/sql/windows/introduction/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Aggregate before applying a window" code=diagram_code fallback=diagram_fallback %}

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

{% capture diagram_code %}
flowchart LR
accTitle: Turn events into sessions or runs
A["Ordered events"] --> B["LAG: previous event or state"] --> C["CASE: mark each boundary"] --> D["Cumulative SUM of boundaries"] --> E["Session, island, or run ID"]
click B href "{{ '/sql/windows/lag-lead/' | relative_url }}" "Open LAG: previous event or state" _self
click D href "{{ '/sql/windows/running-calculations/' | relative_url }}" "Open Cumulative SUM of boundaries" _self
click E href "{{ '/sql/patterns/sessions/' | relative_url }}" "Open Session, island, or run ID" _self
{% endcapture %}
{% capture diagram_fallback %}
1. Ordered events
2. [LAG: previous event or state]({{ '/sql/windows/lag-lead/' | relative_url }})
3. CASE: mark each boundary
4. [Cumulative SUM of boundaries]({{ '/sql/windows/running-calculations/' | relative_url }})
5. [Session, island, or run ID]({{ '/sql/patterns/sessions/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Turn events into sessions or runs" code=diagram_code fallback=diagram_fallback %}

Use for sessions, state changes, event runs, and many gaps-and-islands problems.

### ROW_NUMBER → filter

{% capture diagram_code %}
flowchart LR
accTitle: Choose one row per business key
A["Partition by business key"] --> B["Order by preferred survivor"] --> C["Assign ROW_NUMBER"] --> D["Keep rn = 1"]
click C href "{{ '/sql/windows/ranking/' | relative_url }}" "Open Assign ROW_NUMBER" _self
click D href "{{ '/sql/patterns/deduplication/' | relative_url }}" "Open Keep rn = 1" _self
{% endcapture %}
{% capture diagram_fallback %}
1. Partition by business key
2. Order by preferred survivor
3. [Assign ROW_NUMBER]({{ '/sql/windows/ranking/' | relative_url }})
4. [Keep rn = 1]({{ '/sql/patterns/deduplication/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Choose one row per business key" code=diagram_code fallback=diagram_fallback %}

Use for latest records and deterministic deduplication.

### Calendar → LEFT JOIN

{% capture diagram_code %}
flowchart LR
accTitle: Make missing dates explicit
A["Generate expected dates"] --> B["Aggregate observed data"] --> C["LEFT JOIN on the date"] --> D["Fill zero only when appropriate"]
click C href "{{ '/sql/joins/join-types/' | relative_url }}" "Open LEFT JOIN on the date" _self
click D href "{{ '/sql/patterns/retention-calendar/' | relative_url }}" "Open Fill zero only when appropriate" _self
{% endcapture %}
{% capture diagram_fallback %}
1. Generate expected dates
2. Aggregate observed data
3. [LEFT JOIN on the date]({{ '/sql/joins/join-types/' | relative_url }})
4. [Fill zero only when appropriate]({{ '/sql/patterns/retention-calendar/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Make missing dates explicit" code=diagram_code fallback=diagram_fallback %}

Needed when “no row” must appear explicitly as a date with zero activity.

### CROSS JOIN → LEFT JOIN

{% capture diagram_code %}
flowchart LR
accTitle: Build the expected combinations
A["Expected entities"] --> B["CROSS JOIN expected categories or dates"] --> C["LEFT JOIN observations"]
click B href "{{ '/sql/joins/join-types/' | relative_url }}" "Open CROSS JOIN expected categories or dates" _self
click C href "{{ '/sql/patterns/retention-calendar/' | relative_url }}" "Open LEFT JOIN observations" _self
{% endcapture %}
{% capture diagram_fallback %}
1. Expected entities
2. [CROSS JOIN expected categories or dates]({{ '/sql/joins/join-types/' | relative_url }})
3. [LEFT JOIN observations]({{ '/sql/patterns/retention-calendar/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Build the expected combinations" code=diagram_code fallback=diagram_fallback %}

Use for students × subjects, stores × days, customers × months.

### First event → later event

{% capture diagram_code %}
flowchart LR
accTitle: Find events after the first occurrence
A["MIN(event_time) per entity"] --> B["Establish first-event attributes"] --> C["Find events after first_time"]
click C href "{{ '/sql/patterns/funnels/' | relative_url }}" "Open Find events after first_time" _self
{% endcapture %}
{% capture diagram_fallback %}
1. MIN(event_time) per entity
2. Establish first-event attributes
3. [Find events after first_time]({{ '/sql/patterns/funnels/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Find events after the first occurrence" code=diagram_code fallback=diagram_fallback %}

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
<li><a href="{{ '/sql/patterns/period-changes/' | relative_url }}">Period changes and missing months</a><span>Aggregate to calendar grain before LAG, and make missing periods explicit.</span></li>
<li><a href="{{ '/sql/patterns/rates-and-populations/' | relative_url }}">Rates, populations, and weighted averages</a><span>Define numerator and denominator at the same grain before dividing.</span></li>
</ul>

## How to study

Read the wording column and try to name the technique before looking right. In an interview, write the output grain and edge case before writing syntax.
