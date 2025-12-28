// Service Worker - Background script for API calls and processing

// API Configuration
const API_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    modelPrimary: 'gpt-5-mini-2025-08-07',
    useResponsesAPI: true // Enable Responses API for tool support (file search, web search)
  },
  serpApi: {
    baseUrl: 'https://serpapi.com/search'
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
    case 'analyzeCompany':
      return await analyzeCompany(request.data);

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

// Analyze company using AI-powered enrichment
async function analyzeCompany(data) {
  const { company, jobDescription, jobTitle } = data;
  const settings = await getSettings();

  if (!settings.openaiKey) {
    return {
      success: false,
      error: 'OpenAI API key required for company analysis',
      data: {
        company,
        website: null,
        engineeringBlog: null,
        techStack: [],
        recentProjects: [],
        insights: []
      }
    };
  }

  try {
    // Use OpenAI to research company and extract structured data
    const companyData = await enrichCompanyWithAI(company, jobDescription, jobTitle, settings.openaiKey);

    return {
      success: true,
      data: companyData
    };
  } catch (error) {
    console.error('Company analysis error:', error);
    return {
      success: false,
      error: error.message,
      data: {
        company,
        website: null,
        engineeringBlog: null,
        techStack: [],
        recentProjects: [],
        insights: []
      }
    };
  }
}

// Company enrichment using AI
async function enrichCompanyWithAI(company, jobDescription, jobTitle, apiKey) {
  const prompt = `You are a company research assistant. Research and provide accurate, factual information about the following company.

**Company**: ${company}
**Job Title**: ${jobTitle}
**Job Description**: ${jobDescription?.substring(0, 1500) || 'Not provided'}

Based on your knowledge, provide:
1. Official website URL
2. Engineering blog or technical blog URL (if exists)
3. GitHub organization URL (if exists)
4. Technologies they likely use (based on the job description and company)
5. Recent projects, products, or initiatives they're working on
6. Key insights about their tech culture or engineering practices

**IMPORTANT**: Only include information you are confident about. If you don't know something, say "Unknown" or leave it empty.

Return ONLY a valid JSON object with this structure:
{
  "company": "${company}",
  "website": "https://example.com",
  "engineeringBlog": "https://blog.example.com" or null,
  "githubOrg": "https://github.com/orgname" or null,
  "techStack": ["Technology1", "Technology2", ...],
  "recentProjects": [
    {
      "name": "Project name",
      "description": "What it does",
      "relevance": "Why it matters for this role"
    }
  ],
  "insights": [
    "Insight about company's tech culture",
    "Engineering practice or value"
  ],
  "sources": [
    "Where this information comes from"
  ]
}`;

  try {
    // Use Responses API with web_search tool for real-time company research
    const response = await fetch(`${API_CONFIG.openai.baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.openai.modelPrimary,
        modalities: ['text'],
        instructions: 'You are a company research assistant that provides accurate, factual information about companies and their technology practices. Use web search to find current information. Always respond with valid JSON.',
        input: [
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          { type: 'web_search' } // Enable web search for real-time data
        ],
        temperature: 0.3,
        max_output_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const result = await response.json();
    // Responses API returns output instead of choices
    const content = result.output?.[0]?.content || result.choices?.[0]?.message?.content;
    const companyData = JSON.parse(content);

    // Log if tools were used
    if (result.tool_calls?.length > 0) {
      console.log('Tools used:', result.tool_calls.map(t => t.type).join(', '));
    }

    return companyData;
  } catch (error) {
    console.error('Company enrichment error:', error);
    throw error;
  }
}

// Generate project ideas using OpenAI
async function generateIdeas(data) {
  const { jobData, companyData, playerStats, apiKey } = data;

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const prompt = buildPrompt(jobData, companyData, playerStats);

  try {
    // Use Responses API with web_search for current company context
    const response = await fetch(`${API_CONFIG.openai.baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.openai.modelPrimary,
        modalities: ['text'],
        instructions: `You are a career advisor helping job seekers stand out by suggesting impressive portfolio projects.
            Generate creative, practical project ideas that:
            1. Directly relate to the job requirements and company's tech stack
            2. Demonstrate relevant technical skills the candidate has
            3. Align with the company's recent projects and initiatives
            4. Are achievable in 1-2 weeks
            5. Stand out from typical portfolio projects
            6. Show understanding of the company's domain and challenges

            Use web search when you need current information about the company or technologies. Always respond with valid JSON.`,
        input: [
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          { type: 'web_search' }
        ],
        temperature: 0.8,
        max_output_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const result = await response.json();
    // Responses API returns output instead of choices
    const responseContent = result.output?.[0]?.content || result.choices?.[0]?.message?.content;
    const content = JSON.parse(responseContent);

    // Log if tools were used for debugging
    if (result.tool_calls?.length > 0) {
      console.log('AI used tools:', result.tool_calls.map(t => t.type).join(', '));
    }

    return {
      success: true,
      ideas: content.projects || content.ideas || [],
      toolsUsed: result.tool_calls?.map(t => t.type) || []
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}

// Build prompt for OpenAI
function buildPrompt(jobData, companyData, playerStats) {
  let prompt = `Generate 3 unique portfolio project ideas for this job opportunity:

**Job Details:**
- Title: ${jobData?.title || 'Software Engineer'}
- Company: ${jobData?.company || 'Tech Company'}
- Location: ${jobData?.location || 'Remote'}

**Job Description:**
${jobData?.description?.substring(0, 1500) || 'General software development skills required.'}

**Technologies Required:**
${jobData?.technologies?.join(', ') || 'Not specified'}

**Experience Level:**
${jobData?.experienceRequired ? `${jobData.experienceRequired}+ years` : 'Not specified'}
`;

  // Add company insights
  if (companyData) {
    prompt += `\n**Company Intelligence:**\n`;

    if (companyData.website) {
      prompt += `- Website: ${companyData.website}\n`;
    }

    if (companyData.engineeringBlog) {
      prompt += `- Engineering Blog: ${companyData.engineeringBlog}\n`;
    }

    if (companyData.techStack?.length > 0) {
      prompt += `- Company Tech Stack: ${companyData.techStack.join(', ')}\n`;
    }

    if (companyData.recentProjects?.length > 0) {
      prompt += `- Recent Company Projects/Initiatives:\n`;
      companyData.recentProjects.forEach(project => {
        prompt += `  * ${project.name}: ${project.description}\n`;
        if (project.relevance) {
          prompt += `    Relevance: ${project.relevance}\n`;
        }
      });
    }

    if (companyData.insights?.length > 0) {
      prompt += `- Company Culture/Engineering Insights:\n`;
      companyData.insights.forEach(insight => {
        prompt += `  * ${insight}\n`;
      });
    }
  }

  // Add candidate's skill profile
  if (playerStats) {
    const SKILL_CONFIG = {
      dataStructures: 'Data Structures',
      algorithms: 'Algorithms',
      systems: 'Systems/OS',
      databases: 'Databases',
      networking: 'Networking',
      frontend: 'Front-end',
      backend: 'Back-end',
      aiMl: 'AI/ML',
      math: 'Math/Probability'
    };

    const topSkills = Object.entries(playerStats)
      .filter(([_, level]) => level > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, level]) => `${SKILL_CONFIG[skill] || skill} (Level ${level})`)
      .join(', ');

    if (topSkills) {
      prompt += `\n**Candidate's Top Skills:**\n${topSkills}\n`;
    }
  }

  prompt += `
**Output Format (JSON):**
{
  "projects": [
    {
      "title": "Project Name",
      "description": "2-3 sentence description explaining what the project does, why it's relevant to the company, and why it's impressive",
      "technologies": ["Tech1", "Tech2", "Tech3"],
      "difficulty": "beginner|intermediate|advanced",
      "timeEstimate": "X days/weeks",
      "standoutFactor": "What makes this project unique and impressive for THIS specific company",
      "companyAlignment": "How this project aligns with the company's recent work or initiatives"
    }
  ]
}

**Requirements - Projects must:**
1. Be specific to this company's domain and recent initiatives
2. Use technologies from both the job posting AND company's tech stack
3. Align with candidate's demonstrated skill levels
4. Be achievable in 1-2 weeks
5. Show understanding of the company's products/services
6. Stand out from generic portfolio projects
7. Demonstrate relevance to the company's recent projects or direction`;

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
