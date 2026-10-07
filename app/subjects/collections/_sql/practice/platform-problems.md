---
title: "Find your next SQL problem"
nav_title: "Practice on other platforms"
description: "A starting list for StrataScratch, LeetCode, and DataLemur, with links back to the relevant lessons."
chapter: practice
order: 16
sequence: 1416
level: Practice
dialect: Check the platform's selected dialect
references:
  - title: StrataScratch SQL questions
    url: https://platform.stratascratch.com/coding
  - title: LeetCode SQL 50
    url: https://leetcode.com/studyplan/top-sql-50/
  - title: DataLemur SQL questions
    url: https://datalemur.com/questions?category=SQL
---

## Pick a place to practice

| Platform | Where to start | How to use it with CoreTrail |
|---|---|---|
| [StrataScratch](https://platform.stratascratch.com/coding) | Search by question name or ID | Retry familiar problems without your old solution, then compare with the linked CoreTrail lesson. |
| [LeetCode](https://leetcode.com/studyplan/top-sql-50/) | SQL 50 study plan | Work through its sequence, keeping a short note on the mistakes you repeat. |
| [DataLemur](https://datalemur.com/questions?category=SQL) | SQL question list | Choose a weak topic, attempt a problem, then revisit the related concept. |

Choose the SQL dialect before starting. Access, difficulty labels, and available editors can change; the original page is the source of truth. The level labels below are practice guidance. CoreTrail's linked examples explain related techniques and may use different fixtures or assumptions from the platform question.

## A starting list

Try the question before opening the related lesson. Each problem link opens the original platform in the same tab, so the browser's Back button brings you here.

<div class="filter-controls">
<label>Platform <select class="practice-filter" data-field="platform"><option value="">All platforms</option><option>StrataScratch</option><option>LeetCode</option><option>DataLemur</option></select></label>
<label>Topic <select class="practice-filter" data-field="topic"><option value="">All topics</option><option>Existence</option><option>Aggregation</option><option>Rates</option><option>Dates</option><option>Windows</option></select></label>
<label>Level <select class="practice-filter" data-field="level"><option value="">All levels</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
</div>
<p class="practice-count" role="status"></p>
<div class="external-problems">
{% for problem in site.data.practice_problems %}
<div class="practice-item" data-platform="{{ problem.platform }}" data-topic="{{ problem.topic }}" data-level="{{ problem.level }}">
<small>{{ problem.platform }} · {{ problem.level }} · {{ problem.topic }}</small>
<h3><a href="{{ problem.url }}">{{ problem.title }} ↗</a></h3>
<p>{{ problem.focus }}</p><a class="practice-revise" href="{{ problem.lesson | relative_url }}">Revisit the concept →</a>
</div>
{% endfor %}
</div>

## Not sure where to start?

Start with **Page With No Likes** and **Histogram of Tweets**. Then try **Largest Olympics**, **Confirmation Rate**, and **Restaurant Growth**. Finish with a ranking problem and **Customers Who Bought All Products**. This sequence moves from identifying a population to composing several stages.

Once those feel familiar, use the filters to mix topics rather than solving ten nearly identical questions in a row. The [mixed drills]({{ '/sql/practice/mixed-drills/' | relative_url }}) hide the technique and give progressive hints.

## Keep a useful mistake log

After an attempt, record the mistake in one sentence: “I counted events instead of users,” “I removed unmatched rows,” or “I compared the previous observed month.” Add the smallest input that exposes it. Revisit that input a few days later without your original query.

A passing submission checks the platform's cases. It does not prove that your query is efficient at scale. For that part, use the [query-plan labs]({{ '/sql/performance/index-lab/' | relative_url }}) and compare execution evidence on larger data.
