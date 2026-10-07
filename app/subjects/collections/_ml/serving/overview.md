---
title: "Model serving"
nav_title: "Overview"
description: "Compare ordinary prediction serving with autoregressive LLM serving without pretending they are entirely different systems."
chapter: serving
order: 0
sequence: 100
level: "Chapter overview"
keywords:
  - model serving
  - ML inference
  - LLM inference
aliases:
  - serving machine learning models
interview_queries:
  - how does serving an LLM differ from serving a traditional ML model
---

A trained model becomes useful to an application when callers can send it inputs and receive predictions. Both conventional ML models and LLMs need versioned artifacts, deployments, healthy replicas, and monitoring.

The request lifecycle changes the serving choices. A conventional prediction may finish in one bounded pass. An autoregressive LLM processes a prompt, generates output over many steps, and keeps per-request attention state while it does so.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ml/serving/model-serving-vs-llm-serving/' | relative_url }}">Traditional ML serving vs LLM serving</a><span>See which deployment fundamentals carry over and which constraints change for token generation, batching, GPU memory, and scaling.</span></li>
</ul>

Continue into [LLM inference]({{ '/ai-engineering/inference/overview/' | relative_url }}) for the execution details or [Infrastructure & DevOps]({{ '/infrastructure/' | relative_url }}) for the shared deployment mechanics.
