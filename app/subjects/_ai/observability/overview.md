---
title: "LLM observability"
nav_title: "Overview"
description: "Connect user latency to queues, token generation, KV-cache pressure, GPU state, and cost."
chapter: observability
order: 0
sequence: 500
level: "Chapter overview"
keywords:
  - LLM metrics
  - TTFT
  - TPOT
  - tokens per second
  - KV cache utilization
aliases:
  - inference observability
interview_queries:
  - what metrics do you monitor for LLM serving
references:
  - title: vLLM production metrics
    url: https://docs.vllm.ai/en/stable/usage/metrics/
  - title: vLLM benchmark latency metrics
    url: https://docs.vllm.ai/en/stable/benchmarking/cli/
---

“GPU utilization is high” is not enough to explain whether users are getting a healthy service.

You need signals from several layers.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/observability/metrics/' | relative_url }}">What to measure in LLM serving</a><span>Separate user latency, serving pressure, GPU state, and economics.</span></li>
<li><a href="{{ '/ai-engineering/observability/debugging/' | relative_url }}">Debugging a slow or saturated LLM service</a><span>Use TTFT, queue time, prompt length, TPOT, KV cache, and startup state to narrow the bottleneck.</span></li>
</ul>

The goal is not a dashboard with every metric. It is a short chain from a user-visible symptom to the component that can plausibly cause it.
