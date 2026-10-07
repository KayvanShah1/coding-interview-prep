---
title: "What to measure in LLM serving"
nav_title: "Serving metrics"
description: "Use TTFT, TPOT, queue depth, running requests, KV cache, GPU signals, and cost to explain serving health."
chapter: observability
order: 1
sequence: 501
level: Core
keywords:
  - TTFT
  - TPOT
  - ITL
  - tokens per second
  - queue time
  - KV cache utilization
  - GPU utilization
  - cost per token
aliases:
  - time to first token
  - time per output token
  - inter token latency
tools:
  - vLLM
  - Prometheus
  - Grafana
interview_queries:
  - what is TTFT
  - TTFT vs TPOT
  - what metrics would you monitor for vLLM
references:
  - title: vLLM production metrics
    url: https://docs.vllm.ai/en/stable/usage/metrics/
  - title: vLLM benchmark latency metrics
    url: https://docs.vllm.ai/en/stable/benchmarking/cli/
---

Organize metrics by the question they answer.

## Is the user waiting too long to see anything?

**TTFT — time to first token** measures from sending the request until the first streamed output arrives.

It can include:

```text
network / gateway
queue waiting
prompt prefill
scheduler delay
first decode step
```

A poor TTFT therefore does not identify the bottleneck by itself. It tells you where to start.

## Once generation begins, is it progressing quickly?

**TPOT — time per output token** amortizes generation time after the first token across the remaining generated tokens.

**ITL — inter-token latency** measures gaps between streamed outputs.

vLLM notes that terminology differs across tools, especially with speculative decoding, so compare definitions and measurement points rather than only metric names.

## Is demand exceeding immediate serving capacity?

Watch:

- waiting requests / queue depth;
- queue time;
- running requests;
- rejected/admission-limited requests.

A growing queue with healthy individual decode performance usually points toward capacity or routing rather than a broken kernel.

## Is request state filling accelerator memory?

Watch KV-cache utilization or available cache blocks/tokens.

This tells you whether the active sequence mix is approaching the memory budget that supports concurrency.

Prompt and generation length distributions should be tracked alongside it; a fleet can become cache-bound even when request count has not changed.

## Is the hardware doing useful work?

GPU utilization, memory occupancy, kernel behavior, power, and communication metrics help at the infrastructure layer.

Do not use a busy GPU as proof that latency is healthy. A saturated queue and an efficiently busy GPU can exist at the same time.

## What is the service costing?

Useful economic signals include:

```text
input tokens
output tokens
tokens/sec/GPU
cost/request
cost/token
GPU-hours by model
cache hit rate
model/route selection
```

A performance improvement matters differently if it saves 5 ms versus if it doubles useful token throughput on the same fleet.

## A compact layer map

| Layer | Signals |
|---|---|
| User | TTFT, end-to-end latency, errors |
| Decode experience | TPOT, ITL, output tokens/sec |
| Serving | queue time, waiting/running requests, batch work |
| Memory | KV-cache utilization, active sequence lengths |
| Infrastructure | GPU/VRAM, pod/node health, network |
| Economics | tokens, GPU-hours, cost/request/token |

Next: [Debugging a slow or saturated LLM service]({{ '/ai-engineering/observability/debugging/' | relative_url }}).
