---
title: "Routing and serving many users"
nav_title: "Routing & concurrency"
description: "Explain high-concurrency LLM serving as replicas plus per-replica batching, memory management, and routing rather than one giant model process."
chapter: serving
order: 4
sequence: 204
level: Core
mermaid: true
keywords:
  - LLM concurrency
  - request routing
  - load balancing
  - cache aware routing
  - queue depth
  - prefix cache
  - inference gateway
  - llm-d
aliases:
  - concurrent inference
  - high throughput inference
interview_queries:
  - how can thousands of users use the same LLM
  - how do LLMs handle concurrent users
  - how do you route LLM requests
references:
  - title: vLLM data parallel deployment
    url: https://docs.vllm.ai/en/stable/serving/data_parallel_deployment/
  - title: vLLM production metrics
    url: https://docs.vllm.ai/en/stable/usage/metrics/
  - title: Google Cloud - GKE Inference Gateway powered by llm-d
    url: https://docs.cloud.google.com/kubernetes-engine/docs/concepts/about-gke-inference-gateway
---

There is usually no single GPU answering an entire product's traffic. Concurrency comes from **horizontal replicas** and from **sharing each replica efficiently among several active requests**.

{% capture diagram_code %}
flowchart LR
A["Requests"] --> B["Router"]
B --> C["Replica A<br/>continuous batch"]
B --> D["Replica B<br/>continuous batch"]
B --> E["Replica C<br/>continuous batch"]
C --> F["GPU(s)"]
D --> G["GPU(s)"]
E --> H["GPU(s)"]
{% endcapture %}
{% capture diagram_fallback %}
Requests → Router → Replica A, B, or C. Each replica continuously batches several active requests onto its GPU(s).
{% endcapture %}
{% include diagram.html title="Concurrency exists across and inside replicas" code=diagram_code fallback=diagram_fallback caption=true %}

## Horizontal replicas multiply independent serving capacity

If one replica reaches its useful concurrency limit, another replica gives the fleet another KV-cache pool, another scheduler, and another set of accelerator resources.

A router spreads new requests across those serving units.

How many replicas are required depends on measured service capacity: prompt lengths, output lengths, model size, quantization, GPU type, latency target, and scheduler configuration all matter.

## Each replica still serves several requests

Inside a replica, continuous batching lets active sequences share model execution. The inference engine allocates KV-cache blocks and decides which work participates in upcoming execution steps.

That means a model replica is not equivalent to a traditional worker that handles exactly one request at a time.

## Basic routing can be simple

Round-robin can be completely reasonable when replicas are homogeneous and requests are similar.

Least-loaded or queue-aware routing becomes useful when the work varies substantially. A request routed to a replica with a deep queue may wait even while another replica has room.

At larger scale, routing can account for:

- model/version availability;
- region and network latency;
- waiting/running request counts;
- estimated work;
- tenant or priority policy;
- prefix-cache locality.

## Cache-aware routing is an optimization, not the starting point

Suppose several requests share a large prefix and replica A already has reusable prefix state. Sending the next related request to A can avoid prefill work.

But blindly preferring cache locality can overload A while B sits idle. A real policy has to balance locality against current load and latency.

This is a good example of why an LLM router can become more specialized than an ordinary round-robin load balancer without making ordinary load-balancing fundamentals obsolete.

## Production example: inference-aware routing on GKE

Google's current GKE Inference Gateway, powered by llm-d, is a useful example of what this looks like once the router can see model-serving state.

Its routing score can account for:

- **prefix-cache match:** prefer a replica that can reuse more of the request prefix;
- **load:** consider KV-cache utilization and pending queue depth;
- **LoRA locality:** prefer a server that already has the requested adapter loaded or has room for it.

Conceptually:

```text
request
   ↓
inference gateway
   ↓
state-aware scheduler / endpoint picker
   ↓
┌────────────┬────────────┬────────────┐
│ replica A  │ replica B  │ replica C  │
│ queue / KV │ queue / KV │ queue / KV │
│ prefixes   │ prefixes   │ prefixes   │
└────────────┴────────────┴────────────┘
```

The implementation is one production example, not a requirement for every LLM service. A small homogeneous fleet may still be better served by simple load balancing.

What it demonstrates is the progression:

`round robin → load-aware routing → inference-state-aware routing`.

The more state the router consumes, the more routing quality can improve, but the control plane also becomes more complex and tightly coupled to serving metrics.

## What happens when every replica is busy?

Routing alone cannot create capacity.

Requests begin waiting, queue depth increases, TTFT rises, and eventually the system must choose among:

- admit the work and let it wait;
- reject or shed load;
- route to another model/region;
- add replicas;
- add GPU machines if the cluster lacks space.

Those choices move us from serving into production traffic control and autoscaling.

Before that, the next chapter answers a more basic deployment question: [what actually gets deployed]({{ '/ai-engineering/deployment/what-gets-deployed/' | relative_url }}).
