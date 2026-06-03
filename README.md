# ⚡ Founder's OS

> A personal life RPG for the ambitious student — built to turn goals into quests, habits into XP, and your biggest dreams into a game worth playing.

![Version](https://img.shields.io/badge/version-1.0.0-7F77DD?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%2018-1D9E75?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-BA7517?style=flat-square)
![Status](https://img.shields.io/badge/status-active-639922?style=flat-square)

---

## What is this?

**Founder's OS** is a full-stack gamification system for a high school student managing exams, certifications, startup ideas, olympiads, hackathons, fitness, daily habits, and personal finance — all at once.

Instead of a boring to-do app, it turns your life into an RPG:

- 📚 **Study for IELTS** → earn Intellect XP
- 🚀 **Build your startup MVP** → advance the milestone tree
- ⚔️ **Compete in an olympiad** → fight a boss
- 💤 **Sleep before midnight** → restore Vitality
- 💰 **Log your spending** → level up Strategist
- ⚡ **Talk to the AI Agent** → it reads your full state and coaches you in real time

Every action in your life earns XP. Every goal is a quest. Every week is a new chapter.

---

## Features

### 🎮 Core RPG System
- **7 independent stats** — Intellect, Builder, Mastery, Warrior, Strategist, Gladiator, Vitality
- **Character class** — pick once, permanently: The Founder, The Scholar, The Gladiator, or The Polymath (each gives a 1.5× XP bonus to their primary stat)
- **Title progression** — Recruit → Apprentice → Specialist → Expert → Veteran → Elite → Legend → Immortal
- **Coin economy** — every 500 XP = 1 Gold Coin, redeemable for real-world rewards
- **Origin story** — write your "why" once; read it on hard days

### 📋 Quest Board
- **5 main arcs** (Certificate Grind, The First Build, Codebreaker, Arena Entry, Body of a Founder)
- **Weekly side quests** — add your own or ask the AI Agent to generate them
- **Boss fights** — Exam Day, Hackathon, University Application, Startup Pitch — schedule them and prepare

### ✅ Habit System
- **Phase-gated rollout** — Phase 1 starts with just 4 habits (no overwhelm)
- **Streak tracking** with Revival Potions to protect against missed days
- **"Just Start" mechanic** — 5 minutes of work = 25% XP + streak protected
- **2-Minute Rule** — built-in habit for instant task clearing

### 🚀 Startup Tracker
- **7-stage milestone tree** — Idea → Validation → MVP → First User → First Revenue → First $100 → Scale
- **Experiment log** — every experiment earns +40 Builder XP, win or lose (failure = data)
- **Mentor quest** — find and talk to one person who's done it → +300 XP

### 💰 Finance Tracker
- Income and expense logging with Strategist XP rewards
- **War Chest** — a dedicated savings goal for startup funding
- Net balance, visual progress bar toward savings goal

### 🧠 Wellbeing System
- **Private mood tracker** — 1–5 scale, not shown on character sheet; auto-detects burnout
- **Daily win log** — one small win per day trains your brain to notice progress
- **Reading XP** — books and articles award XP to any stat you choose

### 📊 Analytics
- **90-day activity heatmap** — GitHub-style contribution graph for your life
- **Season reports** — quarterly snapshots with theme setting
- **All-time snapshot** — XP, coins, streak, experiments, wins, books

### ⚡ AI System Agent
- Powered by **Claude (claude-sonnet-4-20250514)**
- Full read/write access to your entire game state
- Can answer questions, give strategic advice, apply XP, add quests, advance your startup, log mood entries, and evolve the system itself — all via natural language
- **Quick prompts** built in for the most common commands

### 🛡️ Anti-Burnout Design
- No penalty XP — missing a day is always zero, never negative
- Phase-gated habits — you can't add all 9 habits on day one
- Low-mood detection — system softens automatically when you're struggling
- Revival Potions — protect streaks when life genuinely interrupts
- Rest days are free — declare one each week, streak intact

---

## Screenshots

> _Add screenshots of each tab here once built_

| Dashboard | Character | Startup |
|---|---|---|
| ![dashboard](docs/dashboard.png) | ![character](docs/character.png) | ![startup](docs/startup.png) |

| Agent | Analytics | Habits |
|---|---|---|
| ![agent](docs/agent.png) | ![analytics](docs/analytics.png) | ![habits](docs/habits.png) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (functional components + hooks) |
| Styling | Inline styles / Tailwind CSS |
| State | React `useState` / `useReducer` |
| Persistence | `localStorage` (no backend needed) |
| AI Agent | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Build | Vite |
| Deployment | Any static host (Vercel, Netlify, GitHub Pages) |

No database. No backend. No auth. Runs entirely in the browser — except the AI Agent tab, which requires an internet connection and an Anthropic API key.

---

## Getting Started

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/) (only needed for the AI Agent tab)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/founders-os.git
cd founders-os

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

### API Key Setup

The AI Agent tab requires an Anthropic API key. You have two options:

**Option A — Environment variable (recommended for local dev):**
```bash
# Create a .env file in the project root
echo "VITE_ANTHROPIC_API_KEY=sk-ant-..." > .env
```

**Option B — In-app input:**
Open the ⚡ Agent tab and paste your API key into the input field. It will be saved to localStorage.

> ⚠️ Never commit your API key to the repository. The `.env` file is already in `.gitignore`.

### Build for Production

```bash
npm run build
# Output goes to /dist — deploy this folder to any static host
```

---

## Project Structure

```
founders-os/
├── index.html
├── package.json
├── vite.config.js
├── .env.example              # Copy to .env and add your API key
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Root component, state, tab routing
    ├── initialState.js       # Default state values
    ├── xpEngine.js           # addXP(), applyMutation(), getTitle()
    ├── constants.js          # STAT_META, CLASSES, TITLES, XP_TABLE
    ├── components/
    │   ├── Header.jsx
    │   ├── TabBar.jsx
    │   ├── XPBar.jsx
    │   ├── Pill.jsx
    │   ├── Card.jsx
    │   ├── Heatmap.jsx
    │   ├── StartupTree.jsx
    │   ├── SkillTree.jsx
    │   ├── MoodChart.jsx
    │   └── Agent.jsx
    └── tabs/
        ├── Dashboard.jsx
        ├── Character.jsx
        ├── Quests.jsx
        ├── Habits.jsx
        ├── Startup.jsx
        ├── Finance.jsx
        ├── Wellbeing.jsx
        ├── Analytics.jsx
        └── AgentTab.jsx
```

---

## How It Works

### The XP Engine

Every action in the app routes through a single `addXP(state, statKey, amount)` function:

```js
// Class multipliers apply automatically
// Stat levels up when xp >= xpToNext
// xpToNext = Math.round(300 * Math.pow(1.4, level - 1))
// Coins = Math.floor(totalXP / 500)
// Heatmap updates with today's date
```

### The AI Agent

The Agent tab sends Claude your full state as a system prompt on every message. Claude can respond with a JSON mutation block that gets parsed and applied to your state in real time:

```json
{
  "mutation": {
    "stats": { "builder": { "xp": 50 } },
    "quests": { "weekly": [{ "id": "w1", "name": "Solve 5 LeetCode problems", "xp": 35, "stat": "mastery", "done": false }] }
  }
}
```

This means the Agent can do anything you can do manually — and more.

### Persistence

The entire state is saved to `localStorage` on every change. Habits auto-reset each calendar day. No account needed, no sync, no server.

---

## The Stats

| Stat | Icon | What levels it up |
|---|---|---|
| Intellect | 📚 | Exams, SAT, IELTS, study sessions |
| Builder | 🚀 | Startup experiments, MVP progress, mentor calls |
| Mastery | ⚡ | Coding, skill tree nodes, languages, certificates |
| Warrior | ⚔️ | Workouts, football sessions, physical movement |
| Strategist | 🎯 | Finance logging, war chest savings, planning |
| Gladiator | 🏆 | Olympiads, hackathons, competitions |
| Vitality | 💚 | Sleep, habits, mood, daily routines |

---

## The Philosophy

This system is built on a few core beliefs:

**1. Missing a day is zero, not negative.**
The system never punishes. It only rewards. Consistency earns bonuses; gaps earn nothing but cost nothing either.

**2. Start small.**
Phase 1 is only 4 habits. The system earns trust before it demands commitment.

**3. Failure is data.**
Every startup experiment earns +40 XP regardless of outcome. The experiment log exists to reframe failure as learning, not defeat.

**4. The system serves you.**
If logging feels like homework, simplify it. If XP values feel unfair, change them. The system has to feel like yours — not a tool handed down.

**5. Rest is mechanical.**
Recovery quests, revival potions, rest days, and mood-triggered load reduction make rest a game mechanic, not a weakness.

---

## Roadmap

- [ ] Mobile PWA support (installable on phone)
- [ ] Weekly review template (structured Sunday reflection)
- [ ] Custom habit creation UI
- [ ] Boss prep auto-banner (14 days before scheduled boss fight)
- [ ] Export / import JSON backup
- [ ] Browser notifications for habit reminders
- [ ] Self-rival system (this week vs last week XP)
- [ ] IELTS / SAT dedicated prep roadmap
- [ ] Light mode

---

## Contributing

This project was built for a specific person, but the system is general enough to work for any ambitious student. If you want to adapt it:

1. Fork the repo
2. Update `INITIAL_STATE` in `src/initialState.js` with your own quests, stats, and arcs
3. Adjust XP values in `src/constants.js` to match your own activities
4. Update the Agent's system prompt in `src/components/Agent.jsx` with your own context

Pull requests are welcome for bug fixes, accessibility improvements, or new optional features.

---

## License

MIT — use it, fork it, build on it.

---

## Acknowledgements

- Built with [React](https://react.dev/)
- AI Agent powered by [Anthropic Claude](https://www.anthropic.com/)
- Gamification system designed using research from the [Octalysis Framework](https://yukaichou.com/gamification-examples/octalysis-complete-gamification-framework/) by Yu-kai Chou
- Inspired by real life: an ambitious 16-year-old in Tashkent who wants to build a startup, win olympiads, and get into a top university — all at the same time

---

<div align="center">
  <strong>Built for the grind. Designed for the long game.</strong><br/>
  <sub>Every XP point is a real action. Every level is real progress.</sub>
</div>
