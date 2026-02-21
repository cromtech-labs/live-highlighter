# Creating Rules

Learn how to create effective highlight rules for your needs.

## Rule Basics

Each highlight rule consists of two components:

1. **Text to match:** The string you want to highlight
2. **Colour:** The highlight colour to apply

## Text Matching

### Exact Matching

Live Highlighter matches text exactly as you enter it:

- "Production" will match "Production" but not "production"
- "error" will match "error" but not "Error"

### Case Sensitivity

Text matching is case-sensitive. If you want to match both "Error" and "error", create two separate rules.

### Partial Matching

Rules match text anywhere it appears:

- A rule for "prod" will highlight "prod" in "production", "products", etc.
- Be specific to avoid unwanted matches

## Available Colours

Live Highlighter provides 6 carefully selected colours:

| Colour | Common Uses |
|--------|-------------|
| Red | Critical items, production environments, errors |
| Orange | Warnings, important but not critical items |
| Yellow | Staging environments, caution items |
| Green | Safe items, dev environments, success messages |
| Blue | Informational items, secondary highlights |
| Purple | Custom categories, special cases |

!!! tip "Colour Psychology"
    Consider using red for critical/dangerous items, yellow for caution, and green for safe items. This follows common colour conventions and makes highlights more intuitive.

## Creating Effective Rules

### Be Specific

**Good:**
- "api.production.company.com"
- "[PROD]"
- "environment: production"

**Not recommended:**
- "prod" (too broad, matches "product", "production", etc.)
- "test" (matches too many unrelated words)

### Use Consistent Patterns

If your systems use consistent naming conventions, leverage them:

- Create rules for environment prefixes: "prod-", "staging-", "dev-"
- Highlight status tags: "[ERROR]", "[WARNING]", "[INFO]"
- Target specific fields: "Status: Active", "Type: Critical"

### Prioritize Important Rules

Since rules are processed top-to-bottom, place more important or specific rules higher in the list:

1. "production-database" (red) - specific and critical
2. "production" (red) - general production items
3. "prod" (orange) - catch-all for prod-related items

## Rule Limits

- No hard limit on number of rules
- Performance remains fast even with many rules
- Consider your actual needs - more rules aren't always better

## Examples by Use Case

### Cloud Environment Management

```
1. "production" → Red
2. "staging" → Yellow
3. "development" → Green
```

### Log Monitoring

```
1. "ERROR" → Red
2. "WARN" → Orange
3. "INFO" → Blue
4. "SUCCESS" → Green
```

### Security Monitoring

```
1. "unencrypted" → Red
2. "http://" → Orange
3. "public" → Yellow
```

## Next Steps

- Learn how to [manage your rules](managing-rules.md) effectively
- Explore more [use cases](use-cases.md) for inspiration
