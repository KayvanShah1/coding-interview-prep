---
title: "Storage and init containers"
description: "Use volumes for data whose lifecycle differs from a container and init containers for setup that must finish before the application starts."
chapter: kubernetes
order: 3
sequence: 203
level: Core
keywords:
  - PersistentVolume
  - PVC
  - volume mount
  - init container
  - shared volume
aliases:
  - Kubernetes storage
  - initialization container
tools:
  - Kubernetes
interview_queries:
  - what is an init container
  - how do pods access persistent storage
  - how do you download a model before the main container starts
references:
  - title: Kubernetes Init Containers
    url: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/
  - title: Kubernetes Volumes
    url: https://kubernetes.io/docs/concepts/storage/volumes/
---

Container filesystems are useful for packaged software and temporary runtime state. Data with a different lifecycle should be modeled separately.

## Volumes give containers another storage lifecycle

A Pod can mount volumes into one or more containers.

Depending on the volume type, the data may be:

- ephemeral for the Pod;
- backed by node-local storage;
- backed by a PersistentVolume;
- provided by a network or cloud storage system;
- generated from configuration/secrets.

The design question is: **what should survive container replacement, and where should the authoritative copy live?**

## Init containers run before the app containers

Kubernetes init containers run to completion during Pod initialization. Each configured init container must succeed before the next one and before the normal application containers start.

That is useful for setup work such as:

```text
fetch artifact
verify checksum
render configuration
wait for dependency
prepare shared volume
```

For an LLM deployment:

```text
init container
   ↓ downloads / verifies checkpoint
shared volume
   ↓
vLLM application container
```

The serving process does not need to own every model-distribution concern.

## Do not use an init container merely because setup exists

If the main application can safely and efficiently load its own immutable artifact, an extra init layer may add complexity without benefit.

Use it when ordering and separation are operationally useful.

## Persistent volume does not guarantee fast startup

A model available through shared storage may avoid a remote internet download while still being slower to read than local NVMe. Several replicas starting at once can also contend for storage bandwidth.

Storage location, caching, and startup time are separate measurements.

Next: [Startup, readiness, liveness, and rollouts]({{ '/infrastructure/kubernetes/probes-rollouts/' | relative_url }}).
