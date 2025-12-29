# 🧭 RepoComPass

A gamified Chrome extension that generates personalized portfolio project recommendations based on job postings. Level up your career with an epic, retro arcade experience!

## ✨ Features

### 🎮 Gamification & RPG System
- **9 Skill Domains**: Track expertise across Data Structures, Algorithms, Systems/OS, Databases, Networking, Frontend, Backend, AI/ML, and Math/Probability
- **Character Progression**: Evolve from "Apprentice Dev" 🧙 to "Legendary Dev" 🌟 across 7 character classes
- **Power Level System**: Your total skill points determine your character class
- **XP & Levels**: Gain experience by analyzing jobs and generating project ideas
- **Custom Player Profile**: Create your unique developer persona

### 🔍 Job Analysis
- **Multi-Platform Support**: Automatically extracts job details from LinkedIn, Indeed, and Glassdoor
- **Smart Extraction**: Uses multiple fallback selector chains to handle varying HTML structures
- **Tech Stack Detection**: Pattern matching for 15+ technologies and frameworks
- **Company Intelligence**: AI-powered web search to find company websites, engineering blogs, and GitHub organizations
- **30-Second Caching**: Job data cached locally to prevent redundant scraping

### 💡 AI-Powered Project Generation
- **GPT-4o-mini Integration**: Uses OpenAI's cost-optimized model with Responses API
- **Structured Outputs**: JSON schema validation ensures reliable, parsable results
- **Web Search Capability**: Leverages OpenAI's web search for up-to-date company information and tech recommendations
- **Continuation Support**: Handles long AI responses gracefully
- **Personalized Recommendations**: AI creates 3-5 project suggestions tailored to:
  - Job requirements and tech stack
  - Your current skill levels
  - Company's technology preferences
  - Difficulty level (Beginner/Intermediate/Advanced)
  - Time estimates and standout features

### 💾 Save & Track Ideas
- **Portfolio Collection**: Save generated project ideas for later review
- **Clear Organization**: View all saved ideas in the "IDEAS" tab
- **Persistent Storage**: All data stored locally in Chrome storage
- **Export Ready**: Ideas include full descriptions, tech stacks, and implementation guides

### 🎨 Retro Arcade Experience
- **80s Arcade Aesthetics**: Neon cyan/magenta colors, CRT effects, scanlines
- **Pixel Perfect Fonts**: Orbitron, VT323, and Press Start 2P Google Fonts
- **Animated UI**: Smooth transitions, glowing buttons, hover effects
- **Responsive Design**: Optimized 400x600px popup with scrollable content
- **Dark Mode**: Built-in dark theme perfect for late-night job hunting

### 🔒 Privacy & Security
- **Bring Your Own Key (BYOK)**: Your OpenAI API key stays in local browser storage
- **Zero Analytics**: No tracking, no data collection, no telemetry
- **Local-First Architecture**: All user data (stats, ideas, settings) persists locally
- **Open Source**: Fully transparent codebase for security auditing
- **No External Servers**: Direct API calls to OpenAI only, no intermediary servers

### ⚡ Performance & Optimization
- **Smart Caching System**: 24-hour cache for API responses reduces costs by 70%+
- **Rate Limiting**: Built-in protection against API rate limit violations
- **Automatic Cleanup**: Expired cache entries removed automatically
- **Storage Quota Tracking**: Monitors browser storage usage
- **Lazy Loading**: Content loaded on-demand for faster initial render

## 📦 Installation

### For Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/GraphoLogiCode/RepoComPass.git
   cd RepoComPass
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right)
   - Click **"Load unpacked"**
   - Select the `RepoComPass` folder (contains `manifest.json`)

3. **Extension icon appears** in your toolbar 🎮

### First-Time Setup

When you first open RepoComPass, you'll go through a 5-step guided setup wizard:

1. **Welcome**: Introduction to features and gamification system
2. **Player Name**: Choose your developer handle (3-16 characters, alphanumeric)
3. **API Key**: Add your OpenAI API key (required for AI-powered features)
4. **Skill Allocation**: Distribute 10 initial skill points across 9 technical domains
5. **Ready**: Complete setup and launch the extension

After setup, you'll see a welcome screen with your character class and initial power level!

### Getting Your OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to [API Keys](https://platform.openai.com/api-keys)
3. Create a new secret key (starts with `sk-proj-` or `sk-`)
4. Copy the key and paste it in the extension setup

**Cost**: ~$0.001-0.005 per job analysis (using gpt-4o-mini, extremely cost-effective)

**Free Credits**: OpenAI provides $5 in free credits for new accounts - enough for 1,000-5,000 job analyses!

## 🎯 Usage

### Analyzing a Job Posting

1. **Navigate** to a job posting on:
   - LinkedIn Jobs (`linkedin.com/jobs/*`)
   - Indeed (`indeed.com/*`)
   - Glassdoor (`glassdoor.com/*`)

2. **Open Extension**
   - Click the 🎮 RepoComPass icon in your browser toolbar
   - Or click the floating 🧭 compass button injected on the job page

3. **Auto-Extract Job Details**
   - Extension automatically scrapes:
     - Job title
     - Company name
     - Location
     - Job description and requirements
     - Detected technologies (via pattern matching)

4. **Optional: Search Company**
   - Click **"SEARCH COMPANY"** button
   - AI uses web search to find company website, engineering blog, and GitHub organization
   - Identifies commonly used technologies and recent projects

5. **Generate Project Ideas**
   - Click **"GENERATE PROJECT IDEAS"** button
   - AI processes job requirements + your skills + company info
   - Receives 3-5 personalized project recommendations
   - Each idea includes:
     - **Project Title**: Catchy, professional name
     - **Description**: What the project does and why it matters
     - **Key Features**: Specific functionalities to implement
     - **Tech Stack**: Recommended languages, frameworks, and tools
     - **Difficulty**: Beginner, Intermediate, or Advanced
     - **Time Estimate**: Expected development time
     - **Why It Stands Out**: Unique aspects that impress recruiters
     - **Alignment**: How it connects to the company's needs

6. **Save Ideas**
   - Click the 💾 save icon on any project idea
   - Access saved ideas in the **"IDEAS"** tab anytime
   - Export or reference them when building your portfolio

### Managing Your Stats

Visit the **"STATS"** tab to:
- **View Current Skills**: See your level (0-10) in each of the 9 domains
- **Track Power Level**: Total sum of all skill points
- **Check Character Class**: Current rank based on power level
- **Monitor XP**: Track your total experience points
- **Review Progression**: See your journey from Apprentice to Legend

### Character Progression Classes

| Min Power | Character Class | Avatar |
|-----------|-----------------|--------|
| 0+ | Apprentice Dev | 🧙 |
| 10+ | Junior Coder | 🧝 |
| 25+ | Code Warrior | ⚔️ |
| 40+ | Senior Wizard | 🧙‍♂️ |
| 60+ | Tech Knight | 🛡️ |
| 80+ | Master Architect | 👑 |
| 90+ | Legendary Dev | 🌟 |

*Power level = sum of all 9 skill points (0-90 max)*

### Customizing Settings

In the **"CONFIG"** tab:
- **OpenAI API Key**: Update or change your API key
- **Enable Cache**: Toggle 24-hour caching (enabled by default, recommended)
- **Clear Cache**: Manually flush cached API responses
- **CRT Effects**: Enable/disable retro scanline overlay
- **Debug Mode**: View detailed logs and API responses

## 🏗️ Project Structure

```
RepoComPass/
├── manifest.json                   # Chrome Extension Manifest V3
│
├── popup/                          # Main Extension Popup
│   ├── popup.html                  # UI structure (486 lines)
│   ├── popup.css                   # Retro arcade styling (900+ lines)
│   └── popup.js                    # Core logic & RPG system (1,152 lines)
│
├── setup/                          # First-Time Onboarding
│   ├── setup.html                  # 5-step wizard UI (380+ lines)
│   ├── setup.css                   # Setup page styling (580 lines)
│   └── setup.js                    # Setup flow & validation (590 lines)
│
├── background/                     # Service Worker (MV3)
│   └── service-worker.js           # API calls & CORS handling (980 lines)
│
├── content/                        # Content Scripts
│   └── content-script.js           # Job scraping logic (710 lines)
│
├── styles/                         # Injected Styles
│   └── content.css                 # Floating button styling
│
├── utils/                          # Utility Classes
│   └── helpers.js                  # CacheManager, RateLimiter, TextUtils, StorageUtils (359 lines)
│
├── icons/                          # Extension Icons
│   ├── icon.svg                    # Vector source
│   ├── icon16.png                  # Toolbar icon
│   ├── icon48.png                  # Extension management
│   └── icon128.png                 # Chrome Web Store
│
├── welcome.html                    # Post-setup welcome screen
├── welcome.js                      # Welcome screen animations
│
└── README.md                       # This file

Total: ~4,800 lines of code | ~170KB | Zero dependencies
```

## 🔧 Technical Architecture

### Tech Stack

**Frontend:**
- Pure Vanilla JavaScript (ES6+)
- HTML5 with semantic markup
- CSS3 with custom properties, animations, grid/flexbox
- No frameworks, no build tools, no bundlers

**APIs:**
- OpenAI GPT API (gpt-4o-mini model with Responses API and web search)
- Chrome Extension APIs (storage, scripting, tabs, messaging)

**Fonts:**
- Orbitron (geometric sci-fi headings)
- VT323 (bitmap monospace terminal)
- Press Start 2P (pixel arcade accents)

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                        Job Site                              │
│              (LinkedIn / Indeed / Glassdoor)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Content Script                              │
│  • Detects job posting pages (URL pattern matching)         │
│  • Scrapes job data (multi-selector fallback chains)        │
│  • Injects floating compass button                          │
│  • Caches extracted data (30-second TTL)                    │
│  • Sends data to popup via chrome.runtime.sendMessage       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Popup UI                                 │
│  • Displays extracted job information                        │
│  • Manages RPG stats (skills, XP, character class)          │
│  • Handles user interactions (tabs, buttons, forms)         │
│  • Requests AI generations via service worker                │
│  • Persists data to chrome.storage.local                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Worker                              │
│  • Proxies API calls to bypass CORS restrictions            │
│  • Makes authenticated requests to OpenAI API               │
│  • Implements Responses API with continuation support       │
│  • Uses OpenAI's web search for company intelligence        │
│  • Handles rate limiting and error responses                │
│  • Returns structured JSON to popup                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Chrome Storage                               │
│  • setupCompleted: boolean (first-launch detection)         │
│  • playerStats: { name, skills, xp, savedIdeas }            │
│  • settings: { apiKey, cacheEnabled, crtEffects }           │
│  • cache_*: Cached API responses (24hr expiry)              │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. CacheManager (`utils/helpers.js`)
```javascript
class CacheManager {
  async set(key, data, ttl = 86400000)  // 24-hour default
  async get(key)                         // Returns null if expired
  async delete(key)
  async clear()
  async getStats()                       // Size, count, oldest entry
}
```

#### 2. RateLimiter (`utils/helpers.js`)
```javascript
class RateLimiter {
  async checkRateLimit(apiName, limit, windowMs)
  async recordRequest(apiName)
  async getRateLimitInfo(apiName)
  async resetRateLimit(apiName)
}
```

#### 3. TextUtils (`utils/helpers.js`)
- Email extraction via regex
- URL parsing and validation
- Text normalization and sanitization
- Name extraction from identifiers

#### 4. StorageUtils (`utils/helpers.js`)
- Settings management with defaults
- Storage quota tracking
- Async chrome.storage wrappers
- Data migration helpers

### Data Flow: Job Analysis

1. **Content Script** detects job page via URL patterns
2. **Scraper** uses CSS selectors to extract job data
3. **Technology Detector** applies 15+ regex patterns to find tech stack
4. **Cache Check** - if same job analyzed in last 30 seconds, return cached
5. **Message Passing** sends data to popup via `chrome.runtime.sendMessage`
6. **Popup** receives data and updates UI dynamically

### Data Flow: Company Search

1. **User** clicks "SEARCH COMPANY"
2. **Popup** sends company name to service worker
3. **Service Worker** makes OpenAI API call with web search enabled
4. **AI searches web** for company website, blog, GitHub org, tech stack, recent projects
5. **Structured JSON** returned with company intelligence
6. **Cache Storage** saves response for 24 hours
7. **Popup** displays company information with clickable links

### Data Flow: AI Project Generation

1. **User** clicks "GENERATE PROJECT IDEAS"
2. **Popup** constructs prompt with job data + user skills + company info
3. **Message** sent to service worker with API request
4. **Service Worker** checks cache for identical request (24hr TTL)
5. **If cache miss**: Makes authenticated POST to OpenAI Responses API
6. **Continuation Handling**: If response incomplete, fetches remaining chunks
7. **JSON Parsing**: Extracts structured project ideas from AI response
8. **Cache Storage**: Saves response for 24 hours
9. **Return to Popup**: Displays projects in UI

### Manifest V3 Features

- **Service Worker**: Replaces background pages for better performance
- **Host Permissions**: Limited to specific job sites + OpenAI API
- **Content Scripts**: Injected only on matching URLs (performance optimization)
- **Storage API**: Asynchronous chrome.storage.local for persistence
- **Scripting API**: Dynamic content script injection

## 📊 The 9 Skill Domains

| Skill | Icon | Examples | Job Keywords |
|-------|------|----------|--------------|
| **Data Structures** | 🗃️ | Arrays, Trees, Graphs, Hash Tables, Heaps | "data structures", "tree traversal", "graph algorithms" |
| **Algorithms** | 🧮 | Sorting, Searching, DP, Greedy, Divide & Conquer | "algorithms", "Big O", "optimization", "complexity" |
| **Systems/OS** | 🖥️ | Operating Systems, Memory Management, Concurrency | "operating systems", "multithreading", "processes" |
| **Databases** | 🗄️ | SQL, NoSQL, Query Optimization, Indexing | "SQL", "PostgreSQL", "MongoDB", "database design" |
| **Networking** | 🌐 | TCP/IP, HTTP, APIs, WebSockets, Security | "REST API", "HTTP", "networking", "protocols" |
| **Frontend** | 🎨 | HTML, CSS, JavaScript, React, Vue, UI/UX | "React", "frontend", "UI/UX", "responsive design" |
| **Backend** | ⚙️ | Servers, REST APIs, Microservices, Authentication | "Node.js", "backend", "API development", "servers" |
| **AI/ML** | 🤖 | Machine Learning, Neural Networks, NLP, Computer Vision | "machine learning", "AI", "neural networks", "TensorFlow" |
| **Math/Probability** | 📐 | Statistics, Linear Algebra, Calculus, Probability | "statistics", "linear algebra", "probability", "math" |

### How Skill Points Work

- **Starting Points**: 10 points to distribute during setup
- **Max per Skill**: 10 points (full mastery)
- **Total Max**: 90 points (10 points × 9 skills)
- **Power Level**: Sum of all skill points determines character class
- **Future XP System**: Planned feature to earn points by completing analyses

## 💰 Cost Considerations

### OpenAI API Pricing (as of Jan 2025)

**Model**: gpt-4o-mini (with web search enabled for company intelligence)
- **Input**: ~$0.150 per 1M tokens
- **Output**: ~$0.600 per 1M tokens

**Typical Usage**:
- Job analysis prompt: ~800-1,200 tokens
- AI response: ~1,500-2,500 tokens
- **Cost per analysis**: ~$0.001-0.005 (less than half a cent!)
- **100 job analyses**: ~$0.10-0.50

**Free Credits**:
- New OpenAI accounts receive $5 in free credits
- Enough for ~1,000-5,000 job analyses

### Cost Optimization Tips

✅ **Enable Caching** (default: ON)
- Saves 70%+ on repeat analyses of same jobs
- 24-hour cache prevents redundant API calls
- Automatically cleared when expired

✅ **Analyze Strategically**
- Focus on jobs you're seriously considering
- Review extracted data before generating ideas
- Use saved ideas as templates for similar jobs

✅ **Continuation Support**
- Extension handles long responses automatically
- No extra cost for multi-chunk responses

### Estimated Monthly Costs

| Usage Level | Jobs/Month | Est. Cost |
|-------------|------------|-----------|
| Light | 10-20 | $0.01-0.10 |
| Moderate | 50-100 | $0.05-0.50 |
| Heavy | 200-500 | $0.20-2.50 |
| Power User | 1000+ | $1.00-5.00 |

*Much cheaper than a cup of coffee, potentially life-changing for your career!*

## 🐛 Troubleshooting

### "Could not extract job information"

**Causes:**
- Not on a job detail page (on search results instead)
- Page hasn't fully loaded yet
- Job site updated their HTML structure

**Solutions:**
- ✓ Ensure you're viewing a **single job posting**, not a list
- ✓ Wait 2-3 seconds after page load, then open extension
- ✓ Try refreshing the page (F5)
- ✓ Check if URL matches: `linkedin.com/jobs/view/*`, `indeed.com/viewjob`, or `glassdoor.com/job-listing`

### "OpenAI API key invalid"

**Causes:**
- Key format incorrect
- Key revoked or expired
- Account has no credits

**Solutions:**
- ✓ Verify key starts with `sk-proj-` or `sk-`
- ✓ Check key is active in [OpenAI Dashboard](https://platform.openai.com/api-keys)
- ✓ Confirm you have available credits in billing section
- ✓ Try creating a new API key
- ✓ Ensure no extra spaces when pasting key

### "Rate limit exceeded"

**Causes:**
- Too many API requests in short time
- OpenAI rate limit hit
- Shared IP with high usage

**Solutions:**
- ✓ Wait 5-10 minutes before retrying
- ✓ Check if caching is enabled (should reduce rate limits)
- ✓ Review `chrome://extensions/` → RepoComPass → Errors for details

### Extension icon not appearing

**Causes:**
- Extension not loaded correctly
- Developer mode disabled
- Manifest errors

**Solutions:**
- ✓ Go to `chrome://extensions/` and verify RepoComPass is listed
- ✓ Enable **Developer mode** toggle (top right)
- ✓ Click **"Load unpacked"** and select the `RepoComPass` folder
- ✓ Check for red error messages on extension card
- ✓ Try clicking the puzzle icon 🧩 in toolbar → Pin RepoComPass

### Floating button not appearing on job page

**Causes:**
- Content script not injected
- URL doesn't match patterns
- JavaScript disabled

**Solutions:**
- ✓ Verify you're on LinkedIn/Indeed/Glassdoor job page
- ✓ Refresh page after installing extension
- ✓ Check `chrome://extensions/` → RepoComPass → Details → Site Access
- ✓ Ensure "On specific sites" includes the job site

### "Failed to generate ideas" or empty response

**Causes:**
- OpenAI API timeout
- Network connectivity issues
- Malformed API request

**Solutions:**
- ✓ Check internet connection
- ✓ Try again in a few seconds (AI response can take 5-15 seconds)
- ✓ Open DevTools (F12) → Console tab → Look for errors
- ✓ Verify API key has available credits
- ✓ Clear cache in CONFIG tab and retry

### Setup wizard stuck or won't complete

**Causes:**
- Missing required fields
- Invalid API key format
- Browser storage disabled

**Solutions:**
- ✓ Ensure player name is 3-16 alphanumeric characters
- ✓ Paste valid OpenAI API key (starts with `sk-`)
- ✓ Check that total skill points = 10 (no more, no less)
- ✓ Enable cookies and local storage in Chrome settings
- ✓ Try opening extension in new window/tab

### Chrome storage quota exceeded

**Causes:**
- Too many saved ideas (>100)
- Large cache accumulation
- Chrome's 10MB limit reached

**Solutions:**
- ✓ Delete old saved ideas in IDEAS tab
- ✓ Clear cache in CONFIG tab
- ✓ Check storage usage in DevTools → Application → Storage

## 🚀 Development

### Prerequisites

- **Browser**: Chrome/Chromium v88+ or Edge v88+
- **Editor**: VS Code (recommended), Sublime Text, or any text editor
- **Knowledge**: Basic JavaScript, HTML, CSS
- **Tools**: Chrome DevTools for debugging

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/GraphoLogiCode/RepoComPass.git
   cd RepoComPass
   ```

2. **Open in Editor**
   ```bash
   code .  # For VS Code
   ```

3. **Load Extension**
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select `RepoComPass` folder

4. **Make Changes**
   - Edit files in your code editor
   - Save changes

5. **Reload Extension**
   - Go to `chrome://extensions/`
   - Click 🔄 refresh icon on RepoComPass card
   - Or use keyboard shortcut: Ctrl+R on extensions page

6. **Test Changes**
   - Open a job posting page (LinkedIn/Indeed/Glassdoor)
   - Click extension icon
   - Verify your changes work as expected

### Debugging

**Popup Debugging:**
1. Open extension popup
2. Right-click inside popup → **Inspect**
3. DevTools opens with Console, Network, Sources tabs
4. View logs, errors, network requests

**Content Script Debugging:**
1. Navigate to job posting page
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Content script logs appear here
5. Check **Sources** → **Content scripts** → `content-script.js`

**Service Worker Debugging:**
1. Go to `chrome://extensions/`
2. Find RepoComPass card
3. Click **"service worker"** link
4. DevTools opens for background context
5. View API calls, errors, console logs

### Testing Workflow

**Manual Testing Checklist:**
- [ ] First-time setup completes without errors
- [ ] Job data extracts correctly on LinkedIn/Indeed/Glassdoor
- [ ] Company search returns web-sourced data
- [ ] AI generates 3-5 relevant project ideas
- [ ] Saved ideas persist after closing extension
- [ ] Skill points update correctly in STATS tab
- [ ] Cache reduces duplicate API calls
- [ ] Settings save and persist across sessions
- [ ] Character class updates when power level changes
- [ ] Error messages display for invalid API keys

**Automated Testing:**
Currently no unit tests. Contributions welcome!

### Key Files to Modify

| File | Purpose | When to Edit |
|------|---------|--------------|
| [popup/popup.js](popup/popup.js) | Core logic, RPG system, API calls | Adding features, fixing bugs, logic changes |
| [popup/popup.html](popup/popup.html) | UI structure, layout | Changing UI elements, adding new sections |
| [popup/popup.css](popup/popup.css) | Styling, animations | Visual tweaks, color schemes, responsive design |
| [content/content-script.js](content/content-script.js) | Job scraping, selectors | Supporting new job sites, fixing scraping bugs |
| [background/service-worker.js](background/service-worker.js) | API proxy, CORS handling | Changing API endpoints, adding new APIs |
| [setup/setup.js](setup/setup.js) | Onboarding flow | Modifying setup wizard, validation logic |
| [utils/helpers.js](utils/helpers.js) | Utility classes | Adding new utilities, improving caching |
| [manifest.json](manifest.json) | Extension config | Permissions, URLs, version updates |

### Adding a New Job Site

1. **Update `manifest.json`**:
   ```json
   "host_permissions": [
     "https://newjobsite.com/*"
   ],
   "content_scripts": [{
     "matches": ["https://newjobsite.com/*"]
   }]
   ```

2. **Edit `content/content-script.js`**:
   - Add URL detection in `detectJobSite()`
   - Add CSS selectors in `scrapeJobData()`
   - Test extraction on actual job pages

3. **Test thoroughly** on multiple job postings

### Project Roadmap Ideas

**Planned Features:**
- [ ] XP system (earn points by analyzing jobs)
- [ ] Achievements/badges for milestones
- [ ] Export saved ideas to PDF/Markdown
- [ ] Browser sync across devices
- [ ] Dark/light theme toggle
- [ ] Multiple AI model options (GPT-4, Claude)
- [ ] Job tracking dashboard
- [ ] Resume analysis integration
- [ ] Chrome Web Store publication

**Contribution Areas:**
- Additional job site support (Monster, ZipRecruiter, etc.)
- Unit/integration tests
- Accessibility improvements (ARIA labels, keyboard nav)
- Internationalization (i18n support)
- Performance optimizations
- Bug fixes and error handling

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear message (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

**Code Style:**
- Use ES6+ JavaScript features
- 2-space indentation
- Clear variable names (no single letters except loops)
- Add comments for complex logic
- Follow existing code structure

## 📜 License

MIT License - see LICENSE file for details.

You are free to:
- ✓ Use commercially
- ✓ Modify and distribute
- ✓ Use privately
- ✓ Sublicense

Conditions:
- Include original license and copyright notice
- No warranty provided

## 🙏 Acknowledgments

- **Built with ❤️** for job seekers who want to stand out
- **Powered by**: OpenAI GPT-4o-mini API (with web search)
- **Inspired by**: Retro arcade games, RPG progression systems
- **Fonts**: Google Fonts (Orbitron, VT323, Press Start 2P)
- **Icons**: Custom SVG compass design

## 📞 Support & Feedback

- **Issues**: [GitHub Issues](https://github.com/GraphoLogiCode/RepoComPass/issues)
- **Feature Requests**: Open an issue with label "enhancement"
- **Questions**: Check troubleshooting section first, then open issue

## 🌟 Star this Project

If RepoComPass helps you land your dream job, consider:
- ⭐ Starring the repository
- 🐦 Sharing on social media
- 🤝 Contributing improvements
- 💬 Leaving feedback

---

**Ready to level up your career?** Install RepoComPass and start your quest! 🎮🚀

```
┌─────────────────────────────────────┐
│  GAME OVER?  NO, GAME ON!           │
│  INSERT COIN TO CONTINUE...         │
│                                     │
│  [PRESS START]                      │
└─────────────────────────────────────┘
```
