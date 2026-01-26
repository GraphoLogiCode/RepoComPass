
# RepoComPass

**RepoComPass** is a Chrome extension that analyzes job postings and generates **personalized portfolio project ideas** tailored to your skills and target roles.

It helps computer science students and developers build projects that directly align with real job requirements.

---

## What It Does

* Analyzes job postings from **LinkedIn, Indeed, and Glassdoor**
* Extracts required skills, technologies, and role expectations
* Uses AI to generate **3–5 portfolio-ready project ideas**
* Matches projects to:

  * Your skill levels
  * Company needs
  * Job requirements
* Saves ideas for later use in your portfolio

---

## Key Features

* **AI-powered project recommendations**
* **Automatic job scraping**
* **Skill-based personalization**
* **Save and manage project ideas**
* **RPG-style progression system** (skills, power level, ranks)
* Fully **vanilla JS** Chrome Extension (no frameworks)

---

## Installation (Development)

1. Clone the repo

   ```bash
   git clone https://github.com/GraphoLogiCode/RepoComPass.git
   cd RepoComPass
   ```

2. Load in Chrome

   * Go to `chrome://extensions`
   * Enable **Developer Mode**
   * Click **Load unpacked**
   * Select the `RepoComPass` folder

---

## First-Time Setup

On first launch, a short setup wizard guides you through:

1. Welcome screen
2. Choose a developer name
3. Enter your OpenAI API key
4. Allocate skill points across 9 domains
5. Finish and launch

---

## Usage

1. Open a job posting on LinkedIn / Indeed / Glassdoor
2. Click the RepoComPass extension
3. Click **Generate Project Ideas**
4. Review personalized project recommendations
5. Save ideas for your portfolio

Each project includes:

* Description
* Features
* Tech stack
* Difficulty
* Time estimate
* Why it stands out
* Job alignment

---

## Skill Domains

* Data Structures
* Algorithms
* Systems / OS
* Databases
* Networking
* Frontend
* Backend
* AI / Machine Learning
* Math / Probability

Skill points personalize project recommendations.

---

## Tech Stack

* **JavaScript (ES6+)**
* **HTML / CSS**
* **Chrome Extension APIs (MV3)**
* **OpenAI GPT API**

No frameworks, no build tools.

---

## Project Structure (High Level)

```
RepoComPass/
├── popup/        # Main UI
├── setup/        # Onboarding wizard
├── background/   # Service worker
├── content/      # Job scraping
├── utils/        # Helpers & storage
├── icons/
└── README.md
```

---

## License

GPL v3.0

---

## Why RepoComPass?

Most portfolios fail because projects are **generic**.
RepoComPass helps you build projects that are **directly relevant to real jobs**.

---

**Build smarter projects.
Stand out faster.
Level up your portfolio.**
