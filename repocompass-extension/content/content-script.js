// Content Script - Extracts job posting data from supported sites
// Optimized with caching, MutationObserver, and pre-extraction

// =============================================================================
// CACHE & STATE
// =============================================================================

const jobDataCache = {
  data: null,
  url: null,
  timestamp: null,
  TTL: 30000 // 30 seconds cache validity
};

let extractionInProgress = false;
let contentObserver = null;
let cachedSite = null;

// =============================================================================
// SITE-SPECIFIC SELECTORS
// =============================================================================

const SELECTORS = {
  linkedin: {
    title: '.job-details-jobs-unified-top-card__job-title, .t-24.t-bold',
    company: '.job-details-jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__primary-description-container a',
    description: '.jobs-description__content, .jobs-box__html-content',
    hiringManager: '.jobs-poster__name, .hirer-card__hirer-information .app-aware-link',
    location: '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
    requirements: '.jobs-description__content li',
    container: '.jobs-search__job-details, .job-view-layout'
  },
  indeed: {
    title: '.jobsearch-JobInfoHeader-title, [data-testid="jobsearch-JobInfoHeader-title"]',
    company: '.jobsearch-InlineCompanyRating-companyHeader, [data-testid="inlineHeader-companyName"]',
    description: '#jobDescriptionText',
    location: '.jobsearch-JobInfoHeader-subtitle .companyLocation, [data-testid="job-location"]',
    requirements: '#jobDescriptionText li',
    container: '#jobDescriptionText, .jobsearch-ViewJobLayout'
  },
  glassdoor: {
    title: '[data-test="jobTitle"], .JobDetails_jobTitle__Rw_gn',
    company: '[data-test="employer-name"], .JobDetails_companyName__bMEu8',
    description: '[data-test="description"], .JobDetails_jobDescription__uW_fK',
    location: '[data-test="location"], .JobDetails_location__mSg5h',
    requirements: '[data-test="description"] li',
    container: '[data-test="description"], .JobDetails'
  }
};

// Technology patterns - compiled once
const TECH_PATTERNS = [
  /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Go|Rust|Ruby|PHP|Swift|Kotlin|Scala)\b/gi,
  /\b(React|Angular|Vue|Next\.js|Node\.js|Django|Flask|Spring|Rails|Express|FastAPI|NestJS|Svelte)\b/gi,
  /\b(PostgreSQL|MySQL|MongoDB|Redis|Elasticsearch|DynamoDB|Cassandra|SQLite|Oracle|SQL Server)\b/gi,
  /\b(AWS|Azure|GCP|Docker|Kubernetes|Terraform|Jenkins|CircleCI|GitHub Actions|GitLab CI)\b/gi,
  /\b(GraphQL|REST|gRPC|WebSocket|Microservices|Machine Learning|ML|AI|Data Science|LLM)\b/gi
];

// =============================================================================
// UTILITY FUNCTIONS (Optimized)
// =============================================================================

// Detect current site (cached)
function detectSite() {
  if (cachedSite !== null) return cachedSite;
  const hostname = window.location.hostname;
  if (hostname.includes('linkedin.com')) cachedSite = 'linkedin';
  else if (hostname.includes('indeed.com')) cachedSite = 'indeed';
  else if (hostname.includes('glassdoor.com')) cachedSite = 'glassdoor';
  else cachedSite = null;
  return cachedSite;
}

// Optimized: Query with combined selector, fallback to individual
function getText(selectorString) {
  if (!selectorString) return null;
  try {
    const element = document.querySelector(selectorString);
    return element?.textContent?.trim() || null;
  } catch (error) {
    const selectors = selectorString.split(', ');
    for (const sel of selectors) {
      try {
        const element = document.querySelector(sel);
        if (element?.textContent) return element.textContent.trim();
      } catch (e) { /* skip */ }
    }
    return null;
  }
}

// Optimized: Single querySelectorAll
function getAllText(selectorString) {
  if (!selectorString) return [];
  const texts = [];
  try {
    document.querySelectorAll(selectorString).forEach(el => {
      const text = el?.textContent?.trim();
      if (text) texts.push(text);
    });
  } catch (error) {
    const selectors = selectorString.split(', ');
    for (const sel of selectors) {
      try {
        document.querySelectorAll(sel).forEach(el => {
          const text = el?.textContent?.trim();
          if (text) texts.push(text);
        });
      } catch (e) { /* skip */ }
    }
  }
  return texts;
}

// Optimized: Single query for description
function getDescription(selectorString) {
  if (!selectorString) return { text: '', html: '' };
  try {
    const element = document.querySelector(selectorString);
    if (element) {
      return {
        text: element.textContent?.trim() || '',
        html: element.innerHTML || ''
      };
    }
  } catch (error) {
    const selectors = selectorString.split(', ');
    for (const sel of selectors) {
      try {
        const element = document.querySelector(sel);
        if (element) {
          return {
            text: element.textContent?.trim() || '',
            html: element.innerHTML || ''
          };
        }
      } catch (e) { /* skip */ }
    }
  }
  return { text: '', html: '' };
}

// =============================================================================
// EXTRACTION FUNCTIONS
// =============================================================================

function extractTechnologies(text) {
  if (!text || typeof text !== 'string') return [];
  const technologies = new Set();
  for (const pattern of TECH_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) matches.forEach(m => technologies.add(m));
  }
  return Array.from(technologies);
}

function extractExperience(text) {
  if (!text || typeof text !== 'string') return null;
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/gi,
    /experience:\s*(\d+)\+?\s*(?:years?|yrs?)/gi
  ];
  let maxYears = 0;
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const years = parseInt(match[1]);
      if (!isNaN(years) && years > maxYears) maxYears = years;
    }
  }
  return maxYears > 0 ? maxYears : null;
}

function extractHiringManager(site, selectors) {
  if (!site || !selectors) return null;
  
  if (site === 'linkedin') {
    const posterName = document.querySelector('.jobs-poster__name');
    if (posterName?.textContent) return posterName.textContent.trim();
    
    const hirerCard = document.querySelector('.hirer-card__hirer-information .app-aware-link');
    if (hirerCard?.textContent) return hirerCard.textContent.trim();
    
    const recruiterLink = document.querySelector('.jobs-unified-top-card__primary-description a[href*="/in/"]');
    if (recruiterLink?.textContent) return recruiterLink.textContent.trim();
  }
  
  return getText(selectors.hiringManager);
}

// =============================================================================
// CACHE MANAGEMENT
// =============================================================================

function isCacheValid() {
  if (!jobDataCache.data || !jobDataCache.timestamp) return false;
  if (jobDataCache.url !== window.location.href) return false;
  if (Date.now() - jobDataCache.timestamp > jobDataCache.TTL) return false;
  return true;
}

function updateCache(data) {
  jobDataCache.data = data;
  jobDataCache.url = window.location.href;
  jobDataCache.timestamp = Date.now();
}

function invalidateCache() {
  jobDataCache.data = null;
  jobDataCache.url = null;
  jobDataCache.timestamp = null;
}

// =============================================================================
// MAIN EXTRACTION (Optimized with caching)
// =============================================================================

function extractJobData(options = {}) {
  const { skipCache = false, lightMode = false } = options;
  
  // Return cached data if valid
  if (!skipCache && isCacheValid()) {
    console.log('[RepoComPass] Returning cached job data');
    return { success: true, data: jobDataCache.data, fromCache: true };
  }
  
  const site = detectSite();
  if (!site) return { success: false, error: 'Unsupported site' };
  
  const selectors = SELECTORS[site];
  if (!selectors) return { success: false, error: 'No selectors defined for site' };
  
  // Batch DOM reads
  const title = getText(selectors.title);
  const company = getText(selectors.company);
  
  // Early exit if content not loaded
  if (!title && !company) {
    return {
      success: false,
      error: 'Job content not loaded yet',
      partial: { site, url: window.location.href }
    };
  }
  
  const location = getText(selectors.location);
  const description = getDescription(selectors.description);
  const requirements = getAllText(selectors.requirements);
  const hiringManager = extractHiringManager(site, selectors);
  
  const jobData = {
    site,
    url: window.location.href,
    title,
    company,
    location,
    description: description.text,
    descriptionHtml: description.html,
    hiringManager,
    requirements,
    extractedAt: new Date().toISOString()
  };
  
  // Heavy extraction (skip in lightMode for faster initial response)
  if (!lightMode) {
    const combinedText = [description.text, requirements.join(' ')].filter(Boolean).join(' ');
    jobData.technologies = extractTechnologies(combinedText);
    jobData.experienceRequired = extractExperience(description.text);
  } else {
    jobData.technologies = [];
    jobData.experienceRequired = null;
  }
  
  if (!jobData.title || !jobData.company) {
    return {
      success: false,
      error: 'Missing required job fields (title or company)',
      partial: jobData
    };
  }
  
  // Update cache
  updateCache(jobData);
  
  return { success: true, data: jobData, fromCache: false };
}

// =============================================================================
// MUTATION OBSERVER (Replace polling)
// =============================================================================

function waitForContent(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const site = detectSite();
    if (!site) {
      reject(new Error('Unsupported site'));
      return;
    }
    
    const selectors = SELECTORS[site];
    const titleSelector = selectors.title.split(', ')[0];
    
    // Check if content already exists
    const existingElement = document.querySelector(titleSelector);
    if (existingElement?.textContent?.trim()) {
      resolve(existingElement);
      return;
    }
    
    const startTime = Date.now();
    
    // MutationObserver for instant detection
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(titleSelector);
      if (element?.textContent?.trim()) {
        obs.disconnect();
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        obs.disconnect();
        reject(new Error('Timeout waiting for content'));
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Fallback timeout
    setTimeout(() => {
      observer.disconnect();
      const element = document.querySelector(titleSelector);
      if (element?.textContent?.trim()) {
        resolve(element);
      } else {
        reject(new Error('Timeout waiting for content'));
      }
    }, timeout);
  });
}

// =============================================================================
// SPA NAVIGATION OBSERVER
// =============================================================================

function setupContentObserver() {
  const site = detectSite();
  if (!site || contentObserver) return;
  
  let lastUrl = window.location.href;
  
  // Observe for SPA navigation
  contentObserver = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      console.log('[RepoComPass] URL changed, invalidating cache');
      invalidateCache();
      schedulePreExtraction();
    }
  });
  
  contentObserver.observe(document.body, { childList: true, subtree: true });
  
  // Back/forward navigation
  window.addEventListener('popstate', () => {
    invalidateCache();
    schedulePreExtraction();
  });
}

// =============================================================================
// PRE-EXTRACTION (Background extraction on page load)
// =============================================================================

let preExtractionScheduled = false;

function schedulePreExtraction() {
  if (preExtractionScheduled || extractionInProgress) return;
  preExtractionScheduled = true;
  
  const schedule = typeof requestIdleCallback !== 'undefined' 
    ? requestIdleCallback 
    : (cb) => setTimeout(cb, 100);
  
  schedule(() => {
    preExtractionScheduled = false;
    preExtractJobData();
  }, { timeout: 2000 });
}

async function preExtractJobData() {
  if (extractionInProgress) return;
  
  const site = detectSite();
  if (!site) return;
  
  extractionInProgress = true;
  
  try {
    await waitForContent(3000);
    const result = extractJobData({ skipCache: true });
    if (result.success) {
      console.log('[RepoComPass] Pre-extracted:', result.data.title);
    }
  } catch (error) {
    console.log('[RepoComPass] Pre-extraction skipped:', error.message);
  } finally {
    extractionInProgress = false;
  }
}

// =============================================================================
// MESSAGE HANDLER (Cache-first response)
// =============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJobData') {
    const site = detectSite();
    if (!site) {
      sendResponse({ success: false, error: 'Not a supported job site' });
      return true;
    }
    
    // Cache-first for instant response
    if (isCacheValid()) {
      console.log('[RepoComPass] Instant response from cache');
      sendResponse({ success: true, data: jobDataCache.data, fromCache: true });
      return true;
    }
    
    // Try immediate extraction
    const immediateResult = extractJobData();
    if (immediateResult.success) {
      sendResponse(immediateResult);
      return true;
    }
    
    // Wait for content if not ready
    waitForContent(5000)
      .then(() => {
        const result = extractJobData({ skipCache: true });
        sendResponse(result);
      })
      .catch(error => {
        console.error('[RepoComPass] Content timeout:', error);
        const result = extractJobData({ skipCache: true, lightMode: true });
        sendResponse({
          success: result.success,
          data: result.data || result.partial,
          error: result.error,
          partial: !result.success
        });
      });
    
    return true;
  }
});

// =============================================================================
// AUTO-ANALYZE
// =============================================================================

async function autoAnalyzeIfEnabled() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {};
    
    if (settings.autoAnalyze) {
      const jobData = extractJobData();
      if (jobData.success) {
        chrome.runtime.sendMessage({
          action: 'autoAnalyze',
          data: jobData.data
        });
      }
    }
  } catch (error) {
    console.error('[RepoComPass] Auto-analyze error:', error);
  }
}

// =============================================================================
// FLOATING BUTTON (FAB)
// =============================================================================

function injectQuickAccessButton() {
  if (document.getElementById('repocompass-fab') || !document.body) return;
  
  const fab = document.createElement('div');
  fab.id = 'repocompass-fab';
  fab.innerHTML = '🧭';
  fab.title = 'Open RepoComPass';
  fab.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    z-index: 10000;
    transition: transform 0.2s, box-shadow 0.2s;
    user-select: none;
  `;
  
  fab.addEventListener('mouseenter', () => {
    fab.style.transform = 'scale(1.1)';
    fab.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
  });
  
  fab.addEventListener('mouseleave', () => {
    fab.style.transform = 'scale(1)';
    fab.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
  });
  
  fab.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' }).catch(err => {
      console.error('[RepoComPass] Error opening popup:', err);
    });
  });
  
  document.body.appendChild(fab);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

function initialize() {
  const site = detectSite();
  if (!site) return;
  
  console.log('[RepoComPass] Initializing on', site);
  
  // Set up SPA navigation observer
  setupContentObserver();
  
  // Inject FAB
  injectQuickAccessButton();
  
  // Pre-extract job data in background
  schedulePreExtraction();
  
  // Auto-analyze after extraction
  setTimeout(autoAnalyzeIfEnabled, 2500);
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
