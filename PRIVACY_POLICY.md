# Privacy Policy for RepoComPass

**Last Updated:** December 29, 2025
**Effective Date:** December 29, 2025

## Introduction

RepoComPass ("we," "our," or "the extension") is a Chrome browser extension that helps job seekers generate personalized portfolio project recommendations based on job postings. This Privacy Policy explains how we handle your information.

## Our Commitment to Privacy

**RepoComPass does NOT collect, store, or transmit any user data to our servers.** We have no backend infrastructure, databases, or analytics systems. The extension operates entirely within your browser using local storage.

## Information We Access

### 1. Job Posting Information
- **What:** Job titles, company names, locations, and job descriptions from supported job sites (LinkedIn, Indeed, Glassdoor)
- **How:** Extracted from publicly visible web pages using content scripts
- **When:** Only when you explicitly open the extension on a job posting page
- **Storage:** Temporarily cached locally in your browser for 30 seconds to prevent redundant scraping
- **Transmission:** Sent only to OpenAI's API using your personal API key (see below)

### 2. User-Provided Information
- **OpenAI API Key:** You provide your own OpenAI API key for AI-powered features
  - Stored encrypted in Chrome's local storage (`chrome.storage.local`)
  - Never transmitted to our servers (we don't have any)
  - Only used to authenticate requests to OpenAI's API
  - You can delete it anytime in the extension settings

- **Player Profile:** Your chosen username and skill allocations for the gamification system
  - Stored locally in your browser
  - Never leaves your device

- **Saved Project Ideas:** Project recommendations you choose to save
  - Stored locally in your browser
  - Never transmitted externally

## Third-Party Services

### OpenAI API
- **Purpose:** Generate company research and project recommendations using AI
- **Data Shared:** Job posting content, company names, and your skill profile
- **Your Control:** You provide your own API key and can revoke access anytime
- **OpenAI's Privacy:** See [OpenAI Privacy Policy](https://openai.com/privacy)
- **Important:** We do not control how OpenAI processes your data. By using this extension, you agree to OpenAI's terms of service and privacy policy.

### No Other Third Parties
RepoComPass does NOT use:
- ❌ Google Analytics or any analytics service
- ❌ Crash reporting tools
- ❌ Advertising networks
- ❌ Social media tracking pixels
- ❌ Third-party cookies
- ❌ Backend servers or databases

## Data Storage

All data is stored locally in your browser using Chrome's Storage API:

| Data Type | Storage Location | Retention Period |
|-----------|------------------|------------------|
| OpenAI API Key | `chrome.storage.local` | Until you remove it |
| Player Stats (name, skills, XP) | `chrome.storage.local` | Permanent (until you clear it) |
| Saved Project Ideas | `chrome.storage.local` | Permanent (until you delete them) |
| Extension Settings | `chrome.storage.local` | Permanent (until you reset them) |
| API Response Cache | `chrome.storage.local` | 24 hours (auto-deleted) |
| Job Data Cache | `chrome.storage.session` | 30 seconds |

## Permissions Explained

### Required Permissions

#### 1. `activeTab`
- **Purpose:** Read job posting content from the currently active tab when you click the extension icon
- **Scope:** Only the current tab, only when you activate the extension
- **Data Access:** Job title, company name, location, description (publicly visible content)

#### 2. `host_permissions` for Job Sites
- **Sites:** `linkedin.com/jobs/*`, `indeed.com/*`, `glassdoor.com/*`
- **Purpose:** Extract job information from these specific job posting pages
- **When:** Only when you open the extension on these sites
- **Why:** Required to read page content and inject the floating compass button

#### 3. `host_permissions` for OpenAI API
- **Domain:** `api.openai.com/*`
- **Purpose:** Make API requests to generate project recommendations
- **Authentication:** Uses your personal API key
- **Data Sent:** Job details, company names, your skill profile

#### 4. `scripting`
- **Purpose:** Inject content scripts to extract job data and add the floating compass button
- **Scope:** Only on supported job sites (LinkedIn, Indeed, Glassdoor)
- **Code:** All code is bundled with the extension (no remote code execution)

#### 5. `storage`
- **Purpose:** Save your settings, API key, player stats, and project ideas locally
- **Location:** Chrome's local storage (encrypted, sandboxed per extension)
- **Access:** Only accessible by this extension, not shared with websites or other extensions

## Data Security

### Local Storage Protection
- Chrome's `storage.local` API is isolated per extension
- Data is encrypted at rest by Chrome's security layer
- No external network access except OpenAI API calls

### API Key Security
- Stored in Chrome's secure storage (not accessible via JavaScript on websites)
- Never logged, displayed in plain text, or transmitted to third parties
- You should treat your OpenAI API key as a password

### No Remote Storage
- We don't have servers, so we can't lose your data in a breach
- All data stays on your device under your control

## Your Rights and Controls

### You Can:
✅ **View all stored data** - Open Chrome DevTools → Application → Storage → Local Storage → `chrome-extension://[extension-id]`
✅ **Delete your API key** - Go to CONFIG tab → Remove API key
✅ **Clear all cached data** - CONFIG tab → Clear Cache
✅ **Delete saved ideas** - IDEAS tab → Delete icon on each idea
✅ **Reset all settings** - Uninstall and reinstall the extension
✅ **Revoke permissions** - `chrome://extensions/` → RepoComPass → Details → Remove specific permissions
✅ **Uninstall completely** - `chrome://extensions/` → Remove

### Automatic Data Deletion
- API response cache auto-deletes after 24 hours
- Job data cache auto-deletes after 30 seconds
- You can manually clear cache anytime in settings

## Data Transmission

### What We Send to OpenAI:
- Job title, company name, location, description
- Detected technologies from job posting
- Your skill levels (for personalized recommendations)
- Company research context (if you use "Search Company" feature)

### What We DON'T Send:
- ❌ Your browsing history
- ❌ Personal identifying information (name, email, address)
- ❌ Cookies or tracking data
- ❌ LinkedIn/Indeed/Glassdoor account credentials
- ❌ Any data from tabs not explicitly analyzed

## Children's Privacy

RepoComPass is intended for job seekers, typically 18+ years old. We do not knowingly collect information from children under 13. If you are under 13, do not use this extension.

## Open Source Transparency

RepoComPass is fully open source. You can:
- 🔍 **Audit the code:** [GitHub Repository](https://github.com/GraphoLogiCode/RepoComPass)
- 🐛 **Report issues:** [GitHub Issues](https://github.com/GraphoLogiCode/RepoComPass/issues)
- 🔐 **Verify privacy claims:** All code is publicly reviewable

## Changes to This Policy

We may update this Privacy Policy to reflect changes in:
- Browser API capabilities
- Third-party service policies (e.g., OpenAI)
- User feedback and feature requests

**Notice of Changes:**
- Updated policy will be posted in the GitHub repository
- "Last Updated" date will be changed at the top
- Major changes will be announced in release notes

## Legal Compliance

### GDPR (EU Users)
- **Data Controller:** You (the user) control your own data
- **Data Processor:** OpenAI processes job data when you use AI features
- **Right to Access:** View data in Chrome DevTools
- **Right to Deletion:** Uninstall extension or clear storage
- **Right to Portability:** Export saved ideas manually (copy/paste)

### CCPA (California Users)
- **Data Sale:** We do NOT sell your data (we don't collect it!)
- **Data Sharing:** Shared only with OpenAI via your API key
- **Opt-Out:** Don't provide an API key to avoid AI features

## Contact Information

**Developer:** GraphoLogiCode
**GitHub:** [https://github.com/GraphoLogiCode/RepoComPass](https://github.com/GraphoLogiCode/RepoComPass)
**Issues/Questions:** [GitHub Issues](https://github.com/GraphoLogiCode/RepoComPass/issues)

For privacy-related questions, please open a GitHub issue labeled "privacy" or email the developer through GitHub.

## Disclaimer

RepoComPass is provided "as is" without warranty. By using this extension:
- You acknowledge that job data is sent to OpenAI's API
- You agree to OpenAI's Terms of Service and Privacy Policy
- You understand that AI-generated recommendations are not guaranteed to be accurate
- You are responsible for securing your own OpenAI API key

## Summary (TL;DR)

✅ **We DON'T collect your data** - No servers, no analytics, no tracking
✅ **You control everything** - Your API key, your data, your browser
✅ **Open source** - Audit the code yourself on GitHub
✅ **Local-first** - All storage happens in your browser
✅ **Transparent** - You see exactly what's sent to OpenAI

**Questions?** Open an issue on GitHub or check the README troubleshooting section.

---

*This privacy policy is written in plain English to be understandable by all users. For legal interpretation, the GitHub repository serves as the authoritative source.*
