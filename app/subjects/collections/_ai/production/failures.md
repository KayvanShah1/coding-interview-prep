---
title: "Failures and recovery in LLM serving"
nav_title: "Failures & recovery"
description: "Define the real failure unit when one logical model replica can depend on several GPUs, processes, or nodes."
chapter: production
order: 5
sequence: 405
level: Core
keywords:
  - failure domain
  - replica failure
  - GPU failure
  - node failure
  - health probe
  - recovery
aliases:
  - inference failure handling
interview_queries:
  - what happens if one GPU in an LLM replica fails
  - how do you make LLM serving highly available
references:
  - title: Kubernetes workloads
    url: https://kubernetes.io/docs/concepts/workloads/
  - title: Kubernetes probes
    url: https://kubernetes.io/docs/concepts/workloads/pods/probes/
  - title: vLLM parallelism and scaling
    url: https://docs.vllm.ai/en/stable/serving/parallelism_scaling/
---

For large language model (LLM) serving, recovery depends on what must work together for one serving unit to produce output.

## A multi-GPU replica can fail as one unit

Suppose one logical replica uses tensor parallelism across eight graphics processing units (GPUs).

If one worker or GPU disappears, the remaining seven do not necessarily provide seven-eighths of that replica's useful capacity. The distributed process may need to be restarted or replaced as a group.

The failure unit is therefore closer to **the logical replica** than the individual accelerator.

## Multi-node replicas widen the failure domain

A model that spans node A and node B can lose the whole replica when either node becomes unusable.

That is one reason tightly coupled distributed inference should not be spread across arbitrary machines without considering topology and failure behavior.

Replication at a higher level can contain that risk:

```text
Replica A: nodes 1-2
Replica B: nodes 3-4
```

If A disappears, the router can stop sending it traffic while B remains independent.

## Health signals have different actions

A readiness failure should remove a replica from new traffic.

A liveness failure may justify restarting the container.

A node/GPU failure may make the Pod disappear or become unusable, after which the workload controller creates replacement work and the scheduler finds capacity again.

These are not interchangeable actions.

## Recovery time includes model startup

Mean time to recovery (MTTR) includes more than process restart time.

Replacement may need a GPU node, model loading, distributed initialization, and readiness.

That makes warm spare capacity and multiple healthy replicas relevant not only to traffic spikes but also to recovery objectives.

## Do not hide failure behind unlimited retries

If one replica disappears, the remaining fleet has less capacity. Automatically retrying all failed requests against the smaller fleet can overload it.

Retry policy should account for:

- whether the failure is transient;
- whether the operation is safe to retry;
- the remaining queue budget;
- backoff/jitter;
- current fleet capacity.

Availability comes from controlled degradation and independent capacity, not from retries alone.

Next: [Serving trade-offs]({{ '/ai-engineering/production/tradeoffs/' | relative_url }}).
