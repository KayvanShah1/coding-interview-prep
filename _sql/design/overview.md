---
title: "Database design"
nav_title: "Overview"
description: "Model relationships, dependencies, and analytical history."
chapter: "design"
order: 0
sequence: 900
level: "Chapter overview"
---

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/design/normalization/' | relative_url }}">Normalization & functional dependencies</a><span>Reduce update anomalies by storing each fact at its natural grain.</span></li>
<li><a href="{{ '/sql/design/dimensional-modeling/' | relative_url }}">Fact tables, dimensions & slowly changing history</a><span>Choose an analytical grain before choosing keys or columns.</span></li>
</ul>

## How to study

Read the explanation, predict the query output, then run the example. Change one input row to create a tie, a missing value, or a duplicate and explain what changes.
