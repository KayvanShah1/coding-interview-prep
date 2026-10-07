---
title: "From one model to a serving system"
description: "Add routing, replicas, traffic control, and observability around a model server without losing track of which layer solves which problem."
chapter: serving
order: 1
sequence: 201
level: Core
mermaid: true
keywords:
  - serving architecture
  - model server
  - replica
  - load balancer
  - API gateway
aliases:
  - LLM serving stack
interview_queries:
  - what components are needed to serve an LLM
  - design an LLM serving system
references:
  - title: vLLM documentation
    url: https://docs.vllm.ai/en/stable/
---

Start with the smallest useful large language model (LLM) system:

`client → model server → graphics processing unit (GPU)`.

That can be enough for development or a low-traffic internal tool. Every extra layer should answer a concrete production problem.

{% capture diagram_code %}
flowchart LR
A["Client"] --> B["Gateway / router"]
B --> C["Replica A"]
B --> D["Replica B"]
C --> E["GPU(s)"]
D --> F["GPU(s)"]
G["Metrics"] -.-> C
G -.-> D
{% endcapture %}
{% capture diagram_fallback %}
Client → Gateway/router → Replica A or Replica B → GPU(s), with serving metrics collected from replicas.
{% endcapture %}
{% include diagram.html title="A minimal horizontally scaled serving system" code=diagram_code fallback=diagram_fallback caption=true %}

## Add a replica when one serving unit is not enough

A replica is a logical copy of serving capacity. It may be one process on one GPU, or one distributed model process spanning several GPUs.

Multiple replicas give you:

- more independent request capacity;
- a way to keep serving if one replica fails;
- units that can be added or removed as traffic changes.

They also duplicate model weights and therefore cost accelerator memory and money.

## Add a router when there is somewhere to choose between

Once multiple healthy replicas exist, incoming traffic needs to be distributed.

A basic router may use round-robin or least-loaded behavior. A more LLM-aware router can account for queue depth, model identity, prompt/cache affinity, or region.

The router does not replace the inference scheduler. It chooses **which serving replica** receives a request. The inference scheduler decides **how that request shares GPU execution once it is there**.

## Add an API gateway when traffic needs policy

The public or application-facing edge often owns concerns such as authentication, API keys, per-customer quotas, request validation, and rate limits.

Those controls answer questions like:

- Is this caller allowed to use this model?
- Has this tenant exceeded its token or request budget?
- Is the request too large before we spend GPU work on it?

They are deliberately outside the model runtime.

## Add queues and admission control when demand can exceed capacity

A replica has finite active-sequence and memory capacity. When requests arrive faster than useful work can complete, some work waits.

A bounded queue can absorb short bursts. Admission control stops the queue from becoming an unbounded latency problem.

Later, [Rate limits, concurrency, and backpressure]({{ '/ai-engineering/production/traffic-backpressure/' | relative_url }}) separates those controls.

## Add orchestration when humans should not restart replicas manually

Containers and Kubernetes enter when you need repeatable deployment, placement, health management, replica lifecycle, and controlled rollout across machines.

Those are general infrastructure problems. The LLM-specific part is the resource shape: expensive GPU nodes, large model artifacts, long startup, and serving metrics that differ from a normal central processing unit (CPU) API.

The deployment trail starts at [What actually gets deployed]({{ '/ai-engineering/deployment/what-gets-deployed/' | relative_url }}).
