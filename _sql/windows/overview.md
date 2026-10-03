---
title: "Window functions"
nav_title: "Overview"
description: "Compare ordered rows without losing detail."
chapter: "windows"
order: 0
sequence: 600
level: "Chapter overview"
---

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/windows/introduction/' | relative_url }}">The OVER clause</a><span>Keep row detail while computing group-level values.</span></li>
<li><a href="{{ '/sql/windows/ranking/' | relative_url }}">ROW_NUMBER, RANK & DENSE_RANK</a><span>Control ties and select the top rows or distinct values.</span></li>
<li><a href="{{ '/sql/windows/frames/' | relative_url }}">Window frames</a><span>Choose exactly which rows participate in a calculation.</span></li>
<li><a href="{{ '/sql/windows/rows-range-groups/' | relative_url }}">ROWS, RANGE & GROUPS</a><span>Separate row positions, value distances, and peer groups.</span></li>
<li><a href="{{ '/sql/windows/lag-lead/' | relative_url }}">LAG, LEAD & period comparisons</a><span>Compare values in sequence without assuming dates are complete.</span></li>
<li><a href="{{ '/sql/windows/first-last/' | relative_url }}">FIRST_VALUE & LAST_VALUE</a><span>Understand why the frame changes what last means.</span></li>
<li><a href="{{ '/sql/windows/running-calculations/' | relative_url }}">Running totals & moving averages</a><span>Build cumulative metrics, trailing calculations, and shares.</span></li>
<li><a href="{{ '/sql/windows/distribution/' | relative_url }}">NTILE, PERCENT_RANK & CUME_DIST</a><span>Distinguish equal-row buckets from relative rank and cumulative distribution.</span></li>
</ul>

## How to study

Read the explanation, predict the query output, then run the example. Change one input row to create a tie, a missing value, or a duplicate and explain what changes.
