---
title: "Kubernetes Services and networking"
nav_title: "Services & networking"
description: "Understand why Pods need stable service discovery and how cluster and external traffic reach changing backends."
chapter: kubernetes
order: 2
sequence: 202
level: Core
keywords:
  - Kubernetes Service
  - ClusterIP
  - LoadBalancer
  - Gateway API
  - EndpointSlice
  - pod IP
aliases:
  - service discovery
tools:
  - Kubernetes
interview_queries:
  - why do you need a Kubernetes Service
  - how does traffic reach Kubernetes pods
references:
  - title: Kubernetes Services, Load Balancing, and Networking
    url: https://kubernetes.io/docs/concepts/services-networking/
  - title: Connecting Applications with Services
    url: https://kubernetes.io/docs/tutorials/services/connect-applications-service/
---

Pods are replaceable. Their individual IPs should not become the durable address your clients depend on.

A Kubernetes **Service** gives a changing set of backend Pods a stable network identity.

## Pod addresses are not the service contract

A Deployment can remove one Pod and create another. The new Pod can have a different IP.

If callers were configured directly against Pod IPs, normal rollout and failure recovery would break their routing assumptions.

A Service selects eligible backends and provides a stable name/address over that changing set.

## The flow

```text
client
  ↓
Service / Gateway / external load balancer
  ↓
EndpointSlice / backend selection
  ↓
ready Pod
```

Readiness matters here. A Pod that exists but is not ready should not be treated like a healthy backend for ordinary Service traffic.

## Internal and external exposure are different concerns

Inside the cluster, Services provide stable discovery between workloads.

For traffic entering the cluster, common options include:

- a `LoadBalancer` Service backed by cloud infrastructure;
- Gateway API implementations;
- Ingress in existing deployments.

The exact path depends on environment, but keep the layers distinct:

`external edge → cluster service/routing → Pod`.

## Kubernetes networking is broader than load balancing

The cluster network also gives Pods network reachability and supports policy controls.

For system design, the important idea is that Kubernetes is maintaining **endpoint membership** as Pods change. Your application or upstream router can target a stable service rather than discovering every Pod itself.

Next: [Storage and init containers]({{ '/infrastructure/kubernetes/storage-init-containers/' | relative_url }}).
