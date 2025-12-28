// ============================================
// REPOCOMPASS - RETRO ARCADE EDITION
// Popup Logic with RPG Stats System
// ============================================

// ==========================================
// SKILL CONFIGURATION
// Easy to extend - just add new skills here
// ==========================================
const SKILL_CONFIG = {
  dataStructures: {
    name: 'DATA STRUCTURES',
    icon: '🗃️',
    maxLevel: 10,
    description: 'Arrays, Trees, Graphs, Hash Tables'
  },
  algorithms: {
    name: 'ALGORITHMS',
    icon: '🧮',
    maxLevel: 10,
    description: 'Sorting, Searching, Dynamic Programming'
  },
  systems: {
    name: 'SYSTEMS / OS',
    icon: '🖥️',
    maxLevel: 10,
    description: 'Operating Systems, Memory, Processes'
  },
  databases: {
    name: 'DATABASES',
    icon: '🗄️',
    maxLevel: 10,
    description: 'SQL, NoSQL, Query Optimization'
  },
  networking: {
    name: 'NETWORKING',
    icon: '🌐',
    maxLevel: 10,
    description: 'TCP/IP, HTTP, APIs, Security'
  },
  frontend: {
    name: 'FRONTEND',
    icon: '🎨',
    maxLevel: 10,
    description: 'HTML, CSS, JavaScript, React'
  },
  backend: {
    name: 'BACKEND',
    icon: '⚙️',
    maxLevel: 10,
    description: 'Servers, APIs, Microservices'
  },
  aiMl: {
    name: 'AI / ML',
    icon: '🤖',
    maxLevel: 10,
    description: 'Machine Learning, Neural Networks'
  },
  math: {
    name: 'MATH / PROBABILITY',
    icon: '📐',
    maxLevel: 10,
    description: 'Statistics, Linear Algebra, Calculus'
  }
};

// Character class thresholds
const CHARACTER_CLASSES = [
  { minPower: 0, name: 'APPRENTICE DEV', avatar: '🧙' },
  { minPower: 10, name: 'JUNIOR CODER', avatar: '🧝' },
  { minPower: 25, name: 'CODE WARRIOR', avatar: '⚔️' },
  { minPower: 40, name: 'SENIOR WIZARD', avatar: '🧙‍♂️' },
  { minPower: 60, name: 'TECH KNIGHT', avatar: '🛡️' },
  { minPower: 80, name: 'MASTER ARCHITECT', avatar: '👑' },
  { minPower: 90, name: 'LEGENDARY DEV', avatar: '🌟' }
];

// ==========================================
// STATE
// ==========================================
let currentJobData = null;
let currentCompanyData = null;
let playerStats = {
  name: 'HERO_DEV',
  skills: {},
  savedIdeas: []
};

// Initialize all skills to 0
Object.keys(SKILL_CONFIG).forEach(key => {
  playerStats.skills[key] = 0;
});

// ==========================================
// DOM ELEMENTS
// ==========================================
const elements = {};

function initializeElements() {
  // Tabs
  elements.tabs = document.querySelectorAll('.arcade-tab');
  elements.tabContents = document.querySelectorAll('.tab-content');
  
  // Player bar
  elements.playerName = document.getElementById('playerName');
  elements.totalLevel = document.getElementById('totalLevel');
  elements.totalExpBar = document.getElementById('totalExpBar');
  elements.expText = document.getElementById('expText');
  
  // Quest tab
  elements.statusBox = document.getElementById('statusBox');
  elements.statusSprite = document.getElementById('statusSprite');
  elements.statusText = document.getElementById('statusText');
  elements.jobInfo = document.getElementById('jobInfo');
  elements.jobTitle = document.getElementById('jobTitle');
  elements.companyName = document.getElementById('companyName');
  elements.jobTechTags = document.getElementById('jobTechTags');
  elements.companyInfo = document.getElementById('companyInfo');
  elements.companyWebsite = document.getElementById('companyWebsite');
  elements.companyBlog = document.getElementById('companyBlog');
  elements.companyGithub = document.getElementById('companyGithub');
  elements.companyTechStack = document.getElementById('companyTechStack');
  elements.companyTechTags = document.getElementById('companyTechTags');
  elements.companyProjects = document.getElementById('companyProjects');
  elements.generateBtn = document.getElementById('generateBtn');
  elements.projectIdeas = document.getElementById('projectIdeas');
  elements.ideasList = document.getElementById('ideasList');
  elements.errorMessage = document.getElementById('errorMessage');
  
  // Stats tab
  elements.avatarSprite = document.getElementById('avatarSprite');
  elements.characterClass = document.getElementById('characterClass');
  elements.powerLevel = document.getElementById('powerLevel');
  elements.skillRows = document.querySelectorAll('.skill-row');
  elements.strongestSkill = document.getElementById('strongestSkill');
  elements.totalXp = document.getElementById('totalXp');
  elements.resetStatsBtn = document.getElementById('resetStatsBtn');
  
  // Inventory tab
  elements.savedIdeasList = document.getElementById('savedIdeasList');
  elements.inventoryCount = document.getElementById('inventoryCount');
  elements.clearInventoryBtn = document.getElementById('clearInventoryBtn');
  
  // Config tab
  elements.configPlayerName = document.getElementById('configPlayerName');
  elements.openaiKey = document.getElementById('openaiKey');
  elements.enableCache = document.getElementById('enableCache');
  elements.autoAnalyze = document.getElementById('autoAnalyze');
  elements.enableSounds = document.getElementById('enableSounds');
  elements.enableCrt = document.getElementById('enableCrt');
  elements.saveConfigBtn = document.getElementById('saveConfigBtn');
  elements.configStatus = document.getElementById('configStatus');
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  setupTabs();
  setupSkillControls();
  setupConfigControls();
  await loadAllData();
  await checkCurrentTab();
  updateAllDisplays();
});

// ==========================================
// TAB NAVIGATION
// ==========================================
function setupTabs() {
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('click');
      
      elements.tabs.forEach(t => t.classList.remove('active'));
      elements.tabContents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

// ==========================================
// SKILL SYSTEM
// ==========================================
function setupSkillControls() {
  elements.skillRows.forEach(row => {
    const skillKey = row.dataset.skill;
    const minusBtn = row.querySelector('.skill-btn.minus');
    const plusBtn = row.querySelector('.skill-btn.plus');
    
    minusBtn.addEventListener('click', () => {
      updateSkill(skillKey, -1);
    });
    
    plusBtn.addEventListener('click', () => {
      updateSkill(skillKey, 1);
    });
  });
  
  elements.resetStatsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all stats?')) {
      resetAllStats();
    }
  });
}

function updateSkill(skillKey, delta) {
  const config = SKILL_CONFIG[skillKey];
  const currentLevel = playerStats.skills[skillKey] || 0;
  const newLevel = Math.max(0, Math.min(config.maxLevel, currentLevel + delta));
  
  if (newLevel !== currentLevel) {
    playerStats.skills[skillKey] = newLevel;
    
    // Play sound
    if (delta > 0) {
      playSound('levelUp');
    } else {
      playSound('levelDown');
    }
    
    // Animate the skill row
    const row = document.querySelector(`[data-skill="${skillKey}"]`);
    row.classList.add('skill-up');
    setTimeout(() => row.classList.remove('skill-up'), 300);
    
    // Update displays and save
    updateSkillDisplay(skillKey);
    updatePlayerBar();
    updateCharacterSheet();
    savePlayerStats();
  }
}

function updateSkillDisplay(skillKey) {
  const row = document.querySelector(`[data-skill="${skillKey}"]`);
  if (!row) return;
  
  const level = playerStats.skills[skillKey] || 0;
  const maxLevel = SKILL_CONFIG[skillKey].maxLevel;
  const percentage = (level / maxLevel) * 100;
  
  row.querySelector('.skill-level').textContent = level;
  row.querySelector('.skill-bar').style.width = `${percentage}%`;
  
  // Add maxed class if at max level
  if (level >= maxLevel) {
    row.classList.add('maxed');
  } else {
    row.classList.remove('maxed');
  }
}

function resetAllStats() {
  Object.keys(SKILL_CONFIG).forEach(key => {
    playerStats.skills[key] = 0;
    updateSkillDisplay(key);
  });
  updatePlayerBar();
  updateCharacterSheet();
  savePlayerStats();
  playSound('reset');
}

// ==========================================
// PLAYER BAR & CHARACTER SHEET
// ==========================================
function updatePlayerBar() {
  // Calculate total XP and level
  const totalXp = calculateTotalXP();
  const level = calculateLevel(totalXp);
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  const progressXp = totalXp - xpForCurrentLevel;
  const requiredXp = xpForNextLevel - xpForCurrentLevel;
  const percentage = (progressXp / requiredXp) * 100;
  
  elements.playerName.textContent = playerStats.name;
  elements.totalLevel.textContent = level;
  elements.totalExpBar.style.width = `${percentage}%`;
  elements.expText.textContent = `${progressXp} / ${requiredXp} XP`;
}

function updateCharacterSheet() {
  const powerLevel = calculatePowerLevel();
  const characterClass = getCharacterClass(powerLevel);
  const strongestSkill = getStrongestSkill();
  const totalXp = calculateTotalXP();
  
  elements.avatarSprite.textContent = characterClass.avatar;
  elements.characterClass.textContent = characterClass.name;
  elements.powerLevel.textContent = powerLevel;
  elements.strongestSkill.textContent = strongestSkill;
  elements.totalXp.textContent = totalXp;
}

function calculateTotalXP() {
  // Each skill level = 10 XP
  return Object.values(playerStats.skills).reduce((sum, level) => sum + (level * 10), 0);
}

function calculatePowerLevel() {
  // Sum of all skill levels
  return Object.values(playerStats.skills).reduce((sum, level) => sum + level, 0);
}

function calculateLevel(totalXp) {
  // Simple level formula: Level = floor(sqrt(XP / 10)) + 1
  return Math.floor(Math.sqrt(totalXp / 10)) + 1;
}

function getXPForLevel(level) {
  // Inverse of level formula
  return Math.pow(level - 1, 2) * 10;
}

function getCharacterClass(powerLevel) {
  // Find highest matching class
  let result = CHARACTER_CLASSES[0];
  for (const charClass of CHARACTER_CLASSES) {
    if (powerLevel >= charClass.minPower) {
      result = charClass;
    }
  }
  return result;
}

function getStrongestSkill() {
  let maxLevel = 0;
  let strongest = '---';
  
  for (const [key, level] of Object.entries(playerStats.skills)) {
    if (level > maxLevel) {
      maxLevel = level;
      strongest = SKILL_CONFIG[key].name;
    }
  }
  
  return maxLevel > 0 ? strongest : '---';
}

// ==========================================
// QUEST TAB (JOB ANALYSIS)
// ==========================================
async function checkCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (isJobSite(tab.url)) {
      updateStatus('analyzing', '🔍', 'SCANNING QUEST BOARD...');
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getJobData' });
      
      if (response && response.success) {
        currentJobData = response.data;
        displayJobInfo(currentJobData);
        await analyzeCompany(currentJobData);
      } else {
        updateStatus('error', '❌', 'QUEST DATA CORRUPTED. TRY REFRESHING THE DUNGEON.');
      }
    } else {
      updateStatus('idle', '🗡️', 'SEEK A JOB POSTING TO BEGIN YOUR QUEST...');
    }
  } catch (error) {
    console.error('Error checking tab:', error);
    updateStatus('idle', '🗡️', 'NAVIGATE TO LINKEDIN, INDEED, OR GLASSDOOR');
  }
}

function isJobSite(url) {
  const jobSites = ['linkedin.com/jobs', 'indeed.com', 'glassdoor.com/job'];
  return jobSites.some(site => url?.includes(site));
}

function updateStatus(type, icon, message) {
  elements.statusSprite.textContent = icon;
  elements.statusText.textContent = message;
}

function displayJobInfo(jobData) {
  elements.jobInfo.classList.remove('hidden');
  elements.jobTitle.textContent = jobData.title || 'UNKNOWN QUEST';
  elements.companyName.querySelector('span:last-child').textContent = jobData.company || 'MYSTERIOUS GUILD';
  
  // Display tech tags
  if (jobData.technologies && jobData.technologies.length > 0) {
    elements.jobTechTags.innerHTML = jobData.technologies
      .slice(0, 6)
      .map(tech => `<span class="tech-tag">${tech}</span>`)
      .join('');
  }
  
  updateStatus('success', '⚔️', 'QUEST IDENTIFIED! ANALYZING NPC...');
}

async function analyzeCompany(jobData) {
  try {
    updateStatus('analyzing', '🔍', 'RESEARCHING COMPANY INTELLIGENCE...');

    const response = await chrome.runtime.sendMessage({
      action: 'analyzeCompany',
      data: {
        company: jobData.company,
        jobDescription: jobData.description,
        jobTitle: jobData.title
      }
    });

    if (response.success && response.data) {
      currentCompanyData = response.data;
      displayCompanyInfo(response.data);
    } else {
      currentCompanyData = {
        company: jobData.company,
        website: null,
        engineeringBlog: null,
        techStack: [],
        recentProjects: [],
        insights: []
      };
      displayCompanyInfo(currentCompanyData);
    }

    elements.generateBtn.disabled = false;
    updateStatus('ready', '✨', 'READY TO GENERATE QUEST ITEMS!');

  } catch (error) {
    console.error('Company analysis error:', error);
    elements.generateBtn.disabled = false;
    updateStatus('ready', '⚡', 'COMPANY ANALYSIS INCOMPLETE - GENERATE ANYWAY');
  }
}

function displayCompanyInfo(companyData) {
  if (!companyData) return;

  elements.companyInfo.classList.remove('hidden');

  // Display website link
  if (companyData.website) {
    elements.companyWebsite.href = companyData.website;
    elements.companyWebsite.classList.remove('hidden');
  } else {
    elements.companyWebsite.classList.add('hidden');
  }

  // Display blog link
  if (companyData.engineeringBlog) {
    elements.companyBlog.href = companyData.engineeringBlog;
    elements.companyBlog.classList.remove('hidden');
  } else {
    elements.companyBlog.classList.add('hidden');
  }

  // Display GitHub org link
  if (companyData.githubOrg) {
    elements.companyGithub.href = companyData.githubOrg;
    elements.companyGithub.classList.remove('hidden');
  } else {
    elements.companyGithub.classList.add('hidden');
  }

  // Display tech stack
  if (companyData.techStack && companyData.techStack.length > 0) {
    elements.companyTechStack.classList.remove('hidden');
    elements.companyTechTags.innerHTML = companyData.techStack
      .slice(0, 8)
      .map(tech => `<span class="tech-tag">${tech}</span>`)
      .join('');
  } else {
    elements.companyTechStack.classList.add('hidden');
  }

  // Display recent projects
  if (companyData.recentProjects && companyData.recentProjects.length > 0) {
    elements.companyProjects.classList.remove('hidden');
    elements.companyProjects.innerHTML = `
      <div class="company-projects-header">
        <span class="projects-icon">🚀</span>
        <span>RECENT COMPANY INITIATIVES</span>
      </div>
      <div class="projects-list">
        ${companyData.recentProjects.slice(0, 3).map(project => `
          <div class="project-item">
            <div class="project-name">${project.name}</div>
            <div class="project-desc">${project.description}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    elements.companyProjects.classList.add('hidden');
  }
}

// Generate Ideas Button
elements.generateBtn?.addEventListener('click', async () => {
  const btnText = elements.generateBtn.querySelector('.btn-text');
  const btnLoader = elements.generateBtn.querySelector('.btn-loader');
  
  btnText.textContent = 'GENERATING...';
  btnLoader.classList.remove('hidden');
  elements.generateBtn.disabled = true;
  elements.errorMessage.classList.add('hidden');
  
  playSound('generate');
  
  try {
    const settings = await getSettings();
    
    if (!settings.openaiKey) {
      throw new Error('OPENAI API KEY REQUIRED! CHECK CONFIG.');
    }
    
    // Include player stats and company data in the generation request
    const response = await chrome.runtime.sendMessage({
      action: 'generateIdeas',
      data: {
        jobData: currentJobData,
        companyData: currentCompanyData,
        playerStats: playerStats.skills,
        apiKey: settings.openaiKey
      }
    });
    
    if (response.success) {
      displayProjectIdeas(response.ideas);
      playSound('success');
    } else {
      throw new Error(response.error || 'GENERATION FAILED');
    }
  } catch (error) {
    showError(error.message);
    playSound('error');
  } finally {
    btnText.textContent = 'GENERATE QUEST ITEMS';
    btnLoader.classList.add('hidden');
    elements.generateBtn.disabled = false;
  }
});

function displayProjectIdeas(ideas) {
  elements.projectIdeas.classList.remove('hidden');
  
  const rarities = ['🟢', '🔵', '🟣', '🟡'];
  
  elements.ideasList.innerHTML = ideas.map((idea, index) => `
    <div class="loot-item">
      <div class="loot-item-header">
        <span class="loot-rarity">${rarities[index % rarities.length]}</span>
        <span class="loot-name">${idea.title}</span>
      </div>
      <p class="loot-description">${idea.description}</p>
      <div class="loot-tags">
        ${idea.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
      </div>
      <div class="loot-actions">
        <button class="pixel-btn small save-idea-btn" data-index="${index}">
          <span>📥</span> COLLECT
        </button>
      </div>
    </div>
  `).join('');
  
  // Add save handlers
  elements.ideasList.querySelectorAll('.save-idea-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const button = e.currentTarget;
      const index = parseInt(button.dataset.index);
      await saveIdea(ideas[index]);
      button.innerHTML = '<span>✓</span> COLLECTED';
      button.disabled = true;
      playSound('collect');
    });
  });
}

function showError(message) {
  elements.errorMessage.classList.remove('hidden');
  elements.errorMessage.querySelector('.error-text').textContent = message;
}

// ==========================================
// INVENTORY (SAVED IDEAS)
// ==========================================
async function loadSavedIdeas() {
  const savedIdeas = playerStats.savedIdeas || [];
  
  elements.inventoryCount.textContent = `${savedIdeas.length} ITEMS`;
  
  if (savedIdeas.length === 0) {
    elements.savedIdeasList.innerHTML = `
      <div class="empty-inventory">
        <span class="empty-icon">📦</span>
        <p>YOUR INVENTORY IS EMPTY!</p>
        <p class="empty-hint">COMPLETE QUESTS TO COLLECT LOOT</p>
      </div>
    `;
    elements.clearInventoryBtn.classList.add('hidden');
    return;
  }
  
  elements.clearInventoryBtn.classList.remove('hidden');
  elements.savedIdeasList.innerHTML = savedIdeas.map((idea, index) => `
    <div class="inventory-item">
      <div class="inventory-item-header">
        <span class="inventory-item-title">${idea.title}</span>
        <button class="pixel-btn danger small remove-item-btn" data-index="${index}">✕</button>
      </div>
      <p class="inventory-item-source">📍 ${idea.company} - ${idea.jobTitle}</p>
      <p class="inventory-item-desc">${idea.description}</p>
      <div class="loot-tags">
        ${idea.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
      </div>
    </div>
  `).join('');
  
  // Add remove handlers
  elements.savedIdeasList.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const button = e.currentTarget;
      const index = parseInt(button.dataset.index);
      playerStats.savedIdeas.splice(index, 1);
      await savePlayerStats();
      loadSavedIdeas();
      playSound('drop');
    });
  });
}

async function saveIdea(idea) {
  const newIdea = {
    ...idea,
    jobTitle: currentJobData?.title || 'Unknown',
    company: currentJobData?.company || 'Unknown',
    savedAt: new Date().toISOString()
  };
  
  playerStats.savedIdeas.push(newIdea);
  await savePlayerStats();
  loadSavedIdeas();
}

elements.clearInventoryBtn?.addEventListener('click', async () => {
  if (confirm('DROP ALL ITEMS? THIS CANNOT BE UNDONE!')) {
    playerStats.savedIdeas = [];
    await savePlayerStats();
    loadSavedIdeas();
    playSound('drop');
  }
});

// ==========================================
// CONFIG
// ==========================================
function setupConfigControls() {
  // Toggle password visibility
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
      playSound('click');
    });
  });
  
  // CRT toggle
  elements.enableCrt?.addEventListener('change', (e) => {
    document.body.classList.toggle('no-crt', !e.target.checked);
  });
  
  // Save config button
  elements.saveConfigBtn?.addEventListener('click', saveConfig);
}

async function loadConfig() {
  const settings = await getSettings();

  elements.configPlayerName.value = playerStats.name || 'HERO_DEV';
  elements.openaiKey.value = settings.openaiKey || '';
  elements.enableCache.checked = settings.enableCache !== false;
  elements.autoAnalyze.checked = settings.autoAnalyze || false;
  elements.enableSounds.checked = settings.enableSounds !== false;
  elements.enableCrt.checked = settings.enableCrt !== false;

  // Apply CRT setting
  document.body.classList.toggle('no-crt', !settings.enableCrt);
}

async function saveConfig() {
  const newName = elements.configPlayerName.value.trim().toUpperCase() || 'HERO_DEV';
  playerStats.name = newName;

  const apiKey = elements.openaiKey.value.trim();
  
  // Validate API key if provided
  if (apiKey) {
    showConfigStatus('VALIDATING API KEY...', 'info');
    elements.saveConfigBtn.disabled = true;
    
    try {
      const validation = await chrome.runtime.sendMessage({
        action: 'validateApiKey',
        data: { apiKey }
      });
      
      if (!validation.success) {
        showConfigStatus(`API KEY ERROR: ${validation.error}`, 'error');
        playSound('error');
        elements.saveConfigBtn.disabled = false;
        return; // Don't save if API key is invalid
      }
    } catch (error) {
      showConfigStatus('API KEY VALIDATION FAILED', 'error');
      playSound('error');
      elements.saveConfigBtn.disabled = false;
      return;
    }
  }

  const settings = {
    openaiKey: apiKey,
    enableCache: elements.enableCache.checked,
    autoAnalyze: elements.autoAnalyze.checked,
    enableSounds: elements.enableSounds.checked,
    enableCrt: elements.enableCrt.checked
  };

  await chrome.storage.local.set({ settings });
  await savePlayerStats();

  updatePlayerBar();
  elements.saveConfigBtn.disabled = false;
  showConfigStatus('CONFIG SAVED! API KEY VALID ✓', 'success');
  playSound('save');
}

function showConfigStatus(message, type) {
  elements.configStatus.textContent = message;
  elements.configStatus.className = `config-status ${type}`;
  elements.configStatus.classList.remove('hidden');
  
  setTimeout(() => {
    elements.configStatus.classList.add('hidden');
  }, 3000);
}

// ==========================================
// DATA PERSISTENCE
// ==========================================
async function loadAllData() {
  // Load player stats
  const result = await chrome.storage.local.get(['playerStats', 'settings']);
  
  if (result.playerStats) {
    playerStats = { ...playerStats, ...result.playerStats };
  }
  
  // Load config
  await loadConfig();
  
  // Update all skill displays
  Object.keys(SKILL_CONFIG).forEach(key => {
    updateSkillDisplay(key);
  });
  
  // Load saved ideas
  loadSavedIdeas();
}

async function savePlayerStats() {
  await chrome.storage.local.set({ playerStats });
}

async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  return result.settings || {};
}

// ==========================================
// UPDATE ALL DISPLAYS
// ==========================================
function updateAllDisplays() {
  updatePlayerBar();
  updateCharacterSheet();
  Object.keys(SKILL_CONFIG).forEach(key => {
    updateSkillDisplay(key);
  });
  loadSavedIdeas();
}

// ==========================================
// SOUND EFFECTS
// ==========================================
function playSound(type) {
  // Check if sounds are enabled
  const soundsEnabled = elements.enableSounds?.checked !== false;
  if (!soundsEnabled) return;
  
  // Create audio context for retro sounds
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const sounds = {
      click: { freq: 800, duration: 0.05, type: 'square' },
      levelUp: { freq: 523, duration: 0.15, type: 'square', sweep: 1047 },
      levelDown: { freq: 400, duration: 0.1, type: 'square', sweep: 200 },
      success: { freq: 659, duration: 0.2, type: 'square' },
      error: { freq: 200, duration: 0.3, type: 'sawtooth' },
      collect: { freq: 1047, duration: 0.1, type: 'square' },
      drop: { freq: 300, duration: 0.15, type: 'square', sweep: 100 },
      save: { freq: 880, duration: 0.1, type: 'square' },
      generate: { freq: 440, duration: 0.2, type: 'triangle' },
      reset: { freq: 150, duration: 0.4, type: 'sawtooth' }
    };
    
    const sound = sounds[type] || sounds.click;
    
    oscillator.type = sound.type;
    oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
    
    if (sound.sweep) {
      oscillator.frequency.linearRampToValueAtTime(sound.sweep, audioContext.currentTime + sound.duration);
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  } catch (e) {
    // Audio not supported or blocked
  }
}

// ==========================================
// EXPORT SKILLS FOR BACKGROUND SCRIPT
// ==========================================
window.getPlayerSkills = () => playerStats.skills;
window.SKILL_CONFIG = SKILL_CONFIG;