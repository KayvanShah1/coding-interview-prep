---
title: "Traditional ML serving vs LLM serving"
description: "The deployment fundamentals survive. The expensive resource, request shape, and useful scaling signals change."
chapter: serving
order: 1
sequence: 101
level: Core
keywords:
  - model serving
  - ML inference
  - LLM inference
  - MLOps
  - LLMOps
aliases:
  - ML serving vs LLM serving
interview_queries:
  - how is LLM deployment different from ML deployment
  - LLM serving vs traditional model serving
references:
  - title: NVIDIA Triton architecture
    url: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/architecture.html
  - title: vLLM documentation
    url: https://docs.vllm.ai/en/stable/
---

A traditional online model can often be thought of as:

`features → forward pass → prediction`.

An autoregressive large language model (LLM) still runs inference behind an application programming interface (API), but one request remains active through prompt processing and many decode steps while retaining per-request attention state.

## What stays the same

Both systems still need familiar production concerns:

- a versioned model artifact;
- repeatable deployment;
- request validation and authentication;
- load balancing and replicas;
- health checks;
- rollouts and rollback;
- metrics, logs, and traces;
- capacity planning and cost control.

Docker and Kubernetes keep the same responsibilities whether the workload is a web application, a conventional model, or an LLM server.

## What changes enough to affect the architecture

| Traditional ML serving | LLM serving |
|---|---|
| Often one bounded forward pass | Prefill followed by autoregressive decode |
| Often smaller and easier to place; size varies widely by model family | Large checkpoints can reach tens or hundreds of gigabytes |
| Central processing unit (CPU) serving is common for many models | Graphics processing unit (GPU) / accelerator serving is common |
| Per-request state is often small | Active sequences retain key-value (KV) cache state |
| Request cost is often relatively predictable | Prompt/output token lengths vary widely |
| Ordinary/dynamic batching | Continuous batching across active sequences |
| Replica often maps simply to one process/device | One logical replica may span several GPUs/nodes |
| CPU and requests per second (RPS) can be useful scaling signals | Queue depth, time to first token (TTFT), KV pressure, token throughput become important |
| Startup can be quick | Weight transfer/loading/warmup can dominate scale-out |

## Same system-design fundamentals, different bottlenecks

A queue is still a queue. Replication is still replication. Backpressure is still backpressure.

The difference is what saturates.

For a web or prediction API, you may hit CPU, memory, database connections, or I/O.

For an LLM serving replica, the constraint may be:

```text
GPU compute
GPU memory
KV-cache capacity
token throughput
inter-GPU communication
model startup time
```

An autoscaling rule such as “scale at 70% CPU utilization” can miss queue or memory pressure in an LLM service even though horizontal scaling remains the right general mechanism.

## MLOps still owns the model lifecycle

Machine learning operations (MLOps) still covers model registries, versioning, deployment promotion, evaluation gates, monitoring, and rollback.

LLM serving adds token-generation, memory, and concurrency constraints on top of that lifecycle.

Continue with [LLM inference]({{ '/ai-engineering/inference/overview/' | relative_url }}) for the execution details or [Infrastructure & DevOps]({{ '/infrastructure/' | relative_url }}) for the reusable deployment mechanics.
