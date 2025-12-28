# 🧭 RepoComPass

A gamified Chrome extension that generates personalized portfolio project recommendations based on job postings and hiring manager insights.  Level up your career with an epic, retro arcade experience!

## ✨ Features

### 🎮 Gamification & RPG System
- **Skill Point System**: Track your expertise across 9 technical domains
- **Character Progression**: Evolve from "Apprentice Dev" to "Legendary Dev"
- **XP & Levels**: Gain experience by analyzing jobs and generating ideas
- **Custom Player Profile**: Create your unique developer persona

### 🔍 Job Analysis
- **Automated Extraction**: Scrapes job requirements from LinkedIn, Indeed, and Glassdoor
- **Company Intelligence**: Analyzes hiring manager GitHub profiles to understand tech preferences
- **AI-Powered Matching**: Uses OpenAI GPT-4o-mini to generate tailored project recommendations

### 💡 Project Generation
- **Personalized Ideas**: AI creates project suggestions aligned with: 
  - Job requirements and tech stack
  - Your current skill levels
  - Hiring manager's interests
- **Save & Track**: Build your portfolio idea collection
- **Smart Caching**: Reduces API costs with intelligent data caching

### 🎨 Retro Arcade Experience
- **80s Arcade Aesthetics**: Neon colors, pixel fonts, CRT effects
- **Animated UI**: Smooth transitions, glowing buttons, scanline overlays
- **Sound Effects**: Optional retro audio feedback (configurable)
- **Dark Mode**: Easy on the eyes for late-night job hunting

### 🔒 Privacy & Security
- **Bring Your Own Key**: Your API keys stay local in browser storage
- **No Tracking**: Zero analytics or data collection
- **Open Source**:  Fully transparent codebase

## 📦 Installation

### For Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/GraphoLogiCode/RepoComPass. git
   cd RepoComPass/repocompass-extension
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right)
   - Click **"Load unpacked"**
   - Select the `repocompass-extension` folder

3. **Extension icon appears** in your toolbar 🎮

### First-Time Setup

When you first open RepoComPass, you'll go through a 5-step guided setup:

1. **Welcome**:  Introduction to features
2. **Player Name**: Choose your developer handle (3-16 chars)
3. **API Keys**: Add your OpenAI API key (required for AI features)
4. **Skill Allocation**:  Distribute 10 initial skill points across domains
5. **Ready**:  Complete setup and start your quest!

### Getting API Keys

#### OpenAI API Key (Required)
- Sign up at [OpenAI Platform](https://platform.openai.com/)
- Navigate to [API Keys](https://platform.openai.com/api-keys)
- Create a new key (starts with `sk-`)
- **Cost**: ~$0.01-0.03 per job analysis (using gpt-4o-mini)



## 🎯 Usage

### Analyzing a Job Posting

1. **Navigate** to a job posting on: 
   - LinkedIn Jobs (`linkedin.com/jobs/... `)
   - Indeed (`indeed.com/... `)
   - Glassdoor (`glassdoor.com/...`)

2. **Open Extension**
   - Click the 🎮 icon in your toolbar
   - Or click the floating 🧭 button on the page

3. **Analyze Job**
   - Extension auto-extracts job details
   - Click **"SEARCH COMPANY"** to find hiring manager
   - View extracted requirements and tech stack

4. **Generate Ideas**
   - Click **"GENERATE PROJECT IDEAS"**
   - AI creates 3-5 personalized project suggestions
   - Each idea includes:
     - Project title and description
     - Key features to implement
     - Tech stack recommendations
     - Estimated difficulty level

5. **Save Ideas**
   - Click 💾 on ideas you like
   - Access saved ideas in the **"IDEAS"** tab

### Managing Your Stats

Visit the **"STATS"** tab to:
- View your current skill levels across 9 domains
- Track total XP and character level
- See your character class (e.g., "Code Warrior")
- Increase skill points by analyzing more jobs

### Customizing Settings

In the **"CONFIG"** tab:
- **API Keys**: Update OpenAI/GitHub tokens
- **Enable Cache**: Reduce API costs (24hr cache)
- **Auto-Analyze**: Automatically detect job pages
- **Sound Effects**: Toggle retro audio
- **CRT Effects**: Enable/disable scanline overlay

## 🏗️ Project Structure

```
repocompass-extension/
├── manifest.json              # Extension configuration
├── popup/
│   ├── popup.html            # Main popup UI
│   ├── popup.css             # Retro arcade styles
│   └── popup.js              # Core logic & state management
├── setup/
│   ├── setup.html            # First-time onboarding UI
│   ├── setup. css             # Setup page styles
│   └── setup. js              # Setup flow logic & validation
├── background/
│   └── service-worker.js     # Background API handling
├── content/
│   └── content-script.js     # Job page scraping logic
├── styles/
│   └── content. css           # Injected page styles
├── icons/                    # Extension icons (16/48/128px)
├── welcome. html              # Post-setup welcome screen
├── welcome.js                # Welcome animations
├── SETUP_TESTING.md          # Setup flow testing guide
└── README.md                 # This file
```

## 🔧 Technical Architecture


### Data Flow

1. **Content Script** → Extracts job data from DOM
2. **Popup** → Displays data, sends API requests via service worker
3. **Service Worker** → Makes authenticated API calls (CORS bypass)
4. **Chrome Storage** → Persists settings, stats, saved ideas

## 📊 Skill Domains

RepoComPass tracks 9 technical skill categories:

| Skill | Icon | Description |
|-------|------|-------------|
| **Data Structures** | 🗃️ | Arrays, Trees, Graphs, Hash Tables |
| **Algorithms** | 🧮 | Sorting, Searching, Dynamic Programming |
| **Systems/OS** | 🖥️ | Operating Systems, Memory, Processes |
| **Databases** | 🗄️ | SQL, NoSQL, Query Optimization |
| **Networking** | 🌐 | TCP/IP, HTTP, APIs, Security |
| **Frontend** | 🎨 | HTML, CSS, JavaScript, React, UI/UX |
| **Backend** | ⚙️ | Servers, REST APIs, Microservices |
| **AI/ML** | 🤖 | Machine Learning, Neural Networks |
| **Math/Probability** | 📐 | Statistics, Linear Algebra, Calculus |

## 💰 Cost Considerations

| API | Free Tier | Typical Cost |
|-----|-----------|--------------|
| **OpenAI GPT-5-mini** | $5 free credit | cheap |


### Cost Optimization Tips
- ✅ **Enable caching** (on by default) - saves 70%+ on repeat searches
- ✅ **Use GitHub token** - increases rate limits to 5000/hr
- ✅ **Analyze strategically** - focus on jobs you're serious about

## 🐛 Troubleshooting

### "Could not extract job information"
- ✓ Ensure you're on a **job detail page** (not search results)
- ✓ Try refreshing the page and waiting 2-3 seconds
- ✓ Some job sites have dynamic layouts that may not work

### "OpenAI API key invalid"
- ✓ Check key format (starts with `sk-`)
- ✓ Verify key is active in OpenAI dashboard
- ✓ Ensure you have available credits

### "Rate limit exceeded"
- ✓ Wait 5-10 minutes before retrying
- ✓ Add GitHub token in settings for higher limits
- ✓ Check if caching is enabled

### Extension not appearing
- ✓ Verify "Developer mode" is enabled
- ✓ Check for errors in `chrome://extensions/`
- ✓ Try reloading the extension

## 🚀 Development

### Prerequisites
- Chrome/Chromium browser (v88+)
- Text editor (VS Code recommended)
- Basic knowledge of JavaScript, HTML, CSS

### Making Changes

1. **Edit files** in `repocompass-extension/`
2. **Reload extension**: 
   - Go to `chrome://extensions/`
   - Click refresh icon on RepoComPass card
3. **Test changes** on a job posting page
4. **Check logs**:  Right-click popup → Inspect → Console

### Testing Setup Flow

See `SETUP_TESTING.md` for comprehensive testing instructions.

### Key Files to Modify

- **`popup/popup.js`** - Core logic, API calls, skill system
- **`popup/popup.css`** - Visual styles, animations
- **`content/content-script.js`** - Job scraping logic
- **`background/service-worker.js`** - API proxy, CORS handling

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with ❤️ for job seekers who want to stand out
- Powered by OpenAI GPT-4o-mini, GitHub API

---

**Ready to level up your career?** Install RepoComPass and start your quest!  🎮🚀

```
GAME OVER?  NO, GAME ON!  
INSERT COIN TO CONTINUE... 
```