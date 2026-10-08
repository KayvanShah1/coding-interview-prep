---
title: "Schema evolution in real-time pipelines"
description: "Roll out event schema changes across producers, stream processors, state, and sinks without losing or misreading events."
chapter: processing
order: 2
sequence: 502
level: Core
keywords:
  - streaming schema evolution
  - event schema
  - schema registry
  - Avro
  - Protobuf
  - Kafka
  - Pub/Sub
  - backward compatibility
  - forward compatibility
  - Flink savepoints
  - Dataflow pipeline updates
  - dead-letter queues
interview_queries:
  - how do you handle schema changes in real time data pipelines
  - how do Kafka consumers handle events with different schema versions
  - how do you update a stateful Dataflow or Flink streaming pipeline
---

An order producer adds `discount_amount` at noon. Some service instances still publish the old event, while others publish the new one. A consumer is hours behind and may first encounter the older version. A streaming aggregation also has window state written by yesterday's code. The warehouse might be able to add a nullable column, but that fixes only one part of the deployment.

Streaming schema evolution is a **rolling compatibility and state-migration problem**. Batch pipelines can often be changed and verified between scheduled runs. A real-time pipeline stays alive while old and new messages, application versions, buffered records and sometimes persisted processing state coexist.

## A streaming pipeline may have no Bronze, Silver or Gold

Consider a low-latency payment risk service:

~~~text
payment API
  → Kafka topic: payments.events
  → Flink / Kafka Streams: detect unusual velocity
  → risk service or alert topic
  → separate sink for analytics
~~~

There may be no warehouse transformation between the event and the decision. The contract at the **topic** and the expectations inside the **stream processor** govern the application. Another stream may simultaneously archive events to object storage and write BigQuery tables for analytics.

A medallion design is possible for continuous ingestion, but it is not required. The same structural change can be harmless for an archival sink, rejected by a streaming parser and dangerous for an online risk calculation. Schema acceptance needs to be decided at each interface.

## Three compatibilities to check

| Interface | What can break | Mechanism |
| --- | --- | --- |
| Producer → event log → consumer | An old consumer cannot decode a newly written event, or a new consumer cannot replay older records | Versioned event schemas, serializer/deserializer rules, compatibility policy and rollout order |
| Stream processor → checkpointed state | A new job cannot restore an old aggregate, timer, window or key-value state | Compatible serializers, savepoints/checkpoints, upgrade validation or state migration |
| Processor → sink / external consumer | A database rejects a row, a downstream event changes meaning, or a dashboard expects an old field | Sink schema policy, explicit mappings, parallel versions, consumer contracts and reconciliation |

Kafka itself transports bytes; event-schema enforcement depends on the schema registry, serializers, validation in producers/consumers and any configured platform controls. Registering a compatible schema does not automatically rewrite a Kafka Streams topology or a Flink transformation.

## How mixed event versions are decoded

With Avro or Protocol Buffers, producers commonly serialize events against a registered schema and include a **schema identifier** with each message, in an agreed envelope or header. The reader uses that identifier to interpret the writer's schema and then resolves fields against a compatible reader schema. Cache schema lookups in a busy consumer instead of fetching a definition on every message.

For example, a Kafka topic can contain the following logical events:

~~~json
{"schema_version": 1, "payment_id": "p1", "amount": 100}
{"schema_version": 2, "payment_id": "p2", "amount": 200, "discount_amount": 10}
~~~

These JSON records show the idea; a registered Avro or Protobuf message normally uses its own serialization format and metadata. A consumer built for version 2 may default a missing `discount_amount` to zero when reading version 1, **if the serialization format and schema definition support that default**. The consumer's business calculation still has to decide whether zero really means no discount.

For genuinely incompatible changes, one option is an explicit normalizer:

~~~text
payments.events.v1 ─┐
                    ├→ version-aware adapter → payment canonical event → consumers
payments.events.v2 ─┘
~~~

A normalizer may be a stream-processing job or a small service. It maps supported versions to a stable event contract; an unknown or invalid version goes to a classified error path for repair or replay. A new topic/version is often warranted when required fields, keys, or business meaning change incompatibly.

## Backward, forward and full compatibility: deployment order

These terms have precise reader/writer meanings, and permitted field changes vary across Avro, Protobuf and JSON Schema.

| Policy | Guarantee | Typical rollout implication |
| --- | --- | --- |
| `BACKWARD` | New reader can handle data from the previous writer version | Upgrade consumers first, then producers |
| `FORWARD` | Old reader can handle data from the new writer version | Producers can move first, but consumers upgrading afterward may still encounter older retained messages |
| `FULL` | Both reader directions work for the compared versions | Consumers and producers have more freedom to roll independently |
| `*_TRANSITIVE` | Compare against **all** earlier registered versions | Valuable when long-retained data can be replayed months later |

Confluent Schema Registry defaults to `BACKWARD`, not `BACKWARD_TRANSITIVE`. With the non-transitive setting, passing a new-versus-previous check does not prove that a consumer can read every historic version in the topic. Long Kafka retention, disaster recovery and reprocessing often motivate stronger compatibility policies and explicit replay tests.

Upgrade order is particularly important when an old consumer cannot decode the new producer's messages. It also depends on whether the consumer is stateless or stores changelog/state data. Confluent's documentation calls out Kafka Streams separately because the upgraded application may need to read previously serialized state as well as input events.

## What a producer rollout can look like

Suppose the payment team adds an optional `merchant_category` field and the new fraud rules will use it.

1. Define and register a compatible schema version. Test serialization with old/new producer and consumer combinations and with historic retained messages.
2. Upgrade the streaming consumer to accept both versions. The new rule must handle the field being absent until producers are fully updated.
3. Roll out producers gradually. During the overlap, both event versions are valid on the same topic. Monitor decode failures, null/missing rates, consumer lag and the results of risk calculations.
4. Only after event coverage and consumer migration are verified should the business consider making `merchant_category` required or retiring compatibility logic.

If the new attribute is missing for historical events, the correct fallback is a domain decision. Imputing a convenient value can change fraud scores, revenue totals or eligibility logic.

A field rename is more disruptive than an additive optional field. Treat `amount` and `total_amount` as different fields until an explicit alias/mapping is approved; don't assume a serialization format recognizes a rename as equivalent.

## Stateful stream processing adds another migration

Imagine a rolling five-minute payment total keyed by `account_id`. A Flink job keeps per-key aggregates and timers in managed state. Updating the event decoder might be safe, while changing the key type or the serialized aggregate breaks state restoration.

Apache Flink can restore from a **savepoint**, subject to serializer and state compatibility. A supported state schema evolution can migrate compatible serialized state, but arbitrary changes to key types, serializers, operator identity or complex state layouts are not inherently safe. For incompatible changes, teams may need a planned rebuild, explicit state transformation, a new job started from a controlled replay point or parallel processing while the old job drains.

Google Cloud Dataflow has a related but distinct update model. A **replacement job** can preserve intermediate state and in-flight records when its pipeline graph and coders are compatible. The documented schema changes permitted for schema-aware Apache Beam `PCollection` updates include adding fields and making required fields nullable. Removing fields, renaming fields and changing field types are not permitted by that update mechanism. Other pipeline-graph and coder changes may also block replacement. In such cases, Dataflow documents **parallel pipelines** as one migration option. The cutover still needs a strategy for duplicate outputs, in-flight work and sink ownership.

Keep event-wire compatibility and persisted-state compatibility as separate test cases. Passing schema registry checks says nothing about whether the job can restore its checkpoint.

## Pub/Sub → Dataflow → BigQuery on GCP

A real-time GCP implementation might be:

~~~text
application
  → Pub/Sub (Avro / Protobuf schema and revisions)
  → Dataflow / Apache Beam (decode, validate, normalize)
      ├→ BigQuery real-time table
      ├→ Cloud Storage raw archive
      └→ classified invalid-message sink / dead-letter queue
~~~

Pub/Sub can validate published messages against an attached schema and its allowed revisions, rejecting nonconforming publishes. Its schema revisions use stricter compatibility constraints than arbitrary changes to a JSON payload, and consumers can use revision metadata to decode messages. A Pub/Sub topic without a schema attachment does not obtain those checks automatically.

The Dataflow code still defines the output fields and business rules. On an additive event-field change, it may keep writing the old stable BigQuery projection until a reviewed update exposes the new field. The destination needs its own compatible change, and historical rows will not automatically gain meaningful values.

For a disruptive sink migration, parallel pipelines can produce into separate staging tables while a stable view or controlled switchover serves consumers. Avoid having two uncoordinated pipeline versions append duplicate business events to the same production target.

## Malformed messages, replay and a safe cutover

A decoder cannot process an arbitrary future version just because the event contains a schema ID. Decide what happens to an unrecognized schema, malformed value or impossible enum. Depending on the system, reject publication, isolate the record for later repair or route processing failures to a dead-letter queue (DLQ). Put event IDs, schema versions and error reasons in that record; avoid endless retries of permanently malformed messages.

A DLQ is not a substitute for a replay strategy. Document topic retention, archived raw copies, checkpoints/offsets and an idempotent sink key. A pipeline cutover may require comparing old and new outputs for a bounded time window before moving traffic, then verifying counts, keys and business measures.

For a streaming deployment, watch **schema/decoder failures, message age and consumer lag, checkpoint or replacement-job failures, DLQ volume, duplicate sink writes and output discrepancies**. A deployment can be technically healthy while its fraud logic or aggregate amounts are wrong.

## How to choose the mechanism

Use the simplest versioning and migration method that fits the consumer relationship:

- A short-lived internal stream with coordinated deployments can rely on a compatible additive change and tests.
- A shared topic with independently deployed consumers benefits from a registry, clear compatibility policy, schema-aware serializers and consumer ownership.
- A high-impact breaking change often warrants a versioned event or canonical adapter plus an explicit consumer migration.
- A stateful processor requires separate checkpoint/savepoint compatibility testing.
- An analytics sink needs its own stable output contract; its table-evolution settings are a separate decision from event-schema compatibility.

The governing question is: **which producer and consumer versions, historic records, persisted state and downstream sinks must coexist during the rollout?** Once that is explicit, the right approach is easier to choose.

For the warehouse-side version of the problem, including Silver mappings, model contracts and expand-and-contract migrations, see [Schema evolution, data contracts, and safe migrations]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}).

## References

- [Confluent — Schema evolution and compatibility](https://docs.confluent.io/platform/8.2/schema-registry/fundamentals/schema-evolution.html)
- [Confluent — Schema Registry serialization](https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/overview.html)
- [Google Cloud — Pub/Sub schemas](https://docs.cloud.google.com/pubsub/docs/schemas)
- [Google Cloud — Pub/Sub schema revisions](https://docs.cloud.google.com/pubsub/docs/commit-schema-revision)
- [Google Cloud — Updating a Dataflow pipeline](https://docs.cloud.google.com/dataflow/docs/guides/updating-a-pipeline)
- [Google Cloud — Upgrading a streaming pipeline](https://docs.cloud.google.com/dataflow/docs/guides/upgrade-guide)
- [Apache Flink — Checkpoints and savepoints](https://nightlies.apache.org/flink/flink-docs-master/docs/ops/state/checkpoints_vs_savepoints/)
