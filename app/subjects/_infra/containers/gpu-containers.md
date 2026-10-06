---
title: "How containers use GPUs"
description: "Separate host GPU drivers and devices from CUDA userspace libraries and inference software inside a container."
chapter: containers
order: 2
sequence: 102
level: Core
mermaid: true
keywords:
  - GPU container
  - NVIDIA driver
  - CUDA
  - device plugin
  - NVIDIA Container Toolkit
aliases:
  - container GPU access
tools:
  - NVIDIA Container Toolkit
  - Docker
  - Kubernetes
interview_queries:
  - how does Docker access a GPU
  - is the NVIDIA driver inside the container
references:
  - title: NVIDIA Container Toolkit installation guide
    url: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html
---

A container does not contain a physical GPU.

A useful split is:

{% capture diagram_code %}
flowchart TD
subgraph C["Container"]
A["Application / vLLM"]
B["PyTorch + CUDA userspace"]
A --> B
end
B --> D["Host NVIDIA driver"]
D --> E["Physical GPU"]
{% endcapture %}
{% capture diagram_fallback %}
Container: application/vLLM → PyTorch + CUDA userspace libraries → host NVIDIA driver → physical GPU
{% endcapture %}
{% include diagram.html title="The container uses a host GPU through the host driver" code=diagram_code fallback=diagram_fallback caption=true %}

## The host owns the hardware and kernel driver

The machine has the physical GPU and an installed NVIDIA driver that talks to the hardware.

The container commonly carries the application, framework, and compatible CUDA userspace libraries.

Container tooling exposes selected GPU devices and required host capabilities into the container.

This is why GPU containers still have host compatibility requirements. Containerization does not make an arbitrary host driver/GPU combination disappear.

## Kubernetes schedules a resource; the runtime executes on it

A Kubernetes node can advertise GPU resources, commonly through NVIDIA's device integration.

A Pod can request something conceptually like:

```yaml
resources:
  limits:
    nvidia.com/gpu: 4
```

Kubernetes uses that resource request for placement.

Once the container starts, the inference runtime uses the exposed GPUs through CUDA and related libraries.

So:

`Kubernetes scheduler → which node/GPU resources are assigned?`

`inference runtime → how is model computation executed on those GPUs?`

## Multi-GPU communication adds another layer

If one distributed process uses several GPUs, communication libraries such as NCCL coordinate data exchange. The physical path can involve NVLink/NVSwitch, PCIe, or network fabrics across nodes.

That is a performance/topology issue on top of basic device access.

The next chapter moves from one container host to cluster orchestration: [Kubernetes]({{ '/infrastructure/kubernetes/overview/' | relative_url }}).
