---
title: "Operations & observability"
nav_title: "Overview"
description: "Use metrics, logs, traces, and health state together to explain what a distributed workload is doing."
chapter: observability
order: 0
sequence: 400
level: "Chapter overview"
keywords:
  - observability
  - metrics
  - logs
  - traces
  - monitoring
aliases:
  - telemetry
tools:
  - OpenTelemetry
  - Prometheus
  - Grafana
interview_queries:
  - metrics vs logs vs traces
  - what is observability
references:
  - title: OpenTelemetry documentation
    url: https://opentelemetry.io/docs/
  - title: OpenTelemetry signals
    url: https://opentelemetry.io/docs/concepts/signals/
---

Monitoring tells you whether known conditions are healthy. Observability gives you enough evidence to investigate why a system is behaving the way it is, including failures you did not predefine exactly.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/infrastructure/observability/metrics-logs-traces/' | relative_url }}">Metrics, logs, and traces</a><span>Use each signal for the questions it answers best and correlate them through request/context identifiers.</span></li>
</ul>
