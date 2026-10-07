---
title: "What an inference engine does"
nav_title: "Inference engines"
description: "Separate inference engines, serving frameworks, general model servers, and cluster orchestration by the responsibility each layer owns."
chapter: serving
order: 2
sequence: 202
level: Core
keywords:
  - inference engine
  - model server
  - scheduler
  - batching
  - KV cache
tools:
  - vLLM
  - SGLang
  - Triton Inference Server
  - TensorRT-LLM
aliases:
  - LLM runtime
  - inference server
interview_queries:
  - what does vLLM do
  - what is the difference between vLLM and Kubernetes
  - what is an inference engine
references:
  - title: vLLM documentation
    url: https://docs.vllm.ai/en/stable/
  - title: NVIDIA Triton architecture
    url: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/architecture.html
  - title: NVIDIA Triton model repository
    url: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/model_repository.html
  - title: Ray Serve LLM API
    url: https://docs.ray.io/en/master/serve/api/llm.html
  - title: KServe generative inference runtime
    url: https://kserve.github.io/website/docs/model-serving/generative-inference/overview
---

An inference engine sits between an API request and accelerator execution. Its job is to make model execution correct and efficient.

For an autoregressive LLM, that can include:

- loading model configuration, tokenizer, and weights;
- allocating GPU and KV-cache memory;
- scheduling prompt and decode work;
- batching active sequences;
- executing optimized kernels;
- coordinating multiple GPUs when one replica is distributed;
- streaming generated output;
- exposing serving metrics and health endpoints.

## An inference engine is not the cluster orchestrator

The layers are easier to separate by the question each one answers.

| Layer | Main question |
|---|---|
| Cluster/workload orchestration | Where should this workload run, and should another replica exist? |
| Inference engine | Which inference work should execute now, and how should accelerator memory/execution be used? |
| Gateway/router | Is the request allowed, and which serving endpoint should receive it? |

A Pod can be healthy from Kubernetes' point of view while the inference engine has a deep request queue. Conversely, an inference engine can batch work efficiently but cannot provision a new cloud GPU machine by itself.

## Where common serving tools fit

Tool names are easier to remember after the responsibility is clear.

| Layer | Responsibility | Examples |
|---|---|---|
| Higher-level serving/orchestration | Deployment, replicas, scaling, routing abstractions | KServe, Ray Serve |
| LLM inference engine | Token scheduling, batching, KV-cache management, model execution | vLLM, SGLang |
| General inference server | Serve and schedule model backends across model families | Triton |
| Optimized LLM execution/runtime | Hardware-specific kernels and execution optimizations | TensorRT-LLM |

These layers can be composed. A higher-level serving framework may run an LLM inference engine, and a general inference server may use an optimized LLM backend. They are not necessarily competing products at the same layer.

The product names will change faster than the boundary. When comparing systems, ask whether you need:

- broad framework support or LLM-specific serving;
- hardware-specific optimization;
- multi-node execution;
- supported quantization and kernels;
- deployment and autoscaling abstractions;
- observability and operational simplicity.

Exact benchmark winners also change with model, version, GPU, context distribution, and configuration. The durable question is which responsibility the component owns and how you would benchmark it for the workload.

## What should stay outside the inference engine?

Authentication, tenant billing, global quotas, business routing, durable conversation state, and cluster/node lifecycle generally belong elsewhere.

Keeping that boundary clear makes the rest of the architecture easier to reason about: the inference engine owns **efficient model execution**, while other layers own **traffic and infrastructure lifecycle**.
