---
title: "Workload versus node autoscaling"
description: "Place HPA, KEDA, the Kubernetes scheduler, and Karpenter in the order they affect replicas and machine capacity."
chapter: scaling
order: 1
sequence: 301
level: Core
mermaid: true
keywords:
  - Horizontal Pod Autoscaler
  - HPA
  - KEDA
  - Karpenter
  - Pending pod
  - node autoscaling
aliases:
  - pod autoscaling vs node autoscaling
tools:
  - Kubernetes
  - HPA
  - KEDA
  - Karpenter
interview_queries:
  - HPA vs Karpenter
  - KEDA vs HPA
  - what happens when Kubernetes has no room for a new pod
references:
  - title: Kubernetes Horizontal Pod Autoscaler
    url: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
  - title: KEDA scaling Deployments and StatefulSets
    url: https://keda.sh/docs/2.21/concepts/scaling-deployments/
  - title: Karpenter documentation
    url: https://karpenter.sh/docs/
---

Autoscaling moves through a sequence of desired states.

{% capture diagram_code %}
flowchart TD
A["Metric / event"] --> B["HPA or KEDA + HPA"]
B --> C["Workload replicas increase"]
C --> D["New Pod"]
D --> E["Scheduler"]
E --> F{"Suitable node has capacity?"}
F -- "Yes" --> G["Run Pod"]
F -- "No" --> H["Pod Pending / unschedulable"]
H --> I["Node autoscaler / Karpenter"]
I --> J["Provision node"]
J --> E
{% endcapture %}
{% capture diagram_fallback %}
Metric/event → HPA or KEDA/HPA → replica count increases → new Pod → scheduler. If no suitable node has capacity, Pod stays Pending → Karpenter/node autoscaler provisions node → scheduler places Pod.
{% endcapture %}
{% include diagram.html title="Replica demand reaches machine provisioning only when needed" code=diagram_code fallback=diagram_fallback caption=true %}

## HPA changes workload replica count

The Horizontal Pod Autoscaler (HPA) watches configured metrics and updates the scale target, commonly a Deployment or StatefulSet.

It changes workload replicas; machine provisioning is handled elsewhere.

The workload controller reacts to the new desired replica count by creating or removing Pods.

## KEDA supplies scaling signals and activation behavior

Kubernetes Event-driven Autoscaling (KEDA) monitors supported external/event sources and can feed metrics into Kubernetes/HPA scaling.

For Deployment-style workloads, KEDA handles activation from zero where configured and HPA manages the active 1-to-N scaling phase using the metrics KEDA exposes.

KEDA therefore covers one part of the scaling path rather than the entire Kubernetes autoscaling system.

## The scheduler tries to place every new Pod

A new Pod can run only if a node satisfies its resource requests and placement constraints.

If no node fits, the Pod remains Pending/unschedulable.

That state is evidence that workload demand exists but machine capacity does not.

## Node autoscaling changes the cluster

Karpenter watches unschedulable Pods, evaluates their requests/constraints, and provisions nodes that can run them.

The new node joins the cluster; then the scheduler can place the waiting Pod.

This is particularly visible with GPUs because a requested accelerator may not exist on any current node.

## Scale-down has the same two layers

When workload replicas shrink, nodes can become unnecessary. Node lifecycle systems can consolidate or terminate underused capacity subject to their policies and disruption constraints.

The application-level scaling decision and infrastructure-cost decision remain related but separate.

Next: [Operations & observability]({{ '/infrastructure/observability/overview/' | relative_url }}).
