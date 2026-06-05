const AI_MARKERS = [
  { id: 'ai_word', name: "\"AI mentioned\"", level: 3 },
  { id: 'testament', name: "\"Testament to\"", level: 3 },
  { id: 'dive_deep', name: "\"Dive deep\"", level: 3 },
  { id: 'not_x_but_y', name: "\"It's not X, it's Y\"", level: 2 },
  { id: 'buckle_up', name: "\"Buckle up\"", level: 2 },
  { id: 'game_changer', name: "\"Game-changer\"", level: 2 },
  { id: 'unlock_power', name: "\"Unlock the power of\"", level: 2 },
  { id: 'ever_evolving', name: "\"Ever-evolving\"", level: 2 },
  { id: 'supercharge', name: "\"Supercharge your\"", level: 2 },
  { id: 'ah_the', name: "\"Ah, the\"", level: 2 },
  { id: 'in_conclusion', name: "\"In conclusion\"", level: 2 },
  { id: 'lets_dive_in', name: "\"Let's dive in\"", level: 2 },
  { id: 'important_to_remember', name: "\"It's important to remember\"", level: 2 },
  { id: 'picture_this', name: "\"Picture this\"", level: 2 },
  { id: 'imagine_a_world', name: "\"Imagine a world\"", level: 2 },
  { id: 'in_the_realm_of', name: "\"In the realm of\"", level: 2 },
  { id: 'delve', name: "\"Delve\"", level: 1 },
  { id: 'fast_paced', name: "\"In today's fast-paced\"", level: 1 },
  { id: 'navigating', name: "\"Navigating the complexities\"", level: 1 },
  { id: 'paradigm_shift', name: "\"A paradigm shift\"", level: 1 },
  { id: 'tapestry', name: "\"Tapestry of\"", level: 1 },
  { id: 'transformative', name: "\"Transformative power\"", level: 1 },
  { id: 'as_an_ai', name: "\"As an AI\"", level: 1 }
];

document.addEventListener('DOMContentLoaded', () => {
  const rulesList = document.getElementById('rulesList');
  const slider = document.getElementById('aggressionSlider');
  const lbls = [document.getElementById('lbl1'), document.getElementById('lbl2'), document.getElementById('lbl3')];
  
  function updateSliderLabels(val) {
    lbls.forEach((lbl, index) => {
      lbl.style.color = (index + 1) === val ? '#4f46e5' : '#777';
    });
  }

  function renderList(disabledRules) {
    rulesList.innerHTML = '';
    AI_MARKERS.forEach(marker => {
      const isEnabled = !disabledRules.includes(marker.id);
      
      const div = document.createElement('div');
      div.className = 'rule-item';
      
      const leftCol = document.createElement('div');
      leftCol.className = 'rule-left';
      
      const label = document.createElement('span');
      label.className = 'rule-custom';
      label.textContent = marker.name;
      
      leftCol.appendChild(label);
      
      const switchLabel = document.createElement('label');
      switchLabel.className = 'switch';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isEnabled;
      checkbox.dataset.id = marker.id;
      
      const switchSlider = document.createElement('span');
      switchSlider.className = 'slider-switch';
      
      switchLabel.appendChild(checkbox);
      switchLabel.appendChild(switchSlider);
      
      div.appendChild(leftCol);
      div.appendChild(switchLabel);
      
      rulesList.appendChild(div);
      
      checkbox.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const checked = e.target.checked;
        
        chrome.storage.sync.get(['disabledRules'], (res) => {
          let currentDisabled = res.disabledRules || [];
          if (checked) {
            currentDisabled = currentDisabled.filter(r => r !== id);
          } else {
            if (!currentDisabled.includes(id)) currentDisabled.push(id);
          }
          chrome.storage.sync.set({ disabledRules: currentDisabled });
        });
      });
    });
  }

  const useAIToggle = document.getElementById('useAIToggle');
  const aiConfigPanel = document.getElementById('aiConfigPanel');
  const geminiKeyInput = document.getElementById('geminiKeyInput');
  const saveKeyBtn = document.getElementById('saveKeyBtn');
  const saveStatus = document.getElementById('saveStatus');

  chrome.storage.sync.get(['disabledRules', 'aggressivenessLevel', 'useAI', 'geminiKey'], (result) => {
    const disabledRules = result.disabledRules || [];
    const aggLevel = result.aggressivenessLevel || 3;
    const isAIEnabled = result.useAI || false;
    const key = result.geminiKey || "";
    
    slider.value = aggLevel;
    updateSliderLabels(parseInt(aggLevel));
    renderList(disabledRules);
    
    useAIToggle.checked = isAIEnabled;
    aiConfigPanel.style.display = isAIEnabled ? 'block' : 'none';
    geminiKeyInput.value = key;
    
    updateRulesVisibility();

    // Check for onboarding
    chrome.storage.local.get(['hasSeenOnboarding'], (localRes) => {
      if (!localRes.hasSeenOnboarding && !isAIEnabled) {
        const tooltip = document.getElementById('onboardingTooltip');
        if (tooltip) {
          tooltip.classList.add('visible');
        }
      }
    });
  });

  const tooltipClose = document.getElementById('tooltipClose');
  if (tooltipClose) {
    tooltipClose.addEventListener('click', () => {
      const tooltip = document.getElementById('onboardingTooltip');
      if (tooltip) tooltip.classList.remove('visible');
      chrome.storage.local.set({ hasSeenOnboarding: true });
    });
  }

  function updateRulesVisibility() {
    const isAIOn = useAIToggle.checked;
    const hasKey = geminiKeyInput.value.trim().length > 0;
    const rulesHeader = document.getElementById('rulesHeader');
    const rulesList = document.getElementById('rulesList');
    
    if (isAIOn && hasKey) {
      if (rulesHeader) rulesHeader.style.display = 'none';
      if (rulesList) rulesList.style.display = 'none';
    } else {
      if (rulesHeader) rulesHeader.style.display = 'block';
      if (rulesList) rulesList.style.display = 'block';
    }
  }

  useAIToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    aiConfigPanel.style.display = checked ? 'block' : 'none';
    chrome.storage.sync.set({ useAI: checked });
    
    const toggleStatus = document.getElementById('toggleStatus');
    if (toggleStatus) {
      toggleStatus.style.display = 'inline-block';
      setTimeout(() => toggleStatus.style.display = 'none', 3000);
    }
    
    if (checked) {
      setTimeout(() => geminiKeyInput.focus(), 50);
      
      // Also close tooltip if they toggle AI
      const tooltip = document.getElementById('onboardingTooltip');
      if (tooltip) tooltip.classList.remove('visible');
      chrome.storage.local.set({ hasSeenOnboarding: true });
    }
    updateRulesVisibility();
  });

  saveKeyBtn.addEventListener('click', async () => {
    const key = geminiKeyInput.value.trim();
    
    if (!key) {
      chrome.storage.sync.set({ geminiKey: '' }, () => {
        saveStatus.textContent = 'Cleared';
        saveStatus.style.color = '#71717a';
        saveStatus.style.display = 'inline';
        updateRulesVisibility();
        setTimeout(() => saveStatus.style.display = 'none', 2000);
      });
      return;
    }

    saveKeyBtn.disabled = true;
    saveKeyBtn.textContent = 'Verifying...';
    saveStatus.style.display = 'none';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      if (!response.ok) {
        throw new Error('Invalid Key');
      }
      
      chrome.storage.sync.set({ geminiKey: key }, () => {
        saveStatus.textContent = 'Saved! Refresh page to see changes.';
        saveStatus.style.color = '#10b981';
        saveStatus.style.display = 'inline';
        updateRulesVisibility();
        setTimeout(() => saveStatus.style.display = 'none', 4000);
      });
    } catch (e) {
      saveStatus.textContent = 'Invalid API Key';
      saveStatus.style.color = '#ef4444';
      saveStatus.style.display = 'inline';
    } finally {
      saveKeyBtn.disabled = false;
      saveKeyBtn.textContent = 'Save Key';
    }
  });

  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    updateSliderLabels(val);
    
    const newDisabled = [];
    AI_MARKERS.forEach(marker => {
      if (marker.level > val) {
        newDisabled.push(marker.id);
      }
    });
    
    chrome.storage.sync.set({ 
      aggressivenessLevel: val, 
      disabledRules: newDisabled 
    });
    
    renderList(newDisabled);
  });
  
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.disabledRules) {
      // Re-render list if changes happen from content scripts or elsewhere
      renderList(changes.disabledRules.newValue || []);
    }
  });
});
