---
title: "PostgreSQL toolkit"
nav_title: "Overview"
description: "Work with arrays, JSON, views, and database routines."
chapter: "postgres"
order: 0
sequence: 1200
level: "Chapter overview"
---

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/postgres/arrays/' | relative_url }}">Arrays & UNNEST</a><span>Expand arrays, preserve empty rows, and avoid accidental products.</span></li>
<li><a href="{{ '/sql/postgres/postgres-shortcuts/' | relative_url }}">DISTINCT ON & string types</a><span>Recognize useful PostgreSQL-specific choices.</span></li>
<li><a href="{{ '/sql/postgres/jsonb/' | relative_url }}">JSONB extraction & expansion</a><span>Query nested data while keeping types, missing keys, and row counts explicit.</span></li>
<li><a href="{{ '/sql/postgres/views/' | relative_url }}">Views & materialized views</a><span>Separate reusable query definitions from stored query results.</span></li>
<li><a href="{{ '/sql/postgres/routines-triggers/' | relative_url }}">Functions, procedures & triggers</a><span>Recognize when logic belongs in a database routine and when hidden behavior adds risk.</span></li>
<li><a href="{{ '/sql/postgres/security/' | relative_url }}">Privileges & parameterized queries</a><span>Separate SQL values from SQL code and give database roles only the access they need.</span></li>
</ul>

## How to study

Read the explanation, predict the query output, then run the example. Change one input row to create a tie, a missing value, or a duplicate and explain what changes.
