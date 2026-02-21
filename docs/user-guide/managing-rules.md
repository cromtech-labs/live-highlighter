# Managing Groups

Learn how to organise, edit, and maintain your highlight groups.

## Accessing the Options Page

To manage your groups:

1. Click the Live Highlighter icon in your browser toolbar
2. Click **Manage Groups** in the popup

## Reordering Groups

### Why Order Matters

When text matches words in multiple groups, **only the first matching group applies**. Group order determines which highlight wins when there's a conflict.

### Example

If you have these groups (in order):

1. "production" → Red
2. "prod" → Orange

The text "production" will be highlighted in red because it matches the first group before reaching the second.

### How to Reorder

1. Open the options page
2. Click and hold the drag handle (⋮⋮) next to a group
3. Drag the group up or down
4. Release to drop it in the new position
5. Changes are saved automatically

!!! tip "Ordering strategy"
    Place more specific groups above more general ones:

    1. "production-database" → Red (most specific)
    2. "production" → Orange
    3. "prod" → Yellow (catch-all)

!!! info
    The drag handle is hidden when you only have one group.

## Toggling Groups On/Off

Temporarily disable a group without deleting it:

1. Open the options page
2. Click the toggle switch next to the group
3. Disabled groups are greyed out and won't highlight anything

**When to toggle off:**

- Testing a different highlighting scheme
- Temporarily reducing visual clutter
- Keeping seasonal or context-specific groups ready but inactive

## Editing a Group

To rename a group or change its colour:

- **Name:** Click the group name text (or the pencil icon) to edit it inline
- **Colour:** Click the colour swatch in the group header to open the colour picker, then select a new colour

Changes are saved automatically.

## Adding and Removing Words

To add a word to an existing group:

1. Expand the group by clicking its header
2. Type a word or phrase in the input field
3. Press **Enter** or click **Add**

To remove a word, click the × on its chip.

## Deleting Groups

To permanently remove a group and all its words:

1. Open the options page
2. Click the delete icon (🗑️) next to the group
3. Confirm the deletion

!!! warning "No undo"
    Deleted groups cannot be recovered.

## Global Toggle

The toggle at the top of the options page (and in the popup) disables all highlighting across every tab without changing your groups. Use this to quickly pause highlighting and re-enable it later.

## Organising Large Setups

### Group by Purpose

Use descriptive group names so your setup stays readable:

- "Cloud: Production" → Red
- "Cloud: Staging" → Yellow
- "Cloud: Dev" → Green
- "Logs: Errors" → Pink
- "Logs: Warnings" → Orange

### Regular Maintenance

Periodically review your groups:

- Remove groups you no longer use
- Tune matching options if you're seeing false positives
- Reorder groups based on current priorities

## Performance

- Live Highlighter uses the CSS Custom Highlight API — no DOM modification
- Highlighting is fast even with many groups and words
- A debounced observer re-highlights after DOM mutations (e.g., lazy-loaded content)
- Works in iframes and shadow DOM within the same page

## Troubleshooting

### Groups Not Applying

If a group isn't highlighting:

1. Check that the group is enabled (toggle should be on)
2. Check that global highlighting is enabled (popup toggle)
3. Verify the word exists on the page with the correct spelling
4. Check if case sensitivity is enabled and the case matches
5. Check if a higher-priority group is matching the same text first

### Unexpected Highlights

If text is highlighting unexpectedly:

1. Review group order — a more general group might be matching first
2. Enable **Match whole word** to prevent partial matches
3. Make your words more specific

## Next Steps

- Learn more about [matching options](creating-rules.md#text-matching)
- Explore [use cases](use-cases.md) for different scenarios
