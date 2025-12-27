# 🧭 RepoComPass

A Chrome extension that generates personalized portfolio project recommendations based on job postings and hiring manager insights.

## Features

- **Job Posting Analysis**: Automatically extracts job requirements, technologies, and company info from LinkedIn, Indeed, and Glassdoor
- **Hiring Manager Insights**: Searches for the hiring manager's GitHub profile to understand their tech interests
- **AI-Powered Recommendations**: Uses OpenAI GPT-4 to generate tailored project ideas that align with job requirements and hiring manager preferences
- **Save & Track**: Save project ideas for different job applications
- **Privacy-First**: "Bring Your Own Key" model - your API keys stay local

## Installation

### For Development

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `repocompass` folder
5. The extension icon should appear in your toolbar

### Setting Up API Keys

1. Click the RepoComPass icon and go to **Settings**
2. Add your API keys:
   - **OpenAI API Key** (required): Get from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **GitHub Token** (optional): Get from [GitHub Settings](https://github.com/settings/tokens)
   - **SerpAPI Key** (optional): Get from [SerpAPI](https://serpapi.com/manage-api-key)

## Usage

1. Navigate to a job posting on:
   - LinkedIn Jobs
   - Indeed
   - Glassdoor

2. Click the RepoComPass extension icon (or the floating 🧭 button)

3. The extension will:
   - Extract job details and requirements
   - Search for the hiring manager's GitHub profile
   - Analyze their tech interests and recent projects

4. Click **"Generate Project Ideas"** to get personalized recommendations

5. Save ideas you like for future reference

## Project Structure

```
repocompass/
├── manifest.json          # Extension configuration
├── popup/
│   ├── popup.html        # Main popup UI
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
├── background/
│   └── service-worker.js # Background API handling
├── content/
│   └── content-script.js # Job page scraping
├── styles/
│   └── content.css       # Content script styles
├── utils/
│   └── helpers.js        # Utility functions
├── icons/                # Extension icons
├── welcome.html          # Onboarding page
└── README.md
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Job Sites     │────▶│  Content Script  │────▶│     Popup       │
│ (LinkedIn, etc) │     │  (Data Extract)  │     │   (UI/Display)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                               ┌──────────────────┐
                                               │ Service Worker   │
                                               │ (Background)     │
                                               └────────┬─────────┘
                                                        │
                        ┌───────────────────────────────┼───────────────────────────────┐
                        ▼                               ▼                               ▼
               ┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
               │   GitHub API    │            │    SerpAPI      │            │   OpenAI API    │
               │ (Profile/Repos) │            │ (Search Person) │            │ (Generate Ideas)│
               └─────────────────┘            └─────────────────┘            └─────────────────┘
```

## Privacy & Ethics

### What We DO:
- ✅ Use public GitHub data via their official API
- ✅ Extract job posting info from pages you're viewing
- ✅ Store your settings locally in your browser
- ✅ Let you use your own API keys

### What We DON'T DO:
- ❌ Scrape LinkedIn profiles (violates their ToS)
- ❌ Store your API keys on any server
- ❌ Track your job search activity
- ❌ Share your data with third parties

## Cost Considerations

| API | Free Tier | Paid Rates |
|-----|-----------|------------|
| GitHub API | 60 req/hr (unauth), 5000/hr (auth) | Free with token |
| Google Programmable Search | 100 queries/day | $5 per 1000 queries |
| SerpAPI | Limited free trial | ~$75/mo for 5000 searches |
| OpenAI GPT-4 | Pay as you go | ~$0.03-0.06 per 1K tokens |

### Tips to Reduce Costs:
- Enable caching (on by default)
- Use GitHub token for higher rate limits
- The extension caches hiring manager data for 24 hours

## Troubleshooting

### "Could not extract job information"
- Make sure you're on a job posting page (not a job search results page)
- Try refreshing the page and waiting a few seconds
- Some job postings may have unusual layouts

### "OpenAI API key is required"
- Go to Settings and add your OpenAI API key
- Make sure the key is valid and has available credits

### Rate Limit Errors
- Wait a few minutes and try again
- Add a GitHub token in settings for higher limits
- Enable caching to reduce API calls

## Development

### Building for Production

```bash
npm run build    # Copies files to dist/
npm run zip      # Creates extension zip file
```

### Testing Changes

1. Make your changes
2. Go to `chrome://extensions/`
3. Click the refresh icon on the RepoComPass card
4. Test your changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] Support for more job sites (Wellfound, Greenhouse, Lever)
- [ ] Browser action for quick idea generation
- [ ] Export ideas to markdown/PDF
- [ ] Integration with task managers (Notion, Todoist)
- [ ] Team/shared idea collections
- [ ] Analytics on saved ideas

---

Built with ❤️ for job seekers who want to stand out
