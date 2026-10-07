---
title: "How LLM inference actually works"
description: "Trace a prompt through tokenization, prefill, autoregressive decode, and streamed output."
chapter: inference
order: 1
sequence: 101
level: Core
mermaid: true
keywords:
  - autoregressive generation
  - next token prediction
  - token generation
  - inference loop
aliases:
  - LLM generation loop
interview_queries:
  - how does an LLM generate tokens
  - what happens when an LLM receives a prompt
references:
  - title: vLLM documentation
    url: https://docs.vllm.ai/en/stable/
---

A normal prediction endpoint often looks like one bounded computation:

`features → model → prediction`.

An LLM request has a different shape. The prompt is processed, then generation repeatedly produces another token until a stopping condition is reached.

{% capture diagram_code %}
flowchart LR
A["Prompt text"] --> B["Tokenize"]
B --> C["Prefill prompt"]
C --> D["Generate next token"]
D --> E{"Stop?"}
E -- "No" --> D
E -- "Yes" --> F["Return / stream output"]
{% endcapture %}
{% capture diagram_fallback %}
Prompt text → Tokenize → Prefill prompt → Generate next token → repeat until stop → Return or stream output
{% endcapture %}
{% include diagram.html title="One request through autoregressive inference" code=diagram_code fallback=diagram_fallback caption=true %}

## The prompt is not generated token by token

Suppose the request contains 2,000 input tokens. The model can process those prompt tokens together to establish the attention state needed for generation. This stage is **prefill**.

Once prefill completes, the model begins **decode**. At each decode step it produces logits for the next token, selects or samples a token, then uses that new token as part of the state for the following step.

A 300-token answer therefore involves roughly 300 sequential decode steps. Work inside each step is massively parallel on the GPU, but token 250 cannot be finalized before the state produced by token 249 exists.

That sequential dependency is why an LLM endpoint behaves differently from a classifier that returns one score after a single forward pass.

## Streaming changes the user experience, not the underlying work

The server does not need to wait for the complete answer before returning anything. Once the first output token is ready, it can stream generated text to the client while later decode steps continue.

This gives two different latency questions:

- **How long until generation starts?** This is captured by time to first token, or TTFT.
- **How quickly does generation continue?** This is captured by inter-token latency or time per output token.

A request can have a good TTFT and still feel slow if decode is slow. It can also generate quickly once started but have a poor TTFT because it waited in a queue or processed a very long prompt.

## Input and output length stress different parts of the path

A long prompt increases prefill work and creates more attention state. A long answer keeps the request active through more decode steps.

That means two requests are not equivalent merely because both count as one HTTP request:

| Request | Likely pressure |
|---|---|
| Short prompt, short answer | Small amount of serving work |
| Long prompt, short answer | Heavy prefill and KV-cache allocation |
| Short prompt, long answer | Long-lived decode work |
| Long prompt, long answer | Both memory pressure and sustained generation |

This is why production LLM systems often reason in tokens and active sequences rather than requests per second alone.

## What the inference engine has to manage

At this layer the engine is concerned with the model execution itself: loading weights, allocating model and cache memory, scheduling sequences, building efficient batches, executing kernels, and returning generated tokens.

Kubernetes does not decide which token should run next. A load balancer does not manage the KV cache. Those responsibilities belong deeper in the inference runtime.

Continue to [Prefill, decode, and KV cache]({{ '/ai-engineering/inference/prefill-decode-kv-cache/' | relative_url }}) before thinking about replicas. The amount of per-request state determines how many requests one replica can keep active.
