---
layout: home
title: Resources
description: Practice platforms, channels, and references I come back to for technical interview prep.
subject: home
permalink: /resources/
---

<section class="top-page-hero resources-hero">
  <h1>Resources</h1>
  <p class="top-page-lead">Things I come back to for another explanation, more practice, or a different way of looking at something.</p>
</section>

<nav class="resource-filters" aria-label="Filter resources">
  <button class="resource-filter active" type="button" data-resource-filter="all" aria-pressed="true">All</button>
  {% assign ordered_sections = site.data.resources.sections | sort: 'order' %}
  {% for section in ordered_sections -%}
    <button class="resource-filter" type="button" data-resource-filter="{{ section.id }}" aria-pressed="false">{{ section.filter_label }}</button>
  {%- endfor %}
</nav>

{% assign ordered_sections = site.data.resources.sections | sort: 'order' %}
{% for section in ordered_sections -%}
  {%- assign section_resources = site.data.resources.resources | where: 'section', section.id | sort: 'priority' -%}
  <section class="resource-group" data-resource-group data-resource-category="{{ section.id }}">
    <div class="resource-group-heading">
      <h2>{{ section.title }}</h2>
      <p>{{ section.description }}</p>
    </div>
    <div class="resource-list">
      {% for resource in section_resources -%}
        <a class="resource-row" href="{{ resource.url }}" target="_blank" rel="noopener noreferrer">
          <span class="resource-icon-wrap">{% include icons/resource.html kind=resource.icon %}</span>
          <strong>
            {{- resource.name -}}
            {%- if resource.alias %} <span class="resource-alias">({{ resource.alias }})</span>{% endif -%}
          </strong>
          <span class="resource-description">{{ resource.description }}</span>
          <small>{{ resource.type }}</small>
          <span class="resource-open" aria-hidden="true">↗</span>
        </a>
      {%- endfor %}
    </div>
  </section>
{%- endfor %}

<p class="resource-note">Not a complete curriculum. Just resources I have found useful enough to come back to.</p>

<script>
(() => {
  const buttons = [...document.querySelectorAll('.resource-filter')];
  const groups = [...document.querySelectorAll('[data-resource-group]')];

  if (!buttons.length) return;

  const applyFilter = (category) => {
    buttons.forEach((button) => {
      const active = button.dataset.resourceFilter === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    groups.forEach((group) => {
      group.hidden = category !== 'all' && group.dataset.resourceCategory !== category;
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => applyFilter(button.dataset.resourceFilter));
  });
})();
</script>
