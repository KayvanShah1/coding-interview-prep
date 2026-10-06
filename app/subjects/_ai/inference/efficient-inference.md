---
title: "Making LLM inference faster and cheaper"
nav_title: "Efficient inference"
description: "Match quantization, PagedAttention, prefix caching, speculative decoding, and model routing to the bottleneck they address."
chapter: inference
order: 4
sequence: 104
level: "Core + deep dive"
keywords:
  - quantization
  - PagedAttention
  - prefix caching
  - speculative decoding
  - chunked prefill
  - throughput
  - latency
aliases:
  - inference optimization
  - LLM optimization
tools:
  - vLLM
interview_queries:
  - how do you optimize LLM inference
  - how do you reduce LLM serving cost
references:
  - title: vLLM documentation
    url: https://docs.vllm.ai/en/stable/
  - title: vLLM cache configuration
    url: https://docs.vllm.ai/en/stable/api/vllm/config/cache/
  - title: vLLM optimization and tuning
    url: https://docs.vllm.ai/en/stable/configuration/optimization/
---

Do not start an optimization discussion with a list of techniques. Start with the expensive resource or delay you are trying to reduce.

## If model weights consume too much memory: quantize

Lower-precision weight formats reduce the memory footprint of the model and can improve execution efficiency on supported hardware.

A rough intuition is enough for interviews:

`70B parameters × 2 bytes ≈ 140 GB` for 16-bit weights before other memory.

Moving to a lower-bit representation can cut that substantially, but the real outcome depends on the quantization method, hardware, kernels, and acceptable quality change.

The decision is not “4-bit is always better.” Ask whether the target is **fit**, **throughput**, **cost**, or **latency**, then benchmark quality and performance on the actual workload.

## If KV memory is fragmented or poorly utilized: manage it in blocks

vLLM's PagedAttention work popularized treating KV-cache memory more like paged/block-managed storage than reserving one large contiguous region per sequence.

Conceptually:

`[A][A][B][C][A][B][D] ...`

The point is not the name. The point is that variable-length requests make naïve memory reservation wasteful. Better allocation lets more useful request state fit in the same VRAM budget.

## If prompts repeat: reuse prefix work

Many production requests share long prefixes: a system prompt, tool definitions, policy instructions, a common document header, or the beginning of a multi-turn conversation.

Prefix caching can reuse previously computed KV state for matching prefixes instead of recomputing the same prefill work.

The gain depends on actual reuse. A cache with almost no repeated prefixes adds memory and bookkeeping without much benefit.

Routing can then become cache-aware: if replica A already holds a useful prefix, sending the related request to replica A may avoid work. That is an optimization layer, not a requirement for a basic serving system.

## If sequential decode is the bottleneck: speculative decoding

Speculative decoding uses cheaper proposal work to suggest multiple future tokens and lets the target model verify them. When several proposals are accepted, the system advances farther than one normal token step for part of the workload.

It is useful when the extra proposer/verification work produces enough accepted tokens to reduce effective generation time. It is not free acceleration for every model and traffic pattern.

## If prompts are large: schedule prefill carefully

Large prefills can monopolize execution and hurt other requests' first-token latency. Chunked or disaggregated prefill approaches split or separate prompt processing so the scheduler can balance it against decode traffic.

This becomes increasingly relevant when a serving fleet mixes long-document requests with interactive chat.

## If the request does not need the largest model: route differently

Infrastructure optimization is not the only cost lever.

A router can send simpler work to a smaller model, reserve a larger model for harder requests, or choose a specialized model for embeddings or code. The trade-off moves from pure systems tuning into quality measurement: the cheaper route is only useful if it still meets the task's quality bar.

## Keep the decision table in mind

| Bottleneck | Candidate lever |
|---|---|
| Weights do not fit / VRAM expensive | Quantization, more/smaller model choice |
| KV-cache pressure | Better cache allocation, shorter context, more capacity |
| Repeated prompt prefill | Prefix caching |
| Decode latency | Speculative decoding, faster kernels/hardware |
| Long prompt interference | Chunked/disaggregated prefill |
| Cost from over-capable models | Model routing |
| Low GPU utilization | Better scheduling/batching |

The next chapter moves one level up: [LLM serving]({{ '/ai-engineering/serving/overview/' | relative_url }}).
