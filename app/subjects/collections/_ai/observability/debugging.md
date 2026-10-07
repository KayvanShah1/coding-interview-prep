---
title: "Debugging a slow or saturated LLM service"
nav_title: "Debugging serving"
description: "Move from a latency symptom to queueing, prefill, decode, memory, routing, or cold-start evidence instead of guessing from GPU utilization."
chapter: observability
order: 2
sequence: 502
level: Core
mermaid: true
keywords:
  - LLM debugging
  - saturation
  - queue time
  - TTFT
  - TPOT
  - cold start
  - KV cache pressure
aliases:
  - inference troubleshooting
interview_queries:
  - why is LLM inference slow
  - how would you debug high TTFT
  - how do you diagnose vLLM saturation
references:
  - title: vLLM production metrics
    url: https://docs.vllm.ai/en/stable/usage/metrics/
  - title: vLLM benchmark latency metrics
    url: https://docs.vllm.ai/en/stable/benchmarking/cli/
---

A slow large language model (LLM) request becomes easier to diagnose once the latency shape is split into waiting, prefill, and decode.

{% capture diagram_code %}
flowchart TD
A["Time to first token (TTFT) high"] --> B{"Queue time high?"}
B -- "Yes" --> C["Capacity / routing / admission"]
B -- "No" --> D{"Prompts larger?"}
D -- "Yes" --> E["Prefill pressure"]
D -- "No" --> F["Replica / runtime investigation"]
G["Generation slow after first token"] --> H["TPOT / ITL"]
H --> I["GPU execution / memory / communication"]
J["Only new replicas are slow"] --> K["Node + image + model startup path"]
{% endcapture %}
{% capture diagram_fallback %}
TTFT high → check queue time. High queue → capacity/routing/admission. Low queue → check prompt/prefill and replica runtime. Slow generation after first token → TPOT/ITL → GPU/memory/communication. Only new replicas slow → inspect startup path.
{% endcapture %}
{% include diagram.html title="Use the latency shape to narrow the serving layer" code=diagram_code fallback=diagram_fallback caption=true %}

## High TTFT: first separate waiting from execution

If queue time rose sharply while prompt lengths and time per output token (TPOT) stayed normal, the model may simply be underprovisioned or traffic may be imbalanced across replicas.

Check:

```text
waiting requests
per-replica queue
routing distribution
available replicas
recent failures
autoscaler state
```

If queue time is low but time to first token (TTFT) rises with prompt length, investigate prefill.

## Healthy TTFT, poor generation speed

If the first token arrives on time but subsequent tokens are slow, focus on decode.

Compare:

- TPOT and inter-token latency (ITL);
- batch/concurrency changes;
- GPU and memory pressure;
- quantization/runtime changes;
- multi-GPU communication;
- model/version changes.

A problem that begins only after token generation starts points downstream of the application programming interface (API) gateway, toward decode execution or memory/communication pressure.

## Concurrency falls as context grows

If the number of simultaneous healthy requests drops while average context length rises, inspect key-value (KV) cache pressure.

That is often a capacity-shape problem rather than a simple request-count problem.

## New replicas are slow but old ones are healthy

Break startup apart:

```text
Pending for node?
image pull?
model transfer?
weight loading?
CUDA / NVIDIA Collective Communications Library (NCCL) init?
compile / graph capture?
readiness?
```

The fix depends on the phase. A node-local model cache does nothing for a Pod that is spending most of its time waiting for a GPU node to be provisioned.

## Latency differs only on one replica

Compare queue depth, model version, GPU type, cache state, errors, and node health. Routing can hide a bad replica behind an average fleet metric.

Per-replica observability matters when the router chooses among heterogeneous states.

## Keep the investigation causal

A good incident explanation sounds like:

> TTFT increased because waiting requests accumulated on two replicas after one replica failed. Decode TPOT stayed normal, which ruled out a model-execution regression. The node autoscaler replaced GPU capacity, but model startup took another two minutes before readiness, so we temporarily shed low-priority requests.

That is more useful than “GPU was high, so we scaled Kubernetes.”
