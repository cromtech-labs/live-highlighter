# Max Capacity Test - Setup Guide

Quick reference for setting up 10 groups with 20 words each (200 total) for the max-capacity.html test.

## Extension Configuration

Create these groups in Live Highlighter options page:

### Group 1 (Yellow) - Errors & Failures
```
error, failure, failed, exception, fault, bug, crash, critical, emergency, alert, severe, broken, invalid, rejected, timeout, denied, forbidden, unauthorized, conflict, abort
```

### Group 2 (Orange) - Warnings & Issues
```
warning, caution, notice, attention, deprecated, legacy, outdated, review, pending, waiting, delayed, slow, limited, throttled, retry, fallback, degraded, unstable, experimental, beta
```

### Group 3 (Cyan) - Success & Completion
```
success, completed, passed, approved, verified, confirmed, validated, accepted, active, enabled, ready, available, healthy, stable, optimal, live, deployed, published, released, production
```

### Group 4 (Pink) - Data & Storage
```
data, database, storage, cache, memory, disk, volume, backup, restore, snapshot, replica, shard, partition, index, query, table, schema, record, row, column
```

### Group 5 (Green) - API & Network
```
request, response, api, endpoint, service, client, server, host, port, protocol, http, https, rest, graphql, websocket, tcp, udp, dns, proxy, gateway
```

### Group 6 (Lavender) - Users & Auth
```
user, account, profile, session, token, auth, login, logout, password, credential, permission, role, admin, guest, member, owner, viewer, editor, contributor, subscriber
```

### Group 7 (Yellow) - Configuration
```
config, setting, option, parameter, variable, constant, environment, property, attribute, metadata, flag, feature, toggle, switch, preference, default, custom, override, inherit, global
```

### Group 8 (Orange) - Network & Infrastructure
```
network, connection, bandwidth, latency, throughput, packet, route, switch, router, firewall, load, balancer, cdn, edge, origin, upstream, downstream, peer, node, cluster
```

### Group 9 (Cyan) - Monitoring & Observability
```
monitor, metric, log, trace, event, alert, alarm, threshold, dashboard, panel, chart, graph, report, analytics, insight, telemetry, observability, instrumentation, audit, compliance
```

### Group 10 (Pink) - Processing & Execution
```
process, thread, task, job, worker, queue, scheduler, executor, pipeline, workflow, stage, step, phase, cycle, iteration, batch, stream, consumer, producer, handler
```

## Quick Copy-Paste Format

For adding words to each group (comma-separated):

**Group 1:** error, failure, failed, exception, fault, bug, crash, critical, emergency, alert, severe, broken, invalid, rejected, timeout, denied, forbidden, unauthorized, conflict, abort

**Group 2:** warning, caution, notice, attention, deprecated, legacy, outdated, review, pending, waiting, delayed, slow, limited, throttled, retry, fallback, degraded, unstable, experimental, beta

**Group 3:** success, completed, passed, approved, verified, confirmed, validated, accepted, active, enabled, ready, available, healthy, stable, optimal, live, deployed, published, released, production

**Group 4:** data, database, storage, cache, memory, disk, volume, backup, restore, snapshot, replica, shard, partition, index, query, table, schema, record, row, column

**Group 5:** request, response, api, endpoint, service, client, server, host, port, protocol, http, https, rest, graphql, websocket, tcp, udp, dns, proxy, gateway

**Group 6:** user, account, profile, session, token, auth, login, logout, password, credential, permission, role, admin, guest, member, owner, viewer, editor, contributor, subscriber

**Group 7:** config, setting, option, parameter, variable, constant, environment, property, attribute, metadata, flag, feature, toggle, switch, preference, default, custom, override, inherit, global

**Group 8:** network, connection, bandwidth, latency, throughput, packet, route, switch, router, firewall, load, balancer, cdn, edge, origin, upstream, downstream, peer, node, cluster

**Group 9:** monitor, metric, log, trace, event, alert, alarm, threshold, dashboard, panel, chart, graph, report, analytics, insight, telemetry, observability, instrumentation, audit, compliance

**Group 10:** process, thread, task, job, worker, queue, scheduler, executor, pipeline, workflow, stage, step, phase, cycle, iteration, batch, stream, consumer, producer, handler

## Verification

After setup, verify:
- Total groups: 10
- Total words: 200 (20 per group)
- Group order: 1-10 (for priority testing)

Open `file:///D:/live-highlighter/tests/max-capacity.html` to run all tests.
