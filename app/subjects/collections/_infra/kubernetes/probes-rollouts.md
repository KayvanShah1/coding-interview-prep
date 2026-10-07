---
title: "Startup, readiness, liveness, and rollouts"
nav_title: "Probes & rollouts"
description: "Use each Kubernetes health signal for the action it controls, then connect readiness to safe Deployment rollouts."
chapter: kubernetes
order: 4
sequence: 204
level: Core
keywords:
  - startup probe
  - readiness probe
  - liveness probe
  - rolling update
  - maxSurge
  - maxUnavailable
aliases:
  - Kubernetes health checks
tools:
  - Kubernetes
interview_queries:
  - readiness vs liveness probe
  - what is a startup probe
  - how does a Kubernetes rolling update work
references:
  - title: Kubernetes liveness, readiness, and startup probes
    url: https://kubernetes.io/docs/concepts/workloads/pods/probes/
  - title: Kubernetes Deployments
    url: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
---

The three probes should not be explained as three versions of “is it healthy?”

## Startup: has initialization completed?

A startup probe protects slow-starting applications from being treated as dead before they have had a reasonable chance to initialize.

While startup has not succeeded, Kubernetes does not run the normal liveness/readiness probes.

This is useful for applications with predictable long initialization, including large language model (LLM) servers.

## Readiness: should new traffic come here?

A readiness failure removes the Pod from normal Service traffic.

The process can remain alive while temporarily unable to serve: it may still be warming, reloading, or recovering from a dependency issue.

For LLM serving, readiness should wait until the intended model is loaded enough to serve. A bound web port only proves that the process is listening.

## Liveness: should the container be restarted?

Liveness is for a process that is stuck or unhealthy in a way where restarting the container is the appropriate recovery action.

Do not use liveness as a proxy for transient load. A busy service should not be restarted simply because latency rose.

## Rollouts depend on readiness

A Deployment replacement can bring up new Pods while old Pods still serve.

Only after new Pods become ready should they count as available capacity.

Settings such as `maxSurge` and `maxUnavailable` control the temporary capacity envelope during rollout.

For large graphics processing unit (GPU) workloads, those numbers can translate directly into expensive temporary accelerator demand. The mechanics are generic Kubernetes; the cost profile is workload-specific.

The next chapter separates scaling the workload from scaling the cluster: [Scaling]({{ '/infrastructure/scaling/overview/' | relative_url }}).
