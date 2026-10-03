---
title: "Interview patterns"
nav_title: "Overview"
description: "Recognize recurring problems and choose a reliable approach."
chapter: "patterns"
order: 0
sequence: 700
level: "Chapter overview"
---

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

Read the explanation, predict the query output, then run the example. Change one input row to create a tie, a missing value, or a duplicate and explain what changes.
