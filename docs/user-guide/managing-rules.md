# Managing Rules

Learn how to organize, edit, and maintain your highlight rules.

## Accessing Rule Management

To access the rule management interface:

1. Click the Live Highlighter icon in your browser toolbar
2. Click "Manage Rules" button in the popup

## Reordering Rules

### Why Order Matters

When text matches multiple rules, **only the first matching rule applies**. This means rule order determines which highlight appears when there's a conflict.

### Example

If you have these rules:

1. "production" → Red
2. "prod" → Orange

The text "production" will be highlighted in red because it matches the first rule before reaching the second.

### How to Reorder

1. Open the rule management interface
2. Click and hold the drag handle (⋮⋮) next to a rule
3. Drag the rule up or down
4. Release to drop it in the new position
5. Changes are saved automatically

!!! tip "Ordering Strategy"
    Place more specific rules above more general ones:

    ```
    1. "production-database" → Red
    2. "production" → Orange
    3. "prod" → Yellow
    ```

## Toggling Rules On/Off

Temporarily disable rules without deleting them:

1. Open the rule management interface
2. Locate the toggle switch next to the rule
3. Click to toggle between enabled (on) and disabled (off)
4. Disabled rules are grayed out

**When to toggle off:**

- Testing different highlighting schemes
- Temporarily reducing visual clutter
- Keeping seasonal or context-specific rules

## Editing Rules

Currently, to modify a rule:

1. Note the text and colour of the existing rule
2. Delete the rule
3. Create a new rule with the updated settings

!!! info "Future Enhancement"
    Direct rule editing is planned for a future release.

## Deleting Rules

To permanently remove a rule:

1. Open the rule management interface
2. Click the delete icon (🗑️) next to the rule
3. Confirm the deletion in the popup dialog

!!! warning "No Undo"
    Deleted rules cannot be recovered. Make sure you don't need the rule before deleting.

## Organizing Large Rule Sets

### Group by Purpose

Organize rules mentally or with naming conventions:

```
Cloud Environments:
  - "production" → Red
  - "staging" → Yellow
  - "dev" → Green

Status Messages:
  - "ERROR" → Red
  - "WARNING" → Orange
  - "SUCCESS" → Green
```

### Regular Maintenance

Periodically review your rules:

- Remove rules you no longer use
- Update rules that aren't working as expected
- Reorder rules based on what you need most

### Export and Backup

!!! info "Future Feature"
    Export/import functionality is planned for a future release. For now, all rules are stored in your browser's local storage.

## Performance Considerations

- Live Highlighter is optimized for performance
- No noticeable impact even with many rules
- Highlighting happens instantly as pages load
- Rules work on all frames within a page

## Troubleshooting

### Rules Not Applying

If a rule isn't working:

1. Check if the rule is enabled (toggle should be on)
2. Verify the text matches exactly (case-sensitive)
3. Check if a higher rule is matching first
4. Try refreshing the page

### Unexpected Highlights

If text is highlighting unexpectedly:

1. Review rule order - a more general rule might be matching first
2. Make your rules more specific
3. Check for partial matches (e.g., "prod" in "product")

## Next Steps

- Learn more about [creating effective rules](creating-rules.md)
- Explore [use cases](use-cases.md) for different scenarios
