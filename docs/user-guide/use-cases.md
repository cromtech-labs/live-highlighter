# Use Cases

Discover how Live Highlighter can make your work easier and safer.

## Cloud Environment Management

### The Problem

When managing cloud resources, it's easy to accidentally modify production resources when you meant to change development or staging. The consequences can be severe - downtime, data loss, or security incidents.

### The Solution

Create environment-based highlights:

```
1. "production" → Red
2. "prod-" → Red
3. "staging" → Yellow
4. "stage-" → Yellow
5. "development" → Green
6. "dev-" → Green
```

**Benefits:**

- Instantly spot production resources
- Reduce accidental production changes
- Quick visual confirmation before making changes

### Real-World Example

In AWS Console, GCP Cloud Console, or Azure Portal, resource names like:

- `prod-database-cluster` → Highlighted in red
- `staging-api-server` → Highlighted in yellow
- `dev-test-instance` → Highlighted in green

## Status and Error Monitoring

### The Problem

Scanning through logs, dashboards, or monitoring tools to find errors or warnings is time-consuming and error-prone.

### The Solution

Highlight status keywords:

```
1. "ERROR" → Red
2. "CRITICAL" → Red
3. "WARNING" → Orange
4. "WARN" → Orange
5. "SUCCESS" → Green
6. "INFO" → Blue
```

**Benefits:**

- Errors jump out immediately
- Faster incident response
- Better situational awareness

### Real-World Example

In application logs or monitoring dashboards:

- `[ERROR] Connection timeout` → Red highlight on "ERROR"
- `[WARNING] High memory usage` → Orange highlight on "WARNING"
- `[SUCCESS] Deployment complete` → Green highlight on "SUCCESS"

## Security and Compliance

### The Problem

Security misconfigurations like unencrypted connections or public access can slip through manual reviews.

### The Solution

Highlight security-relevant terms:

```
1. "unencrypted" → Red
2. "http://" → Orange
3. "public" → Yellow
4. "private" → Green
5. "encrypted" → Green
```

**Benefits:**

- Catch security issues during configuration
- Visual reminder of security posture
- Faster security audits

### Real-World Example

In configuration interfaces:

- `Connection: unencrypted` → Red highlight
- `Access: public` → Yellow highlight
- `Protocol: http://api.example.com` → Orange highlight

## Content Moderation

### The Problem

Content moderators need to quickly identify flagged keywords in large volumes of user-generated content.

### The Solution

Highlight moderation keywords:

```
1. "spam" → Red
2. "reported" → Orange
3. "pending-review" → Yellow
4. "approved" → Green
```

**Benefits:**

- Faster content review
- Consistent flagging
- Reduced cognitive load

## Sales and CRM

### The Problem

In CRM systems, tracking deal stages and priority levels across multiple pages requires constant context switching.

### The Solution

Highlight deal stages and priorities:

```
1. "Hot Lead" → Red
2. "Warm Lead" → Orange
3. "Cold Lead" → Blue
4. "Closed Won" → Green
5. "Closed Lost" → Red
```

**Benefits:**

- Quick deal pipeline overview
- Priority awareness
- Better time management

## Data Quality Monitoring

### The Problem

Identifying data quality issues like null values, missing data, or invalid formats in data tables or admin interfaces.

### The Solution

Highlight data quality indicators:

```
1. "null" → Red
2. "undefined" → Red
3. "missing" → Orange
4. "invalid" → Orange
5. "N/A" → Yellow
```

**Benefits:**

- Quick data quality assessment
- Faster identification of issues
- Better data governance

## DevOps and CI/CD

### The Problem

Monitoring build statuses, deployment pipelines, and infrastructure health across multiple dashboards.

### The Solution

Highlight build and deployment states:

```
1. "failed" → Red
2. "failing" → Red
3. "pending" → Yellow
4. "running" → Blue
5. "success" → Green
6. "deployed" → Green
```

**Benefits:**

- Immediate build failure awareness
- Faster incident response
- Better pipeline monitoring

## Network Administration

### The Problem

Managing network devices and configurations with different environments and criticality levels.

### The Solution

Highlight network contexts:

```
1. "production-network" → Red
2. "core-router" → Red
3. "staging-network" → Yellow
4. "test-network" → Green
5. "offline" → Red
6. "online" → Green
```

**Benefits:**

- Prevent network misconfigurations
- Quick status assessment
- Safer network changes

## Tips for Success

### Start Simple

Begin with 3-5 high-value rules and expand as needed.

### Be Consistent

Use the same colours for similar concepts across different use cases (e.g., always use red for critical/production).

### Review Regularly

Your needs change over time. Review and update rules monthly.

### Combine Use Cases

You can mix rules from multiple use cases:

```
1. "production" → Red (Cloud)
2. "ERROR" → Red (Monitoring)
3. "unencrypted" → Orange (Security)
4. "pending" → Yellow (Status)
```

## Share Your Use Case

Have a creative use case for Live Highlighter? We'd love to hear about it! Visit our [Support page](../about/support.md) to share your story.
