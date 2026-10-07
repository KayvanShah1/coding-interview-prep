---
title: "Continuous batching and request scheduling"
description: "See how an inference engine keeps the GPU useful while requests arrive, finish, and generate at different lengths."
chapter: inference
order: 3
sequence: 103
level: Core
mermaid: true
keywords:
  - continuous batching
  - dynamic batching
  - request scheduling
  - running requests
  - waiting requests
  - batch size
aliases:
  - in-flight batching
tools:
  - vLLM
  - Triton
interview_queries:
  - how do LLMs serve many requests on one GPU
  - what is continuous batching
  - why does batching improve LLM throughput
references:
  - title: vLLM documentation
    url: https://docs.vllm.ai/en/stable/
  - title: NVIDIA Triton dynamic batching
    url: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html
---

A graphics processing unit (GPU) is good at large parallel tensor operations. Running tiny independent pieces of work one after another leaves expensive hardware underused.

Batching tries to turn several requests into useful work together.

## Static batches are awkward for generation

Suppose four requests begin together:

`A, B, C, D`.

Their output lengths differ. If the batch had to remain fixed until every request completed, a short request finishing early would leave an empty slot while a long request kept generating.

Continuous batching lets the serving scheduler change the active batch as work completes.

{% capture diagram_code %}
flowchart TD
A["Step 1: A · B · C · D"] --> B["A finishes"]
B --> C["Step 2: E · B · C · D"]
C --> D["C finishes"]
D --> E["Step 3: E · B · F · D"]
{% endcapture %}
{% capture diagram_fallback %}
Step 1: A B C D → A finishes → Step 2: E B C D → C finishes → Step 3: E B F D
{% endcapture %}
{% include diagram.html title="Continuous batching replaces finished work" code=diagram_code fallback=diagram_fallback caption=true %}

The exact scheduling policy is engine-specific, but the goal is straightforward: keep useful GPU work flowing without forcing unrelated requests to finish together.

## There are two schedulers people often mix up

**Kubernetes scheduler:** Which node should run this Pod?

**Inference scheduler:** Which sequences or tokens should receive model execution now?

Kubernetes works at the workload-placement layer. It can place a vLLM Pod on a node with four GPUs. Once that model server is running, vLLM's scheduler decides how admitted inference requests share those GPUs.

Kubernetes does not batch large language model (LLM) requests. It places Pods; the inference scheduler decides how admitted sequences share model execution.

## Throughput and latency pull in different directions

A larger or fuller batch can improve GPU efficiency and total token throughput. Waiting longer to form useful work can increase queueing delay and time to first token.

That creates a familiar systems trade-off:

| Choice | Likely effect |
|---|---|
| Admit more concurrent work | Better utilization until memory/queue pressure becomes excessive |
| Larger batches | Higher throughput, potentially more waiting |
| Prioritize latency | Less opportunity to batch |
| Prioritize throughput | More work shared per execution step |

There is no universally correct batch size. The target comes from the workload and its latency service-level objective (SLO).

## Waiting is different from running

At saturation, a serving replica can have both:

- **running requests** consuming execution and cache capacity;
- **waiting requests** that have been admitted but cannot yet make progress.

That distinction becomes useful later for autoscaling. A GPU that is busy is not automatically overloaded. A persistent queue of waiting requests is stronger evidence that arrival rate has exceeded the replica's current service capacity.

## Dynamic batching and continuous batching are related, not identical labels

General inference servers such as NVIDIA Triton support dynamic batching: compatible requests are combined before model execution to improve throughput.

Autoregressive LLM serving adds a more persistent scheduling problem because requests remain active across many decode iterations. Engines such as vLLM continuously reshape the set of active sequences as requests arrive and finish.

The shared principle is to **amortize expensive accelerator execution across useful concurrent work**. The scheduling details differ with the model and serving runtime.

Next: [Making inference faster and cheaper]({{ '/ai-engineering/inference/efficient-inference/' | relative_url }}).
