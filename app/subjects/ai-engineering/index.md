---
layout: subject
title: AI Engineering
subject: ai-engineering
permalink: /ai-engineering/
description: Retrieval, agents, evaluation, inference, and production AI systems.
mermaid: true
keywords:
  - LLM inference
  - LLM serving
  - RAG
  - agents
  - evaluation
aliases:
  - AI engineering handbook
---

## Start from what the model is actually doing

Calling a hosted model can make the infrastructure disappear. That is useful until an interview, production incident, or cost problem forces you to explain where the latency comes from and which part of the stack owns it.

This trail starts with the model's inference loop, then adds the serving machinery around it.

{% capture diagram_code %}
flowchart LR
A["Prompt"] --> B["Inference"]
B --> C["Serving"]
C --> D["Deployment"]
D --> E["Production traffic"]
E --> F["Observability"]
{% endcapture %}
{% capture diagram_fallback %}
Prompt → Inference → Serving → Deployment → Production traffic → Observability
{% endcapture %}
{% include diagram.html title="From a model call to a production service" code=diagram_code fallback=diagram_fallback caption=true %}

The point is not to memorize a modern AI stack. It is to know why each layer exists, what signal tells you it is failing, and which trade-off changes when the workload is an autoregressive model instead of a normal API.

## Follow the serving path

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/inference/overview/' | relative_url }}">LLM inference</a><span>Prefill, decode, KV cache, batching, and the GPU work behind token generation.</span></li>
<li><a href="{{ '/ai-engineering/serving/overview/' | relative_url }}">LLM serving</a><span>Inference engines, replicas, parallelism, routing, and concurrent users.</span></li>
<li><a href="{{ '/ai-engineering/deployment/overview/' | relative_url }}">Deploying LLMs</a><span>Artifacts, containers, model weights, GPU startup, readiness, and rollouts.</span></li>
<li><a href="{{ '/ai-engineering/production/overview/' | relative_url }}">Production LLM systems</a><span>Gateways, queues, backpressure, autoscaling, cold starts, capacity, and failures.</span></li>
<li><a href="{{ '/ai-engineering/observability/overview/' | relative_url }}">LLM observability</a><span>TTFT, TPOT, queue pressure, KV-cache utilization, GPU signals, and cost.</span></li>
</ul>

## Keep the boundary with general infrastructure clear

Docker, Kubernetes, Services, probes, HPA, KEDA, and node autoscaling are not LLM concepts. Their mechanics live under [Infrastructure & DevOps]({{ '/infrastructure/' | relative_url }}).

The AI pages use those mechanisms where the LLM changes the decision: a replica may need several GPUs, model startup can require moving tens of gigabytes before readiness, and GPU utilization alone may not tell you whether another request will meet its latency target.
