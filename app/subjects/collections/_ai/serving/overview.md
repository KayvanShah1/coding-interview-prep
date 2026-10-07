---
title: "LLM serving"
nav_title: "Overview"
description: "Turn one inference process into a service with replicas, routing, concurrency, and a clear boundary around the inference engine."
chapter: serving
order: 0
sequence: 200
level: "Chapter overview"
keywords:
  - LLM serving
  - model serving
  - inference server
aliases:
  - language model serving
interview_queries:
  - how are LLMs served in production
  - how can many users use one LLM
references:
  - title: vLLM documentation
    url: https://docs.vllm.ai/en/stable/
  - title: NVIDIA Triton architecture
    url: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/architecture.html
---

One running model server can answer requests. A production serving system has to answer a different question: **how do we keep latency and throughput acceptable when requests arrive concurrently and individual requests have very different token lengths?**

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/serving/one-model-to-system/' | relative_url }}">From one model to a serving system</a><span>Add the layers only when the problem requires them.</span></li>
<li><a href="{{ '/ai-engineering/serving/inference-engines/' | relative_url }}">Inference engines</a><span>Understand what vLLM, SGLang, Triton, and TensorRT-LLM actually own.</span></li>
<li><a href="{{ '/ai-engineering/serving/replicas-parallelism/' | relative_url }}">Replicas and parallelism</a><span>Separate splitting one model from copying serving capacity.</span></li>
<li><a href="{{ '/ai-engineering/serving/routing-concurrency/' | relative_url }}">Routing and serving many users</a><span>Connect load distribution, cache locality, per-replica scheduling, and horizontal scale.</span></li>
</ul>

The important boundary is that an **inference engine** schedules model execution, while the **serving platform** decides how traffic reaches enough healthy inference replicas.
