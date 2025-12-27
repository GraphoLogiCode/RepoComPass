// Content Script - Extracts job posting data from supported sites

// Site-specific selectors
const SELECTORS = {
  linkedin: {
    title: '.job-details-jobs-unified-top-card__job-title, .t-24.t-bold',
    company: '.job-details-jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__primary-description-container a',
    description: '.jobs-description__content, .jobs-box__html-content',
    hiringManager: '.jobs-poster__name, .hirer-card__hirer-information .app-aware-link',
    location: '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
    requirements: '.jobs-description__content li'
  },
  indeed: {
    title: '.jobsearch-JobInfoHeader-title, [data-testid="jobsearch-JobInfoHeader-title"]',
    company: '.jobsearch-InlineCompanyRating-companyHeader, [data-testid="inlineHeader-companyName"]',
    description: '#jobDescriptionText',
    location: '.jobsearch-JobInfoHeader-subtitle .companyLocation, [data-testid="job-location"]',
    requirements: '#jobDescriptionText li'
  },
  glassdoor: {
    title: '[data-test="jobTitle"], .JobDetails_jobTitle__Rw_gn',
    company: '[data-test="employer-name"], .JobDetails_companyName__bMEu8',
    description: '[data-test="description"], .JobDetails_jobDescription__uW_fK',
    location: '[data-test="location"], .JobDetails_location__mSg5h',
    requirements: '[data-test="description"] li'
  }
};

// Detect current site
function detectSite() {
  const hostname = window.location.hostname;
  if (hostname.includes('linkedin.com')) return 'linkedin';
  if (hostname.includes('indeed.com')) return 'indeed';
  if (hostname.includes('glassdoor.com')) return 'glassdoor';
  return null;
}

// Extract text from element
function getText(selector) {
  const selectors = selector.split(', ');
  for (const sel of selectors) {
    const element = document.querySelector(sel);
    if (element) {
      return element.textContent.trim();
    }
  }
  return null;
}

// Extract all text from multiple elements
function getAllText(selector) {
  const selectors = selector.split(', ');
  const texts = [];
  for (const sel of selectors) {
    const elements = document.querySelectorAll(sel);
    elements.forEach(el => {
      const text = el.textContent.trim();
      if (text) texts.push(text);
    });
  }
  return texts;
}

// Extract job description HTML
function getDescription(selector) {
  const selectors = selector.split(', ');
  for (const sel of selectors) {
    const element = document.querySelector(sel);
    if (element) {
      return {
        text: element.textContent.trim(),
        html: element.innerHTML
      };
    }
  }
  return { text: '', html: '' };
}

// Parse technologies from job description
function extractTechnologies(text) {
  const techPatterns = [
    // Languages
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Go|Rust|Ruby|PHP|Swift|Kotlin|Scala)\b/gi,
    // Frameworks
    /\b(React|Angular|Vue|Next\.js|Node\.js|Django|Flask|Spring|Rails|Express|FastAPI)\b/gi,
    // Databases
    /\b(PostgreSQL|MySQL|MongoDB|Redis|Elasticsearch|DynamoDB|Cassandra)\b/gi,
    // Cloud
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Terraform|Jenkins|CircleCI)\b/gi,
    // Other
    /\b(GraphQL|REST|API|Microservices|Machine Learning|ML|AI|Data Science)\b/gi
  ];
  
  const technologies = new Set();
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => technologies.add(match));
    }
  });
  
  return Array.from(technologies);
}

// Extract years of experience requirements
function extractExperience(text) {
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/gi,
    /experience:\s*(\d+)\+?\s*(?:years?|yrs?)/gi
  ];
  
  let maxYears = 0;
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const years = parseInt(match[1]);
      if (years > maxYears) maxYears = years;
    }
  });
  
  return maxYears > 0 ? maxYears : null;
}

// Extract hiring manager name (LinkedIn specific handling)
function extractHiringManager(site, selectors) {
  if (site === 'linkedin') {
    // Try multiple approaches for LinkedIn
    const posterName = document.querySelector('.jobs-poster__name');
    if (posterName) {
      return posterName.textContent.trim();
    }
    
    // Check for hirer card
    const hirerCard = document.querySelector('.hirer-card__hirer-information');
    if (hirerCard) {
      const name = hirerCard.querySelector('.app-aware-link');
      if (name) return name.textContent.trim();
    }
    
    // Check for recruiter info
    const recruiter = document.querySelector('[data-control-name="message_recruiter"]');
    if (recruiter) {
      const parent = recruiter.closest('.jobs-unified-top-card__primary-description');
      if (parent) {
        const links = parent.querySelectorAll('a');
        for (const link of links) {
          if (link.href.includes('/in/')) {
            return link.textContent.trim();
          }
        }
      }
    }
  }
  
  return getText(selectors.hiringManager);
}

// Main extraction function
function extractJobData() {
  const site = detectSite();
  if (!site) {
    return { success: false, error: 'Unsupported site' };
  }
  
  const selectors = SELECTORS[site];
  const description = getDescription(selectors.description);
  const requirements = getAllText(selectors.requirements);
  
  const jobData = {
    site,
    url: window.location.href,
    title: getText(selectors.title),
    company: getText(selectors.company),
    location: getText(selectors.location),
    description: description.text,
    descriptionHtml: description.html,
    hiringManager: extractHiringManager(site, selectors),
    requirements: requirements,
    technologies: extractTechnologies(description.text + ' ' + requirements.join(' ')),
    experienceRequired: extractExperience(description.text),
    extractedAt: new Date().toISOString()
  };
  
  return { success: true, data: jobData };
}

// Wait for page to load (for SPAs)
function waitForContent(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for content'));
      } else {
        setTimeout(check, 200);
      }
    };
    
    check();
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJobData') {
    const site = detectSite();
    if (!site) {
      sendResponse({ success: false, error: 'Not a supported job site' });
      return true;
    }
    
    // Wait for content to load (important for SPAs like LinkedIn)
    const titleSelector = SELECTORS[site].title.split(', ')[0];
    waitForContent(titleSelector)
      .then(() => {
        const result = extractJobData();
        sendResponse(result);
      })
      .catch(error => {
        // Try extracting anyway
        const result = extractJobData();
        sendResponse(result);
      });
    
    return true; // Keep message channel open for async response
  }
});

// Optional: Auto-analyze on page load (if enabled in settings)
async function autoAnalyzeIfEnabled() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {};
    
    if (settings.autoAnalyze) {
      // Send job data to background
      const jobData = extractJobData();
      if (jobData.success) {
        chrome.runtime.sendMessage({
          action: 'autoAnalyze',
          data: jobData.data
        });
      }
    }
  } catch (error) {
    console.error('Auto-analyze error:', error);
  }
}

// Run auto-analyze after page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(autoAnalyzeIfEnabled, 2000);
  });
} else {
  setTimeout(autoAnalyzeIfEnabled, 2000);
}

// Inject floating button for quick access (optional UI enhancement)
function injectQuickAccessButton() {
  if (document.getElementById('repocompass-fab')) return;
  
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
    transition: transform 0.2s;
  `;
  
  fab.addEventListener('mouseenter', () => {
    fab.style.transform = 'scale(1.1)';
  });
  
  fab.addEventListener('mouseleave', () => {
    fab.style.transform = 'scale(1)';
  });
  
  fab.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
  
  document.body.appendChild(fab);
}

// Inject FAB after page load
setTimeout(injectQuickAccessButton, 1000);
