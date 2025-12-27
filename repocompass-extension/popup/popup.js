// Popup.js - Main popup logic for RepoComPass

// DOM Elements
const elements = {
  tabs: document.querySelectorAll('.tab'),
  tabContents: document.querySelectorAll('.tab-content'),
  statusCard: document.getElementById('statusCard'),
  statusText: document.getElementById('statusText'),
  jobInfo: document.getElementById('jobInfo'),
  jobTitle: document.getElementById('jobTitle'),
  companyName: document.getElementById('companyName'),
  managerInfo: document.getElementById('managerInfo'),
  managerName: document.getElementById('managerName'),
  githubLink: document.getElementById('githubLink'),
  linkedinLink: document.getElementById('linkedinLink'),
  techStack: document.getElementById('techStack'),
  techTags: document.getElementById('techTags'),
  generateBtn: document.getElementById('generateBtn'),
  projectIdeas: document.getElementById('projectIdeas'),
  ideasList: document.getElementById('ideasList'),
  errorMessage: document.getElementById('errorMessage'),
  savedIdeasList: document.getElementById('savedIdeasList'),
  clearSavedBtn: document.getElementById('clearSavedBtn'),
  openaiKey: document.getElementById('openaiKey'),
  githubToken: document.getElementById('githubToken'),
  serpApiKey: document.getElementById('serpApiKey'),
  enableCache: document.getElementById('enableCache'),
  autoAnalyze: document.getElementById('autoAnalyze'),
  cacheExpiry: document.getElementById('cacheExpiry'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  settingsStatus: document.getElementById('settingsStatus')
};

// State
let currentJobData = null;
let currentManagerData = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  setupSettings();
  await loadSettings();
  await loadSavedIdeas();
  await checkCurrentTab();
});

// Tab Navigation
function setupTabs() {
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.tabs.forEach(t => t.classList.remove('active'));
      elements.tabContents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

// Check current tab for job posting
async function checkCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (isJobSite(tab.url)) {
      updateStatus('analyzing', 'Analyzing job posting...');
      
      // Request job data from content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getJobData' });
      
      if (response && response.success) {
        currentJobData = response.data;
        displayJobInfo(currentJobData);
        await analyzeHiringManager(currentJobData);
      } else {
        updateStatus('error', 'Could not extract job information. Try refreshing the page.');
      }
    } else {
      updateStatus('info', 'Navigate to a job posting on LinkedIn, Indeed, or Glassdoor to get started.');
    }
  } catch (error) {
    console.error('Error checking tab:', error);
    updateStatus('info', 'Navigate to a job posting to get started.');
  }
}

// Check if URL is a supported job site
function isJobSite(url) {
  const jobSites = [
    'linkedin.com/jobs',
    'indeed.com',
    'glassdoor.com/job'
  ];
  return jobSites.some(site => url?.includes(site));
}

// Update status display
function updateStatus(type, message) {
  const icons = {
    info: '📋',
    analyzing: '🔍',
    success: '✅',
    error: '❌'
  };
  
  elements.statusCard.querySelector('.status-icon').textContent = icons[type] || '📋';
  elements.statusText.textContent = message;
}

// Display job information
function displayJobInfo(jobData) {
  elements.jobInfo.classList.remove('hidden');
  elements.jobTitle.textContent = jobData.title || 'Unknown Position';
  elements.companyName.textContent = jobData.company || 'Unknown Company';
  updateStatus('success', 'Job posting analyzed');
}

// Analyze hiring manager
async function analyzeHiringManager(jobData) {
  try {
    // Check cache first
    const settings = await getSettings();
    if (settings.enableCache) {
      const cached = await getCachedManager(jobData.company, jobData.hiringManager);
      if (cached) {
        currentManagerData = cached;
        displayManagerInfo(cached);
        elements.generateBtn.disabled = false;
        return;
      }
    }

    // Send to background for API processing
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeManager',
      data: {
        hiringManager: jobData.hiringManager,
        company: jobData.company,
        jobTitle: jobData.title
      }
    });

    if (response.success) {
      currentManagerData = response.data;
      displayManagerInfo(response.data);
      
      // Cache the result
      if (settings.enableCache) {
        await cacheManagerData(jobData.company, jobData.hiringManager, response.data);
      }
    } else {
      // Still allow generation without manager data
      currentManagerData = { name: 'Not found', github: null, linkedin: null, techStack: [] };
      displayManagerInfo(currentManagerData);
    }
    
    elements.generateBtn.disabled = false;
  } catch (error) {
    console.error('Error analyzing manager:', error);
    elements.generateBtn.disabled = false;
  }
}

// Display manager information
function displayManagerInfo(managerData) {
  elements.managerInfo.classList.remove('hidden');
  elements.managerName.textContent = managerData.name || 'Not found';
  
  if (managerData.github) {
    elements.githubLink.href = managerData.github;
    elements.githubLink.classList.remove('hidden');
  }
  
  if (managerData.linkedin) {
    elements.linkedinLink.href = managerData.linkedin;
    elements.linkedinLink.classList.remove('hidden');
  }
  
  if (managerData.techStack && managerData.techStack.length > 0) {
    elements.techStack.classList.remove('hidden');
    elements.techTags.innerHTML = managerData.techStack
      .map(tech => `<span class="tag">${tech}</span>`)
      .join('');
  }
}

// Generate project ideas
elements.generateBtn.addEventListener('click', async () => {
  const btnText = elements.generateBtn.querySelector('.btn-text');
  const btnLoader = elements.generateBtn.querySelector('.btn-loader');
  
  btnText.textContent = 'Generating...';
  btnLoader.classList.remove('hidden');
  elements.generateBtn.disabled = true;
  elements.errorMessage.classList.add('hidden');
  
  try {
    const settings = await getSettings();
    
    if (!settings.openaiKey) {
      throw new Error('Please add your OpenAI API key in Settings to generate project ideas.');
    }
    
    const response = await chrome.runtime.sendMessage({
      action: 'generateIdeas',
      data: {
        jobData: currentJobData,
        managerData: currentManagerData,
        apiKey: settings.openaiKey
      }
    });
    
    if (response.success) {
      displayProjectIdeas(response.ideas);
    } else {
      throw new Error(response.error || 'Failed to generate ideas');
    }
  } catch (error) {
    elements.errorMessage.textContent = error.message;
    elements.errorMessage.classList.remove('hidden');
  } finally {
    btnText.textContent = 'Generate Project Ideas';
    btnLoader.classList.add('hidden');
    elements.generateBtn.disabled = false;
  }
});

// Display project ideas
function displayProjectIdeas(ideas) {
  elements.projectIdeas.classList.remove('hidden');
  elements.ideasList.innerHTML = ideas.map((idea, index) => `
    <div class="idea-card" data-index="${index}">
      <h5>${idea.title}</h5>
      <p>${idea.description}</p>
      <div class="idea-tags">
        ${idea.technologies.map(tech => `<span class="tag">${tech}</span>`).join('')}
      </div>
      <div class="idea-actions">
        <button class="save-btn" data-index="${index}">💾 Save</button>
      </div>
    </div>
  `).join('');
  
  // Add save handlers
  elements.ideasList.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.target.dataset.index);
      await saveIdea(ideas[index]);
      e.target.textContent = '✓ Saved';
      e.target.classList.add('saved');
      e.target.disabled = true;
    });
  });
}

// Save idea to storage
async function saveIdea(idea) {
  const savedIdeas = await getSavedIdeas();
  const newIdea = {
    ...idea,
    jobTitle: currentJobData?.title,
    company: currentJobData?.company,
    savedAt: new Date().toISOString()
  };
  savedIdeas.push(newIdea);
  await chrome.storage.local.set({ savedIdeas });
  await loadSavedIdeas();
}

// Get saved ideas from storage
async function getSavedIdeas() {
  const result = await chrome.storage.local.get('savedIdeas');
  return result.savedIdeas || [];
}

// Load and display saved ideas
async function loadSavedIdeas() {
  const savedIdeas = await getSavedIdeas();
  
  if (savedIdeas.length === 0) {
    elements.savedIdeasList.innerHTML = `
      <p class="empty-state">No saved ideas yet. Generate and save project ideas from job postings!</p>
    `;
    elements.clearSavedBtn.classList.add('hidden');
    return;
  }
  
  elements.clearSavedBtn.classList.remove('hidden');
  elements.savedIdeasList.innerHTML = savedIdeas.map((idea, index) => `
    <div class="saved-idea-card">
      <p class="job-ref">${idea.company} - ${idea.jobTitle}</p>
      <h5>${idea.title}</h5>
      <p>${idea.description}</p>
      <div class="idea-tags">
        ${idea.technologies.map(tech => `<span class="tag">${tech}</span>`).join('')}
      </div>
      <button class="remove-btn" data-index="${index}">Remove</button>
    </div>
  `).join('');
  
  // Add remove handlers
  elements.savedIdeasList.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.target.dataset.index);
      savedIdeas.splice(index, 1);
      await chrome.storage.local.set({ savedIdeas });
      await loadSavedIdeas();
    });
  });
}

// Clear all saved ideas
elements.clearSavedBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to clear all saved ideas?')) {
    await chrome.storage.local.set({ savedIdeas: [] });
    await loadSavedIdeas();
  }
});

// Settings
function setupSettings() {
  // Toggle password visibility
  document.querySelectorAll('.toggle-visibility').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
  
  // Save settings
  elements.saveSettingsBtn.addEventListener('click', saveSettings);
}

async function loadSettings() {
  const settings = await getSettings();
  elements.openaiKey.value = settings.openaiKey || '';
  elements.githubToken.value = settings.githubToken || '';
  elements.serpApiKey.value = settings.serpApiKey || '';
  elements.enableCache.checked = settings.enableCache !== false;
  elements.autoAnalyze.checked = settings.autoAnalyze || false;
  elements.cacheExpiry.value = settings.cacheExpiry || 24;
}

async function saveSettings() {
  const settings = {
    openaiKey: elements.openaiKey.value.trim(),
    githubToken: elements.githubToken.value.trim(),
    serpApiKey: elements.serpApiKey.value.trim(),
    enableCache: elements.enableCache.checked,
    autoAnalyze: elements.autoAnalyze.checked,
    cacheExpiry: parseInt(elements.cacheExpiry.value) || 24
  };
  
  await chrome.storage.local.set({ settings });
  
  elements.settingsStatus.textContent = 'Settings saved successfully!';
  elements.settingsStatus.className = 'settings-status success';
  elements.settingsStatus.classList.remove('hidden');
  
  setTimeout(() => {
    elements.settingsStatus.classList.add('hidden');
  }, 3000);
}

async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  return result.settings || {};
}

// Cache functions
async function getCachedManager(company, managerName) {
  const cacheKey = `manager_${company}_${managerName}`.replace(/\s+/g, '_');
  const result = await chrome.storage.local.get(cacheKey);
  
  if (result[cacheKey]) {
    const cached = result[cacheKey];
    const settings = await getSettings();
    const expiryHours = settings.cacheExpiry || 24;
    const expiryTime = expiryHours * 60 * 60 * 1000;
    
    if (Date.now() - cached.timestamp < expiryTime) {
      return cached.data;
    }
  }
  return null;
}

async function cacheManagerData(company, managerName, data) {
  const cacheKey = `manager_${company}_${managerName}`.replace(/\s+/g, '_');
  await chrome.storage.local.set({
    [cacheKey]: {
      data,
      timestamp: Date.now()
    }
  });
}
