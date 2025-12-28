// ============================================
// REPOCOMPASS - SETUP FLOW
// First-time onboarding with validation
// ============================================

// Skill configuration (matching popup.js)
const SKILL_CONFIG = {
  dataStructures: { name: 'DATA STRUCTURES', icon: '🗃️', maxLevel: 10 },
  algorithms: { name: 'ALGORITHMS', icon: '🧮', maxLevel: 10 },
  systems: { name: 'SYSTEMS / OS', icon: '🖥️', maxLevel: 10 },
  databases: { name: 'DATABASES', icon: '🗄️', maxLevel: 10 },
  networking: { name: 'NETWORKING', icon: '🌐', maxLevel: 10 },
  frontend: { name: 'FRONTEND', icon: '🎨', maxLevel: 10 },
  backend: { name: 'BACKEND', icon: '⚙️', maxLevel: 10 },
  aiMl: { name: 'AI / ML', icon: '🤖', maxLevel: 10 },
  math: { name: 'MATH / PROBABILITY', icon: '📐', maxLevel: 10 }
};

// State management
const setupState = {
  currentPage: 1,
  totalPages: 5,
  playerName: '',
  apiKey: '',
  apiKeyValidated: false,
  skills: {},
  availablePoints: 10,
  usedPoints: 0
};

// Initialize skills to 0
Object.keys(SKILL_CONFIG).forEach(key => {
  setupState.skills[key] = 0;
});

// DOM Elements
const elements = {
  progressSteps: null,
  pages: null,
  prevBtn: null,
  nextBtn: null,
  // Page 2: Player Name
  playerNameInput: null,
  namePreview: null,
  nameError: null,
  // Page 3: API Key
  apiKeyInput: null,
  apiKeyError: null,
  apiKeySuccess: null,
  toggleVisibilityBtn: null,
  // Page 4: Stats
  pointsRemaining: null,
  skillRows: null,
  statsError: null,
  // Page 5: Summary
  summaryName: null,
  summaryPower: null
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  setupEventListeners();
  updateNavigation();
});

function initializeElements() {
  elements.progressSteps = document.querySelectorAll('.progress-step');
  elements.pages = document.querySelectorAll('.setup-page');
  elements.prevBtn = document.getElementById('prevBtn');
  elements.nextBtn = document.getElementById('nextBtn');

  // Page 2
  elements.playerNameInput = document.getElementById('setupPlayerName');
  elements.namePreview = document.getElementById('namePreview');
  elements.nameError = document.getElementById('nameError');

  // Page 3
  elements.apiKeyInput = document.getElementById('setupOpenaiKey');
  elements.apiKeyError = document.getElementById('apiKeyError');
  elements.apiKeySuccess = document.getElementById('apiKeySuccess');
  elements.toggleVisibilityBtn = document.querySelector('.toggle-visibility');

  // Page 4
  elements.pointsRemaining = document.getElementById('pointsRemaining');
  elements.skillRows = document.querySelectorAll('.skill-allocation-row');
  elements.statsError = document.getElementById('statsError');

  // Page 5
  elements.summaryName = document.getElementById('summaryName');
  elements.summaryPower = document.getElementById('summaryPower');
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Navigation
  elements.prevBtn.addEventListener('click', goToPreviousPage);
  elements.nextBtn.addEventListener('click', goToNextPage);

  // Player Name
  elements.playerNameInput.addEventListener('input', handlePlayerNameInput);
  elements.playerNameInput.addEventListener('blur', validatePlayerName);

  // API Key
  elements.apiKeyInput.addEventListener('input', handleApiKeyInput);
  elements.toggleVisibilityBtn?.addEventListener('click', toggleApiKeyVisibility);

  // Skills
  elements.skillRows.forEach(row => {
    const skillKey = row.dataset.skill;
    const minusBtn = row.querySelector('.skill-btn.minus');
    const plusBtn = row.querySelector('.skill-btn.plus');

    minusBtn.addEventListener('click', () => adjustSkill(skillKey, -1));
    plusBtn.addEventListener('click', () => adjustSkill(skillKey, 1));
  });
}

// ==========================================
// NAVIGATION
// ==========================================
async function goToNextPage() {
  // Validate current page before proceeding
  const isValid = await validateCurrentPage();

  if (!isValid) {
    return; // Stay on current page
  }

  // Special handling for last page
  if (setupState.currentPage === setupState.totalPages) {
    await completeSetup();
    return;
  }

  // Move to next page
  setupState.currentPage++;
  updatePages();
  updateNavigation();
  playSound('pageForward');
}

function goToPreviousPage() {
  if (setupState.currentPage > 1) {
    setupState.currentPage--;
    updatePages();
    updateNavigation();
    playSound('pageBack');
  }
}

function updatePages() {
  elements.pages.forEach((page, index) => {
    const pageNumber = index + 1;

    page.classList.remove('active', 'prev');

    if (pageNumber === setupState.currentPage) {
      page.classList.add('active');
    } else if (pageNumber < setupState.currentPage) {
      page.classList.add('prev');
    }
  });

  updateProgressBar();
}

function updateProgressBar() {
  elements.progressSteps.forEach((step, index) => {
    const stepNumber = index + 1;

    step.classList.remove('active', 'completed');

    if (stepNumber === setupState.currentPage) {
      step.classList.add('active');
    } else if (stepNumber < setupState.currentPage) {
      step.classList.add('completed');
    }
  });
}

function updateNavigation() {
  // Update prev button
  elements.prevBtn.disabled = setupState.currentPage === 1;

  // Update next button text
  if (setupState.currentPage === setupState.totalPages) {
    elements.nextBtn.innerHTML = 'START <span>►</span>';
  } else if (setupState.currentPage === 1) {
    elements.nextBtn.innerHTML = 'BEGIN <span>►</span>';
  } else {
    elements.nextBtn.innerHTML = 'NEXT <span>►</span>';
  }
}

// ==========================================
// VALIDATION
// ==========================================
async function validateCurrentPage() {
  switch (setupState.currentPage) {
    case 1: // Welcome page
      return true;

    case 2: // Player name
      return validatePlayerName();

    case 3: // API Key
      return await validateApiKey();

    case 4: // Stats
      return validateStats();

    case 5: // Complete
      return true;

    default:
      return false;
  }
}

// ==========================================
// PAGE 2: PLAYER NAME VALIDATION
// ==========================================
function handlePlayerNameInput(e) {
  let value = e.target.value.toUpperCase().replace(/[^A-Z0-9_\s]/g, '');

  // Limit to 16 characters
  if (value.length > 16) {
    value = value.substring(0, 16);
  }

  e.target.value = value;
  setupState.playerName = value;

  // Update preview
  elements.namePreview.textContent = value || 'HERO_DEV';

  // Clear error on input
  hideError(elements.nameError);
  elements.playerNameInput.classList.remove('error');
}

function validatePlayerName() {
  const name = setupState.playerName.trim();

  // Check if empty
  if (!name) {
    showError(elements.nameError, 'Player name is required!');
    elements.playerNameInput.classList.add('error');
    playSound('error');
    return false;
  }

  // Check minimum length
  if (name.length < 3) {
    showError(elements.nameError, 'Player name must be at least 3 characters long');
    elements.playerNameInput.classList.add('error');
    playSound('error');
    return false;
  }

  // Validate characters
  if (!/^[A-Z0-9_\s]+$/.test(name)) {
    showError(elements.nameError, 'Only letters, numbers, underscores, and spaces allowed');
    elements.playerNameInput.classList.add('error');
    playSound('error');
    return false;
  }

  // Valid
  elements.playerNameInput.classList.remove('error');
  elements.playerNameInput.classList.add('success');
  hideError(elements.nameError);
  return true;
}

// ==========================================
// PAGE 3: API KEY VALIDATION
// ==========================================
function handleApiKeyInput(e) {
  const value = e.target.value.trim();
  setupState.apiKey = value;
  setupState.apiKeyValidated = false;

  // Clear messages on input
  hideError(elements.apiKeyError);
  hideError(elements.apiKeySuccess);
  elements.apiKeyInput.classList.remove('error', 'success');
}

function toggleApiKeyVisibility() {
  const input = elements.apiKeyInput;
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
  playSound('click');
}

async function validateApiKey() {
  const apiKey = setupState.apiKey.trim();

  // Check if empty
  if (!apiKey) {
    showError(elements.apiKeyError, 'OpenAI API key is required to continue');
    elements.apiKeyInput.classList.add('error');
    playSound('error');
    return false;
  }

  // Check format (OpenAI keys start with sk-)
  if (!apiKey.startsWith('sk-')) {
    showError(elements.apiKeyError, 'Invalid API key format. OpenAI keys start with "sk-"');
    elements.apiKeyInput.classList.add('error');
    playSound('error');
    return false;
  }

  // If already validated this session, skip API call
  if (setupState.apiKeyValidated) {
    return true;
  }

  // Test API key with actual API call
  elements.nextBtn.disabled = true;
  elements.nextBtn.innerHTML = 'VALIDATING... <span class="spinner"></span>';
  hideError(elements.apiKeyError);
  hideError(elements.apiKeySuccess);

  try {
    const validation = await chrome.runtime.sendMessage({
      action: 'validateApiKey',
      data: { apiKey }
    });

    if (validation.success) {
      // API key is valid
      setupState.apiKeyValidated = true;
      elements.apiKeyInput.classList.remove('error');
      elements.apiKeyInput.classList.add('success');
      showSuccess(elements.apiKeySuccess, 'API KEY VALIDATED SUCCESSFULLY');
      playSound('success');
      elements.nextBtn.disabled = false;
      elements.nextBtn.innerHTML = 'NEXT <span>►</span>';
      return true;
    } else {
      // API key is invalid
      const errorMsg = validation.error || 'API key validation failed';
      showError(elements.apiKeyError, `Validation failed: ${errorMsg}`);
      elements.apiKeyInput.classList.add('error');
      playSound('error');
      elements.nextBtn.disabled = false;
      elements.nextBtn.innerHTML = 'NEXT <span>►</span>';
      return false;
    }
  } catch (error) {
    console.error('API validation error:', error);

    // Network or other error
    showError(
      elements.apiKeyError,
      'Unable to validate API key. Check your internet connection and try again.'
    );
    elements.apiKeyInput.classList.add('error');
    playSound('error');
    elements.nextBtn.disabled = false;
    elements.nextBtn.innerHTML = 'NEXT <span>►</span>';
    return false;
  }
}

// ==========================================
// PAGE 4: STATS ALLOCATION
// ==========================================
function adjustSkill(skillKey, delta) {
  const currentLevel = setupState.skills[skillKey];
  const newLevel = currentLevel + delta;

  // Check boundaries
  if (newLevel < 0 || newLevel > SKILL_CONFIG[skillKey].maxLevel) {
    return;
  }

  // Check available points
  if (delta > 0 && setupState.usedPoints >= setupState.availablePoints) {
    showError(elements.statsError, 'No points remaining! Remove points from other skills first.');
    playSound('error');
    setTimeout(() => hideError(elements.statsError), 3000);
    return;
  }

  // Update skill level
  setupState.skills[skillKey] = newLevel;
  setupState.usedPoints += delta;

  // Update UI
  updateSkillRow(skillKey);
  updatePointsRemaining();

  // Play sound
  if (delta > 0) {
    playSound('levelUp');
  } else {
    playSound('levelDown');
  }

  hideError(elements.statsError);
}

function updateSkillRow(skillKey) {
  const row = document.querySelector(`.skill-allocation-row[data-skill="${skillKey}"]`);
  if (!row) return;

  const level = setupState.skills[skillKey];
  const valueElement = row.querySelector('.skill-value');
  const minusBtn = row.querySelector('.skill-btn.minus');
  const plusBtn = row.querySelector('.skill-btn.plus');

  // Update value
  valueElement.textContent = level;

  // Update button states
  minusBtn.disabled = level === 0;
  plusBtn.disabled = level >= SKILL_CONFIG[skillKey].maxLevel ||
                     setupState.usedPoints >= setupState.availablePoints;
}

function updatePointsRemaining() {
  const remaining = setupState.availablePoints - setupState.usedPoints;
  elements.pointsRemaining.textContent = remaining;

  // Update all plus buttons based on available points
  elements.skillRows.forEach(row => {
    const skillKey = row.dataset.skill;
    const plusBtn = row.querySelector('.skill-btn.plus');
    const currentLevel = setupState.skills[skillKey];

    plusBtn.disabled = remaining === 0 || currentLevel >= SKILL_CONFIG[skillKey].maxLevel;
  });
}

function validateStats() {
  // Stats are optional, but show a note if user hasn't allocated any points
  if (setupState.usedPoints === 0) {
    const shouldContinue = confirm(
      'You haven\'t allocated any skill points. You can do this later in the Stats tab. Continue?'
    );
    return shouldContinue;
  }

  return true;
}

// ==========================================
// PAGE 5: COMPLETION & SAVE
// ==========================================
async function completeSetup() {
  // Update summary
  elements.summaryName.textContent = setupState.playerName || 'HERO_DEV';
  elements.summaryPower.textContent = setupState.usedPoints;

  // Save to storage
  try {
    // Calculate remaining points (unspent from setup)
    const remainingPoints = setupState.availablePoints - setupState.usedPoints;
    
    const playerStats = {
      name: setupState.playerName || 'HERO_DEV',
      skills: setupState.skills,
      savedIdeas: [],
      completedProjects: 0,
      availablePoints: remainingPoints  // Save unspent points
    };

    const settings = {
      openaiKey: setupState.apiKey,
      enableCache: true,
      autoAnalyze: false,
      enableSounds: true,
      enableCrt: true
    };

    // Mark setup as completed
    await chrome.storage.local.set({
      setupCompleted: true,
      playerStats: playerStats,
      settings: settings
    });

    console.log('[RepoComPass Setup] Setup completed and saved:', {
      playerStats,
      settings,
      remainingPoints
    });

    // Redirect to main popup after animation
    setTimeout(() => {
      window.location.href = '../popup/popup.html';
    }, 3000); // 3 seconds for animation

  } catch (error) {
    console.error('[RepoComPass Setup] Error saving setup:', error);
    alert('Error saving setup. Please try again.');
  }
}

// ==========================================
// UI HELPERS
// ==========================================
function showError(element, message) {
  if (element) {
    element.textContent = message;
    element.classList.remove('hidden');
  }
}

function hideError(element) {
  if (element) {
    element.classList.add('hidden');
  }
}

function showSuccess(element, message) {
  if (element) {
    element.querySelector('span:last-child').textContent = message;
    element.classList.remove('hidden');
  }
}

// ==========================================
// SOUND EFFECTS
// ==========================================
function playSound(type) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const sounds = {
      click: { freq: 800, duration: 0.05, type: 'square' },
      pageForward: { freq: 659, duration: 0.15, type: 'square', sweep: 880 },
      pageBack: { freq: 523, duration: 0.15, type: 'square', sweep: 392 },
      success: { freq: 659, duration: 0.2, type: 'square' },
      error: { freq: 200, duration: 0.3, type: 'sawtooth' },
      levelUp: { freq: 523, duration: 0.15, type: 'square', sweep: 1047 },
      levelDown: { freq: 400, duration: 0.1, type: 'square', sweep: 200 }
    };

    const sound = sounds[type] || sounds.click;

    oscillator.type = sound.type;
    oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);

    if (sound.sweep) {
      oscillator.frequency.linearRampToValueAtTime(
        sound.sweep,
        audioContext.currentTime + sound.duration
      );
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + sound.duration
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  } catch (e) {
    // Audio not supported
  }
}
