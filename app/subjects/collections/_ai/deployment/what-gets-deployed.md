---
title: "What actually gets deployed"
description: "Separate the serving software, model artifact, infrastructure declaration, and runtime GPU state behind an LLM endpoint."
chapter: deployment
order: 1
sequence: 301
level: Core
keywords:
  - model artifact
  - container image
  - model registry
  - deployment manifest
  - runtime state
aliases:
  - LLM deployment artifacts
tools:
  - Docker
  - Kubernetes
  - vLLM
interview_queries:
  - what is inside an LLM container
  - is the model stored in the Docker image
references:
  - title: NVIDIA Triton model repository
    url: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/model_repository.html
  - title: vLLM parallelism and scaling
    url: https://docs.vllm.ai/en/stable/serving/parallelism_scaling/
---

There are at least three durable things to version independently.

## 1. The serving software

A container image can package:

```text
Python
PyTorch
CUDA userspace libraries
vLLM / another runtime
tokenizer libraries
application code
startup command
```

The image answers: **which software environment should start?**

It does not have to contain the model checkpoint.

## 2. The model artifact

A model artifact can include:

```text
config.json
tokenizer files
weight shards
quantization metadata
generation defaults
adapter weights
```

Those files may live in Hugging Face storage, S3/GCS/Azure object storage, a model registry, a persistent filesystem, or node-local disk.

The artifact answers: **which model version should this server load?**

Keeping model and application versions separate lets you change serving code without rebuilding an 80 GB image and lets you roll a model independently of unrelated API code.

## 3. The infrastructure declaration

Kubernetes manifests, Helm values, Terraform, cloud configuration, and secrets specify things such as:

- which image to run;
- how many GPUs and how much CPU/RAM it requests;
- which storage is mounted;
- environment and credentials;
- probes;
- replica counts and scaling rules;
- network exposure.

This answers: **where and under what operational constraints should the workload run?**

## Runtime state is created after deployment starts

Once the process starts, more state appears:

```text
model tensors in central processing unit (CPU) / graphics processing unit (GPU) memory
key-value (KV) cache
compiled kernels / graph caches
active requests
queues
open connections
```

None of this is equivalent to the checkpoint sitting in object storage.

That distinction explains why a Pod can exist while the model is not ready, why replacing a Pod loses its in-memory KV cache, and why “the weights are already downloaded” does not imply instant startup.

## What would I version?

For a production system, be able to identify at least:

```text
serving image version
model/checkpoint version
runtime configuration
deployment configuration
```

Then an incident can answer “what changed?” without treating the endpoint as one opaque artifact.

Continue to [Where model weights live]({{ '/ai-engineering/deployment/model-weights/' | relative_url }}).
