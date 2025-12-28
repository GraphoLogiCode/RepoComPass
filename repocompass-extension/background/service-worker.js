// Service Worker - Background script for API calls and processing

// API Configuration
const API_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    // Use gpt-5-mini with Responses API - supports web_search tool
    modelPrimary: 'gpt-5-mini'
  }
};

// Helper function to extract JSON from text that might be wrapped in markdown code blocks
function extractJSON(text) {
  if (!text) return null;
  
  // Try to parse as-is first
  try {
    return JSON.parse(text);
  } catch (e) {
    // Not valid JSON, try to extract from markdown
  }
  
  // Remove markdown code blocks like ```json ... ``` or ``` ... ```
  let cleaned = text.trim();
  
  // Match ```json ... ``` or ```JSON ... ``` or ``` ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }
  
  // Try parsing the cleaned text
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[RepoComPass] Failed to parse JSON:', e.message);
    console.error('[RepoComPass] Raw text:', text.substring(0, 500));
    throw new Error('Failed to parse JSON response from AI');
  }
}

// JSON Schema for company research (Structured Outputs)
const COMPANY_RESEARCH_SCHEMA = {
  name: 'company_research',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      company: { type: 'string', description: 'Company name' },
      website: { 
        anyOf: [{ type: 'string' }, { type: 'null' }],
        description: 'Official website URL or null if unknown'
      },
      engineeringBlog: { 
        anyOf: [{ type: 'string' }, { type: 'null' }],
        description: 'Engineering blog URL or null if none'
      },
      githubOrg: { 
        anyOf: [{ type: 'string' }, { type: 'null' }],
        description: 'GitHub organization URL or null if none'
      },
      techStack: {
        type: 'array',
        items: { type: 'string' },
        description: 'Technologies used by the company'
      },
      recentProjects: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            relevance: { type: 'string' }
          },
          required: ['name', 'description', 'relevance'],
          additionalProperties: false
        },
        description: 'Recent company projects'
      },
      insights: {
        type: 'array',
        items: { type: 'string' },
        description: 'Insights about company culture and engineering'
      }
    },
    required: ['company', 'website', 'engineeringBlog', 'githubOrg', 'techStack', 'recentProjects', 'insights'],
    additionalProperties: false
  }
};

// JSON Schema for project ideas (Structured Outputs)
const PROJECT_IDEAS_SCHEMA = {
  name: 'project_ideas',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      projects: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            technologies: {
              type: 'array',
              items: { type: 'string' }
            },
            difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            timeEstimate: { type: 'string' },
            standoutFactor: { type: 'string' },
            companyAlignment: { type: 'string' }
          },
          required: ['title', 'description', 'technologies', 'difficulty', 'timeEstimate', 'standoutFactor', 'companyAlignment'],
          additionalProperties: false
        }
      }
    },
    required: ['projects'],
    additionalProperties: false
  }
};

// Extract text content from Responses API output with robust handling
function extractTextFromResponseOutput(result) {
  let textContent = null;
  let webSearchSources = [];
  let refusalMessage = null;
  
  console.log('[RepoComPass] extractTextFromResponseOutput - parsing output:', {
    hasOutput: !!result.output,
    outputLength: result.output?.length,
    outputTypes: result.output?.map(o => o.type)
  });
  
  if (result.output && Array.isArray(result.output)) {
    for (const outputItem of result.output) {
      console.log('[RepoComPass] Processing output item:', {
        type: outputItem.type,
        hasContent: !!outputItem.content,
        contentLength: outputItem.content?.length
      });
      
      // Handle message type (contains the actual text response)
      if (outputItem.type === 'message' && outputItem.content) {
        for (const contentItem of outputItem.content) {
          console.log('[RepoComPass] Processing content item:', {
            type: contentItem.type,
            hasText: !!contentItem.text,
            textLength: contentItem.text?.length
          });
          
          // Check for refusal
          if (contentItem.type === 'refusal') {
            refusalMessage = contentItem.refusal;
            console.warn('[RepoComPass] Model refused request:', refusalMessage);
          }
          
          if (contentItem.type === 'output_text' || contentItem.type === 'text') {
            textContent = contentItem.text;
            console.log('[RepoComPass] Found text content, length:', textContent?.length);

            // Validate text is not empty
            if (!textContent || textContent.trim() === '') {
              console.warn('[RepoComPass] Text content is empty string');
              textContent = null;  // Treat empty as null to trigger fallback
            }
            break;
          }
        }
      }
      
      // Collect web search sources if available
      if (outputItem.type === 'web_search_call' && outputItem.action?.sources) {
        webSearchSources.push(...outputItem.action.sources);
      }
      
      if (textContent) break;
    }
  }
  
  // Fallback for Chat Completions API format
  if (!textContent && result.choices?.[0]?.message?.content) {
    textContent = result.choices[0].message.content;
    console.log('[RepoComPass] Using Chat Completions fallback, length:', textContent?.length);
  }
  
  console.log('[RepoComPass] extractTextFromResponseOutput result:', {
    foundText: !!textContent,
    textLength: textContent?.length,
    sourcesCount: webSearchSources.length,
    hasRefusal: !!refusalMessage
  });
  
  return { textContent, webSearchSources, refusalMessage };
}

// Make a Responses API call with continuation support for incomplete responses
async function callResponsesAPIWithContinuation(requestBody, apiKey, maxIterations = 3) {
  const baseUrl = API_CONFIG.openai.baseUrl;
  let iterations = 0;
  let previousResponseId = null;
  let finalResult = null;
  let allWebSearchSources = [];
  
  while (iterations < maxIterations) {
    iterations++;
    
    // Build request - for continuation, include model + previous_response_id
    // The API requires model to be specified even when continuing
    const currentRequestBody = previousResponseId
      ? { 
          model: requestBody.model,
          previous_response_id: previousResponseId,
          // Keep same text format for continuation
          text: requestBody.text,
          max_output_tokens: requestBody.max_output_tokens
        }
      : requestBody;
    
    console.log(`[RepoComPass] API call iteration ${iterations}/${maxIterations}`, {
      isContinuation: !!previousResponseId,
      previousResponseId,
      model: currentRequestBody.model
    });
    
    const response = await fetch(`${baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(currentRequestBody)
    });
    
    console.log('[RepoComPass] Response status:', response.status);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[RepoComPass] API Error:', errorBody);
      try {
        const error = JSON.parse(errorBody);
        throw new Error(error.error?.message || `OpenAI API error (${response.status})`);
      } catch (e) {
        if (e.message.includes('OpenAI API error')) throw e;
        throw new Error(`OpenAI API error (${response.status}): ${errorBody.substring(0, 200)}`);
      }
    }
    
    const result = await response.json();
    console.log('[RepoComPass] Response received:', {
      status: result.status,
      id: result.id,
      outputLength: result.output?.length,
      incompleteReason: result.incomplete_details?.reason
    });
    
    // Collect web search sources from this response
    if (result.output) {
      for (const item of result.output) {
        if (item.type === 'web_search_call' && item.action?.sources) {
          allWebSearchSources.push(...item.action.sources);
        }
      }
    }
    
    // Check completion status
    if (result.status === 'completed') {
      finalResult = result;
      finalResult._webSearchSources = allWebSearchSources;
      console.log('[RepoComPass] Response completed successfully');
      break;
    } else if (result.status === 'incomplete') {
      const reason = result.incomplete_details?.reason;
      console.warn(`[RepoComPass] Response incomplete: ${reason}`);

      // Handle content_filter explicitly - this is a hard failure
      if (reason === 'content_filter') {
        console.error('[RepoComPass] Content filtered by safety system');
        throw new Error('Request blocked by content policy. Please rephrase your job description or try a different company.');
      }

      if (reason === 'max_output_tokens' && iterations < maxIterations) {
        // Continue from where we left off
        previousResponseId = result.id;
        console.log('[RepoComPass] Continuing with previous_response_id:', previousResponseId);
        continue;
      } else {
        // Can't continue or other reason - try to extract what we have
        console.warn('[RepoComPass] Cannot continue, attempting to extract partial result');
        finalResult = result;
        finalResult._webSearchSources = allWebSearchSources;
        break;
      }
    } else if (result.status === 'failed') {
      throw new Error(`API request failed: ${result.error?.message || 'Unknown error'}`);
    } else {
      // Unknown status - return what we have
      finalResult = result;
      finalResult._webSearchSources = allWebSearchSources;
      break;
    }
  }
  
  if (!finalResult) {
    throw new Error('Failed to get response after maximum iterations');
  }
  
  return finalResult;
}

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

    case 'validateApiKey':
      return await validateApiKey(request.data.apiKey);

    case 'autoAnalyze':
      // Store for quick access
      await chrome.storage.session.set({ lastJobData: request.data });
      return { success: true };

    case 'openPopup':
      // Open popup page in a new tab
      try {
        const popupUrl = chrome.runtime.getURL('popup/popup.html');
        await chrome.tabs.create({ url: popupUrl });
      } catch (err) {
        console.error('Failed to open popup:', err);
      }
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

// Company enrichment using AI with Structured Outputs and continuation support
async function enrichCompanyWithAI(company, jobDescription, jobTitle, apiKey) {
  const prompt = `Research and provide accurate, factual information about ${company}.

Job context:
- Title: ${jobTitle}
- Description: ${jobDescription?.substring(0, 1000) || 'Not provided'}

Provide:
1. Official website URL (or null if unknown)
2. Engineering/tech blog URL (or null if none)
3. GitHub org URL (or null if none)
4. Technologies they use (based on job description and company knowledge)
5. 2-3 recent projects/products/initiatives
6. 2-3 insights about their tech culture

Be concise. Only include confident information.`;

  try {
    const requestBody = {
      model: API_CONFIG.openai.modelPrimary,
      reasoning: { effort: 'low' },  // Limit reasoning tokens to prevent incomplete outputs
      instructions: 'You are a company research assistant. Use web search for current information. Return valid JSON matching the company research schema with factual data.',
      input: [{ role: 'user', content: prompt }],
      tools: [{ type: 'web_search' }],
      tool_choice: 'auto',  // Let model decide when to use web search
      include: ['web_search_call.action.sources'],
      text: {
        format: { type: 'text' },  // Use text format instead of strict JSON to allow citations
        verbosity: 'low'  // Reduce output length to save tokens
      },
      max_output_tokens: 10000  // Increased buffer for reasoning + output
    };

    console.log('[RepoComPass] enrichCompanyWithAI - Starting request for:', company);

    // Use continuation-aware API call
    const result = await callResponsesAPIWithContinuation(requestBody, apiKey);
    
    console.log('[RepoComPass] enrichCompanyWithAI - Response received:', {
      status: result.status,
      outputItems: result.output?.length,
      webSearchSources: result._webSearchSources?.length || 0
    });

    // Extract text content
    const { textContent, webSearchSources, refusalMessage } = extractTextFromResponseOutput(result);
    
    // Check for refusal
    if (refusalMessage) {
      throw new Error(`AI refused request: ${refusalMessage}`);
    }
    
    // Merge sources from continuation helper
    const allSources = [...webSearchSources, ...(result._webSearchSources || [])];
    
    if (!textContent) {
      // Log what we got for debugging
      console.error('[RepoComPass] No text content in response. Output types:', 
        result.output?.map(o => o.type).join(', '));
      
      // If status was incomplete, provide more context
      if (result.status === 'incomplete') {
        throw new Error(`Response incomplete (${result.incomplete_details?.reason}). Model may need more tokens for reasoning.`);
      }
      throw new Error('Could not parse API response - no text content found');
    }
    
    // Parse the JSON (Structured Outputs should guarantee valid JSON)
    let companyData;
    try {
      companyData = JSON.parse(textContent);
    } catch (e) {
      // Fallback to extractJSON helper for any markdown wrapping
      companyData = extractJSON(textContent);
    }
    
    // Attach web search sources from API (not model-generated)
    if (allSources.length > 0) {
      companyData.sources = allSources.map(s => ({
        title: s.title,
        url: s.url
      }));
      console.log('[RepoComPass] Attached', allSources.length, 'web search sources');
    }

    // Log usage stats with cost estimate
    if (result.usage) {
      const inputTokens = result.usage.input_tokens || 0;
      const outputTokens = result.usage.output_tokens || 0;
      const reasoningTokens = result.usage.reasoning_tokens || 0;

      // GPT-5-mini pricing: $0.20/1M input, $0.80/1M output
      const estimatedCost = (inputTokens * 0.20 + outputTokens * 0.80) / 1_000_000;

      console.log('[RepoComPass] Token usage (Company Analysis):', {
        input: inputTokens,
        output: outputTokens,
        reasoning: reasoningTokens,
        webSearchRequests: result.usage.web_search_requests,
        estimatedCost: `$${estimatedCost.toFixed(4)}`
      });
    }

    return companyData;
  } catch (error) {
    console.error('[RepoComPass] Company enrichment error:', error);
    throw error;
  }
}

// Generate project ideas using OpenAI with Structured Outputs and continuation support
async function generateIdeas(data) {
  const { jobData, companyData, playerStats, apiKey } = data;

  console.log('[RepoComPass] generateIdeas called with:', {
    hasJobData: !!jobData,
    jobTitle: jobData?.title,
    jobCompany: jobData?.company,
    hasCompanyData: !!companyData,
    hasPlayerStats: !!playerStats,
    hasApiKey: !!apiKey
  });

  if (!apiKey) {
    return { success: false, error: 'OpenAI API key is required', ideas: [] };
  }

  if (!jobData || !jobData.title) {
    return { success: false, error: 'Job data is missing', ideas: [] };
  }

  const prompt = buildPrompt(jobData, companyData, playerStats);
  console.log('[RepoComPass] Built prompt, length:', prompt.length);

  try {
    const requestBody = {
      model: API_CONFIG.openai.modelPrimary,
      reasoning: { effort: 'low' },  // Limit reasoning tokens to prevent incomplete outputs
      instructions: `You are a career advisor. Generate 3 impressive portfolio project ideas that:
1. Directly relate to the job requirements
2. Use the company's tech stack
3. Are achievable in 1-2 weeks
4. Stand out from typical projects

Use web search for current company information if needed. Return valid JSON matching the project ideas schema.`,
      input: [{ role: 'user', content: prompt }],
      tools: [{ type: 'web_search' }],
      tool_choice: 'auto',  // Let model decide when to use web search
      include: ['web_search_call.action.sources'],
      text: {
        format: { type: 'text' },  // Use text format instead of strict JSON to allow citations
        verbosity: 'low'  // Reduce output length to save tokens
      },
      max_output_tokens: 10000  // Increased buffer for reasoning + output
    };

    console.log('[RepoComPass] generateIdeas - Sending request to OpenAI...');

    // Use continuation-aware API call
    const result = await callResponsesAPIWithContinuation(requestBody, apiKey);

    console.log('[RepoComPass] generateIdeas - Response received:', {
      status: result.status,
      outputItems: result.output?.length,
      webSearchSources: result._webSearchSources?.length || 0
    });

    // Extract text content using shared helper
    const { textContent, webSearchSources, refusalMessage } = extractTextFromResponseOutput(result);
    const allSources = [...webSearchSources, ...(result._webSearchSources || [])];

    // Check for refusal
    if (refusalMessage) {
      throw new Error(`AI refused request: ${refusalMessage}`);
    }

    if (!textContent) {
      console.error('[RepoComPass] No text content. Output types:', 
        result.output?.map(o => o.type).join(', '));
      
      if (result.status === 'incomplete') {
        throw new Error(`Response incomplete (${result.incomplete_details?.reason})`);
      }
      throw new Error('Could not parse API response - no text content found');
    }

    // Parse JSON (Structured Outputs guarantees valid JSON)
    let content;
    try {
      content = JSON.parse(textContent);
    } catch (e) {
      content = extractJSON(textContent);
    }

    const ideas = content.projects || content.ideas || [];

    if (!Array.isArray(ideas)) {
      throw new Error('API response has invalid ideas format (expected array)');
    }

    console.log('[RepoComPass] Extracted ideas array, length:', ideas.length);

    // Validate each idea has required fields
    const validIdeas = ideas.filter((idea, index) => {
      const isValid = idea && typeof idea === 'object' &&
                      (idea.title || idea.name) &&
                      (idea.description || idea.desc);
      if (!isValid) {
        console.warn('[RepoComPass] Invalid idea at index', index);
      }
      return isValid;
    });

    // Log usage with cost estimate
    if (result.usage) {
      const inputTokens = result.usage.input_tokens || 0;
      const outputTokens = result.usage.output_tokens || 0;
      const reasoningTokens = result.usage.reasoning_tokens || 0;

      // GPT-5-mini pricing: $0.20/1M input, $0.80/1M output
      const estimatedCost = (inputTokens * 0.20 + outputTokens * 0.80) / 1_000_000;

      console.log('[RepoComPass] Token usage (Project Ideas):', {
        input: inputTokens,
        output: outputTokens,
        reasoning: reasoningTokens,
        webSearchRequests: result.usage.web_search_requests,
        estimatedCost: `$${estimatedCost.toFixed(4)}`
      });
    }

    return {
      success: true,
      ideas: validIdeas,
      webSearchUsed: result.usage?.web_search_requests > 0,
      sources: allSources.map(s => ({ title: s.title, url: s.url }))
    };
  } catch (error) {
    console.error('[RepoComPass] Generate Ideas error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      ideas: []
    };
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

  // Ensure total prompt doesn't exceed ~4000 tokens (~16k chars)
  const MAX_PROMPT_CHARS = 16000;
  if (prompt.length > MAX_PROMPT_CHARS) {
    console.warn('[RepoComPass] Prompt too long, truncating:', {
      original: prompt.length,
      truncated: MAX_PROMPT_CHARS
    });
    prompt = prompt.substring(0, MAX_PROMPT_CHARS) + '\n\n[Content truncated for length...]';
  }

  return prompt;
}

// Get settings from storage
async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  return result.settings || {};
}

// Validate OpenAI API key by making a simple models request
async function validateApiKey(apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    return { success: false, error: 'API key is empty' };
  }

  try {
    // Use the models endpoint for a lightweight validation
    const response = await fetch(`${API_CONFIG.openai.baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return { success: true, message: 'API key is valid' };
    }

    const error = await response.json();
    
    if (response.status === 401) {
      return { success: false, error: 'Invalid API key' };
    } else if (response.status === 429) {
      return { success: false, error: 'Rate limited - but key appears valid' };
    } else {
      return { success: false, error: error.error?.message || 'API validation failed' };
    }
  } catch (error) {
    console.error('API key validation error:', error);
    return { success: false, error: 'Network error - could not validate key' };
  }
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
    
    // Open setup page as floating popup window
    chrome.windows.create({
      url: chrome.runtime.getURL('setup/setup.html'),
      type: 'popup',
      width: 500,
      height: 700
    });
  }
});

// Clear badge when popup opens
chrome.action.onClicked.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});
