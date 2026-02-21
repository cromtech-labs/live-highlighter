# Quick Start

Get up and running with Live Highlighter in just a few steps.

## Creating Your First Group

1. **Open the options page**
   - Click the Live Highlighter icon in your browser toolbar
   - Click **Manage Groups** in the popup

2. **Add a group**
   - Click **Add Group**
   - Enter a name for the group (e.g., "Environments")
   - Choose a highlight colour from the 10 available options

3. **Add words to the group**
   - Expand the group by clicking its header
   - Type a word or phrase in the input field and press **Enter** (or click **Add**)
   - Repeat for each word you want highlighted in that colour

4. **See it in action**
   - Visit any webpage — your words will automatically appear highlighted
   - No page refresh needed

## Managing Your Groups

### Reordering Groups

Groups are processed in order from top to bottom. When text matches words in multiple groups, **the first matching group wins**.

To reorder groups:

1. Open the options page via **Manage Groups** in the popup
2. Click and hold the drag handle (⋮⋮) next to a group
3. Drag the group up or down to change its priority
4. Changes are saved automatically

### Toggling Groups On/Off

Temporarily disable an entire group without deleting it:

1. Open the options page
2. Click the toggle switch next to any group
3. Disabled groups won't highlight until re-enabled

### Deleting Groups or Words

To remove a group:

1. Open the options page
2. Click the delete icon (🗑️) next to the group
3. Confirm the deletion

To remove a single word, click the × next to the word chip inside the group.

## Example: Highlighting Environments

Let's set up a practical example for cloud environment management:

1. Click **Add Group**, name it "Environments", choose **Red**
2. Add the word "production" to the group
3. Click **Add Group** again, name it "Staging", choose **Yellow**
4. Add "staging" to that group
5. Click **Add Group**, name it "Dev", choose **Green**
6. Add "dev" to that group
7. Visit your cloud console

Now environment names will automatically pop with colour, helping you avoid costly mistakes.

## Tips for Effective Highlighting

- **Be specific:** Highlight unique identifiers rather than common words to avoid unwanted matches
- **Use meaningful colours:** Red for danger/production, yellow for caution/staging, green for safe/dev
- **Use whole word matching:** Enable "Match whole word" on a group to avoid partial matches (e.g., "prod" matching "product")
- **Order matters:** Place more specific or important groups above general ones
- **Use regex for patterns:** Enable the Regex option for advanced matching like `error|warn|fail`

## Next Steps

- Learn more about [groups and words](../user-guide/creating-rules.md)
- Explore [use cases](../user-guide/use-cases.md) for inspiration
- Check the [FAQ](../reference/faq.md) for common questions
