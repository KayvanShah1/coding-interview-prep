---
layout: default
title: SQL handbook
subject: sql
mermaid: true
permalink: /sql/
description: A practical SQL handbook covering queries, joins, window functions, database design, and query performance.
keywords:
  - SQL
  - PostgreSQL
  - joins
  - window functions
  - query performance
aliases:
  - SQL interview guide
  - SQL handbook
---
<div class="breadcrumb"><span>SQL handbook</span></div>
<header class="article-header">
  <h1>SQL, one concept at a time.</h1>
  <p class="lead">Understand the query. Read the result. Know why it works.</p>
</header>
<article class="prose">
  <p>
    <a class="text-icon" href="{{ '/' | relative_url }}">
      {%- include icons/arrow-left.html %} All CoreTrail subjects</a
    >
  </p>
  <p class="overview-intro">
    A practical path from your first SELECT to window frames, query plans, and database design.
    Short lessons, worked examples, and the edge cases that make interview answers reliable.
  </p>
  <div class="learning-route">
    <a
      class="route-link"
      href="{{ '/sql/foundations/grain/' | relative_url }}"
      ><small>01 / BUILD THE FOUNDATION</small
      ><strong class="text-icon">Start with the basics {% include icons/arrow-right.html %}</strong>
      <p>Tables, grain, filtering, and joins.</p></a
    ><a
      class="route-link"
      href="{{ '/sql/windows/frames/' | relative_url }}"
      ><small>02 / UNDERSTAND THE PATTERN</small
      ><strong class="text-icon"
        >Explore window functions {% include icons/arrow-right.html -%}
      </strong>
      <p>Move a frame and see what changes.</p></a
    ><a
      class="route-link"
      href="{{ '/sql/practice/problem-index/' | relative_url }}"
      ><small>03 / PUT IT INTO PRACTICE</small
      ><strong class="text-icon">Work through problems {% include icons/arrow-right.html %}</strong>
      <p>Apply a concept and check your reasoning.</p>
    </a>
  </div>
  <h2 id="learning-paths">Choose a learning path</h2>
  {% capture diagram_code %}
flowchart LR
accTitle: Build query fluency
A["Foundations"] --> B["Filtering"] --> C["Aggregation"] --> D["Joins"] --> E["Subqueries"] --> F["Windows"]
click A href "{{ '/sql/foundations/overview/' | relative_url }}" "Open Foundations" _self
click B href "{{ '/sql/filtering/overview/' | relative_url }}" "Open Filtering" _self
click C href "{{ '/sql/aggregation/overview/' | relative_url }}" "Open Aggregation" _self
click D href "{{ '/sql/joins/overview/' | relative_url }}" "Open Joins" _self
click E href "{{ '/sql/subqueries/overview/' | relative_url }}" "Open Subqueries" _self
click F href "{{ '/sql/windows/overview/' | relative_url }}" "Open Windows" _self
{% endcapture %}
  {% capture diagram_fallback %}
1. [Foundations]({{ '/sql/foundations/overview/' | relative_url }})
2. [Filtering]({{ '/sql/filtering/overview/' | relative_url }})
3. [Aggregation]({{ '/sql/aggregation/overview/' | relative_url }})
4. [Joins]({{ '/sql/joins/overview/' | relative_url }})
5. [Subqueries]({{ '/sql/subqueries/overview/' | relative_url }})
6. [Windows]({{ '/sql/windows/overview/' | relative_url }})
{% endcapture %}
  {% include diagram.html title="Build query fluency" code=diagram_code fallback=diagram_fallback caption=true %}

  {% capture diagram_code %}
flowchart LR
accTitle: Prepare for interviews
A["Revision maps"] --> B["Worked patterns"] --> C["Mixed drills"] --> D["Explain edge cases aloud"]
click A href "{{ '/sql/practice/pattern-map/' | relative_url }}" "Open Revision maps" _self
click B href "{{ '/sql/patterns/overview/' | relative_url }}" "Open Worked patterns" _self
click C href "{{ '/sql/practice/mixed-drills/' | relative_url }}" "Open Mixed drills" _self
{% endcapture %}
  {% capture diagram_fallback %}
1. [Revision maps]({{ '/sql/practice/pattern-map/' | relative_url }})
2. [Worked patterns]({{ '/sql/patterns/overview/' | relative_url }})
3. [Mixed drills]({{ '/sql/practice/mixed-drills/' | relative_url }})
4. Explain edge cases aloud
{% endcapture %}
  {% include diagram.html title="Prepare for interviews" code=diagram_code fallback=diagram_fallback caption=true %}

  {% capture diagram_code %}
flowchart LR
accTitle: Investigate performance
A["Diagnosis workflow"] --> B["Plans and indexes"] --> C["Native labs"] --> D["Storage and scaling"]
click A href "{{ '/sql/performance/workflow/' | relative_url }}" "Open Diagnosis workflow" _self
click B href "{{ '/sql/performance/explain/' | relative_url }}" "Open Plans and indexes" _self
click C href "{{ '/sql/performance/index-lab/' | relative_url }}" "Open Native labs" _self
click D href "{{ '/sql/scaling/overview/' | relative_url }}" "Open Storage and scaling" _self
{% endcapture %}
  {% capture diagram_fallback %}
1. [Diagnosis workflow]({{ '/sql/performance/workflow/' | relative_url }})
2. [Plans and indexes]({{ '/sql/performance/explain/' | relative_url }})
3. [Native labs]({{ '/sql/performance/index-lab/' | relative_url }})
4. [Storage and scaling]({{ '/sql/scaling/overview/' | relative_url }})
{% endcapture %}
  {% include diagram.html title="Investigate performance" code=diagram_code fallback=diagram_fallback caption=true %}
  <h2 id="chapters">Explore the chapters</h2>
  <div class="chapter-index">
    {% for chapter in site.data.chapters.sql -%}
      {%- assign topics = site.sql
        | where: 'chapter', chapter.id
        | where_exp: 'item', 'item.order > 0'
      -%}
      <a
        class="chapter-row"
        href="{{ '/sql/' | append: chapter.id | append: '/overview/' | relative_url }}"
        ><span class="chapter-number">{{ forloop.index | prepend: '0' | slice: -2, 2 }}</span>
        <div>
          <strong>{{ chapter.title }}</strong>
          <p>{{ chapter.description }}</p>
        </div>
        <span class="count">{{ topics.size }} topics</span></a
      >
    {%- endfor %}
  </div>
  <h2 id="how-to-use">Make the examples work for you</h2>
  <p>
    PostgreSQL is the main dialect. Each lesson states its assumptions; dialect-specific syntax is
    labelled. Follow the reading order or search directly for a function or problem.
  </p>
  {% capture diagram_code %}
flowchart LR
accTitle: Make the examples work for you
A["State the output grain"] --> B["Run the query"] --> C["Add a duplicate, null, or tie"] --> D["Compare and explain the result"]
click B href "{{ '/sql/foundations/sample-data/' | relative_url }}" "Open Run the query" _self
{% endcapture %}
  {% capture diagram_fallback %}
1. State the output grain
2. [Run the query]({{ '/sql/foundations/sample-data/' | relative_url }})
3. Add a duplicate, null, or tie
4. Compare and explain the result
{% endcapture %}
  {% include diagram.html title="Make the examples work for you" code=diagram_code fallback=diagram_fallback %}
  <p>
    Before running a query, state the output grain. After running it, add a duplicate, a null, or a
    tie. Explaining that second result is often where the learning happens.
  </p>
  <p>
    <a class="text-icon" href="{{ '/sql/foundations/sample-data/' | relative_url }}"
      >Get the practice dataset {% include icons/arrow-right.html -%}
    </a>
    &nbsp;
    <a class="text-icon" href="{{ '/sql/practice/references/' | relative_url }}"
      >Sources & coverage {% include icons/arrow-right.html -%}
    </a>
  </p>
</article>
