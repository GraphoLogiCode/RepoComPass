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

## The 9 Skill Domains

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
  
### Estimated Monthly Costs

Much cheaper than a cup of coffee, potentially life-changing for your career!*

Below is a **compressed, scannable version** with the same meaning and coverage.

---

## 🐛 Troubleshooting

### Could not extract job information

**Causes**

* Not on a single job page
* Page not fully loaded
* Site HTML changed

**Fix**

* Open a single job posting (not a list)
* Wait 2–3s, then open extension
* Refresh (F5)
* Check URL: `linkedin.com/jobs/view/*`, `indeed.com/viewjob`, `glassdoor.com/job-listing`

---

### OpenAI API key invalid

**Causes**

* Wrong format
* Revoked / expired
* No credits

**Fix**

* Key starts with `sk-` or `sk-proj-`
* Verify in OpenAI Dashboard
* Check billing credits
* Regenerate key if needed
* Remove extra spaces

---

### Rate limit exceeded

**Causes**

* Too many requests
* OpenAI limit hit
* Shared IP traffic

**Fix**

* Wait 5–10 minutes
* Ensure caching is enabled
* Check errors in `chrome://extensions/` → RepoComPass

---

### Extension icon missing

**Causes**

* Not loaded
* Dev mode off
* Manifest error

**Fix**

* Check RepoComPass in `chrome://extensions/`
* Enable Developer Mode
* Reload via “Load unpacked”
* Fix any red errors
* Pin from puzzle icon 🧩

---

## 📜 License

GPL v3.0 - see LICENSE file for details.

You are free to:
- ✓ Modify and distribute
- ✓ Use privately
- ✓ Sublicense

Conditions:
- Include original license and copyright notice
- No warranty provided

## Acknowledgments

- **Built with ❤️** for job seekers who want to stand out
- **Powered by**: OpenAI GPT-5-mini API (with web search)
- **Inspired by**: Retro arcade games, RPG progression systems
- **Fonts**: Google Fonts (Orbitron, VT323, Press Start 2P)
- **Icons**: Custom SVG compass design

---

**Ready to level up your career?** Install RepoComPass and start your quest! 

```
┌─────────────────────────────────────┐
│  GAME OVER?  NO, GAME ON!           │
│  INSERT COIN TO CONTINUE...         │
│                                     │
│  [PRESS START]                      │
└─────────────────────────────────────┘
```
