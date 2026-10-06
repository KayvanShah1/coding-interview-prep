---
layout: subject
title: Infrastructure & DevOps
subject: infrastructure
permalink: /infrastructure/
description: Containers, Kubernetes, deployment, scaling, and operating production systems.
mermaid: true
keywords:
  - Docker
  - Kubernetes
  - autoscaling
  - observability
aliases:
  - DevOps
  - infrastructure
---

## Follow the workload, not the tool list

Infrastructure becomes easier when each component answers one operational question.

{% capture diagram_code %}
flowchart LR
A["Build image"] --> B["Registry"]
B --> C["Run container"]
C --> D["Kubernetes workload"]
D --> E["Service / traffic"]
D --> F["Autoscaling"]
D --> G["Metrics · logs · traces"]
{% endcapture %}
{% capture diagram_fallback %}
Build image → Registry → Run container → Kubernetes workload → Service/traffic, autoscaling, and observability
{% endcapture %}
{% include diagram.html title="From packaged software to an operated workload" code=diagram_code fallback=diagram_fallback caption=true %}

The pages here own the reusable mechanics. AI Engineering links back when an LLM changes the resource profile, startup path, or scaling signal.

## Start with the layers

<ul class="topic-list">
<li><a href="{{ '/infrastructure/containers/overview/' | relative_url }}">Containers</a><span>Images, registries, runtimes, and GPU access.</span></li>
<li><a href="{{ '/infrastructure/kubernetes/overview/' | relative_url }}">Kubernetes</a><span>Pods, nodes, Deployments, Services, storage, init containers, and probes.</span></li>
<li><a href="{{ '/infrastructure/scaling/overview/' | relative_url }}">Scaling</a><span>Workload replicas versus machine capacity, with HPA, KEDA, and node autoscaling.</span></li>
<li><a href="{{ '/infrastructure/observability/overview/' | relative_url }}">Operations & observability</a><span>Metrics, logs, traces, health, and the evidence used during incidents.</span></li>
</ul>
