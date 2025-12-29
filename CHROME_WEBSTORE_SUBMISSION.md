# Chrome Web Store Submission Guide

This document contains all the required information for submitting RepoComPass to the Chrome Web Store.

## 📝 Privacy Practices Tab - Required Justifications

Copy and paste these justifications into the corresponding fields in the Chrome Web Store Developer Dashboard.

---

### 1. Single Purpose Description

**Field:** Single Purpose
**Character Limit:** 132 characters

```
Generate personalized portfolio project ideas tailored to job postings using AI-powered company research and skill analysis.
```

---

### 2. Permission Justifications

#### activeTab Permission

**Field:** activeTab Justification
**Recommended Length:** 2-3 sentences

```
The activeTab permission allows RepoComPass to read publicly visible job posting content (title, company name, location, description) from the currently active tab when users explicitly click the extension icon. This information is used to generate personalized project recommendations. The extension only accesses tab content when the user activates it on supported job sites (LinkedIn, Indeed, Glassdoor).
```

---

#### Host Permissions Justification

**Field:** Host Permissions Justification
**Recommended Length:** 3-4 sentences

```
Host permissions are required for two purposes:

1. Job Sites (linkedin.com/jobs/*, indeed.com/*, glassdoor.com/*): To extract publicly visible job posting information when users click the extension icon on these pages. Content scripts read job titles, company names, locations, and descriptions to provide personalized recommendations.

2. OpenAI API (api.openai.com/*): To send job data and receive AI-generated project recommendations using the user's own OpenAI API key. All API requests are authenticated with the user's personal key, and no data is sent to the extension developer's servers.

No data is collected, stored, or transmitted to third parties except OpenAI's API for processing.
```

---

#### Remote Code Justification

**Field:** Remote Code Justification
**Recommended Length:** 3-4 sentences

```
RepoComPass does NOT execute remote code. All extension code is bundled and packaged within the extension itself. The only remote interaction is making HTTPS API calls to OpenAI's REST API (api.openai.com) to send job data and receive JSON responses containing project recommendations. No executable JavaScript or code is fetched, evaluated, or executed from remote sources. All API responses are parsed as data (JSON), not executed as code.
```

**Alternative (if Chrome flags API usage):**
```
Remote interactions are limited strictly to RESTful API calls to OpenAI's servers using the user's own API key. The extension sends job posting data via HTTPS POST requests and receives JSON-formatted text responses. These responses are parsed as data structures, not executed as code. No JavaScript, WebAssembly, or executable code is downloaded or executed from remote sources. All extension logic is contained in the packaged files reviewed during submission.
```

---

#### scripting Permission Justification

**Field:** scripting Permission Justification
**Recommended Length:** 2-3 sentences

```
The scripting permission is used to inject content scripts into job posting pages (linkedin.com/jobs/*, indeed.com/*, glassdoor.com/*) to extract publicly visible job information when users activate the extension. Content scripts read the DOM to identify job titles, company names, locations, and descriptions, and inject a floating compass button for easy extension access. This injection only occurs on supported job sites and only reads publicly available content visible to any website visitor.
```

---

#### storage Permission Justification

**Field:** storage Permission Justification
**Recommended Length:** 3-4 sentences

```
The storage permission is used to save user data locally within the browser using Chrome's storage API. Stored data includes:
- User's OpenAI API key (encrypted by Chrome, never transmitted to our servers)
- User preferences (cache settings, auto-analyze toggle, CRT effects)
- Player profile (username, skill levels, XP points for the gamification system)
- Saved project ideas for later reference
- Temporary API response cache (24-hour expiration) to reduce costs

All data is stored locally on the user's device and never transmitted to the extension developer's servers. Users can delete all stored data by clearing the cache in settings or uninstalling the extension.
```

---

## 🔒 Data Usage Certification

### Are you collecting user data?

**Answer:** ❌ **NO** (if you don't use analytics)

OR

**Answer:** ✅ **YES** (only if required by Chrome's definition)

**If YES, what data:**
- Publicly visible job posting content (temporary, not stored permanently)
- User-provided OpenAI API key (stored locally only)
- User preferences and gamification stats (stored locally only)

---

### Data Usage Declaration

**Question:** Does your extension collect or transmit user data?

**Answer:**
```
RepoComPass collects minimal data solely for providing its core functionality:

COLLECTED DATA:
1. Job posting content (title, company, location, description) - extracted from public web pages when users click the extension icon
2. User's OpenAI API key - provided voluntarily by users, stored locally in Chrome storage
3. User preferences - stored locally (cache settings, player name, skill levels)

DATA TRANSMISSION:
- Job data is sent ONLY to OpenAI's API (api.openai.com) using the user's own API key
- No data is sent to the extension developer's servers (we have none)
- No analytics, tracking, or telemetry is implemented

DATA STORAGE:
- All data stored locally using chrome.storage.local API
- API response cache expires after 24 hours and is auto-deleted
- Users can delete all data via extension settings or uninstallation

THIRD-PARTY SERVICES:
- OpenAI API (for AI-generated recommendations) - See OpenAI Privacy Policy: https://openai.com/privacy
- No other third-party services, analytics, or tracking

We do NOT:
❌ Collect personally identifiable information (PII)
❌ Track browsing history
❌ Use cookies for tracking
❌ Sell or share data with third parties
❌ Implement analytics or telemetry
❌ Store data on remote servers
```

---

### Data Handling Practices

Check all that apply:

✅ **Data is encrypted in transit** - HTTPS to OpenAI API
✅ **Users can request data deletion** - Clear cache or uninstall
✅ **Data usage is disclosed** - Privacy policy provided
❌ **Data is NOT sold to third parties** - We don't sell anything
❌ **Data is NOT used for advertising** - No ads
❌ **Data is NOT used for analytics** - No tracking

---

## 🌐 Privacy Policy URL

**Field:** Privacy Policy URL
**Requirements:** Must be publicly accessible HTTPS URL

**Option 1: GitHub (Recommended)**
```
https://github.com/GraphoLogiCode/RepoComPass/blob/main/PRIVACY_POLICY.md
```

**Option 2: GitHub Pages**
```
https://graphologicode.github.io/RepoComPass/privacy
```

**Option 3: Custom Domain**
```
https://yourwebsite.com/repocompass/privacy
```

---

## 📋 Additional Information for Reviewers

### Testing Instructions

**For Chrome Web Store Reviewers:**

1. **Installation:**
   - Load extension in Chrome
   - Complete 5-step setup wizard (enter any player name, provide test API key, allocate 10 skill points)

2. **Testing Job Extraction:**
   - Navigate to: `https://www.linkedin.com/jobs/view/123456789` (any LinkedIn job posting)
   - Click RepoComPass extension icon
   - Verify job title, company, location, and description are extracted

3. **Testing AI Features (requires valid OpenAI API key):**
   - Click "SEARCH COMPANY" to analyze company
   - Click "GENERATE PROJECT IDEAS" to get recommendations
   - Verify project ideas appear with title, description, tech stack

4. **Privacy Verification:**
   - Open Chrome DevTools → Network tab
   - Perform job analysis and idea generation
   - Verify ONLY requests to `api.openai.com` are made (no other external domains)
   - Verify no analytics or tracking requests

5. **Data Storage Inspection:**
   - Open DevTools → Application → Storage → Local Storage
   - Verify data is stored under extension's origin only
   - Check that API key is stored (encrypted by Chrome)

**Test OpenAI API Key (for reviewers):**
We recommend reviewers create their own free OpenAI account at https://platform.openai.com (includes $5 free credits) for testing. If needed, we can provide a limited test key upon request through the review process.

---

### Demo Video Script (Optional)

**Title:** RepoComPass - AI-Powered Portfolio Project Recommendations

**Script (60 seconds):**
1. [0-10s] Navigate to LinkedIn job posting for "Software Engineer at Google"
2. [10-15s] Click RepoComPass extension icon, showing auto-extracted job data
3. [15-25s] Click "SEARCH COMPANY", show AI finding Google's tech stack and blog
4. [25-40s] Click "GENERATE PROJECT IDEAS", show 3 personalized recommendations
5. [40-50s] Save one idea, navigate to IDEAS tab, show saved projects
6. [50-60s] Open STATS tab, show skill levels and character class

**Upload to:** YouTube (unlisted) or Vimeo

---

## 📸 Screenshots & Store Listing

### Required Screenshots (1280x800 or 640x400)

1. **Main Popup - Job Analysis**
   - Caption: "Automatically extract job details from LinkedIn, Indeed, and Glassdoor"

2. **Company Research**
   - Caption: "AI-powered company intelligence with web search"

3. **Project Recommendations**
   - Caption: "Get 3-5 personalized portfolio project ideas tailored to the job"

4. **Gamification - Stats Tab**
   - Caption: "Track your skills across 9 domains and level up your character"

5. **Saved Ideas**
   - Caption: "Save and organize project ideas for your portfolio"

### Store Listing Copy

**Short Description (132 characters max):**
```
AI-powered portfolio project ideas tailored to job postings. Analyze companies, track skills, level up your career! 🎮🚀
```

**Detailed Description (16,000 characters max):**
```
🧭 RepoComPass - Your AI Career Compass

Stand out in your job search with personalized portfolio project recommendations powered by AI!

✨ KEY FEATURES:

🔍 Smart Job Analysis
• Automatically extract job details from LinkedIn, Indeed, and Glassdoor
• Detect required technologies and skills from job descriptions
• AI-powered company research (website, blog, GitHub, tech stack)

💡 Personalized Project Ideas
• Get 3-5 custom project recommendations for each job
• Tailored to company's tech stack and recent initiatives
• Includes difficulty level, time estimates, and implementation tips
• Stand out with unique projects that demonstrate relevant skills

🎮 Gamified Skill Tracking
• Track expertise across 9 skill domains (Algorithms, Frontend, AI/ML, etc.)
• Level up from "Apprentice Dev" 🧙 to "Legendary Dev" 🌟
• Character progression system with 7 classes
• Earn XP by analyzing jobs and generating ideas

💾 Portfolio Builder
• Save promising project ideas for later
• Organize ideas by company or difficulty
• Export recommendations for your portfolio

🔒 Privacy-First Design
• Bring Your Own OpenAI API Key (BYOK)
• All data stored locally in your browser
• No analytics, tracking, or data collection
• Open source - audit the code yourself!

⚡ Cost-Effective
• Uses GPT-4o-mini (extremely affordable)
• ~$0.001-0.005 per job analysis
• Smart caching reduces API calls by 70%+
• New users get $5 free OpenAI credits (1,000+ analyses!)

🎨 Retro Arcade Vibes
• 80s arcade aesthetics with neon colors
• CRT effects and scanlines
• Pixel-perfect fonts
• Smooth animations

🚀 HOW IT WORKS:

1. Browse job postings on LinkedIn, Indeed, or Glassdoor
2. Click the RepoComPass icon to extract job details
3. (Optional) Research the company with AI-powered web search
4. Generate personalized project ideas based on the job
5. Save promising ideas and build your standout portfolio!

💰 PRICING:
• Extension: 100% FREE
• OpenAI API: ~$0.001-0.005 per analysis (you provide your own key)
• Free tier: $5 credits = 1,000-5,000 job analyses

📦 SUPPORTED JOB SITES:
• LinkedIn Jobs
• Indeed
• Glassdoor

🛠️ TECH STACK:
• Pure Vanilla JavaScript (no frameworks!)
• OpenAI GPT-4o-mini with web search
• Chrome Extension Manifest V3
• Local-first architecture

🌟 PERFECT FOR:
• Job seekers wanting to stand out
• Developers building portfolios
• Career changers learning new skills
• Students preparing for internships

🔗 OPEN SOURCE:
View the code: github.com/GraphoLogiCode/RepoComPass

📜 LICENSE: GPL v3.0

---

Ready to level up your career? Install RepoComPass and start your quest! 🎮🚀

Need help? Check the README or open a GitHub issue.
```

---

## 🏷️ Category & Tags

**Primary Category:** Productivity

**Secondary Category (if available):** Developer Tools

**Tags/Keywords:**
- job search
- career development
- portfolio projects
- AI assistant
- developer tools
- project ideas
- linkedin helper
- indeed helper
- resume builder
- coding projects

---

## 🌍 Language & Regions

**Language:** English (United States)

**Regions:** All regions (worldwide availability)

---

## 📧 Developer Contact

**Developer Name:** GraphoLogiCode

**Email:** [Your email or GitHub contact]

**Website:** https://github.com/GraphoLogiCode/RepoComPass

**Support URL:** https://github.com/GraphoLogiCode/RepoComPass/issues

---

## ✅ Pre-Submission Checklist

Before submitting, verify:

- [ ] All permission justifications are filled in
- [ ] Privacy policy URL is accessible (HTTPS)
- [ ] Single purpose description is under 132 characters
- [ ] Data usage certification is completed
- [ ] 5 screenshots uploaded (1280x800 recommended)
- [ ] Store listing text is compelling and accurate
- [ ] Promotional tile (440x280) designed (optional but recommended)
- [ ] Small promotional tile (220x140) designed (optional)
- [ ] Demo video uploaded (optional but helpful)
- [ ] Support email/website provided
- [ ] Pricing tier set to FREE
- [ ] Distribution regions selected
- [ ] Tested on clean Chrome profile
- [ ] No console errors in production build
- [ ] manifest.json version matches submission

---

## 🚨 Common Rejection Reasons & How to Avoid

### 1. Insufficient Permission Justifications
✅ **Solution:** Use the detailed justifications provided above

### 2. Missing Privacy Policy
✅ **Solution:** Link to PRIVACY_POLICY.md on GitHub (publicly accessible)

### 3. Overly Broad Permissions
✅ **Solution:** We only request necessary permissions (activeTab, storage, scripting, specific host_permissions)

### 4. Remote Code Execution
✅ **Solution:** Clarify that we make API calls (data), not execute remote code

### 5. Single Purpose Violation
✅ **Solution:** Our single purpose is "generate personalized portfolio project ideas for job seekers"

### 6. Data Collection Not Disclosed
✅ **Solution:** Clearly state we only send data to OpenAI, no tracking/analytics

### 7. Broken Demo/Testing
✅ **Solution:** Provide clear testing instructions and working test credentials

---

## 📞 Post-Submission Actions

After submitting:

1. **Monitor Review Status** - Check developer dashboard daily
2. **Respond Quickly** - If reviewers ask questions, reply within 24 hours
3. **Be Ready to Update** - If rejected, address feedback and resubmit promptly
4. **Update Documentation** - If changes required, update README and privacy policy
5. **Announce Launch** - Once approved, share on social media, Reddit, HN, etc.

---

## 📚 Additional Resources

- [Chrome Web Store Developer Policy](https://developer.chrome.com/docs/webstore/program-policies/)
- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [User Data Privacy Policy](https://developer.chrome.com/docs/webstore/user_data/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

**Questions?** Open an issue on GitHub or check the main README.md file.

Good luck with your submission! 🚀
