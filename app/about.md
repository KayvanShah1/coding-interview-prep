---
layout: home
title: About
description: Why CoreTrail exists, how I use it, and where I want to take it.
subject: home
mermaid: true
permalink: /about/
---

<section class="top-page-hero">
  <h1>About CoreTrail</h1>
  <p class="top-page-lead">What interviews made me revisit.</p>
</section>

<article class="about-copy">
<section class="about-section" markdown="1">

## Why I built it

<div class="about-section-body" markdown="1">

CoreTrail started because I kept relearning the same things.

During interviews, I would be comfortable with a topic and then one question would expose some detail I had not touched in months. I would open ChatGPT, dig into it, ask five follow-up questions, and usually end up with something useful.

Then that explanation would disappear into another long thread.

After a while I had far too many chats that I knew contained useful material, but finding the right one again was almost as annoying as learning the thing again.

I tried saving the better conversations as Markdown too. That worked for a while, until the Markdown folder became another place to search.

CoreTrail came out of that.

{% capture diagram_code %}
flowchart LR
accTitle: How CoreTrail grows
A["Interview or work"] --> B["Something feels rusty"] --> C["Revisit it"] --> D["Keep what matters"] --> E["Come back to it later"]
{% endcapture %}
{% capture diagram_fallback %}
1. Interview or work
2. Something feels rusty
3. Revisit it
4. Keep what matters
5. Come back to it later
{% endcapture %}
{% include diagram.html title="How CoreTrail grows" code=diagram_code fallback=diagram_fallback %}

</div>
</section>

<section class="about-section" markdown="1">

## How I use it

<div class="about-section-body" markdown="1">

Before an interview, I mostly skim. I already know most of the concepts I am revisiting. I just want the details, trade-offs, terminology, or patterns back in my head before the round.

After an interview, I usually come back to whatever made me hesitate. Sometimes I forgot something. Sometimes I knew it but could not explain the trade-off clearly enough. Sometimes the question exposed a part of the topic I had never really thought through.

The same thing happens while building. If I have to investigate something properly once, I would rather leave myself a useful trail back to it than rediscover it six months later.

</div>
</section>

<section class="about-section" markdown="1">

## Philosophy

<div class="about-section-body" markdown="1">

CoreTrail is mainly for revision.

I do not want every topic to become a long article. If a short explanation is enough to bring the idea back, that is enough. When a topic needs more context, the example, diagram, trade-off, query plan, failure case, or deeper explanation should be close by.

I also do not want this to become a dump of everything I have ever learned. That would make it harder to use.

The useful part is being able to open something familiar and get back to the important detail quickly.

</div>
</section>

<section class="about-section" markdown="1">

## A note on AI

<div class="about-section-body" markdown="1">

A lot of the revisiting still happens through ChatGPT. I can keep questioning something until the explanation makes sense, compare approaches, or build a tiny example around the part I am unsure about.

The problem was never getting another explanation. It was finding the useful one again later.

Codex also helps me build and maintain the site, refactor things, test changes, and work through parts of the material.

What stays in CoreTrail is still based on what I actually had to revisit.

</div>
</section>

<section class="about-section" markdown="1">

## Direction

<div class="about-section-body" markdown="1">

SQL is the first part I built out properly because that is where I already had enough material for the structure to become useful.

The broader direction is the stuff I actually interview for and work with: Data Engineering, Data Modeling, System Design, Machine Learning, AI Engineering, DSA, databases, and the things between them.

Those sections will probably grow unevenly. That is fine. I would rather add something because I needed to revisit it than fill a section just because it exists.

CoreTrail is public, but I am building it first as something I would actually open before an interview.

**A trail back to things I already learned.**

</div>
</section>
</article>
