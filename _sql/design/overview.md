---
title: "Database design"
nav_title: "Overview"
description: "Model relationships, dependencies, and analytical history."
chapter: "design"
order: 0
sequence: 900
level: "Chapter overview"
---

## Model the relationships your questions depend on

A schema is a choice about entities, relationships, history, and access. Normalization addresses dependencies; dimensional modeling makes analytical grain and history explicit. Learn what problem each approach solves.

**Suggested route:** Begin with dependencies and normalization, then choose a fact grain and connect dimensions. Follow physical layout choices into storage and scaling.

**By the end:** Explain what one fact row represents, which attributes change, and how historical answers stay correct.

## Decision reference

| Design question | Concept |
|---|---|
| What determines an attribute? | Functional dependency |
| Where should a fact be stored? | Normalization |
| What does a measured row represent? | Fact grain |
| How do attributes change over time? | Slowly changing dimensions |
| Which data can a query skip? | Physical layout; see performance |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/design/normalization/' | relative_url }}">Normalization & functional dependencies</a><span>Reduce update anomalies by storing each fact at its natural grain.</span></li>
<li><a href="{{ '/sql/design/dimensional-modeling/' | relative_url }}">Fact tables, dimensions & slowly changing history</a><span>Choose an analytical grain before choosing keys or columns.</span></li>
</ul>

## How to study

Use the suggested route above. For each lesson, explain the decision in your own words, test its example, and identify a situation where a different approach would be needed.
