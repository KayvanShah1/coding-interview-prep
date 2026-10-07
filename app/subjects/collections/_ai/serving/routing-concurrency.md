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
  - inference aware routing
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
  - title: Google Cloud - inference-aware routing example
    url: https://docs.cloud.google.com/kubernetes-engine/docs/concepts/about-gke-inference-gateway
---

There is usually no single graphics processing unit (GPU) answering an entire large language model (LLM) product's traffic. Concurrency comes from **horizontal replicas** and from **sharing each replica efficiently among several active requests**.

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

If one replica reaches its useful concurrency limit, another replica gives the fleet another key-value (KV) cache pool, another scheduler, and another set of accelerator resources.

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

## Inference-aware routing uses serving state

As the fleet grows, routing can use more than endpoint availability.

Useful signals can include:

- waiting or running requests;
- KV-cache pressure;
- reusable prefix state;
- model, version, or adapter availability.

That gives a progression:

`round robin → load-aware routing → inference-state-aware routing`.

A small homogeneous fleet may still be better served by simple load balancing. More state can improve placement decisions, but it also makes the routing layer more complex and more dependent on fresh serving metrics.

## What happens when every replica is busy?

Routing alone cannot create capacity.

Requests begin waiting, queue depth increases, time to first token (TTFT) rises, and eventually the system must choose among:

- admit the work and let it wait;
- reject or shed load;
- route to another model/region;
- add replicas;
- add GPU machines if the cluster lacks space.

Those choices move us from serving into production traffic control and autoscaling.

Before that, the next chapter answers a more basic deployment question: [what actually gets deployed]({{ '/ai-engineering/deployment/what-gets-deployed/' | relative_url }}).
