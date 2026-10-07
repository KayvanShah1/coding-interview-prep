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

An autoregressive LLM still runs model inference behind an API, but one request remains active through prompt processing and many decode steps while retaining per-request attention state.

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

Docker and Kubernetes do not become “AI tools” merely because the container happens to load a language model.

## What changes enough to affect the architecture

| Traditional ML serving | LLM serving |
|---|---|
| Often one bounded forward pass | Prefill followed by autoregressive decode |
| Model can be MBs to a few GB | Checkpoints can be tens or hundreds of GB |
| CPU may be sufficient | GPU/accelerator serving is common |
| Per-request state is usually small | Active sequences retain KV-cache state |
| Request cost is often relatively predictable | Prompt/output token lengths vary widely |
| Ordinary/dynamic batching | Continuous batching across active sequences |
| Replica often maps simply to one process/device | One logical replica may span several GPUs/nodes |
| CPU/RPS can be useful scaling signals | Queue depth, TTFT, KV pressure, token throughput become important |
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

That is why blindly copying a CPU-based autoscaling rule such as “scale at 70% utilization” can fail even though horizontal autoscaling itself is still the right general concept.

## Keep MLOps and LLM serving connected

Model registries, versioning, deployment promotion, evaluation gates, monitoring, and rollback remain part of the production ML lifecycle.

LLM systems add their own serving mechanics and quality concerns; they do not invalidate the rest of MLOps.

Continue with [LLM inference]({{ '/ai-engineering/inference/overview/' | relative_url }}) for the execution details or [Infrastructure & DevOps]({{ '/infrastructure/' | relative_url }}) for the reusable deployment mechanics.
