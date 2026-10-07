---
title: "What an inference engine does"
nav_title: "Inference engines"
description: "Place vLLM, SGLang, Triton, and TensorRT-LLM by responsibility instead of treating them as interchangeable tool names."
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

## vLLM is not Kubernetes

A useful boundary is:

| Component | Main question |
|---|---|
| Kubernetes | Where should this workload run, and should another workload replica exist? |
| vLLM / SGLang | Which inference work should execute now, and how should GPU memory/execution be used? |
| Gateway/router | Is the request allowed, and which serving endpoint should receive it? |

A Pod can be perfectly healthy from Kubernetes' point of view while the inference engine is overloaded with waiting requests. Conversely, vLLM can know exactly how to batch requests but cannot provision a new cloud GPU machine by itself.

## Triton is broader than an LLM-only engine

NVIDIA Triton is a general inference server. Requests arrive through HTTP/gRPC/C APIs, enter a per-model scheduler, may be batched, and then execute through a backend for the model type.

That makes it useful for many model families and runtimes, not only decoder LLMs.

A stack can also combine layers. For example, Triton can serve a TensorRT-LLM backend. Tool names therefore do not always represent mutually exclusive products.

## TensorRT-LLM focuses on optimized NVIDIA execution

TensorRT-LLM provides NVIDIA-specific compilation/runtime techniques for LLM inference. It can appear directly in serving stacks or behind a serving layer such as Triton.

The design question is not “Which acronym wins?” Ask what you need:

- broad framework support or LLM-specific serving;
- fastest path on a particular GPU generation;
- operational simplicity;
- multi-node execution;
- supported quantization and kernels;
- model compatibility;
- observability and deployment integration.

## SGLang and vLLM sit close to the LLM serving problem

Both target high-throughput language-model workloads and include scheduling/cache/runtime optimizations designed around autoregressive generation.

Exact benchmark winners change with model, version, GPU, context distribution, and configuration. In an interview, it is stronger to explain the responsibilities and benchmark criteria than to claim one engine is universally faster.

## Where higher-level serving layers fit

The tool names become easier to place when you draw the stack instead of comparing every product directly.

A minimal deployment can be:

```text
Kubernetes
   ↓
Deployment / Service
   ↓
vLLM or SGLang
   ↓
GPU
```

A higher-level serving framework can add another operational layer:

```text
Kubernetes
   ↓
KServe or Ray Serve
   ↓
vLLM
   ↓
GPU
```

And NVIDIA's stack can look different again:

```text
Kubernetes
   ↓
Triton Inference Server
   ↓
TensorRT-LLM backend/runtime
   ↓
GPU
```

These are examples, not mandatory compositions.

**Ray Serve** adds distributed application deployment, replicas, autoscaling, routing, and multi-model serving around the engine. Its current LLM APIs build vLLM-backed deployments rather than replacing vLLM's token scheduler.

**KServe** provides Kubernetes-native serving abstractions such as `InferenceService` and model runtimes. Its current Hugging Face generative runtime uses vLLM as the default backend for supported LLM workloads.

**Triton** is a broad inference-serving platform that can host different backends. **TensorRT-LLM** focuses on optimized NVIDIA LLM execution. A Triton + TensorRT-LLM deployment therefore occupies different layers rather than representing two competing names for exactly the same component.

The interview question is usually not “which one is best?” It is:

> Which layer do I actually need beyond the inference engine, and what operational responsibility does it remove from my application?

## What should stay outside the inference engine?

Authentication, tenant billing, global quotas, business routing, durable conversation state, and cluster/node lifecycle generally belong elsewhere.

Keeping this boundary clear makes the rest of the architecture easier to reason about: the inference engine owns **efficient model execution**, while other layers own **traffic and infrastructure lifecycle**.
