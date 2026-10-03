---
title: "Schema & data changes"
nav_title: "Overview"
description: "Define tables, enforce constraints, and modify data safely."
chapter: "schema"
order: 0
sequence: 800
level: "Chapter overview"
---

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/schema/constraints/' | relative_url }}">Keys, constraints & defaults</a><span>Encode data rules in the database and understand what each constraint guarantees.</span></li>
<li><a href="{{ '/sql/schema/ddl/' | relative_url }}">CREATE, ALTER, DROP & TRUNCATE</a><span>Distinguish changing a table's structure from changing its rows.</span></li>
<li><a href="{{ '/sql/schema/dml/' | relative_url }}">INSERT, UPDATE & DELETE</a><span>Change exactly the intended rows and inspect the results.</span></li>
<li><a href="{{ '/sql/schema/upsert-merge/' | relative_url }}">Upserts & MERGE</a><span>Define how incoming records interact with existing keys.</span></li>
</ul>

## How to study

Read the explanation, predict the query output, then run the example. Change one input row to create a tie, a missing value, or a duplicate and explain what changes.
