# Groups & Words

Learn how to create effective highlight groups for your needs.

## How It Works

Live Highlighter uses a **groups** architecture. Each group has:

- A **name** to help you organise your highlights
- A **colour** applied to all words in the group
- One or more **words or phrases** to match
- Optional **matching options** (whole word, case sensitive, regex)

This lets you manage related words together — for example, a "Errors" group with "error", "exception", and "fatal".

## Adding a Group

1. Open the options page via the popup → **Manage Groups**
2. Click **Add Group**
3. Enter a group name and choose a colour
4. Expand the group and start adding words

## Adding Words

Type a word or phrase in the input field and press **Enter** or click **Add**. Each word appears as a chip inside the group. Click the × on any chip to remove it.

**Limits:**

- Up to **10 groups** per extension
- Up to **20 words** per group
- Up to **200 words** total across all groups

## Text Matching

By default, Live Highlighter does a **case-insensitive partial match** — so "error" will match "Error", "errors", "proofreader", etc.

You can change this behaviour per group using the matching options (expand the **Matching options** section inside a group):

### Match Whole Word

When enabled, the word must appear as a complete word, not as part of a larger word.

- `error` **matches:** "There was an error." "The error code is 404."
- `error` **does not match:** "errors", "proofreader", "error-prone"

### Case Sensitive

When enabled, matching is exact — uppercase and lowercase are treated differently.

- `Error` **matches:** "Error"
- `Error` **does not match:** "error", "ERROR"

### Regex

When enabled, the word is treated as a JavaScript regular expression. This is the most powerful matching option.

- `error|warn|fail` matches any of those three words
- `\[ERROR\]` matches the literal string "[ERROR]"
- `prod(uction)?` matches both "prod" and "production"

!!! tip "Testing regex"
    Use [regexr.com](https://regexr.com/) to build and test your patterns before adding them.

!!! info "Regex and other options"
    When Regex is enabled, the Whole Word and Case Sensitive options are disabled — you can express these within the regex itself (e.g., add `\b` for word boundaries or use `(?-i)` for case sensitivity).

## Available Colours

Live Highlighter provides 10 carefully selected colours, all WCAG AA compliant with black text:

| Colour | Hex | Common Uses |
|--------|-----|-------------|
| Yellow | `#FFF59D` | General highlights, caution items |
| Orange | `#FFCC80` | Warnings, important but not critical |
| Cyan | `#80DEEA` | Informational items |
| Pink | `#F48FB1` | Custom categories, special cases |
| Green | `#A5D6A7` | Safe items, dev environments, success |
| Lavender | `#CE93D8` | Secondary categories |
| Blue | `#BBDEFB` | Informational, secondary highlights |
| Peach | `#FFCCBC` | Soft warnings, secondary items |
| Teal | `#B2DFDB` | Additional environments or categories |
| Indigo | `#C5CAE9` | Background categories |

!!! tip "Colour strategy"
    Use red/orange for critical items, yellow for caution, and green for safe items. This follows common conventions and makes highlights more intuitive at a glance.

## Creating Effective Groups

### Be Specific

**Good:**
- "api.production.company.com"
- "[PROD]"
- "environment: production"

**Be careful with:**
- "prod" — also matches "product", "production", "deproduced" (use **Match whole word** to avoid this)
- "test" — matches too many unrelated words

### Use Consistent Patterns

Leverage your system's naming conventions:

- Environment prefixes: "prod-", "staging-", "dev-"
- Status tags: "[ERROR]", "[WARNING]", "[INFO]"
- Specific fields: "Status: Active", "Type: Critical"

### Prioritize Important Groups

Since groups are processed top-to-bottom, place more important or specific groups higher:

1. "production-database" (red) — specific and critical
2. "production" (red) — general production items
3. "prod" (orange) — catch-all for prod-related items

## Examples by Use Case

### Cloud Environment Management

**Group: Production** (Red)
```
production
```

**Group: Staging** (Yellow)
```
staging
```

**Group: Development** (Green)
```
development
dev
```

### Log Monitoring

**Group: Errors** (Red) — with Regex enabled
```
error|exception|fatal|critical
```

**Group: Warnings** (Orange)
```
warn
warning
```

**Group: Success** (Green)
```
success
ok
passed
```

### Security Monitoring

**Group: Unsafe** (Red)
```
unencrypted
http://
public
```

## Next Steps

- Learn how to [manage your groups](managing-rules.md) effectively
- Explore more [use cases](use-cases.md) for inspiration
