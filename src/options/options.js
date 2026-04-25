// Live Highlighter - Options Page Logic (Groups Architecture)

(function ()
{
  'use strict';

  // Access namespace
  const { Storage, PRESET_COLOURS, MAX_GROUPS, MAX_WORDS_PER_GROUP, MAX_TOTAL_WORDS, MAX_IMPORT_FILE_BYTES, NOTIFICATION_TIMEOUT_MS, i18n } = LiveHighlighter;

  // Helper for translated messages
  const msg = (key, substitutions) => i18n.getMessage(key, substitutions);

  // DOM elements
  let groupsList;
  let emptyState;
  let groupCountSpan;
  let maxGroupsSpan;
  let totalWordCountSpan;
  let maxTotalWordsSpan;
  let addGroupBtn;
  let globalToggle;
  let groupTemplate;
  let wordChipTemplate;

  // State
  let groups = [];
  let draggedElement = null;
  let dragOverElement = null;
  let expandedGroupIds = new Set(); // Track which groups are expanded

  // ============================================================================
  // Initialization
  // ============================================================================

  async function init()
  {
    console.log('Live Highlighter: Options page initializing');

    // Apply translations
    LiveHighlighter.i18n.applyTranslations();

    // Get DOM elements
    groupsList = document.getElementById('groupsList');
    emptyState = document.getElementById('emptyState');
    groupCountSpan = document.getElementById('groupCount');
    maxGroupsSpan = document.getElementById('maxGroups');
    totalWordCountSpan = document.getElementById('totalWordCount');
    maxTotalWordsSpan = document.getElementById('maxTotalWords');
    addGroupBtn = document.getElementById('addGroupBtn');
    globalToggle = document.getElementById('globalToggle');
    groupTemplate = document.getElementById('groupTemplate');
    wordChipTemplate = document.getElementById('wordChipTemplate');

    // Set max limits
    maxGroupsSpan.textContent = MAX_GROUPS;
    maxTotalWordsSpan.textContent = MAX_TOTAL_WORDS;

    // Load current state
    await loadGroups();
    await loadGlobalEnabled();

    // Set up event listeners
    addGroupBtn.addEventListener('click', handleAddGroup);
    globalToggle.addEventListener('click', handleGlobalToggle);

    // Listen for storage changes from other tabs
    Storage.onStorageChanged(handleStorageChange);

    // Single document-level listener to close color dropdowns when clicking outside
    document.addEventListener('click', (e) =>
    {
      if (!e.target.closest('.group-color-picker')) {
        document.querySelectorAll('.color-dropdown.show').forEach(dropdown =>
        {
          dropdown.classList.remove('show');
        });
        document.querySelectorAll('[aria-haspopup="listbox"]').forEach(btn =>
        {
          btn.setAttribute('aria-expanded', 'false');
        });
      }
    });

    console.log('Live Highlighter: Options page initialized');
  }

  // ============================================================================
  // Loading and Rendering
  // ============================================================================

  async function loadGroups()
  {
    groups = await Storage.getGroups();
    renderGroups();
  }

  async function loadGlobalEnabled()
  {
    const enabled = await Storage.getEnabled();
    const toggleSlider = globalToggle.querySelector('.toggle-slider');
    if (enabled) {
      toggleSlider.classList.add('active');
    } else {
      toggleSlider.classList.remove('active');
    }
    globalToggle.setAttribute('aria-checked', enabled.toString());
  }

  function renderGroups()
  {
    // Clear current list
    groupsList.innerHTML = '';

    // Show/hide empty state
    if (groups.length === 0) {
      emptyState.style.display = 'flex';
      groupsList.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      groupsList.style.display = 'flex';

      // Sort groups by order
      const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

      // Auto-expand the sole group when it has no words yet
      if (sortedGroups.length === 1 && sortedGroups[0].words.length === 0) {
        expandedGroupIds.add(sortedGroups[0].id);
      }

      // Mark list when only one group exists (hides drag handle via CSS)
      groupsList.classList.toggle('single-group', sortedGroups.length === 1);

      // Render each group
      sortedGroups.forEach((group, index) =>
      {
        const groupElement = createGroupElement(group, index);
        groupsList.appendChild(groupElement);
      });
    }

    // Show help section only when no words are configured yet
    const totalWordsForHelp = groups.reduce((sum, g) => sum + g.words.length, 0);
    const helpSection = document.querySelector('.help-section');
    if (helpSection) {
      helpSection.style.display = totalWordsForHelp === 0 ? 'block' : 'none';
    }

    // Update counts
    updateCounts();
  }

  function updateCounts()
  {
    const totalWords = groups.reduce((sum, g) => sum + g.words.length, 0);

    groupCountSpan.textContent = groups.length;
    totalWordCountSpan.textContent = totalWords;

    // Disable add group button if at limit
    addGroupBtn.disabled = groups.length >= MAX_GROUPS;
  }

  // ============================================================================
  // Group Element Creation
  // ============================================================================

  function createGroupElement(group, index)
  {
    const template = groupTemplate.content.cloneNode(true);
    const groupItem = template.querySelector('.group-item');

    // Apply translations to cloned template
    LiveHighlighter.i18n.applyTranslations(groupItem);

    // Set group ID
    groupItem.dataset.groupId = group.id;

    // Set group name (read-only by default with edit button)
    const nameDisplay = groupItem.querySelector('.group-name-display');
    const nameInput = groupItem.querySelector('.group-name-input');
    const editNameBtn = groupItem.querySelector('.edit-name-btn');

    nameDisplay.textContent = group.name;
    nameInput.value = group.name;

    // Click on name display or edit button to switch to edit mode
    const activateNameEdit = (e) =>
    {
      e.stopPropagation(); // Don't trigger header expansion
      nameDisplay.style.display = 'none';
      editNameBtn.style.display = 'none';
      nameInput.style.display = 'inline-block';
      nameInput.focus();
      nameInput.select();
    };
    nameDisplay.addEventListener('click', activateNameEdit);
    editNameBtn.addEventListener('click', activateNameEdit);

    // Save on blur
    nameInput.addEventListener('blur', async () =>
    {
      await handleGroupNameChange(group.id, nameInput.value);
      // Switch back to display mode
      nameDisplay.style.display = 'inline-block';
      editNameBtn.style.display = 'inline-flex';
      nameInput.style.display = 'none';
    });

    // Save on Enter
    nameInput.addEventListener('keypress', (e) =>
    {
      if (e.key === 'Enter') {
        nameInput.blur();
      }
    });

    // Set color
    setupColorPicker(groupItem, group);

    // Set word count
    updateGroupWordCount(groupItem, group);

    // Set enabled state
    const toggleElement = groupItem.querySelector('.group-toggle');
    const toggleSlider = groupItem.querySelector('.toggle-slider');

    // Set initial visual and ARIA state
    if (group.enabled) {
      toggleSlider.classList.add('active');
    }
    toggleElement.setAttribute('aria-checked', group.enabled.toString());
    toggleElement.setAttribute('aria-label', group.name);

    // Handle toggle click
    toggleElement.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't trigger header expansion
      handleGroupToggle(group.id, !group.enabled);
    });

    // Expand/collapse functionality
    const expandBtn = groupItem.querySelector('.expand-btn');
    const wordsSection = groupItem.querySelector('.group-words');
    const groupHeader = groupItem.querySelector('.group-header');

    // Function to toggle expansion
    const toggleExpansion = () =>
    {
      const isExpanded = wordsSection.style.display !== 'none';
      wordsSection.style.display = isExpanded ? 'none' : 'block';
      expandBtn.classList.toggle('expanded', !isExpanded);
      expandBtn.setAttribute('aria-expanded', (!isExpanded).toString());

      // Track expanded state
      if (isExpanded) {
        expandedGroupIds.delete(group.id);
      } else {
        expandedGroupIds.add(group.id);
      }
    };

    // Restore expanded state if this group was previously expanded
    if (expandedGroupIds.has(group.id)) {
      wordsSection.style.display = 'block';
      expandBtn.classList.add('expanded');
      expandBtn.setAttribute('aria-expanded', 'true');
    }

    // Click anywhere on header to expand/collapse
    groupHeader.addEventListener('click', (e) =>
    {
      // Don't toggle if clicking directly on interactive elements
      if (e.target.closest('.drag-handle') ||
          e.target.closest('.color-button') ||
          e.target.closest('.color-dropdown') ||
          e.target.closest('.group-name-display') ||
          e.target.closest('.edit-name-btn') ||
          e.target.closest('.group-name-input') ||
          e.target.closest('.group-toggle') ||
          e.target.closest('.delete-group-btn') ||
          e.target.closest('.expand-btn')) {
        return;
      }
      toggleExpansion();
    });

    // Also allow expand button to work
    expandBtn.addEventListener('click', (e) =>
    {
      e.stopPropagation(); // Prevent double-toggle from header click
      toggleExpansion();
    });

    // Render words
    renderWords(groupItem, group);

    // Delete button
    const deleteBtn = groupItem.querySelector('.delete-group-btn');
    deleteBtn.setAttribute('aria-label', msg('deleteGroupAriaLabel', [group.name]));
    deleteBtn.addEventListener('click', () => handleDeleteGroup(group.id));

    // Drag and drop
    setupGroupDragDrop(groupItem);

    return groupItem;
  }

  function updateGroupWordCount(groupElement, group)
  {
    const wordCountSpan = groupElement.querySelector('.word-count');
    wordCountSpan.textContent = `${group.words.length} / ${MAX_WORDS_PER_GROUP} ${msg('words')}`;

    // Add visual warning when at limit
    if (group.words.length >= MAX_WORDS_PER_GROUP) {
      wordCountSpan.classList.add('at-limit');
    } else {
      wordCountSpan.classList.remove('at-limit');
    }
  }

  function setupColorPicker(groupElement, group)
  {
    const colorButton = groupElement.querySelector('.color-button');
    const colorPreview = groupElement.querySelector('.color-preview');
    const colorDropdown = groupElement.querySelector('.color-dropdown');

    // Set current color and aria-label on trigger
    colorPreview.style.backgroundColor = group.colour;
    const currentPreset = PRESET_COLOURS.find(p => p.hex === group.colour);
    colorButton.setAttribute('aria-label', msg('colourPickerLabel', [currentPreset ? currentPreset.name : msg('colourCustom')]));
    colorButton.setAttribute('aria-haspopup', 'listbox');
    colorButton.setAttribute('aria-expanded', 'false');

    // Build color dropdown
    PRESET_COLOURS.forEach(preset =>
    {
      const colorOption = document.createElement('button');
      colorOption.type = 'button';
      colorOption.className = 'color-option';
      colorOption.setAttribute('role', 'option');
      colorOption.setAttribute('aria-label', preset.name);
      if (preset.hex === group.colour) {
        colorOption.classList.add('selected');
        colorOption.setAttribute('aria-selected', 'true');
      } else {
        colorOption.setAttribute('aria-selected', 'false');
      }

      const colorSwatch = document.createElement('div');
      colorSwatch.className = 'color-swatch';
      colorSwatch.style.backgroundColor = preset.hex;

      const colorName = document.createElement('span');
      colorName.className = 'color-name';
      colorName.textContent = preset.name;

      colorOption.appendChild(colorSwatch);
      colorOption.appendChild(colorName);

      colorOption.addEventListener('click', async () =>
      {
        await handleGroupColorChange(group.id, preset.hex);
        colorDropdown.classList.remove('show');
        colorButton.setAttribute('aria-expanded', 'false');
        colorButton.focus();
      });

      colorDropdown.appendChild(colorOption);
    });

    const openDropdown = () =>
    {
      colorDropdown.classList.add('show');
      colorButton.setAttribute('aria-expanded', 'true');
      // Focus the currently selected option, or the first one
      const selected = colorDropdown.querySelector('.selected') || colorDropdown.querySelector('button');
      if (selected) setTimeout(() => selected.focus(), 0);
    };

    const closeDropdown = () =>
    {
      colorDropdown.classList.remove('show');
      colorButton.setAttribute('aria-expanded', 'false');
    };

    // Toggle dropdown
    colorButton.addEventListener('click', (e) =>
    {
      e.preventDefault();
      e.stopPropagation();

      const wasShown = colorDropdown.classList.contains('show');

      // Close all other dropdowns first
      document.querySelectorAll('.color-dropdown.show').forEach(dropdown =>
      {
        dropdown.classList.remove('show');
      });
      document.querySelectorAll('[aria-haspopup="listbox"]').forEach(btn =>
      {
        btn.setAttribute('aria-expanded', 'false');
      });

      if (!wasShown) {
        openDropdown();
      }
    });

    // Keyboard navigation inside dropdown
    colorDropdown.addEventListener('keydown', (e) =>
    {
      const options = [...colorDropdown.querySelectorAll('button')];
      const idx = options.indexOf(document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        options[(idx + 1) % options.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        options[(idx - 1 + options.length) % options.length].focus();
      } else if (e.key === 'Escape') {
        closeDropdown();
        colorButton.focus();
      }
    });

    // Prevent dropdown clicks from closing it or expanding header
    colorDropdown.addEventListener('click', (e) =>
    {
      e.stopPropagation();
    });
  }

  // ============================================================================
  // Word Rendering
  // ============================================================================

  function renderWords(groupElement, group)
  {
    const wordsList = groupElement.querySelector('.words-list');
    wordsList.innerHTML = '';

    // Render each word as a chip
    group.words.forEach(word =>
    {
      const wordChip = createWordChip(group.id, word);
      wordsList.appendChild(wordChip);
    });

    // Setup add word input
    const addWordInput = groupElement.querySelector('.add-word-input');
    const addWordBtn = groupElement.querySelector('.add-word-btn');

    // Check if group is at word limit
    const atLimit = group.words.length >= MAX_WORDS_PER_GROUP;

    // Clear any existing event listeners by cloning the button and input
    const newAddWordBtn = addWordBtn.cloneNode(true);
    addWordBtn.replaceWith(newAddWordBtn);
    const newAddWordInput = addWordInput.cloneNode(true);
    addWordInput.replaceWith(newAddWordInput);

    // Disable input and button if at limit
    if (atLimit) {
      newAddWordInput.disabled = true;
      newAddWordInput.placeholder = msg('placeholderMaxWordsReached', [MAX_WORDS_PER_GROUP.toString()]);
      newAddWordBtn.disabled = true;
    } else {
      newAddWordInput.disabled = false;
      newAddWordInput.placeholder = msg('addWordsPlaceholder');
      newAddWordBtn.disabled = false;
    }

    // Add event listeners
    newAddWordBtn.addEventListener('click', async () =>
    {
      await handleAddWord(group.id, newAddWordInput.value);
      newAddWordInput.value = '';
    });

    newAddWordInput.addEventListener('keypress', async (e) =>
    {
      if (e.key === 'Enter') {
        await handleAddWord(group.id, newAddWordInput.value);
        newAddWordInput.value = '';
      }
    });

    // Import button setup
    const importWordsBtn = groupElement.querySelector('.import-words-btn');
    const importWordsFile = groupElement.querySelector('.import-words-file');
    const newImportBtn = importWordsBtn.cloneNode(true);
    importWordsBtn.replaceWith(newImportBtn);
    const newImportFile = importWordsFile.cloneNode(true);
    importWordsFile.replaceWith(newImportFile);

    newImportBtn.disabled = atLimit;

    newImportBtn.addEventListener('click', () => newImportFile.click());
    newImportFile.addEventListener('change', async (e) =>
    {
      const file = e.target.files[0];
      if (!file) return;
      await handleImportWords(group.id, file);
      newImportFile.value = '';
    });

    // Prevent info link click from toggling the checkbox (it's inside a <label>)
    const infoLink = groupElement.querySelector('.info-link');
    if (infoLink) {
      infoLink.addEventListener('click', (e) => e.stopPropagation());
    }

    // Setup match option checkboxes
    const useRegexCheckbox = groupElement.querySelector('.use-regex-checkbox');
    const matchWholeWordCheckbox = groupElement.querySelector('.match-whole-word-checkbox');
    const caseSensitiveCheckbox = groupElement.querySelector('.case-sensitive-checkbox');

    // Set initial checkbox state (default to false for backward compatibility)
    useRegexCheckbox.checked = group.useRegex || false;
    matchWholeWordCheckbox.checked = group.matchWholeWord || false;
    caseSensitiveCheckbox.checked = group.caseSensitive || false;

    // If regex is enabled, disable the other two checkboxes
    if (group.useRegex) {
      matchWholeWordCheckbox.disabled = true;
      caseSensitiveCheckbox.disabled = true;
      matchWholeWordCheckbox.closest('.match-option').classList.add('disabled');
      caseSensitiveCheckbox.closest('.match-option').classList.add('disabled');
    }

    // Handle regex checkbox changes
    useRegexCheckbox.addEventListener('change', async () =>
    {
      const isRegex = useRegexCheckbox.checked;
      await handleMatchOptionChange(group.id, 'useRegex', isRegex);

      if (isRegex) {
        // Disable and uncheck the other two options
        matchWholeWordCheckbox.disabled = true;
        caseSensitiveCheckbox.disabled = true;
        matchWholeWordCheckbox.closest('.match-option').classList.add('disabled');
        caseSensitiveCheckbox.closest('.match-option').classList.add('disabled');

        if (matchWholeWordCheckbox.checked) {
          matchWholeWordCheckbox.checked = false;
          await handleMatchOptionChange(group.id, 'matchWholeWord', false);
        }
        if (caseSensitiveCheckbox.checked) {
          caseSensitiveCheckbox.checked = false;
          await handleMatchOptionChange(group.id, 'caseSensitive', false);
        }
      } else {
        // Re-enable the other two options
        matchWholeWordCheckbox.disabled = false;
        caseSensitiveCheckbox.disabled = false;
        matchWholeWordCheckbox.closest('.match-option').classList.remove('disabled');
        caseSensitiveCheckbox.closest('.match-option').classList.remove('disabled');
      }
    });

    // Handle other checkbox changes
    matchWholeWordCheckbox.addEventListener('change', async () =>
    {
      await handleMatchOptionChange(group.id, 'matchWholeWord', matchWholeWordCheckbox.checked);
    });

    caseSensitiveCheckbox.addEventListener('change', async () =>
    {
      await handleMatchOptionChange(group.id, 'caseSensitive', caseSensitiveCheckbox.checked);
    });
  }

  function createWordChip(groupId, word)
  {
    const template = wordChipTemplate.content.cloneNode(true);
    const chip = template.querySelector('.word-chip');

    // Apply translations to cloned template
    LiveHighlighter.i18n.applyTranslations(chip);

    chip.dataset.word = word;
    chip.querySelector('.word-text').textContent = word;

    const removeBtn = chip.querySelector('.remove-word-btn');
    removeBtn.setAttribute('aria-label', msg('removeWordAriaLabel', [word]));
    removeBtn.addEventListener('click', () => handleRemoveWord(groupId, word));

    return chip;
  }

  // ============================================================================
  // Event Handlers - Groups
  // ============================================================================

  async function handleAddGroup()
  {
    if (groups.length >= MAX_GROUPS) {
      showNotification(msg('notifMaxGroupsReached', [MAX_GROUPS.toString()]), 'error');
      return;
    }

    // Get next color (cycle through preset colors)
    const nextColorIndex = groups.length % PRESET_COLOURS.length;
    const nextColor = PRESET_COLOURS[nextColorIndex].hex;

    const newGroup = await Storage.addGroup(msg('defaultGroupName', [(groups.length + 1).toString()]), nextColor);
    if (newGroup) {
      await loadGroups();
      showNotification(msg('notifGroupAdded'), 'success');

      // Auto-expand the new group and track it
      expandedGroupIds.add(newGroup.id);
      setTimeout(() =>
      {
        const newGroupElement = document.querySelector(`[data-group-id="${newGroup.id}"]`);
        if (newGroupElement) {
          const expandBtn = newGroupElement.querySelector('.expand-btn');
          const wordsSection = newGroupElement.querySelector('.group-words');
          wordsSection.style.display = 'block';
          expandBtn.classList.add('expanded');

          // Focus on group name input
          const nameInput = newGroupElement.querySelector('.group-name-input');
          if (nameInput) {
            nameInput.style.display = 'inline-block';
            const nameDisplay = newGroupElement.querySelector('.group-name-display');
            const editBtn = newGroupElement.querySelector('.edit-name-btn');
            if (nameDisplay) nameDisplay.style.display = 'none';
            if (editBtn) editBtn.style.display = 'none';
            nameInput.focus();
            nameInput.select();
          }
        }
      }, 100);
    } else {
      showNotification(msg('notifFailedAddGroup'), 'error');
    }
  }

  async function handleDeleteGroup(groupId)
  {
    if (confirm(msg('confirmDeleteGroup'))) {
      const success = await Storage.deleteGroup(groupId);
      if (success) {
        await loadGroups();
        showNotification(msg('notifGroupDeleted'), 'success');
      } else {
        showNotification(msg('notifFailedDeleteGroup'), 'error');
      }
    }
  }

  async function handleGroupNameChange(groupId, newName)
  {
    if (!newName || !newName.trim()) {
      showNotification(msg('notifGroupNameEmpty'), 'error');
      await loadGroups();  // Revert
      return;
    }

    const success = await Storage.updateGroup(groupId, { name: newName.trim() });
    if (success) {
      // Update the display without full reload to avoid closing the group
      const group = groups.find(g => g.id === groupId);
      if (group) {
        group.name = newName.trim();
        const groupElement = document.querySelector(`[data-group-id="${groupId}"]`);
        if (groupElement) {
          const nameDisplay = groupElement.querySelector('.group-name-display');
          nameDisplay.textContent = newName.trim();
        }
      }
    } else {
      showNotification(msg('notifFailedUpdateName'), 'error');
      await loadGroups();  // Revert
    }
  }

  async function handleGroupColorChange(groupId, newColor)
  {
    const preset = PRESET_COLOURS.find(p => p.hex === newColor);
    const success = await Storage.updateGroup(groupId, {
      colour: newColor,
      textColor: preset ? preset.textColor : '#000000'
    });

    if (success) {
      await loadGroups();
      showNotification(msg('notifColorUpdated'), 'success');
    } else {
      showNotification(msg('notifFailedUpdateColor'), 'error');
    }
  }

  async function handleGroupToggle(groupId, enabled)
  {
    const success = await Storage.updateGroup(groupId, { enabled });
    if (success) {
      // Update local state
      const group = groups.find(g => g.id === groupId);
      if (group) {
        group.enabled = enabled;
      }

      // Update visual and ARIA state
      const groupElement = document.querySelector(`[data-group-id="${groupId}"]`);
      if (groupElement) {
        const toggleSlider = groupElement.querySelector('.toggle-slider');
        const toggleEl = groupElement.querySelector('.group-toggle');
        if (enabled) {
          toggleSlider.classList.add('active');
        } else {
          toggleSlider.classList.remove('active');
        }
        if (toggleEl) toggleEl.setAttribute('aria-checked', enabled.toString());
      }
    } else {
      showNotification(msg('notifFailedToggleGroup'), 'error');
      await loadGroups();  // Revert
    }
  }

  async function handleMatchOptionChange(groupId, option, value)
  {
    const updates = { [option]: value };
    const success = await Storage.updateGroup(groupId, updates);

    if (success) {
      // Update local state
      const group = groups.find(g => g.id === groupId);
      if (group) {
        group[option] = value;
      }
    } else {
      showNotification(msg('notifFailedUpdateMatch'), 'error');
      await loadGroups();  // Revert
    }
  }

  // ============================================================================
  // Event Handlers - Words
  // ============================================================================

  async function handleAddWord(groupId, word)
  {
    if (!word || !word.trim()) {
      return;
    }

    // Parse input: handle quoted strings and split by comma or space
    const words = parseWordInput(word);

    if (words.length === 0) {
      return;
    }

    // Add each word
    let successCount = 0;
    let failedWords = [];
    let skippedWords = [];

    for (const [i, singleWord] of words.entries()) {
      const canAdd = await Storage.canAddWord(groupId);
      if (!canAdd) {
        skippedWords = words.slice(i);
        break; // Stop adding if limit reached
      }

      const success = await Storage.addWordToGroup(groupId, singleWord);
      if (success) {
        successCount++;
      } else {
        failedWords.push(singleWord);
      }
    }

    // Reload once after all additions
    await loadGroups();

    // Show error notifications only (success is implied by words appearing)
    if (failedWords.length > 0) {
      showNotification(msg('notifFailedAddWords', [failedWords.join(', ')]), 'error');
    }

    if (skippedWords.length > 0) {
      const group = groups.find(g => g.id === groupId);
      if (group && group.words.length >= MAX_WORDS_PER_GROUP) {
        showNotification(msg('notifLimitReached', [skippedWords.join(', ')]), 'error');
      } else {
        showNotification(msg('notifTotalLimitReached', [skippedWords.join(', ')]), 'error');
      }
    }
  }

  async function handleRemoveWord(groupId, word)
  {
    const success = await Storage.removeWordFromGroup(groupId, word);
    if (success) {
      await loadGroups();
    } else {
      showNotification(msg('notifFailedRemoveWord'), 'error');
    }
  }

  async function handleImportWords(groupId, file)
  {
    if (file.size > MAX_IMPORT_FILE_BYTES) {
      const maxKB = Math.round(MAX_IMPORT_FILE_BYTES / 1024);
      showNotification(msg('notifImportFileTooBig', [maxKB.toString()]), 'error');
      return;
    }

    let text;
    try {
      text = await readFileAsText(file);
    } catch (e) {
      showNotification(msg('notifImportError'), 'error');
      return;
    }

    const words = text.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (words.length === 0) {
      showNotification(msg('notifImportEmpty'), 'info');
      return;
    }

    const { added, duplicates, skipped } = await Storage.addWordsToGroup(groupId, words);

    await loadGroups();

    const parts = [];
    if (added > 0) parts.push(msg('notifImportAdded', [added.toString()]));
    if (duplicates > 0) parts.push(msg('notifImportDuplicates', [duplicates.toString()]));
    if (skipped > 0) parts.push(msg('notifImportLimitReached', [skipped.toString()]));

    if (parts.length > 0) {
      const type = skipped > 0 ? 'error' : 'info';
      showNotification(parts.join('. ') + '.', type);
    }
  }

  function readFileAsText(file)
  {
    return new Promise((resolve, reject) =>
    {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // ============================================================================
  // Event Handlers - Global
  // ============================================================================

  async function handleGlobalToggle()
  {
    const toggleSlider = globalToggle.querySelector('.toggle-slider');
    const currentEnabled = await Storage.getEnabled();
    const newEnabled = !currentEnabled;

    const success = await Storage.setEnabled(newEnabled);

    if (success) {
      // Update visual state
      if (newEnabled) {
        toggleSlider.classList.add('active');
      } else {
        toggleSlider.classList.remove('active');
      }
      globalToggle.setAttribute('aria-checked', newEnabled.toString());
    } else {
      showNotification(msg('notifFailedUpdateSetting'), 'error');
    }
  }

  // ============================================================================
  // Drag and Drop
  // ============================================================================

  function setupGroupDragDrop(groupElement)
  {
    // Drag start
    groupElement.addEventListener('dragstart', (e) =>
    {
      draggedElement = groupElement;
      groupElement.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    // Drag end
    groupElement.addEventListener('dragend', () =>
    {
      groupElement.classList.remove('dragging');
      draggedElement = null;
      dragOverElement = null;

      // Remove all drag-over classes
      document.querySelectorAll('.drag-over').forEach(el =>
      {
        el.classList.remove('drag-over');
      });
    });

    // Drag over
    groupElement.addEventListener('dragover', (e) =>
    {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (draggedElement && draggedElement !== groupElement) {
        dragOverElement = groupElement;
        groupElement.classList.add('drag-over');
      }
    });

    // Drag leave
    groupElement.addEventListener('dragleave', () =>
    {
      groupElement.classList.remove('drag-over');
    });

    // Drop
    groupElement.addEventListener('drop', async (e) =>
    {
      e.preventDefault();
      groupElement.classList.remove('drag-over');

      if (!draggedElement || draggedElement === groupElement) {
        return;
      }

      // Get all group elements in current order
      const allGroupElements = Array.from(groupsList.querySelectorAll('.group-item'));

      // Remove dragged element from its current position
      const draggedIndex = allGroupElements.indexOf(draggedElement);
      const dropIndex = allGroupElements.indexOf(groupElement);

      if (draggedIndex === dropIndex) {
        return;
      }

      // Reorder in DOM
      if (draggedIndex < dropIndex) {
        groupElement.after(draggedElement);
      } else {
        groupElement.before(draggedElement);
      }

      // Get new order
      const reorderedElements = Array.from(groupsList.querySelectorAll('.group-item'));
      const orderedIds = reorderedElements.map(el => el.dataset.groupId);

      // Save new order
      const success = await Storage.reorderGroups(orderedIds);
      if (success) {
        await loadGroups();
      } else {
        showNotification(msg('notifFailedReorder'), 'error');
        await loadGroups();  // Revert
      }
    });
  }

  // ============================================================================
  // Word Parsing Helper
  // ============================================================================

  /**
   * Parse word input handling quoted strings and comma/space separation
   * Examples:
   *   "Alice Bob Charlie" -> ["Alice", "Bob", "Charlie"]
   *   "Alice, Bob, Charlie" -> ["Alice", "Bob", "Charlie"]
   *   '"hey there" test' -> ["hey there", "test"]
   *   '"error message", "warning text"' -> ["error message", "warning text"]
   */
  function parseWordInput(input)
  {
    const words = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (char === '"') {
        // Toggle quote state
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === ' ') && !inQuotes) {
        // Separator outside quotes - save current word
        if (current.trim()) {
          words.push(current.trim());
          current = '';
        }
      } else {
        // Regular character - add to current word
        current += char;
      }
    }

    // Don't forget the last word
    if (current.trim()) {
      words.push(current.trim());
    }

    return words;
  }

  // ============================================================================
  // Storage Change Listener
  // ============================================================================

  function handleStorageChange(changes, area)
  {
    // Reload groups if changed in another tab
    if (changes.groups) {
      loadGroups();
    }

    if (changes.enabled) {
      loadGlobalEnabled();
    }
  }

  // ============================================================================
  // Notifications
  // ============================================================================

  function showNotification(message, type = 'info', persistent = false)
  {
    // Create toast notification
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Icon based on type
    const icon = document.createElement('div');
    icon.className = 'notification-icon';
    if (type === 'error') {
      icon.textContent = '⚠';
    } else if (type === 'success') {
      icon.textContent = '✓';
    } else {
      icon.textContent = 'ℹ';
    }

    // Message
    const messageEl = document.createElement('div');
    messageEl.className = 'notification-message';
    messageEl.textContent = message;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', msg('closeNotification'));

    // Assemble notification
    notification.appendChild(icon);
    notification.appendChild(messageEl);
    notification.appendChild(closeBtn);

    // Add to container
    container.appendChild(notification);

    // Close button handler
    const closeNotification = () =>
    {
      notification.classList.add('hiding');
      setTimeout(() =>
      {
        if (notification.parentElement) {
          notification.parentElement.removeChild(notification);
        }
      }, 300); // Match animation duration
    };

    closeBtn.addEventListener('click', closeNotification);

    // Auto-dismiss notifications unless marked as persistent
    if (!persistent) {
      setTimeout(closeNotification, NOTIFICATION_TIMEOUT_MS);
    }
  }

  // ============================================================================
  // Initialize on page load
  // ============================================================================

  document.addEventListener('DOMContentLoaded', init);

})();
