// Live Highlighter - Options Page Logic

(function ()
{
  'use strict';

  // Access namespace
  const { Storage, PRESET_COLOURS, MAX_RULES } = LiveHighlighter;

  // DOM elements
  let rulesList;
  let emptyState;
  let ruleCountSpan;
  let maxRulesSpan;
  let addRuleBtn;
  let globalToggle;
  let ruleTemplate;

  // State
  let rules = [];
  let draggedElement = null;
  let dragOverElement = null;

  // ============================================================================
  // Initialization
  // ============================================================================

  async function init()
  {
    console.log('Live Highlighter: Options page initializing');

    // Get DOM elements
    rulesList = document.getElementById('rulesList');
    emptyState = document.getElementById('emptyState');
    ruleCountSpan = document.getElementById('ruleCount');
    maxRulesSpan = document.getElementById('maxRules');
    addRuleBtn = document.getElementById('addRuleBtn');
    globalToggle = document.getElementById('globalToggle');
    ruleTemplate = document.getElementById('ruleTemplate');

    // Set max rules
    maxRulesSpan.textContent = MAX_RULES;

    // Load current state
    await loadRules();
    await loadGlobalEnabled();

    // Set up event listeners
    addRuleBtn.addEventListener('click', handleAddRule);
    globalToggle.addEventListener('change', handleGlobalToggle);

    // Listen for storage changes from other tabs
    Storage.onStorageChanged(handleStorageChange);

    console.log('Live Highlighter: Options page initialized');
  }

  // ============================================================================
  // Loading and Rendering
  // ============================================================================

  async function loadRules()
  {
    rules = await Storage.getRules();
    renderRules();
  }

  async function loadGlobalEnabled()
  {
    const enabled = await Storage.getEnabled();
    globalToggle.checked = enabled;
  }

  function renderRules()
  {
    // Clear current list
    rulesList.innerHTML = '';

    // Show/hide empty state
    if (rules.length === 0) {
      emptyState.style.display = 'flex';
      rulesList.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      rulesList.style.display = 'block';

      // Sort rules by order
      const sortedRules = [...rules].sort((a, b) => a.order - b.order);

      // Render each rule
      sortedRules.forEach((rule, index) =>
      {
        const ruleElement = createRuleElement(rule, index);
        rulesList.appendChild(ruleElement);
      });
    }

    // Update count
    updateRuleCount();

    // Update add button state
    addRuleBtn.disabled = rules.length >= MAX_RULES;
  }

  function createRuleElement(rule, index)
  {
    // Clone template
    const clone = ruleTemplate.content.cloneNode(true);
    const ruleItem = clone.querySelector('.rule-item');

    // Set data
    ruleItem.dataset.ruleId = rule.id;

    // Set order number
    const orderDiv = ruleItem.querySelector('.rule-order');
    orderDiv.textContent = index + 1;

    // Set text input
    const textInput = ruleItem.querySelector('.rule-text');
    textInput.value = rule.text;
    textInput.addEventListener('input', () => handleTextEdit(rule.id, textInput.value));
    textInput.addEventListener('blur', () => validateText(textInput, rule.id));

    // Set color picker
    const colorButton = ruleItem.querySelector('.color-button');
    const colorPreview = ruleItem.querySelector('.color-preview');
    const colorDropdown = ruleItem.querySelector('.color-dropdown');

    colorPreview.style.backgroundColor = rule.colour;
    setupColorPicker(colorButton, colorDropdown, rule.id, rule.colour);

    // Set enabled toggle
    const enabledToggle = ruleItem.querySelector('.rule-enabled');
    enabledToggle.checked = rule.enabled;
    enabledToggle.addEventListener('change', () => handleToggleEnabled(rule.id, enabledToggle.checked));

    // Set delete button
    const deleteBtn = ruleItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => handleDeleteRule(rule.id));

    // Set up drag and drop
    setupDragAndDrop(ruleItem);

    return ruleItem;
  }

  function setupColorPicker(button, dropdown, ruleId, currentColour)
  {
    // Create color options
    PRESET_COLOURS.forEach(preset =>
    {
      const option = document.createElement('button');
      option.className = 'color-option';
      option.type = 'button';
      option.innerHTML = `
        <span class="color-swatch" style="background-color: ${preset.hex}"></span>
        <span class="color-name">${preset.name}</span>
        ${preset.hex === currentColour ? '<span class="check">✓</span>' : ''}
      `;
      option.addEventListener('click', () =>
      {
        handleColorChange(ruleId, preset.hex);
        closeColorDropdown(dropdown);
      });
      dropdown.appendChild(option);
    });

    // Toggle dropdown
    button.addEventListener('click', (e) =>
    {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');

      // Close all other dropdowns
      document.querySelectorAll('.color-dropdown.open').forEach(d =>
      {
        d.classList.remove('open');
      });

      if (!isOpen) {
        dropdown.classList.add('open');
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () =>
    {
      closeColorDropdown(dropdown);
    });
  }

  function closeColorDropdown(dropdown)
  {
    dropdown.classList.remove('open');
  }

  function updateRuleCount()
  {
    ruleCountSpan.textContent = rules.length;
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  async function handleAddRule()
  {
    if (rules.length >= MAX_RULES) {
      alert(`Maximum ${MAX_RULES} rules reached. Delete a rule to add a new one.`);
      return;
    }

    // Get first available color (cycle through presets)
    const colorIndex = rules.length % PRESET_COLOURS.length;
    const defaultColor = PRESET_COLOURS[colorIndex].hex;

    // Generate unique placeholder text
    let placeholderText = 'text to highlight';
    let counter = 1;
    while (rules.some(r => r.text.toLowerCase() === placeholderText.toLowerCase())) {
      placeholderText = `text to highlight ${counter}`;
      counter++;
    }

    // Add rule with unique placeholder text
    const newRule = await Storage.addRule(placeholderText, defaultColor);

    if (newRule) {
      await loadRules();

      // Focus and select the text for easy editing
      setTimeout(() =>
      {
        const newRuleElement = document.querySelector(`[data-rule-id="${newRule.id}"]`);
        if (newRuleElement) {
          const textInput = newRuleElement.querySelector('.rule-text');
          textInput.focus();
          textInput.select(); // Select all text so user can start typing
        }
      }, 100);
    } else {
      alert('Failed to add rule. Please try again.');
    }
  }

  async function handleTextEdit(ruleId, newText)
  {
    // Auto-save on input (debounced by browser)
    // Validation happens on blur
  }

  async function validateText(textInput, ruleId)
  {
    const newText = textInput.value.trim();

    if (newText === '') {
      // If empty, delete the rule
      const confirmDelete = confirm('Empty rule will be deleted. Continue?');
      if (confirmDelete) {
        await Storage.deleteRule(ruleId);
        await loadRules();
      } else {
        // Restore previous value
        const rule = rules.find(r => r.id === ruleId);
        if (rule) {
          textInput.value = rule.text;
        }
      }
      return;
    }

    // Check for duplicates
    const duplicate = rules.find(r => r.id !== ruleId && r.text.toLowerCase() === newText.toLowerCase());
    if (duplicate) {
      alert(`Duplicate rule: "${newText}" already exists.`);
      const rule = rules.find(r => r.id === ruleId);
      if (rule) {
        textInput.value = rule.text;
      }
      return;
    }

    // Update the rule
    const success = await Storage.updateRule(ruleId, { text: newText });
    if (success) {
      await loadRules();
    } else {
      alert('Failed to update rule. Please try again.');
    }
  }

  async function handleColorChange(ruleId, newColor)
  {
    const success = await Storage.updateRule(ruleId, { colour: newColor });
    if (success) {
      await loadRules();
    } else {
      alert('Failed to update color. Please try again.');
    }
  }

  async function handleToggleEnabled(ruleId, enabled)
  {
    const success = await Storage.updateRule(ruleId, { enabled });
    if (success) {
      await loadRules();
    } else {
      alert('Failed to toggle rule. Please try again.');
    }
  }

  async function handleDeleteRule(ruleId)
  {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    // Confirm deletion if rule has text
    if (rule.text.trim() !== '') {
      const confirmDelete = confirm(`Delete rule "${rule.text}"?`);
      if (!confirmDelete) return;
    }

    const success = await Storage.deleteRule(ruleId);
    if (success) {
      await loadRules();
    } else {
      alert('Failed to delete rule. Please try again.');
    }
  }

  async function handleGlobalToggle()
  {
    const enabled = globalToggle.checked;
    const success = await Storage.setEnabled(enabled);

    if (!success) {
      alert('Failed to update setting. Please try again.');
      globalToggle.checked = !enabled;
    }
  }

  function handleStorageChange(changes)
  {
    // Reload rules if changed externally
    if (changes.rules || changes.enabled) {
      loadRules();
      loadGlobalEnabled();
    }
  }

  // ============================================================================
  // Drag and Drop
  // ============================================================================

  function setupDragAndDrop(ruleItem)
  {
    ruleItem.addEventListener('dragstart', handleDragStart);
    ruleItem.addEventListener('dragend', handleDragEnd);
    ruleItem.addEventListener('dragover', handleDragOver);
    ruleItem.addEventListener('drop', handleDrop);
    ruleItem.addEventListener('dragenter', handleDragEnter);
    ruleItem.addEventListener('dragleave', handleDragLeave);
  }

  function handleDragStart(e)
  {
    draggedElement = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  }

  function handleDragEnd(e)
  {
    e.currentTarget.classList.remove('dragging');

    // Remove all drag-over classes
    document.querySelectorAll('.rule-item').forEach(item =>
    {
      item.classList.remove('drag-over');
    });

    draggedElement = null;
    dragOverElement = null;
  }

  function handleDragOver(e)
  {
    if (e.preventDefault) {
      e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  function handleDragEnter(e)
  {
    const target = e.currentTarget;
    if (target !== draggedElement) {
      target.classList.add('drag-over');
      dragOverElement = target;
    }
  }

  function handleDragLeave(e)
  {
    e.currentTarget.classList.remove('drag-over');
  }

  async function handleDrop(e)
  {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (!draggedElement || !dragOverElement || draggedElement === dragOverElement) {
      return false;
    }

    // Get the rule IDs
    const draggedId = draggedElement.dataset.ruleId;
    const targetId = dragOverElement.dataset.ruleId;

    // Find the rules
    const draggedRule = rules.find(r => r.id === draggedId);
    const targetRule = rules.find(r => r.id === targetId);

    if (!draggedRule || !targetRule) return false;

    // Reorder the rules array
    const newRules = [...rules];
    const draggedIndex = newRules.findIndex(r => r.id === draggedId);
    const targetIndex = newRules.findIndex(r => r.id === targetId);

    // Remove dragged item and insert at new position
    newRules.splice(draggedIndex, 1);
    newRules.splice(targetIndex, 0, draggedRule);

    // Update order field
    newRules.forEach((rule, index) =>
    {
      rule.order = index;
    });

    // Save to storage
    const orderedIds = newRules.map(r => r.id);
    const success = await Storage.reorderRules(orderedIds);

    if (success) {
      await loadRules();
    } else {
      alert('Failed to reorder rules. Please try again.');
    }

    return false;
  }

  // ============================================================================
  // Initialize on page load
  // ============================================================================

  document.addEventListener('DOMContentLoaded', init);

})();
