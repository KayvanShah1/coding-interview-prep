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
  - title: vLLM multi-node serving example
    url: https://docs.vllm.ai/en/stable/examples/ray_serving/multi-node-serving/
  - title: Google Cloud - multi-host LLM serving on GKE
    url: https://docs.cloud.google.com/kubernetes-engine/docs/tutorials/serve-multihost-gpu
  - title: NVIDIA GPUDirect RDMA
    url: https://docs.nvidia.com/cuda/gpudirect-rdma/
  - title: Kubernetes gang scheduling
    url: https://kubernetes.io/docs/concepts/scheduling-eviction/gang-scheduling/
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

## Optional deep dive: topology changes the cost of parallelism

Multi-GPU communication may involve NCCL over NVLink/NVSwitch, PCIe, InfiniBand or RoCE, and GPUDirect RDMA depending on where the workers are placed.

The physical paths are very different:

```text
same node
GPU ↔ NVLink / NVSwitch ↔ GPU

across nodes
GPU ↔ NIC ↔ InfiniBand / RoCE ↔ NIC ↔ GPU
```

NCCL is the collective-communication library commonly coordinating those transfers for NVIDIA GPU workloads. GPUDirect RDMA can let a network device exchange data directly with GPU memory rather than bouncing the payload through host CPU memory.

The important point is not to memorize interconnect products:

> Splitting one model creates communication. The farther apart the participating GPUs are, the more communication topology can become part of inference latency and throughput.

That is why “the cluster has eight free GPUs” is incomplete information. Eight GPUs on one NVLink-connected node and eight GPUs scattered across machines can support very different parallelism strategies.

### Placement can become a group-scheduling problem

A distributed replica is only useful when enough of its workers can run together. Starting one worker while the other required GPU Pods remain unschedulable can reserve expensive resources without producing a ready model.

For tightly coupled workloads, platforms can use topology-aware placement and **gang scheduling** so a required group is admitted together rather than Pod by Pod. Kubernetes now has gang-scheduling primitives for `PodGroup` workloads, although this is a deeper orchestration concern than most serving interviews require.

This also explains why multi-node inference systems often manage the workers of one logical replica as a unit for rollout and recovery.

### Concrete example: one replica across 16 GPUs

Google's GKE multi-host serving guidance uses Llama 3.1 405B as a concrete example. The FP16 model is roughly 750 GB, so the documented setup uses two A3 nodes with eight H100 GPUs each.

The parallelism is split as:

```text
logical model replica
        ↓
pipeline parallelism = 2 nodes
        ↓
tensor parallelism = 8 GPUs inside each node
        ↓
16 GPUs participate in one serving replica
```

That makes the earlier distinction concrete:

`1 replica ≠ 1 Pod ≠ 1 GPU`.

vLLM's current multi-node documentation uses the same general shape for examples: keep tensor parallelism within an eight-GPU node and use pipeline parallelism across two nodes when the model must span hosts.

Next: [Routing and serving many users]({{ '/ai-engineering/serving/routing-concurrency/' | relative_url }}).
