# RepoComPass

A gamified Chrome extension that generates personalized portfolio project recommendations based on job postings. Level up your career with an epic, retro arcade experience!

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

## 🎯 Usage

### Analyzing a Job Posting

1. **Navigate** to a job posting on:
   - LinkedIn Jobs (`linkedin.com/jobs/*`)
   - Indeed (`indeed.com/*`)
   - Glassdoor (`glassdoor.com/*`)

2. **Open Extension**
   - Click the RepoComPass icon in your browser toolbar
   - Or click the floating 🧭 compass button injected on the job page

3. **Auto-Extract Job Details**
   - Extension automatically scrapes:
     - Job title
     - Company name
     - Location
     - Job description and requirements
     - Detected technologies (via pattern matching)
       
4. **Generate Project Ideas**
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

5. **Save Ideas**
   - Click the save icon on any project idea
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

Much cheaper than a cup of coffee, potentially life-changing for your career!*

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

### In the future,

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

GPL v3.0 - see LICENSE file for details.

You are free to:
- ✓ Modify and distribute
- ✓ Use privately
- ✓ Sublicense

Conditions:
- Include original license and copyright notice
- No warranty provided

## 🙏 Acknowledgments

- **Built with ❤️** for job seekers who want to stand out
- **Powered by**: OpenAI GPT-5-mini API (with web search)
- **Inspired by**: Retro arcade games, RPG progression systems
- **Fonts**: Google Fonts (Orbitron, VT323, Press Start 2P)
- **Icons**: Custom SVG compass design

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
