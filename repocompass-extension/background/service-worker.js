// Service Worker - Background script for API calls and processing

// API Configuration
const API_CONFIG = {
  github: {
    baseUrl: 'https://api.github.com',
    rateLimit: 60, // requests per hour (unauthenticated)
    rateLimitAuth: 5000 // requests per hour (authenticated)
  },
  serpApi: {
    baseUrl: 'https://serpapi.com/search'
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4-turbo-preview'
  }
};

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender)
    .then(sendResponse)
    .catch(error => sendResponse({ success: false, error: error.message }));
  return true; // Keep channel open for async response
});

async function handleMessage(request, sender) {
  switch (request.action) {
    case 'analyzeManager':
      return await analyzeManager(request.data);
    
    case 'generateIdeas':
      return await generateIdeas(request.data);
    
    case 'autoAnalyze':
      // Store for quick access
      await chrome.storage.session.set({ lastJobData: request.data });
      return { success: true };
    
    case 'openPopup':
      // Can't programmatically open popup, but can badge
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
      return { success: true };
    
    default:
      return { success: false, error: 'Unknown action' };
  }
}

// Analyze hiring manager
async function analyzeManager(data) {
  const { hiringManager, company, jobTitle } = data;
  const settings = await getSettings();
  
  try {
    // Step 1: Search for the person's GitHub/LinkedIn
    const searchResults = await searchPerson(hiringManager, company, settings);
    
    // Step 2: If GitHub found, analyze their repos
    let techStack = [];
    let repos = [];
    
    if (searchResults.github) {
      const githubData = await analyzeGitHub(searchResults.github, settings);
      techStack = githubData.techStack;
      repos = githubData.repos;
    }
    
    return {
      success: true,
      data: {
        name: hiringManager || 'Not found',
        github: searchResults.github,
        linkedin: searchResults.linkedin,
        techStack,
        repos,
        company
      }
    };
  } catch (error) {
    console.error('Analyze manager error:', error);
    return {
      success: false,
      error: error.message,
      data: {
        name: hiringManager || 'Not found',
        github: null,
        linkedin: null,
        techStack: [],
        repos: []
      }
    };
  }
}

// Search for person using SerpAPI or fallback
async function searchPerson(name, company, settings) {
  if (!name) {
    return { github: null, linkedin: null };
  }
  
  const results = { github: null, linkedin: null };
  
  try {
    if (settings.serpApiKey) {
      // Use SerpAPI for better results
      const searchQuery = `${name} ${company} github`;
      const serpResponse = await fetch(
        `${API_CONFIG.serpApi.baseUrl}?q=${encodeURIComponent(searchQuery)}&api_key=${settings.serpApiKey}&engine=google`
      );
      
      if (serpResponse.ok) {
        const data = await serpResponse.json();
        
        // Parse results for GitHub and LinkedIn
        if (data.organic_results) {
          for (const result of data.organic_results) {
            if (result.link?.includes('github.com') && !results.github) {
              // Extract username from GitHub URL
              const match = result.link.match(/github\.com\/([^\/]+)/);
              if (match && !['topics', 'search', 'explore'].includes(match[1])) {
                results.github = `https://github.com/${match[1]}`;
              }
            }
            if (result.link?.includes('linkedin.com/in/') && !results.linkedin) {
              results.linkedin = result.link;
            }
          }
        }
      }
    } else {
      // Fallback: Try direct GitHub search
      const githubSearchUrl = `${API_CONFIG.github.baseUrl}/search/users?q=${encodeURIComponent(name + ' ' + company)}`;
      const headers = settings.githubToken 
        ? { 'Authorization': `token ${settings.githubToken}` }
        : {};
      
      const githubResponse = await fetch(githubSearchUrl, { headers });
      
      if (githubResponse.ok) {
        const data = await githubResponse.json();
        if (data.items && data.items.length > 0) {
          results.github = data.items[0].html_url;
        }
      }
    }
  } catch (error) {
    console.error('Search error:', error);
  }
  
  return results;
}

// Analyze GitHub profile
async function analyzeGitHub(githubUrl, settings) {
  const username = githubUrl.split('/').pop();
  const headers = settings.githubToken 
    ? { 
        'Authorization': `token ${settings.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    : { 'Accept': 'application/vnd.github.v3+json' };
  
  try {
    // Get user's repos
    const reposResponse = await fetch(
      `${API_CONFIG.github.baseUrl}/users/${username}/repos?sort=updated&per_page=20`,
      { headers }
    );
    
    if (!reposResponse.ok) {
      throw new Error('Failed to fetch GitHub repos');
    }
    
    const repos = await reposResponse.json();
    
    // Extract languages/technologies
    const languageCounts = {};
    const topRepos = [];
    
    for (const repo of repos.slice(0, 10)) {
      // Count languages
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
      
      // Get language breakdown for top repos
      try {
        const langResponse = await fetch(repo.languages_url, { headers });
        if (langResponse.ok) {
          const languages = await langResponse.json();
          for (const lang of Object.keys(languages)) {
            languageCounts[lang] = (languageCounts[lang] || 0) + 1;
          }
        }
      } catch (e) {
        // Skip if rate limited
      }
      
      topRepos.push({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        url: repo.html_url
      });
    }
    
    // Sort languages by frequency
    const techStack = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([lang]) => lang);
    
    return {
      techStack,
      repos: topRepos.slice(0, 5)
    };
  } catch (error) {
    console.error('GitHub analysis error:', error);
    return { techStack: [], repos: [] };
  }
}

// Generate project ideas using OpenAI
async function generateIdeas(data) {
  const { jobData, managerData, apiKey } = data;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }
  
  const prompt = buildPrompt(jobData, managerData);
  
  try {
    const response = await fetch(`${API_CONFIG.openai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are a career advisor helping job seekers stand out by suggesting impressive portfolio projects. 
            Generate creative, practical project ideas that:
            1. Directly relate to the job requirements
            2. Demonstrate relevant technical skills
            3. Would impress the hiring manager based on their interests
            4. Are achievable in 1-2 weeks
            5. Stand out from typical portfolio projects
            
            Always respond with valid JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }
    
    const result = await response.json();
    const content = JSON.parse(result.choices[0].message.content);
    
    return {
      success: true,
      ideas: content.projects || content.ideas || []
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}

// Build prompt for OpenAI
function buildPrompt(jobData, managerData) {
  let prompt = `Generate 3 unique portfolio project ideas for this job opportunity:

**Job Details:**
- Title: ${jobData?.title || 'Software Engineer'}
- Company: ${jobData?.company || 'Tech Company'}
- Location: ${jobData?.location || 'Remote'}

**Job Requirements:**
${jobData?.description?.substring(0, 1500) || 'General software development skills required.'}

**Technologies Mentioned in Job:**
${jobData?.technologies?.join(', ') || 'Not specified'}

**Experience Required:**
${jobData?.experienceRequired ? `${jobData.experienceRequired}+ years` : 'Not specified'}
`;

  if (managerData && (managerData.techStack?.length > 0 || managerData.repos?.length > 0)) {
    prompt += `
**Hiring Manager Insights:**
- Name: ${managerData.name || 'Unknown'}
- Their Tech Interests: ${managerData.techStack?.join(', ') || 'Unknown'}
`;
    
    if (managerData.repos?.length > 0) {
      prompt += `- Their Recent Projects: ${managerData.repos.map(r => r.name).join(', ')}\n`;
    }
  }

  prompt += `
**Output Format (JSON):**
{
  "projects": [
    {
      "title": "Project Name",
      "description": "2-3 sentence description of what the project does and why it's impressive",
      "technologies": ["Tech1", "Tech2", "Tech3"],
      "difficulty": "beginner|intermediate|advanced",
      "timeEstimate": "X days/weeks",
      "standoutFactor": "What makes this project unique and impressive"
    }
  ]
}

Make sure the projects:
1. Are specific to this role and company
2. Use technologies mentioned in the job posting
3. Would resonate with the hiring manager's interests
4. Are practical and achievable
5. Would stand out in a portfolio`;

  return prompt;
}

// Get settings from storage
async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  return result.settings || {};
}

// Rate limiting helper
const rateLimiter = {
  requests: {},
  
  canMakeRequest(api, limit, windowMs = 3600000) {
    const now = Date.now();
    if (!this.requests[api]) {
      this.requests[api] = [];
    }
    
    // Clean old requests
    this.requests[api] = this.requests[api].filter(t => now - t < windowMs);
    
    if (this.requests[api].length >= limit) {
      return false;
    }
    
    this.requests[api].push(now);
    return true;
  }
};

// Install/update handling
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      settings: {
        enableCache: true,
        autoAnalyze: false,
        cacheExpiry: 24
      },
      savedIdeas: []
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: 'welcome.html'
    });
  }
});

// Clear badge when popup opens
chrome.action.onClicked.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});
