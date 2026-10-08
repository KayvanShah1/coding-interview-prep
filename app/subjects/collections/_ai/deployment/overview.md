---
title: "Deploying LLMs"
nav_title: "Overview"
description: "Trace code, model artifacts, containers, storage, GPU initialization, readiness, and rollouts as separate deployment concerns."
chapter: deployment
order: 0
sequence: 300
level: "Chapter overview"
keywords:
  - LLM deployment
  - model weights
  - container
  - GPU deployment
aliases:
  - model deployment
interview_queries:
  - how do you deploy an LLM
  - what happens when an LLM container starts
references:
  - title: vLLM parallelism and scaling
    url: https://docs.vllm.ai/en/stable/serving/parallelism_scaling/
  - title: Kubernetes probes
    url: https://kubernetes.io/docs/concepts/workloads/pods/probes/
---

Deploying a large language model (LLM) spans several artifacts and lifecycle steps.

The container image, model checkpoint, infrastructure configuration, and running graphics processing unit (GPU) memory are related, but they are not the same thing. Keeping them separate makes startup failures and rollout trade-offs much easier to explain.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/deployment/what-gets-deployed/' | relative_url }}">What actually gets deployed</a><span>Separate software images, model artifacts, configuration, and runtime state.</span></li>
<li><a href="{{ '/ai-engineering/deployment/model-weights/' | relative_url }}">Where model weights live</a><span>Follow a checkpoint from registry or object storage to disk, RAM, and GPU video memory (VRAM).</span></li>
<li><a href="{{ '/ai-engineering/deployment/startup-lifecycle/' | relative_url }}">From container start to ready replica</a><span>Trace scheduling, image pull, model loading, warmup, and readiness.</span></li>
<li><a href="{{ '/ai-engineering/deployment/rollouts/' | relative_url }}">Updating models without breaking traffic</a><span>Reason about rolling updates, canaries, surge capacity, and rollback when replicas are expensive to start.</span></li>
</ul>

For the mechanics of images, Pods, Deployments, Services, and probes, use [Infrastructure & DevOps]({{ '/infrastructure/' | relative_url }}). These pages focus on what changes once the workload is an LLM.
