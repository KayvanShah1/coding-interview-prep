---
title: "LLM serving trade-offs"
nav_title: "Serving trade-offs"
description: "Connect quality, latency, throughput, context length, reliability, and cost to concrete serving choices."
chapter: production
order: 6
sequence: 406
level: Core
keywords:
  - latency throughput tradeoff
  - cost per token
  - context length
  - quantization
  - warm capacity
aliases:
  - LLM serving decisions
interview_queries:
  - what are the tradeoffs in LLM serving
  - how do you balance latency throughput and cost
references:
  - title: vLLM benchmark CLI and latency metrics
    url: https://docs.vllm.ai/en/stable/benchmarking/cli/
---

Every large language model (LLM) serving optimization buys something by spending something else: memory, latency, throughput, quality, reliability, or graphics processing unit (GPU) capacity.

| Decision | Helps | Costs / risks |
|---|---|---|
| More replicas | Concurrency, resilience | More duplicated model memory and GPU spend |
| Larger/fuller batches | Throughput, cost per token | Queueing and time to first token (TTFT) can rise |
| Quantization | Fit, memory, often cost | Quality/performance depends on method and hardware |
| Longer context | Capability on long inputs | More key-value (KV) cache pressure and lower concurrency |
| Prefix caching | Repeated-prefix prefill | Cache memory, locality/routing complexity |
| Tensor parallelism | Fit one model across GPUs | Communication overhead |
| Warm spare capacity | Burst handling and recovery | Idle GPU cost |
| Scale to zero | Idle-cost savings | Cold-start latency |
| Smaller routed model | Cost and often latency | Must prove quality remains sufficient |

## Optimize against a service-level objective (SLO), not a benchmark headline

A configuration with the highest total tokens/sec can still be wrong for an interactive product if first-token latency is poor.

A configuration with excellent single-request latency can be uneconomical if it leaves most of an expensive GPU idle.

Define the service target:

```text
quality threshold
TTFT / end-to-end latency
throughput
availability
cost
```

Then benchmark the actual request-length distribution.

## Context length is part of capacity planning

Increasing maximum context changes more than product capability. Long active sequences consume more KV-cache capacity and can produce heavy prefills.

That can reduce concurrent sequences per replica or require more memory.

So “support 128k context” belongs in the same architecture conversation as “how many users per replica?”

## Model choice can dominate infrastructure optimization

If an 8-billion-parameter (8B) model meets the task's quality bar, tuning a 70-billion-parameter (70B) deployment for weeks may still be the wrong economic decision.

Conversely, using a cheaper model without measuring quality can move cost out of infrastructure and into product failures.

Serving architecture and evaluation meet at model routing.

The next chapter is about the feedback loop needed to know which constraint is actually binding: [LLM observability]({{ '/ai-engineering/observability/overview/' | relative_url }}).
