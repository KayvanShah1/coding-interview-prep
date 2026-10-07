---
title: "End-to-end LLM serving architecture"
description: "Place every major serving component by the decision it owns, from public traffic to GPU execution and node provisioning."
chapter: production
order: 1
sequence: 401
level: Core
mermaid: true
keywords:
  - API gateway
  - model router
  - bounded queue
  - inference replica
  - Kubernetes scheduler
  - node autoscaler
aliases:
  - LLM system design
  - production serving architecture
tools:
  - Kubernetes
  - vLLM
  - KEDA
  - Karpenter
  - Prometheus
  - llm-d
interview_queries:
  - design an LLM serving architecture
  - what does each component in an LLM stack do
references:
  - title: vLLM documentation
    url: https://docs.vllm.ai/en/stable/
  - title: Kubernetes workloads
    url: https://kubernetes.io/docs/concepts/workloads/
  - title: Amazon EKS inference autoscaling
    url: https://docs.aws.amazon.com/eks/latest/userguide/ml-inference-autoscaling.html
  - title: Google Cloud - GKE Inference Gateway powered by llm-d
    url: https://docs.cloud.google.com/kubernetes-engine/docs/concepts/about-gke-inference-gateway
---

At this point every box should solve a specific problem rather than appear because it belongs to a fashionable stack.

{% capture diagram_code %}
flowchart TD
A["Client"] --> B["Load balancer / API gateway"]
B --> C["Model router"]
C --> D["Admission control / bounded queue"]
D --> E["Inference replica"]
E --> F["Inference scheduler + KV cache"]
F --> G["GPU(s)"]
H["Kubernetes"] -. "places / replaces replicas" .-> E
I["HPA / KEDA"] -. "desired replica count" .-> H
J["Node autoscaler"] -. "machine capacity" .-> H
K["Metrics / logs / traces"] -.-> E
K -.-> I
{% endcapture %}
{% capture diagram_fallback %}
Client → Load balancer/API gateway → Model router → Admission control/bounded queue → Inference replica → inference scheduler/KV cache → GPU(s). Kubernetes places/replaces replicas; HPA/KEDA changes desired replicas; node autoscaling supplies machines; observability feeds operations and scaling.
{% endcapture %}
{% include diagram.html title="The serving data path and the infrastructure control path" code=diagram_code fallback=diagram_fallback caption=true %}

## Data path: where the request goes

**Load balancer / API gateway:** terminates external traffic and commonly owns authentication, quotas, request validation, and rate limits.

**Model router:** chooses a model, version, region, or serving replica. It may be simple or inference-aware.

**Admission control / bounded queue:** prevents unlimited work from entering a finite serving system.

**Inference replica:** owns the model execution environment.

**Inference scheduler:** decides how active sequences share execution and cache capacity.

**GPU(s):** perform the tensor computation.

## Control path: how serving capacity exists

**Kubernetes:** keeps the declared workloads running and places Pods on suitable nodes.

**HPA/KEDA or another workload autoscaler:** changes the desired number of serving replicas from metrics or events.

**Node autoscaler/Karpenter:** obtains or removes machines when the current cluster cannot place those replicas.

**Observability:** provides the evidence used for scaling, SLOs, and debugging.

## The “who does what?” map

| Tool/layer | Main responsibility |
|---|---|
| Docker/container image | Package the serving software environment |
| Kubernetes Deployment | Maintain and roll workload replicas |
| Kubernetes scheduler | Choose a node for a Pod |
| Service/gateway | Expose and route network traffic |
| HPA | Adjust replica count from metrics |
| KEDA | Feed event/custom metrics into Kubernetes scaling behavior |
| Karpenter / cluster autoscaler | Change machine/node capacity |
| vLLM / SGLang | Schedule and execute LLM inference |
| CUDA | Accelerator execution interface/runtime |
| NCCL | Multi-GPU communication |
| Prometheus | Collect time-series metrics |
| Grafana | Visualize/alert on metrics |
| KServe / Ray Serve | Optional higher-level serving/orchestration abstractions |
| Triton | General inference-serving platform |

You would not necessarily use all of these together.

## One production shape: an inference gateway in front of serving pools

A current GKE design powered by llm-d makes the generic boxes above more concrete:

```text
client
  ↓
Inference Gateway
  ↓
state-aware endpoint selection
  ↓
InferencePool
  ↓
model-server replicas
  ↓
GPU(s)
```

The gateway can combine ordinary traffic control with inference-specific state such as prefix-cache matches, KV-cache pressure, pending queues, and LoRA placement. It can also queue or shed work when the serving pool is saturated.

This is deliberately an **example**, not the canonical CoreTrail architecture. The generic responsibilities still matter even if a different platform calls the gateway, scheduler, pool, or model server by different names.

The routing details live in [Routing and serving many users]({{ '/ai-engineering/serving/routing-concurrency/' | relative_url }}).

## Same fundamentals, different bottleneck

A normal backend may saturate on CPU, database connections, or I/O.

An LLM service can saturate on:

```text
GPU compute
GPU memory / KV cache
inter-GPU communication
request queue
model startup capacity
token throughput
```

The architecture fundamentals survive. The useful signals and cost of a replica change.

Next: [Rate limits, concurrency, and backpressure]({{ '/ai-engineering/production/traffic-backpressure/' | relative_url }}).
