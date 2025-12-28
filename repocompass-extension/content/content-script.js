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
  try {
    if (!selector) return null;
    const selectors = selector.split(', ');
    for (const sel of selectors) {
      const element = document.querySelector(sel);
      if (element && element.textContent) {
        return element.textContent.trim();
      }
    }
    return null;
  } catch (error) {
    console.error('Error in getText:', error);
    return null;
  }
}

// Extract all text from multiple elements
function getAllText(selector) {
  try {
    if (!selector) return [];
    const selectors = selector.split(', ');
    const texts = [];
    for (const sel of selectors) {
      const elements = document.querySelectorAll(sel);
      if (elements) {
        elements.forEach(el => {
          if (el && el.textContent) {
            const text = el.textContent.trim();
            if (text) texts.push(text);
          }
        });
      }
    }
    return texts;
  } catch (error) {
    console.error('Error in getAllText:', error);
    return [];
  }
}

// Extract job description HTML
function getDescription(selector) {
  try {
    if (!selector) return { text: '', html: '' };
    const selectors = selector.split(', ');
    for (const sel of selectors) {
      const element = document.querySelector(sel);
      if (element) {
        return {
          text: element.textContent ? element.textContent.trim() : '',
          html: element.innerHTML || ''
        };
      }
    }
    return { text: '', html: '' };
  } catch (error) {
    console.error('Error in getDescription:', error);
    return { text: '', html: '' };
  }
}

// Parse technologies from job description
function extractTechnologies(text) {
  try {
    if (!text || typeof text !== 'string') return [];
    
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
      try {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => technologies.add(match));
        }
      } catch (error) {
        console.error('Error matching pattern:', error);
      }
    });
    
    return Array.from(technologies);
  } catch (error) {
    console.error('Error in extractTechnologies:', error);
    return [];
  }
}

// Extract years of experience requirements
function extractExperience(text) {
  try {
    if (!text || typeof text !== 'string') return null;
    
    const patterns = [
      /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/gi,
      /experience:\s*(\d+)\+?\s*(?:years?|yrs?)/gi
    ];
    
    let maxYears = 0;
    patterns.forEach(pattern => {
      try {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          const years = parseInt(match[1]);
          if (!isNaN(years) && years > maxYears) maxYears = years;
        }
      } catch (error) {
        console.error('Error matching experience pattern:', error);
      }
    });
    
    return maxYears > 0 ? maxYears : null;
  } catch (error) {
    console.error('Error in extractExperience:', error);
    return null;
  }
}

// Extract hiring manager name (LinkedIn specific handling)
function extractHiringManager(site, selectors) {
  try {
    if (!site || !selectors) return null;
    
    if (site === 'linkedin') {
      // Try multiple approaches for LinkedIn
      const posterName = document.querySelector('.jobs-poster__name');
      if (posterName && posterName.textContent) {
        return posterName.textContent.trim();
      }
      
      // Check for hirer card
      const hirerCard = document.querySelector('.hirer-card__hirer-information');
      if (hirerCard) {
        const name = hirerCard.querySelector('.app-aware-link');
        if (name && name.textContent) return name.textContent.trim();
      }
      
      // Check for recruiter info
      const recruiter = document.querySelector('[data-control-name="message_recruiter"]');
      if (recruiter) {
        const parent = recruiter.closest('.jobs-unified-top-card__primary-description');
        if (parent) {
          const links = parent.querySelectorAll('a');
          for (const link of links) {
            if (link.href && link.href.includes('/in/') && link.textContent) {
              return link.textContent.trim();
            }
          }
        }
      }
    }
    
    return getText(selectors.hiringManager);
  } catch (error) {
    console.error('Error in extractHiringManager:', error);
    return null;
  }
}

// Main extraction function
function extractJobData() {
  try {
    const site = detectSite();
    if (!site) {
      return { success: false, error: 'Unsupported site' };
    }
    
    const selectors = SELECTORS[site];
    if (!selectors) {
      return { success: false, error: 'No selectors defined for site' };
    }
    
    const description = getDescription(selectors.description);
    const requirements = getAllText(selectors.requirements);
    
    // Safely concatenate text for technology extraction
    const combinedText = [description.text, requirements.join(' ')].filter(Boolean).join(' ');
    
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
      technologies: extractTechnologies(combinedText),
      experienceRequired: extractExperience(description.text),
      extractedAt: new Date().toISOString()
    };

    // validate required fields
    if (!jobData.title || !jobData.company) {
      return {
        success: false,
        error: 'Missing required job fields (title or company)',
        partial: jobData
      };
    }
    
    return { success: true, data: jobData };
  } catch (error) {
    console.error('Error in extractJobData:', error);
    return {
      success: false,
      error: 'Failed to extract job data: ' + error.message
    };
  }
}

// Wait for page to load (for SPAs)
function waitForContent(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    try {
      if (!selector) {
        reject(new Error('No selector provided'));
        return;
      }
      
      const startTime = Date.now();
      
      const check = () => {
        try {
          const element = document.querySelector(selector);
          if (element && element.textContent && element.textContent.trim()) {
            resolve(element);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for content'));
          } else {
            setTimeout(check, 200);
          }
        } catch (error) {
          reject(new Error('Error checking for content: ' + error.message));
        }
      };
      
      check();
    } catch (error) {
      reject(new Error('Error in waitForContent: ' + error.message));
    }
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
        console.error('Content load timeout:', error);
        // Try extracting anyway
        const result = extractJobData();
        if (!result.success) {
          sendResponse({
            success: false,
            error: 'Content failed to load and extraction failed: ' + (result.error || 'Unknown error')
          });
        } else {
          sendResponse(result);
        }
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
  try {
    // Check if button already exists or body is not ready
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
      transition: transform 0.2s;
    `;
    
    fab.addEventListener('mouseenter', () => {
      fab.style.transform = 'scale(1.1)';
    });
    
    fab.addEventListener('mouseleave', () => {
      fab.style.transform = 'scale(1)';
    });
    
    fab.addEventListener('click', () => {
      try {
        chrome.runtime.sendMessage({ action: 'openPopup' });
      } catch (error) {
        console.error('Error sending message to open popup:', error);
      }
    });
    
    document.body.appendChild(fab);
  } catch (error) {
    console.error('Error injecting quick access button:', error);
  }
}

// Inject FAB after page load
setTimeout(injectQuickAccessButton, 1000);
