---
title: "Scaling"
nav_title: "Overview"
description: "Separate the desired number of workload replicas from the number and type of machines available to place them."
chapter: scaling
order: 0
sequence: 300
level: "Chapter overview"
keywords:
  - horizontal scaling
  - HPA
  - KEDA
  - cluster autoscaler
  - Karpenter
aliases:
  - Kubernetes autoscaling
tools:
  - HPA
  - KEDA
  - Karpenter
interview_queries:
  - HPA vs cluster autoscaler
  - how does Kubernetes autoscaling work
references:
  - title: Kubernetes Horizontal Pod Autoscaler
    url: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
  - title: Karpenter documentation
    url: https://karpenter.sh/docs/
---

“Autoscaling Kubernetes” can mean two different actions.

```text
workload scaling
→ change how many replicas should exist

node scaling
→ change how much machine capacity exists
```

A healthy design knows which loop is waiting on the other.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/infrastructure/scaling/workload-node-autoscaling/' | relative_url }}">Workload versus node autoscaling</a><span>Place HPA, KEDA, Kubernetes scheduling, and Karpenter in one control flow.</span></li>
</ul>
