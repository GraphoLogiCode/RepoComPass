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
  savedIdeas: [],
  completedProjects: 0,
  availablePoints: 0  // Points earned from completing projects
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

  // Defensive null checks for critical elements
  if (!elements.projectIdeas) {
    console.error('[RepoComPass] CRITICAL: #projectIdeas element not found in DOM');
  }
  if (!elements.ideasList) {
    console.error('[RepoComPass] CRITICAL: #ideasList element not found in DOM');
  }
  if (!elements.errorMessage) {
    console.error('[RepoComPass] CRITICAL: #errorMessage element not found in DOM');
  }
  
  // Stats tab
  elements.avatarSprite = document.getElementById('avatarSprite');
  elements.characterClass = document.getElementById('characterClass');
  elements.powerLevel = document.getElementById('powerLevel');
  elements.availablePoints = document.getElementById('availablePoints');
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
  // Check if this is first launch
  const isFirstLaunch = await checkFirstLaunch();

  if (isFirstLaunch) {
    // Redirect to setup page
    window.location.href = '../setup/setup.html';
    return;
  }

  // Normal initialization for returning users
  initializeElements();
  setupTabs();
  setupSkillControls();
  setupConfigControls();
  setupGenerateButton();  // Set up the Generate Ideas button
  await loadAllData();
  await checkCurrentTab();
  updateAllDisplays();
});

// ==========================================
// FIRST LAUNCH DETECTION
// ==========================================
async function checkFirstLaunch() {
  try {
    const result = await chrome.storage.local.get('setupCompleted');

    // If setupCompleted is not set or is false, this is first launch
    const isFirstLaunch = !result.setupCompleted;

    console.log('[RepoComPass] First launch check:', {
      setupCompleted: result.setupCompleted,
      isFirstLaunch: isFirstLaunch
    });

    return isFirstLaunch;
  } catch (error) {
    console.error('[RepoComPass] Error checking first launch:', error);
    // On error, assume it's not first launch to avoid redirect loop
    return false;
  }
}

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
    if (confirm('Are you sure you want to reset all stats? Points will be refunded.')) {
      resetAllStats();
    }
  });
}

function updateSkill(skillKey, delta) {
  const config = SKILL_CONFIG[skillKey];
  const currentLevel = playerStats.skills[skillKey] || 0;
  const availablePoints = playerStats.availablePoints || 0;
  
  // Check if we can make the change
  if (delta > 0) {
    // Increasing skill - need available points
    if (availablePoints < 1) {
      playSound('error');
      showError('NO SKILL POINTS! Complete projects to earn more.');
      return;
    }
    if (currentLevel >= config.maxLevel) {
      playSound('error');
      return;
    }
  } else if (delta < 0) {
    // Decreasing skill - refund points
    if (currentLevel <= 0) {
      return;
    }
  }
  
  const newLevel = Math.max(0, Math.min(config.maxLevel, currentLevel + delta));
  
  if (newLevel !== currentLevel) {
    playerStats.skills[skillKey] = newLevel;
    
    // Update available points
    if (delta > 0) {
      playerStats.availablePoints = availablePoints - 1;
    } else {
      playerStats.availablePoints = availablePoints + 1;
    }
    
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
  // Calculate total spent points to refund
  let totalSpent = 0;
  Object.keys(SKILL_CONFIG).forEach(key => {
    totalSpent += playerStats.skills[key] || 0;
    playerStats.skills[key] = 0;
    updateSkillDisplay(key);
  });
  
  // Refund all spent points
  playerStats.availablePoints = (playerStats.availablePoints || 0) + totalSpent;
  
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
  const availablePoints = playerStats.availablePoints || 0;
  
  elements.avatarSprite.textContent = characterClass.avatar;
  elements.characterClass.textContent = characterClass.name;
  elements.powerLevel.textContent = powerLevel;
  elements.strongestSkill.textContent = strongestSkill;
  elements.totalXp.textContent = totalXp;
  
  // Update available points display
  if (elements.availablePoints) {
    elements.availablePoints.textContent = availablePoints;
    // Highlight if points available
    elements.availablePoints.parentElement.classList.toggle('has-points', availablePoints > 0);
  }
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
    
    console.log('[RepoComPass] checkCurrentTab - Current tab:', {
      url: tab?.url,
      id: tab?.id,
      isJobSite: isJobSite(tab?.url)
    });
    
    if (isJobSite(tab.url)) {
      updateStatus('analyzing', '🔍', 'SCANNING QUEST BOARD...');
      
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getJobData' });
        
        console.log('[RepoComPass] checkCurrentTab - Got response from content script:', {
          success: response?.success,
          hasData: !!response?.data,
          jobTitle: response?.data?.title,
          error: response?.error
        });
        
        if (response && response.success) {
          currentJobData = response.data;
          displayJobInfo(currentJobData);
          // Show "Ready to generate" status - NO auto-analysis
          updateStatus('ready', '✨', 'READY TO GENERATE QUEST ITEMS!');
          if (elements.generateBtn) {
            elements.generateBtn.disabled = false;  // Enable button immediately
          }
        } else {
          console.error('[RepoComPass] Content script returned error:', response?.error);
          updateStatus('error', '❌', response?.error || 'QUEST DATA CORRUPTED. TRY REFRESHING THE DUNGEON.');
          // Disable button on error
          if (elements.generateBtn) {
            elements.generateBtn.disabled = true;
          }
        }
      } catch (msgError) {
        console.error('[RepoComPass] Failed to communicate with content script:', msgError);
        updateStatus('error', '❌', 'CONTENT SCRIPT NOT LOADED. TRY REFRESHING THE PAGE.');
      }
    } else {
      updateStatus('idle', '🗡️', 'SEEK A JOB POSTING TO BEGIN YOUR QUEST...');
    }
  } catch (error) {
    console.error('[RepoComPass] Error checking tab:', error);
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
  elements.companyName.querySelector('span:last-child').textContent = jobData.company || 'MYSTERIOUS COMPANY';
  
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

    if (elements.generateBtn) {
      elements.generateBtn.disabled = false;
    }
    updateStatus('ready', '✨', 'READY TO GENERATE QUEST ITEMS!');

  } catch (error) {
    console.error('Company analysis error:', error);
    if (elements.generateBtn) {
      elements.generateBtn.disabled = false;
    }
    updateStatus('ready', '⚡', 'COMPANY ANALYSIS INCOMPLETE - GENERATE ANYWAY');
  }
}

function displayCompanyInfo(companyData) {
  if (!companyData) return;

  if (!elements.companyInfo) {
    console.error('[RepoComPass] displayCompanyInfo: elements.companyInfo is null');
    return;
  }

  elements.companyInfo.classList.remove('hidden');

  // Display website link
  if (elements.companyWebsite) {
    if (companyData.website) {
      elements.companyWebsite.href = companyData.website;
      elements.companyWebsite.classList.remove('hidden');
    } else {
      elements.companyWebsite.classList.add('hidden');
    }
  }

  // Display blog link
  if (elements.companyBlog) {
    if (companyData.engineeringBlog) {
      elements.companyBlog.href = companyData.engineeringBlog;
      elements.companyBlog.classList.remove('hidden');
    } else {
      elements.companyBlog.classList.add('hidden');
    }
  }

  // Display GitHub org link
  if (elements.companyGithub) {
    if (companyData.githubOrg) {
      elements.companyGithub.href = companyData.githubOrg;
      elements.companyGithub.classList.remove('hidden');
    } else {
      elements.companyGithub.classList.add('hidden');
    }
  }

  // Display tech stack
  if (elements.companyTechStack && elements.companyTechTags) {
    if (companyData.techStack && companyData.techStack.length > 0) {
      elements.companyTechStack.classList.remove('hidden');
      elements.companyTechTags.innerHTML = companyData.techStack
        .slice(0, 8)
        .map(tech => `<span class="tech-tag">${tech}</span>`)
        .join('');
    } else {
      elements.companyTechStack.classList.add('hidden');
    }
  }

  // Display recent projects
  if (elements.companyProjects) {
    if (companyData.recentProjects && companyData.recentProjects.length > 0) {
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
      elements.companyProjects.classList.remove('hidden');
    } else {
      elements.companyProjects.classList.add('hidden');
    }
  }
}

// ==========================================
// GENERATE IDEAS BUTTON SETUP
// ==========================================
function setupGenerateButton() {
  if (!elements.generateBtn) {
    console.error('[RepoComPass] Generate button not found!');
    return;
  }

  elements.generateBtn.addEventListener('click', async () => {
    const btnText = elements.generateBtn.querySelector('.btn-text');
    const btnLoader = elements.generateBtn.querySelector('.btn-loader');

    // Validate button elements exist
    if (!btnText || !btnLoader) {
      console.error('[RepoComPass] Button elements not found:', { btnText: !!btnText, btnLoader: !!btnLoader });
      return;
    }

    elements.generateBtn.disabled = true;
    if (elements.errorMessage) {
      elements.errorMessage.classList.add('hidden');
    }
    playSound('generate');

    console.log('[RepoComPass] Generate Ideas: Starting two-step process (analyze + generate)');
    console.log('[RepoComPass] Current State:', {
      hasJobData: !!currentJobData,
      jobTitle: currentJobData?.title,
      jobCompany: currentJobData?.company,
      hasCompanyData: !!currentCompanyData,
      companyName: currentCompanyData?.company,
      playerSkills: playerStats.skills
    });

    try {
      const settings = await getSettings();

    if (!settings.openaiKey) {
      throw new Error('OPENAI API KEY REQUIRED! CHECK CONFIG.');
    }

    // Validate we have job data
    if (!currentJobData || !currentJobData.title) {
      throw new Error('NO JOB DATA! Please navigate to a job posting first.');
    }

    // Step 1: Analyze company (if not already done)
    if (!currentCompanyData || !currentCompanyData.company) {
      btnText.textContent = 'ANALYZING COMPANY...';
      btnLoader.classList.remove('hidden');
      updateStatus('analyzing', '🔍', 'RESEARCHING COMPANY INTELLIGENCE...');

      console.log('[RepoComPass] Step 1: Analyzing company...');

      const companyResponse = await chrome.runtime.sendMessage({
        action: 'analyzeCompany',
        data: {
          company: currentJobData.company,
          jobDescription: currentJobData.description,
          jobTitle: currentJobData.title
        }
      });

      if (companyResponse.success && companyResponse.data) {
        currentCompanyData = companyResponse.data;
        displayCompanyInfo(currentCompanyData);
        console.log('[RepoComPass] Company analysis completed successfully');
      } else {
        // Use empty fallback if company analysis fails
        console.warn('[RepoComPass] Company analysis failed, using fallback data');
        currentCompanyData = {
          company: currentJobData.company,
          website: null,
          engineeringBlog: null,
          techStack: [],
          recentProjects: [],
          insights: []
        };
      }
    } else {
      console.log('[RepoComPass] Company data already available, skipping analysis');
    }

    // Step 2: Generate project ideas
    btnText.textContent = 'GENERATING IDEAS...';
    updateStatus('analyzing', '⚡', 'FORGING QUEST ITEMS...');

    console.log('[RepoComPass] Step 2: Generating project ideas...');
    console.log('[RepoComPass] Sending generateIdeas request with:', {
      jobData: currentJobData,
      companyData: currentCompanyData,
      playerStats: playerStats.skills
    });

    const response = await chrome.runtime.sendMessage({
      action: 'generateIdeas',
      data: {
        jobData: currentJobData,
        companyData: currentCompanyData,
        playerStats: playerStats.skills,
        apiKey: settings.openaiKey
      }
    });

    console.log('[RepoComPass] Generate Ideas: Received response', {
      success: response.success,
      ideasCount: response.ideas?.length || 0,
      webSearchUsed: response.webSearchUsed,
      responseType: typeof response.ideas,
      isArray: Array.isArray(response.ideas)
    });

    if (response.success && response.ideas && response.ideas.length > 0) {
      displayProjectIdeas(response.ideas);
      updateStatus('success', '🎉', 'QUEST ITEMS GENERATED!');
      playSound('success');
    } else {
      throw new Error(response.error || 'NO IDEAS GENERATED');
    }
  } catch (error) {
    console.error('[RepoComPass] Generate Ideas: Error occurred', {
      message: error.message,
      error: error
    });
    showError(error.message);
    updateStatus('error', '❌', error.message);
    playSound('error');
  } finally {
    btnText.textContent = 'GENERATE QUEST ITEMS';
    btnLoader.classList.add('hidden');
    elements.generateBtn.disabled = false;
  }
  });
}

function displayProjectIdeas(ideas) {
  console.log('[RepoComPass] Display Ideas: Called with', {
    ideasCount: ideas?.length || 0,
    firstIdea: ideas?.[0]?.title || 'N/A'
  });

  // Defensive null checks
  if (!elements.projectIdeas) {
    console.error('[RepoComPass] Display Ideas: elements.projectIdeas is null');
    showError('UI ERROR: Project ideas container not found');
    return;
  }

  if (!elements.ideasList) {
    console.error('[RepoComPass] Display Ideas: elements.ideasList is null');
    showError('UI ERROR: Ideas list element not found');
    return;
  }

  // Validate input
  if (!Array.isArray(ideas)) {
    console.error('[RepoComPass] Display Ideas: ideas is not an array', {
      type: typeof ideas,
      value: ideas
    });
    showError('DISPLAY ERROR: Invalid ideas format');
    return;
  }

  if (ideas.length === 0) {
    console.warn('[RepoComPass] Display Ideas: Empty ideas array - showing empty state');
    displayEmptyIdeasState();
    return;
  }

  // Show container
  elements.projectIdeas.classList.remove('hidden');

  const rarities = ['🟢', '🔵', '🟣', '🟡'];

  try {
    elements.ideasList.innerHTML = ideas.map((idea, index) => {
      // Validate each idea object
      if (!idea || typeof idea !== 'object') {
        console.warn('[RepoComPass] Display Ideas: Invalid idea object at index', index, idea);
        return '';
      }

      const title = idea.title || 'Untitled Project';
      const description = idea.description || 'No description provided';
      const technologies = Array.isArray(idea.technologies) ? idea.technologies : [];

      return `
        <div class="loot-item">
          <div class="loot-item-header">
            <span class="loot-rarity">${rarities[index % rarities.length]}</span>
            <span class="loot-name">${title}</span>
          </div>
          <p class="loot-description">${description}</p>
          <div class="loot-tags">
            ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
          <div class="loot-actions">
            <button class="pixel-btn small save-idea-btn" data-index="${index}">
              <span>📥</span> COLLECT
            </button>
          </div>
        </div>
      `;
    }).filter(html => html !== '').join('');

    console.log('[RepoComPass] Display Ideas: Successfully rendered', ideas.length, 'ideas');

    // Add save handlers
    elements.ideasList.querySelectorAll('.save-idea-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const button = e.currentTarget;
        const index = parseInt(button.dataset.index);
        console.log('[RepoComPass] Saving idea at index', index);
        await saveIdea(ideas[index]);
        button.innerHTML = '<span>✓</span> COLLECTED';
        button.disabled = true;
        playSound('collect');
      });
    });
  } catch (error) {
    console.error('[RepoComPass] Display Ideas: Error rendering HTML', error);
    showError('DISPLAY ERROR: Failed to render ideas');
  }
}

function displayEmptyIdeasState() {
  console.log('[RepoComPass] Displaying empty ideas state');

  // Show container
  elements.projectIdeas.classList.remove('hidden');

  // Display empty state message
  elements.ideasList.innerHTML = `
    <div class="empty-loot">
      <span class="empty-icon">🎲</span>
      <p class="empty-message">NO IDEAS GENERATED</p>
      <p class="empty-hint">The AI couldn't generate ideas. Try:</p>
      <ul class="empty-suggestions">
        <li>Check your API key is valid</li>
        <li>Ensure job data was loaded correctly</li>
        <li>Try adjusting your skill levels</li>
        <li>Check console for errors (F12)</li>
      </ul>
    </div>
  `;
}

function showError(message) {
  console.log('[RepoComPass] Showing error:', message);

  if (!elements.errorMessage) {
    console.error('[RepoComPass] Error: elements.errorMessage is null');
    alert('ERROR: ' + message); // Fallback
    return;
  }

  elements.errorMessage.classList.remove('hidden');
  const errorTextElement = elements.errorMessage.querySelector('.error-text');

  if (errorTextElement) {
    errorTextElement.textContent = message;
  } else {
    console.error('[RepoComPass] Error: .error-text element not found');
  }

  // Auto-hide after 8 seconds
  setTimeout(() => {
    elements.errorMessage.classList.add('hidden');
  }, 8000);
}

// ==========================================
// INVENTORY (SAVED IDEAS)
// ==========================================

// Points awarded based on project difficulty
const DIFFICULTY_POINTS = {
  beginner: 1,
  intermediate: 2,
  advanced: 3
};

async function loadSavedIdeas() {
  const savedIdeas = playerStats.savedIdeas || [];

  // Null safety checks
  if (!elements.inventoryCount || !elements.savedIdeasList || !elements.clearInventoryBtn) {
    console.error('[RepoComPass] loadSavedIdeas: Required elements not found');
    return;
  }

  const completedCount = savedIdeas.filter(i => i.completed).length;
  const pendingCount = savedIdeas.length - completedCount;

  elements.inventoryCount.textContent = `${pendingCount} PENDING | ${completedCount} DONE`;

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
  elements.savedIdeasList.innerHTML = savedIdeas.map((idea, index) => {
    const isCompleted = idea.completed;
    const difficulty = idea.difficulty || 'intermediate';
    const pointsValue = DIFFICULTY_POINTS[difficulty] || 2;
    
    return `
    <div class="inventory-item ${isCompleted ? 'completed' : ''}">
      <div class="inventory-item-header">
        <span class="inventory-item-title">${isCompleted ? '✅ ' : ''}${idea.title}</span>
        <button class="pixel-btn danger small remove-item-btn" data-index="${index}">✕</button>
      </div>
      <p class="inventory-item-source">📍 ${idea.company} - ${idea.jobTitle}</p>
      <p class="inventory-item-desc">${idea.description}</p>
      <div class="inventory-item-meta">
        <span class="difficulty-badge ${difficulty}">${difficulty.toUpperCase()}</span>
        <span class="points-badge">+${pointsValue} PTS</span>
      </div>
      <div class="loot-tags">
        ${(idea.technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
      </div>
      ${!isCompleted ? `
        <div class="inventory-item-actions">
          <button class="pixel-btn success complete-project-btn" data-index="${index}" data-points="${pointsValue}">
            <span>🏆</span> MARK COMPLETE (+${pointsValue} PTS)
          </button>
        </div>
      ` : `
        <div class="inventory-item-completed">
          <span class="completed-badge">🎉 COMPLETED ${idea.completedAt ? new Date(idea.completedAt).toLocaleDateString() : ''}</span>
        </div>
      `}
    </div>
  `;
  }).join('');
  
  // Add complete handlers
  elements.savedIdeasList.querySelectorAll('.complete-project-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const button = e.currentTarget;
      const index = parseInt(button.dataset.index);
      const points = parseInt(button.dataset.points);
      await completeProject(index, points);
    });
  });
  
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

// Complete a project and award skill points
async function completeProject(index, points) {
  const idea = playerStats.savedIdeas[index];
  if (!idea || idea.completed) return;
  
  // Mark as completed
  idea.completed = true;
  idea.completedAt = new Date().toISOString();
  
  // Award points
  playerStats.availablePoints = (playerStats.availablePoints || 0) + points;
  playerStats.completedProjects = (playerStats.completedProjects || 0) + 1;
  
  // Save and update UI
  await savePlayerStats();
  loadSavedIdeas();
  updatePlayerBar();
  updateCharacterSheet();
  
  // Play celebration sound and show notification
  playSound('levelUp');
  
  // Show points earned notification
  showPointsEarned(points);
}

// Show floating notification for earned points
function showPointsEarned(points) {
  const notification = document.createElement('div');
  notification.className = 'points-notification';
  notification.innerHTML = `
    <span class="points-earned">+${points} SKILL POINTS!</span>
    <span class="points-hint">Spend in STATS tab</span>
  `;
  document.body.appendChild(notification);
  
  // Animate and remove
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2500);
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