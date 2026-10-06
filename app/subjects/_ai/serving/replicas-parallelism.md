---
title: "Replicas, tensor parallelism, and pipeline parallelism"
nav_title: "Replicas & parallelism"
description: "Separate splitting one model across GPUs from duplicating model-serving capacity for more traffic."
chapter: serving
order: 3
sequence: 203
level: Core
mermaid: true
keywords:
  - tensor parallelism
  - pipeline parallelism
  - data parallelism
  - replicas
  - multi GPU inference
  - distributed inference
  - NCCL
  - NVLink
aliases:
  - TP
  - PP
  - model parallelism
  - multi-GPU serving
tools:
  - vLLM
  - NCCL
interview_queries:
  - how do you serve a model that does not fit on one GPU
  - tensor parallelism vs pipeline parallelism
  - replica vs tensor parallelism
references:
  - title: vLLM parallelism and scaling
    url: https://docs.vllm.ai/en/stable/serving/parallelism_scaling/
  - title: vLLM data parallel deployment
    url: https://docs.vllm.ai/en/stable/serving/data_parallel_deployment/
---

Three different scaling ideas are often collapsed into “use more GPUs.” Keep them separate.

{% capture diagram_code %}
flowchart TB
subgraph R1["Replica A"]
A1["GPU 0"] --- A2["GPU 1"]
A2 --- A3["GPU 2"]
A3 --- A4["GPU 3"]
end
subgraph R2["Replica B"]
B1["GPU 4"] --- B2["GPU 5"]
B2 --- B3["GPU 6"]
B3 --- B4["GPU 7"]
end
C["Router"] --> R1
C --> R2
{% endcapture %}
{% capture diagram_fallback %}
Router → Replica A (GPU 0-3) or Replica B (GPU 4-7). GPUs inside each replica can cooperate to execute one model; replicas independently serve traffic.
{% endcapture %}
{% include diagram.html title="Parallelism inside a replica, replication across traffic" code=diagram_code fallback=diagram_fallback caption=true %}

## Tensor parallelism splits work inside model layers

If a model does not fit comfortably on one GPU, tensor parallelism can partition tensor operations across multiple GPUs.

One logical model replica might therefore require:

`GPU 0 + GPU 1 + GPU 2 + GPU 3`.

The GPUs must exchange intermediate results frequently, so communication topology matters. Fast links such as NVLink/NVSwitch inside a node can make this much more practical than spreading tightly coupled tensor-parallel work over ordinary networking.

vLLM's current guidance is straightforward: if the model fits on one GPU, distributed inference may be unnecessary; if it needs several GPUs in one node, tensor parallelism is a common choice.

## Pipeline parallelism splits layers or stages

Pipeline parallelism places different ranges/stages of the model on different workers.

Conceptually:

`early layers → middle layers → later layers`.

This can help when the model must span nodes or when tensor-parallel communication would be unsuitable. It introduces its own pipeline utilization and communication trade-offs.

vLLM recommends combining tensor and pipeline parallelism when a model must span several multi-GPU nodes.

## Serving replicas duplicate capacity

Replication solves a different problem.

If one four-GPU replica can serve a certain amount of traffic, a second four-GPU replica gives the router another independent serving target. The weights are replicated and both replicas can process independent request batches.

That is horizontal serving capacity, often called data-parallel serving at a high level.

So:

- **tensor/pipeline parallelism** helps construct one logical model replica;
- **replicas/data parallelism** help serve more independent traffic.

## A replica is a logical failure and capacity unit

Do not assume:

`1 replica = 1 GPU = 1 Pod`.

A small model might use one GPU and one process. A large model can span eight GPUs on one machine. An even larger replica can span multiple machines.

That changes failure handling. If one worker is required for a distributed replica and that worker disappears, the useful capacity loss may be the whole replica, not merely one GPU's fraction of traffic.

## Why topology becomes a deep-infra concern

Multi-GPU communication may involve NCCL over NVLink/NVSwitch, PCIe, InfiniBand, or GPUDirect RDMA depending on topology.

You do not need those details for every AI Engineer interview. The useful mental model is:

> Splitting a model creates communication. The more tightly the GPUs cooperate, the more the interconnect can become part of inference performance.

That is why a scheduler finding “four free GPUs” is not always enough. Which four GPUs, on which nodes, with which links can matter.

Next: [Routing and serving many users]({{ '/ai-engineering/serving/routing-concurrency/' | relative_url }}).
