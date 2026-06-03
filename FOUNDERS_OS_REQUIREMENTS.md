# Founder's OS — Full Product Requirements Document

> A complete, self-contained life gamification system for an ambitious high school student.
> Built as a single-page web application. All requirements, data models, features, UI specs,
> and agent integration are documented here. Hand this file to Claude Code, Codex, or any
> capable AI coding agent to build the full system.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Data Model](#3-data-model)
4. [Feature Specifications](#4-feature-specifications)
   - 4.1 Character System
   - 4.2 Stats & XP Economy
   - 4.3 Quest Board
   - 4.4 Habit System
   - 4.5 Startup Tracker
   - 4.6 Finance Tracker
   - 4.7 Wellbeing System
   - 4.8 Analytics & Reporting
   - 4.9 Skill Tree
   - 4.10 Distraction Boss
   - 4.11 AI System Agent
5. [UI & Navigation Spec](#5-ui--navigation-spec)
6. [XP Rules & Economy](#6-xp-rules--economy)
7. [Anti-Burnout Rules](#7-anti-burnout-rules)
8. [Persistence](#8-persistence)
9. [AI Agent Integration](#9-ai-agent-integration)
10. [Design System](#10-design-system)
11. [File Structure](#11-file-structure)
12. [Acceptance Criteria](#12-acceptance-criteria)

---

## 1. Project Overview

### What it is
A personal RPG-style life management system called **Founder's OS** for a high school student (16–17 years old). The student's primary goals are:
1. Launch a startup and earn real money
2. Get accepted into a top university abroad
3. Win olympiads and competitions (recognition + cash prizes)

### Core philosophy
- Life is an RPG. Every action earns XP. Every goal is a quest.
- The system rewards consistency, not perfection. Missing a day = 0 XP, never negative.
- The student co-creates the system. He sets his own XP values for new activities.
- Gamification serves real outcomes — not the other way around.
- Rest is mechanically necessary, not optional (recovery quests, free rest days, revivals).

### What it is NOT
- Not a to-do app. Not a calendar. Not a productivity tracker.
- Not a punishment system. No streaks that break permanently. No anxiety mechanics.
- Not for anyone else — no social leaderboards or external comparisons.

---

## 2. Tech Stack

### Recommended stack
```
Frontend:   React 18 (functional components, hooks)
Styling:    Inline styles or Tailwind CSS (no CSS modules)
State:      React useState / useReducer (no Redux needed)
Persistence: localStorage (key: "founders_os_state")
AI Agent:   Anthropic Claude API — claude-sonnet-4-20250514
Build:      Vite (recommended) or Create React App
```

### Constraints
- **Single HTML file deployment is acceptable** (using Babel standalone + CDN React)
- No backend required — everything runs in the browser
- No database — localStorage is sufficient
- The AI Agent tab requires an internet connection; all other features work offline
- Must work in Chrome, Safari, Firefox, Edge

### Dependencies
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```
No other npm dependencies are required. All logic is custom.

---

## 3. Data Model

The entire application state is a single JSON object stored in localStorage.

### Full State Schema

```typescript
interface AppState {
  character: Character;
  stats: Record<StatKey, Stat>;
  habits: HabitSystem;
  quests: QuestSystem;
  startup: StartupTracker;
  finance: FinanceTracker;
  mood: MoodEntry[];
  wins: WinEntry[];
  reading: ReadingEntry[];
  heatmap: Record<string, number>; // ISO date → XP earned that day
  skillTree: SkillTree;
  distraction: DistractionBoss;
  season: Season;
}

type StatKey = 'intellect' | 'builder' | 'mastery' | 'warrior' | 'strategist' | 'gladiator' | 'vitality';

interface Character {
  name: string;
  class: ClassId | null;       // null until chosen
  archetype: string | null;    // display name of class
  backstory: string;           // origin story text
  epithet: string;             // earned nickname, e.g. "The Relentless"
  totalXP: number;
  coins: number;               // floor(totalXP / 500)
}

interface Stat {
  level: number;               // starts at 1, max 10
  xp: number;                  // current XP within level
  xpToNext: number;            // XP needed to reach next level
}

// XP to next level formula: Math.round(300 * Math.pow(1.4, level - 1))
// Level 1→2: 300 XP, Level 2→3: 420 XP, Level 3→4: 588 XP, etc.

interface HabitSystem {
  daily: Habit[];
  streak: number;
  phase: 1 | 2 | 3;           // controls which habits are active
  revivals: number;            // "revival potions" — protect streaks
}

interface Habit {
  id: string;
  name: string;
  xp: number;
  stat: StatKey;
  done: boolean;               // resets each day (manual reset button or date tracking)
  phase: 1 | 2 | 3;           // only shown/active when habits.phase >= this value
}

interface QuestSystem {
  main: MainQuest[];
  weekly: WeeklyQuest[];
  boss: BossFight[];
}

interface MainQuest {
  id: string;
  label: string;               // "Arc 1", "Arc 2", etc.
  name: string;
  desc: string;
  stat: StatKey;
  active: boolean;
  progress: number;            // 0–100 (percentage)
}

interface WeeklyQuest {
  id: string;
  name: string;
  xp: number;
  stat: StatKey;
  done: boolean;
}

interface BossFight {
  id: string;
  name: string;
  xpRange: string;             // display string e.g. "200–800"
  date: string;                // scheduled date (user input)
}

interface StartupTracker {
  name: string;
  idea: string;
  stage: number;               // 0–6 index into stages array
  stages: string[];            // ["Idea","Validation","MVP","First User","First Revenue","First $100","Scale"]
  experiments: Experiment[];
  mentor: string;              // name of mentor contacted
}

interface Experiment {
  date: string;                // ISO date
  idea: string;
  result: string;
  xp: number;                  // always 40
}

interface FinanceTracker {
  income: FinanceEntry[];
  expenses: FinanceEntry[];
  warChest: number;            // startup savings fund (dollars)
  savingsGoal: number;         // target for war chest
}

interface FinanceEntry {
  desc: string;
  amt: string;                 // stored as string, parsed to float for math
  date: string;
}

interface MoodEntry {
  date: string;
  val: 1 | 2 | 3 | 4 | 5;
}

interface WinEntry {
  date: string;
  text: string;
}

interface ReadingEntry {
  date: string;
  title: string;
  stat: StatKey;
  xp: number;                  // always 25
}

interface SkillTree {
  nodes: SkillNode[];
}

interface SkillNode {
  id: string;
  name: string;
  unlocked: boolean;
  xp: number;                  // XP awarded to mastery stat when unlocked
  deps: string[];              // array of node IDs that must be unlocked first
  row: 0 | 1;                  // 0 = Web/Frontend track, 1 = CS/Algorithms track
}

interface DistractionBoss {
  hp: number;                  // starts at 100, min 0
  hits: number;                // total times hit
}

interface Season {
  name: string;                // e.g. "Spring 2026"
  theme: string;               // e.g. "Foundation — build the base"
}
```

---

## 4. Feature Specifications

### 4.1 Character System

#### Class Picker
- Shown once, on first visit to the Character tab, if no class is selected
- 4 classes displayed as clickable cards in a 2×2 grid:

| Class ID | Name | Icon | Bonus | Affected Stat | Description |
|---|---|---|---|---|---|
| `founder` | The Founder | 🚀 | Builder XP ×1.5 | builder | Born to build. Every project is a quest, every failure is data. |
| `scholar` | The Scholar | 📚 | Intellect XP ×1.5 | intellect | Knowledge compounds. Every exam is a boss fight. |
| `gladiator` | The Gladiator | ⚔️ | Gladiator XP ×1.5 | gladiator | Competitions are arenas. Recognition is the prize. |
| `polymath` | The Polymath | ⚡ | All stats +10% | all | Learning everything is the strategy. |

- Selection is **permanent** — no undo button, no re-pick
- After selection, replace the picker UI with a character card showing class icon, name, bonus, and current title
- The XP multiplier is applied automatically in the `addXP()` function

#### Origin Story
- A textarea where the student writes a one-paragraph "why" statement
- Prompt text: "I am [name]. I want to [goal] because [reason]. This is my why."
- Saved to `character.backstory`
- Displayed with italic styling and a left accent border
- Editable after saving via an "Edit" button
- Purpose: to be re-read on hard days — make it prominent

#### Title System
Titles are automatically assigned based on `character.totalXP`:

| Min XP | Title |
|---|---|
| 0 | Recruit |
| 500 | Apprentice |
| 1,500 | Specialist |
| 3,500 | Expert |
| 7,000 | Veteran |
| 12,000 | Elite |
| 20,000 | Legend |
| 35,000 | Immortal |

- Display current title in the header next to level
- Show full ladder in Character tab with checkmarks for achieved titles

#### Character Level
- `characterLevel = Math.floor(sum of all 7 stat levels / 7)`
- Displayed prominently in the header
- This is the "public" level — the average of all 7 stats

---

### 4.2 Stats & XP Economy

#### The 7 Stats

| Key | Display Name | Icon | Description | Primary Activities |
|---|---|---|---|---|
| `intellect` | Intellect | 📚 | Academic performance | Exams, SAT, IELTS, school subjects |
| `builder` | Builder | 🚀 | Startup & project work | Startup progress, experiments, projects |
| `mastery` | Mastery | ⚡ | Skill acquisition | Coding, languages, certifications |
| `warrior` | Warrior | ⚔️ | Physical performance | Gym, football, running, workouts |
| `strategist` | Strategist | 🎯 | Financial & planning | Finance tracking, goal planning, saving |
| `gladiator` | Gladiator | 🏆 | Competitive performance | Olympiads, hackathons, competitions |
| `vitality` | Vitality | 💚 | Daily health & habits | Sleep, habits, mood, daily routines |

#### XP Formula
```javascript
function addXP(state, statKey, rawAmount) {
  let amount = rawAmount;
  
  // Apply class multiplier
  if (state.character.class) {
    if (classBonus.stat === statKey) {
      amount = Math.round(amount * 1.5); // for founder/scholar/gladiator
    }
    if (classBonus.stat === 'all') {
      amount = Math.round(amount * 1.1); // for polymath
    }
  }
  
  // Add to stat
  state.stats[statKey].xp += amount;
  state.character.totalXP += amount;
  
  // Update heatmap
  const today = new Date().toISOString().slice(0, 10);
  state.heatmap[today] = (state.heatmap[today] || 0) + amount;
  
  // Level up loop
  while (state.stats[statKey].xp >= state.stats[statKey].xpToNext) {
    state.stats[statKey].xp -= state.stats[statKey].xpToNext;
    state.stats[statKey].level += 1;
    state.stats[statKey].xpToNext = Math.round(300 * Math.pow(1.4, state.stats[statKey].level - 1));
  }
  
  // Update coins
  state.character.coins = Math.floor(state.character.totalXP / 500);
  
  return state;
}
```

#### XP Values by Activity

**Daily actions:**
| Activity | XP | Stat |
|---|---|---|
| Complete a habit (any) | 5–15 (varies per habit) | Habit's assigned stat |
| 25-min Pomodoro block | 10 | intellect |
| 60+ min study session | 25 | intellect |
| Workout 30+ min | 20 | warrior |
| Football session | 20 | warrior |
| Log spending | 5 | strategist |

**Milestone events:**
| Activity | XP | Stat |
|---|---|---|
| Pass IELTS (any band) | 500 | intellect |
| Pass IELTS at target score | 800 | intellect |
| Pass SAT (any) | 500 | intellect |
| Pass SAT at target score | 800 | intellect |
| Win/place in olympiad | 300–700 | gladiator |
| Launch startup MVP | 600 | builder |
| First paying customer | 400 | builder |
| Get accepted to target uni | 2000 | intellect + builder |
| Complete 30-day coding challenge | 200 | mastery |
| Startup experiment logged | 40 | builder |
| Mentor conversation | 300 | builder |
| Book/article logged | 25 | varies |
| Add to war chest | 20 | strategist |
| Log income | 15 | strategist |
| Log expense | 5 | strategist |
| Advance startup stage | 100–1000 (scales) | builder |
| Hit distraction boss | 5 | vitality |
| Defeat distraction boss | 200 bonus | vitality |
| Unlock skill tree node | node.xp value | mastery |

**Streak multipliers:**
- 7-day streak → all habit XP ×1.5 that week
- 30-day streak → all habit XP ×2.0 that month

---

### 4.3 Quest Board

#### Main Arcs (5 total)
Pre-loaded arcs. Each has a progress bar (0–100%). User increments progress manually (+10%, +25%, +50% buttons).

| Arc | Name | Description | Stat |
|---|---|---|---|
| Arc 1 | The Certificate Grind | IELTS 7.0+ and SAT 1400+ | intellect |
| Arc 2 | The First Build | Idea → MVP → first real user | builder |
| Arc 3 | Codebreaker | Complete a full-stack project | mastery |
| Arc 4 | Arena Entry | Compete in 2+ olympiads/hackathons | gladiator |
| Arc 5 | Body of a Founder | 3× workouts/week for 8 weeks | warrior |

- Only Arc 1 starts as `active: true`. Others must be manually activated.
- Active arcs show progress bar + increment buttons.
- Inactive arcs show an "Activate" button.

#### Weekly Side Quests
- User-defined quests added via a form: name + stat + XP value
- Displayed as a checklist — tap to complete
- Completing earns XP to the selected stat
- The AI Agent can also add weekly quests via state mutation

**Pre-suggested weekly quests (show these as suggestions, not pre-loaded):**
- Complete one full past exam paper (+40 XP, intellect)
- Learn 50 new IELTS/SAT vocabulary words (+30 XP, intellect)
- Solve 5 LeetCode problems (+35 XP, mastery)
- Build one small coding feature (+35 XP, mastery)
- Write one page about startup idea (+30 XP, builder)
- Log all spending for the week (+20 XP, strategist)
- Play football or complete 2+ workout sessions (+30 XP, warrior)

#### Boss Fights (4 total)
Pre-defined high-stakes events. User sets the date. No completion button — these are logged manually or via Agent.

| Boss | XP Range | Notes |
|---|---|---|
| Exam Day | 200–800 XP | XP scales with score vs personal best |
| Hackathon / Olympiad | 150–700 XP | Placement 3rd/2nd/1st scales up |
| University Application | 500 XP | For submitting a complete application |
| Startup Pitch | 300 XP | Any public presentation of the idea |

---

### 4.4 Habit System

#### Default Habit Stack

| ID | Name | XP | Stat | Phase |
|---|---|---|---|---|
| h1 | Plan the day (5 min) | 5 | vitality | 1 |
| h2 | 1 deep work block (25 min) | 10 | intellect | 1 |
| h3 | Log what got done | 5 | vitality | 1 |
| h4 | Lights out by midnight | 15 | vitality | 1 |
| h5 | 15 min coding / skill | 10 | mastery | 2 |
| h6 | Log spending today | 5 | strategist | 2 |
| h7 | Physical movement (15 min) | 15 | warrior | 2 |
| h8 | 2-minute rule: do it now | 5 | vitality | 3 |
| h9 | Daily win log entry | 5 | vitality | 3 |

#### Phase System
- Phase 1: habits with `phase <= 1` are shown and active (4 habits)
- Phase 2: habits with `phase <= 2` are shown and active (7 habits)
- Phase 3: all 9 habits active
- User manually advances phase via buttons
- Habits from higher phases are shown dimmed/locked
- **Critical UX note**: Overwhelming a new user with all habits kills the system. The phase gate is intentional.

#### Streak System
- `habits.streak` increments manually (user logs "+1 streak day" each day)
- OR: auto-increment if all phase-active habits are marked done (implement either approach)
- One free rest day per week: user can tap "Rest Day" to skip without losing streak
- After a miss: streak resets to 0. No negative XP.

#### Revival Potions
- `habits.revivals` starts at 1
- Earned: 1 revival per 30 days of consistency (or manually via "Earn Revival" button)
- Used: "Use Revival" button resets streak but protects a miss — i.e., the streak continues
- Psychological purpose: just knowing it exists reduces anxiety about missing days

#### "Just Start" Mechanic
- Any habit can be marked as "started" (not fully done) to earn 25% of its XP
- This prevents all-or-nothing paralysis
- Implementation: a secondary tap/button per habit, or a separate "partial credit" toggle
- Partial completion still protects the streak

#### Habit Reset
- The `done` field on habits resets each day
- Implementation options:
  - Store a `lastResetDate` in state; on app load, if date !== today, reset all `done` to false
  - Or: manual "Start New Day" button
  - Recommended: auto-reset on load based on date comparison

---

### 4.5 Startup Tracker

#### Milestone Tree
7 sequential stages displayed as a horizontal step progress indicator:

```
Idea → Validation → MVP → First User → First Revenue → First $100 → Scale
```

- Current stage highlighted (colored, pulsing indicator)
- Completed stages shown with checkmark
- "Advance to next stage" button awards XP to builder stat:

| Stage transition | XP awarded |
|---|---|
| 0→1 (Idea→Validation) | 100 |
| 1→2 (Validation→MVP) | 200 |
| 2→3 (MVP→First User) | 400 |
| 3→4 (First User→Revenue) | 600 |
| 4→5 (Revenue→First $100) | 800 |
| 5→6 (First $100→Scale) | 1000 |

#### Experiment Log
- Form: hypothesis/idea (textarea) + result/learning (textarea)
- Every logged experiment = +40 Builder XP regardless of outcome
- Purpose: reframe failure as data collection
- Display last 5 experiments in reverse chronological order
- Each shows: idea, result, date, XP earned

#### Mentor Quest
- One-time quest: find and talk to someone who has done what you want to do
- Input: name/description of person
- Logging = +300 Builder XP
- Once logged, shows "Mentor contacted: [name]" — no re-logging

#### Startup Name & Idea
- Simple text fields: startup name + one-line idea description
- Saved to `startup.name` and `startup.idea`
- Displayed in the startup header

---

### 4.6 Finance Tracker

#### War Chest (Startup Fund)
- A dedicated savings goal for startup expenses
- User sets `savingsGoal` (default: $200)
- User adds to `warChest` manually (input + button)
- Adding to war chest = +20 Strategist XP
- Progress bar: warChest / savingsGoal

#### Income Log
- Form: description + amount
- Logging income = +15 Strategist XP
- Shows last 4 entries

#### Expense Log
- Form: description + amount
- Logging expense = +5 Strategist XP
- Shows last 4 entries

#### Summary Stats
- Total income, total expenses, net balance
- Displayed as 3 metric cards at the top of Finance tab
- Net balance colored green (positive) or red (negative)

---

### 4.7 Wellbeing System

#### Mood Tracker (Private)
- Daily mood log: scale 1–5 with emoji labels (😔 😕 😐 🙂 😊)
- **This stat is intentionally hidden from the character sheet and stats page**
- Display: small bar chart of last 14 days of mood
- Automatic alert: if 5-day average < 2.5, show warning: "Low mood detected. Consider reducing quest load this week."
- Purpose: flag burnout early, not to add pressure

#### Daily Win Log
- Simple text input: "One small win from today"
- Stores as array of `{date, text}` entries
- Shows last 6 wins in reverse order
- Earns no XP (it's a mental health feature, not a grind mechanic)
- Purpose: trains brain to notice progress, not just gaps

#### Reading XP
- Log a book or article: title + target stat (dropdown) + fixed 25 XP
- Any stat can be targeted depending on subject matter
- Shows last 5 entries
- Awards +25 XP to selected stat on log

---

### 4.8 Analytics & Reporting

#### Season Report
- Displays current season name and theme (user-editable fields)
- Shows a bar/line visualization of all 7 stat levels (Lvl 1–10 scale)
- Season name default: auto-detect from current month (`Winter/Spring/Summer/Autumn YYYY`)

#### Activity Heatmap
- GitHub-style contribution heatmap
- Shows last 90 days
- Each day's square is colored by XP earned that day
- Opacity scales from near-transparent (0 XP) to full color (max XP day)
- Tooltip on hover: date + XP earned

#### All-Time Snapshot
- 6 metric cards: Total XP, Coins, Streak, Experiments logged, Wins logged, Books read

#### Startup Snapshot
- Current startup stage name
- Startup milestone tree (read-only view)

#### Season Settings
- Two editable fields: Season Name + Season Theme
- These update `state.season` in real time

---

### 4.9 Skill Tree

Two tracks displayed as horizontal rows of unlockable nodes.

#### Web / Frontend Track
| Node ID | Name | XP | Dependencies |
|---|---|---|---|
| s1 | HTML & CSS | 50 | none |
| s2 | JavaScript | 80 | s1 |
| s3 | React | 100 | s2 |
| s4 | Full-stack project | 150 | s3 |

#### CS / Algorithms Track
| Node ID | Name | XP | Dependencies |
|---|---|---|---|
| s5 | Python | 60 | none |
| s6 | Data structures | 80 | s5 |
| s7 | Algorithms | 100 | s6 |
| s8 | LeetCode ×50 | 120 | s7 |

#### Unlock Rules
- A node can only be unlocked if all its `deps` are already unlocked
- Clicking an unlockable node marks it unlocked and awards its XP to mastery stat
- Locked nodes (deps not met) appear at reduced opacity, cursor not-allowed
- Already-unlocked nodes show a checkmark

---

### 4.10 Distraction Boss

A gamified mechanic for phone/social media discipline.

#### State
```javascript
distraction: {
  hp: 100,   // current boss HP
  hits: 0    // total hits landed
}
```

#### Mechanics
- Boss starts with 100 HP
- Each time the user completes a study session without their phone, they tap "Hit" → -10 HP, +5 Vitality XP
- When HP reaches 0: +200 Vitality XP bonus, boss resets to 100 HP, `hits` increments
- Display: a horizontal HP bar labeled "📵 Phone Boss HP [X]/100"
- Descriptive text: "Each study session without your phone = 1 hit (−10 HP, +5 XP). Defeat = +200 XP bonus."

---

### 4.11 AI System Agent

The Agent tab contains a chat interface powered by the Anthropic API. The agent has full read/write access to the application state and can modify it via structured JSON responses.

See Section 9 for full Agent integration spec.

---

## 5. UI & Navigation Spec

### Layout
- Sticky header at the top (always visible)
- Horizontal tab bar below the header
- Content area below tabs, max-width 820px, centered
- Dark theme throughout

### Header Contents (left to right)
- App icon (gradient circle with ⚡)
- App name: "FOUNDER'S OS" (bold, spaced)
- Subtitle: "[Season Name] · [Season Theme]" (muted, small)
- Right side: Character Level (large, purple), Total XP (amber), Coins (teal), Title pill

### Tab Bar
9 tabs, horizontally scrollable on small screens:

| Tab | Label | Key content |
|---|---|---|
| Dashboard | DASHBOARD | Stats, today's habits, heatmap, active arcs, distraction boss |
| Character | CHARACTER | Class picker or card, origin story, skill tree, title ladder |
| Quests | QUESTS | Main arcs, weekly quests, boss fights |
| Habits | HABITS | Phase-gated habit list, streak, revivals, just-start mechanic |
| Startup | STARTUP | Milestone tree, experiment log, mentor quest |
| Finance | FINANCE | War chest, income/expense logs, balance summary |
| Wellbeing | WELLBEING | Mood tracker, win log, reading log |
| Analytics | ANALYTICS | Season report, heatmap, snapshot, startup snapshot |
| ⚡ Agent | AGENT | AI chat interface with full system access |

### Active Tab Indicator
- Active tab: bottom border 2px in accent purple (#7F77DD), full-brightness text
- Inactive: no border, muted text

### Dashboard Layout (detailed)
```
[4 metric mini-cards: Streak / Done today / Revivals / Phase]
[Stats card — all 7 stats with XP bars]
[Today's habits card — checkbox list]
[Activity heatmap card]
[Active arcs card — progress bars]
[Distraction boss card]
```

---

## 6. XP Rules & Economy

### Core Rules
1. XP is **additive only** — never removed, never negative
2. XP is earned per stat, not globally (though `character.totalXP` tracks the sum)
3. Coins = `Math.floor(totalXP / 500)` — recalculated on every XP gain
4. Class multipliers apply to all XP gains for the relevant stat, including Agent-applied XP
5. The heatmap records XP per calendar day — multiple gains on same day accumulate

### Coin Shop (display only — no automatic enforcement)
The coins system is for real-world rewards negotiated between the student and his brother.
Display current coin balance prominently. The actual redemption happens offline.

Suggested values (show in a "Reward Shop" section or tooltip):
| Reward | Cost |
|---|---|
| 2 hours guilt-free gaming | 1 coin |
| A meal he wants | 1 coin |
| Day out with friends | 2 coins |
| Small gear item (~$20) | 2 coins |
| Tech/sports item (~$50) | 5 coins |
| Football boots | 6 coins |
| Level 5 milestone reward | big reward, negotiated |

### Streak Multiplier Logic
```javascript
function getHabitXPMultiplier(streak) {
  if (streak >= 30) return 2.0;
  if (streak >= 7)  return 1.5;
  return 1.0;
}
```

---

## 7. Anti-Burnout Rules

These are built into the system design, not just UI copy:

### 1. No Penalty XP
- Missing a habit, quest, or day = `0 XP` added, nothing removed
- The state never decrements any XP or stat value
- Streak resets on miss, but no XP is lost

### 2. Revival Potions
- `habits.revivals` is consumed via "Use Revival" which prevents streak reset
- Start with 1 revival. Earn more via 30-day consistency or manually.

### 3. Free Rest Day
- Once per week, user can declare a rest day (not tracked automatically — user-initiated)
- Rest day does not break streak
- Implementation: a "Declare Rest Day" button that sets a `restDay` flag for today's date

### 4. Phase-Gated Habits
- Phase 1 = 4 habits only (weeks 1–2)
- Don't show all 9 habits to a new user — this is enforced via the phase system
- This is a core design constraint, not optional

### 5. Low Mood Alert
- If `mood` entries show 5-day average < 2.5, display a soft warning card
- Warning says: reduce quest load, not "you're failing"
- No XP penalty for low mood

### 6. "Just Start" = Partial Credit
- 5 minutes of work on anything = 25% XP, streak protected
- Never require perfection for progress

### 7. The Agent's Responsibility
- The AI Agent must never nag, punish, or express disappointment
- Agent should acknowledge misses with forward focus: "What's one thing to do today?"
- Agent should suggest reducing load when mood is low

---

## 8. Persistence

### localStorage Implementation
```javascript
// Save on every state change
useEffect(() => {
  try {
    localStorage.setItem('founders_os', JSON.stringify(state));
  } catch (e) {
    console.warn('Storage failed:', e);
  }
}, [state]);

// Load on mount
const [state, setState] = useState(() => {
  try {
    const saved = localStorage.getItem('founders_os');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  } catch (e) {
    return INITIAL_STATE;
  }
});
```

### Daily Reset Logic
Habits `done` field resets each day:
```javascript
// On app load:
const lastReset = localStorage.getItem('founders_os_last_reset');
const today = new Date().toISOString().slice(0, 10);
if (lastReset !== today) {
  // Reset all habits' done field to false
  setState(prev => ({
    ...prev,
    habits: {
      ...prev.habits,
      daily: prev.habits.daily.map(h => ({ ...h, done: false }))
    }
  }));
  localStorage.setItem('founders_os_last_reset', today);
}
```

### Export / Import (Optional Enhancement)
- "Export data" button: downloads `founders_os_backup_[date].json`
- "Import data" button: loads JSON file back into state
- Useful since localStorage can be cleared accidentally

---

## 9. AI Agent Integration

### Overview
The Agent tab is a full chat interface. The Claude API is called with:
1. A system prompt containing the full current state
2. The conversation history (last 10 messages)
3. The user's new message

The model responds with text AND optionally a JSON mutation block that modifies the state.

### API Call
```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: buildSystemPrompt(currentState),
    messages: conversationHistory.slice(-10)
  })
});
```

### System Prompt Template
```
You are the System Agent for "The Founder's Path" — a personal gamification OS for a 
highly ambitious high school student (16–17) whose goals are: 1) launch a startup and 
earn real money, 2) get into a top university abroad, 3) win olympiads/competitions for 
recognition and cash prizes.

FULL CURRENT STATE:
[JSON.stringify(state, null, 2)]

YOUR CAPABILITIES:
1. Answer any question about the system, stats, quests, and progress
2. Give sharp, honest strategic advice
3. Make state changes — return a JSON mutation block in this exact format:
```json
{"mutation": {only the fields you're changing}}
```

MUTATION FORMAT:
- Add XP to a stat: {"stats": {"builder": {"xp": 50}}}
- New weekly quest: {"quests": {"weekly": [{"id":"w[timestamp]","name":"...","xp":35,"stat":"mastery","done":false}]}}
- Update streak: {"habits": {"streak": 5}}
- Log mood: {"mood": [{"date":"[today]","val":4}]}
- Log win: {"wins": [{"date":"[today]","text":"..."}]}
- Advance startup: {"startup": {"stage": 2}}
- Add experiment: {"startup": {"experiments": [{"date":"[today]","idea":"...","result":"...","xp":40}]}}
- Update season: {"season": {"name":"Summer 2026","theme":"..."}}
- Update character: {"character": {"backstory": "...", "epithet": "The Relentless"}}
- Boss prep mode: {"habits":{"phase":1},"quests":{"weekly":[...]}}

RULES:
- Be concise: max 4 sentences unless making changes
- Be personal — reference his actual stats, numbers, quests by name
- Coach voice: sharp, direct, believes in him, no sugarcoating
- Never apply XP the user didn't actually earn — only on explicit request
- After any mutation, confirm briefly what changed
- Never nag, punish, or express disappointment
- When mood is low (if visible in state): suggest lighter week, not push harder
- Refer to his class and archetype when motivating
```

### Mutation Parsing
```javascript
function parseMutation(responseText) {
  const match = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    return parsed.mutation || null;
  } catch (e) {
    return null;
  }
}
```

### Mutation Application
```javascript
function applyMutation(prevState, mutation) {
  let state = JSON.parse(JSON.stringify(prevState));
  
  // Stats (with XP leveling)
  if (mutation.stats) {
    for (const [statKey, changes] of Object.entries(mutation.stats)) {
      if (changes.xp && state.stats[statKey]) {
        state = addXP(state, statKey, changes.xp);
      }
      if (changes.level != null) {
        state.stats[statKey].level = changes.level;
      }
    }
  }
  
  // Character fields
  if (mutation.character) {
    Object.assign(state.character, mutation.character);
  }
  
  // Habits
  if (mutation.habits) {
    if (mutation.habits.streak != null) state.habits.streak = mutation.habits.streak;
    if (mutation.habits.phase != null) state.habits.phase = mutation.habits.phase;
    if (mutation.habits.revivals != null) state.habits.revivals = mutation.habits.revivals;
    if (mutation.habits.daily) state.habits.daily = mutation.habits.daily;
  }
  
  // Quests
  if (mutation.quests) {
    if (mutation.quests.weekly) {
      state.quests.weekly = [...state.quests.weekly, ...mutation.quests.weekly];
    }
    if (mutation.quests.main) state.quests.main = mutation.quests.main;
  }
  
  // Startup
  if (mutation.startup) Object.assign(state.startup, mutation.startup);
  
  // Finance
  if (mutation.finance) Object.assign(state.finance, mutation.finance);
  
  // Arrays (mood, wins — append, don't replace)
  if (mutation.mood) state.mood = [...state.mood, ...mutation.mood];
  if (mutation.wins) state.wins = [...state.wins, ...mutation.wins];
  
  // Season
  if (mutation.season) Object.assign(state.season, mutation.season);
  
  // Distraction boss
  if (mutation.distraction) Object.assign(state.distraction, mutation.distraction);
  
  return state;
}
```

### Quick Prompts
Show these as clickable suggestion buttons below the chat input:
- "What should I focus on this week?"
- "Add 50 XP to Builder stat"
- "I just completed an exam — give me XP"
- "What's my weakest stat right now?"
- "Activate boss prep mode: exam in 2 weeks"
- "Add a weekly quest: solve 5 LeetCode problems"
- "Log today's mood as 4"
- "I talked to a mentor today"

### API Key Handling
- Do NOT hardcode the API key
- Options (in order of preference):
  1. Environment variable `VITE_ANTHROPIC_API_KEY` or `REACT_APP_ANTHROPIC_API_KEY`
  2. A settings modal where the user pastes their own API key (stored in localStorage)
  3. A visible input field at the top of the Agent tab
- If no API key is present, show a message: "Enter your Anthropic API key to activate the agent"

---

## 10. Design System

### Color Palette (Dark Theme)

```css
:root {
  /* Backgrounds */
  --bg-0: #0f0e0d;    /* App background */
  --bg-1: #1a1915;    /* Card background */
  --bg-2: #232220;    /* Input background */
  --bg-3: #2c2b27;    /* Hover state */
  
  /* Text */
  --text-1: #e8e6e0;  /* Primary text */
  --text-2: #a09e98;  /* Secondary text */
  --text-3: #666460;  /* Muted / labels */
  
  /* Borders */
  --border:   #2e2c28;
  --border-2: #3a3835;
  
  /* Accent colors */
  --purple: #7F77DD;  /* Primary accent, intellect, character level */
  --teal:   #1D9E75;  /* Builder, success, income */
  --blue:   #378ADD;  /* Mastery, information */
  --coral:  #D85A30;  /* Warrior, danger, expenses, boss fights */
  --amber:  #BA7517;  /* Strategist, XP, warnings */
  --pink:   #D4537E;  /* Gladiator, mood */
  --green:  #639922;  /* Vitality, nature */
  
  /* Stat colors (map) */
  --stat-intellect:  var(--purple);
  --stat-builder:    var(--teal);
  --stat-mastery:    var(--blue);
  --stat-warrior:    var(--coral);
  --stat-strategist: var(--amber);
  --stat-gladiator:  var(--pink);
  --stat-vitality:   var(--green);
  
  /* Radius */
  --radius:    8px;
  --radius-lg: 12px;
}
```

### Typography
- Font: `'SF Mono', ui-monospace, monospace` for the whole app
- This gives it a "developer terminal" feel that fits the startup/tech student persona
- Base size: 13px
- Heading size: 15–16px, weight 500
- Label/meta size: 10–11px, weight 400–500
- Section labels: 10px, uppercase, letter-spacing 0.1em, muted color

### Component Specs

**XP Bar:**
```jsx
<div style={{ background: 'rgba(128,128,128,.12)', borderRadius: 99, height: h, overflow: 'hidden' }}>
  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .5s ease' }} />
</div>
```

**Pill badge:**
```jsx
<span style={{
  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
  background: color + '22', color: color, border: `0.5px solid ${color}55`
}}>
  {children}
</span>
```

**Card:**
```jsx
<div style={{
  background: 'var(--bg-1)', border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: 10
}}>
```

**Primary button:**
```jsx
<button style={{ background: color, color: '#fff', fontWeight: 600, borderRadius: 8, padding: '6px 14px' }}>
```

**Input field:**
```jsx
<input style={{
  background: 'var(--bg-2)', border: '0.5px solid var(--border-2)',
  borderRadius: 'var(--radius)', padding: '7px 11px', color: 'var(--text-1)',
  fontFamily: 'inherit', fontSize: 12, outline: 'none'
}} />
```

### Heatmap Component
```jsx
// Render 90 squares in a flex-wrap container
// Each square: 9×9px, border-radius 2px
// Color: rgba(127, 119, 221, opacity) where opacity = 0.12 + 0.88 * (dayXP / maxDayXP)
// Zero-XP days: rgba(128, 128, 128, 0.1)
// Hover tooltip: "[date]: [xp] XP"
```

### Startup Milestone Tree
```jsx
// Horizontal flex with stages connected by lines
// Completed stages: filled circle (teal), checkmark
// Current stage: outline circle (teal), pulsing ring animation
// Future stages: gray outline
// Stage labels below each circle, 9–10px font
// Overflow-x: auto (scrollable on mobile)
```

---

## 11. File Structure

### Recommended (Vite + React)
```
founders-os/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # Entry point, ReactDOM.render
    ├── App.jsx               # Root component, state management, tab routing
    ├── initialState.js       # INIT constant with default values
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

### Single-File Alternative
If building as a single HTML file (no build step):
```html
<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">
    // All component code here
    ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
  </script>
</body>
</html>
```

---

## 12. Acceptance Criteria

The system is considered complete when all of the following pass:

### Core
- [ ] App loads and displays all 9 tabs
- [ ] State persists across browser refresh via localStorage
- [ ] Daily habit reset works correctly (habits reset each new calendar day)
- [ ] XP earned updates the stat bar, levels up the stat when threshold crossed, and updates total XP in header
- [ ] Coins update automatically (totalXP / 500)
- [ ] Class selection is permanent and applies multiplier to all subsequent XP gains

### Character
- [ ] Class picker appears on first visit to Character tab, disappears after selection
- [ ] Origin story saves and displays correctly
- [ ] Skill tree nodes unlock in dependency order
- [ ] Title updates automatically based on totalXP

### Habits
- [ ] Only phase-appropriate habits are interactive
- [ ] Marking a habit done awards XP to the correct stat
- [ ] Streak increments and revival mechanic work
- [ ] "Just start" partial credit awards 25% XP

### Quests
- [ ] Only active main arcs show progress bars
- [ ] Progress increment buttons work
- [ ] Weekly quests can be added via form and completed
- [ ] Boss fight dates can be set

### Startup
- [ ] Milestone tree advances and awards correct XP per stage
- [ ] Experiment log adds entries and awards 40 Builder XP each
- [ ] Mentor quest awards 300 Builder XP once
- [ ] Stage advancement is blocked beyond the last stage

### Finance
- [ ] Income and expense entries save correctly
- [ ] Net balance calculates correctly
- [ ] War chest progress bar reflects current value vs goal

### Wellbeing
- [ ] Mood entries save and display as a bar chart
- [ ] Low-mood warning appears when 5-day average < 2.5
- [ ] Win entries save and display in reverse order
- [ ] Reading log saves and awards XP to selected stat

### Analytics
- [ ] Heatmap shows correct colors based on XP per day
- [ ] Season name and theme are editable
- [ ] All-time snapshot metrics are accurate
- [ ] Startup milestone tree renders correctly (read-only)

### Agent
- [ ] Chat sends message to Claude API and displays response
- [ ] JSON mutations in responses are parsed and applied to state
- [ ] Quick-prompt buttons populate the input
- [ ] Agent has full read access to current state via system prompt
- [ ] State changes made via agent persist (same as manual state changes)
- [ ] If no API key: shows a clear message/input to enter one

### Distraction Boss
- [ ] Each "hit" decreases HP by 10 and awards 5 Vitality XP
- [ ] When HP reaches 0: awards 200 Vitality XP bonus and resets HP to 100
- [ ] HP bar renders correctly

---

## Appendix A: Initial State Values

```javascript
const INITIAL_STATE = {
  character: {
    name: "",
    class: null,
    archetype: null,
    backstory: "",
    epithet: "",
    totalXP: 0,
    coins: 0,
  },
  stats: {
    intellect:   { level: 1, xp: 0, xpToNext: 300 },
    builder:     { level: 1, xp: 0, xpToNext: 300 },
    mastery:     { level: 1, xp: 0, xpToNext: 300 },
    warrior:     { level: 1, xp: 0, xpToNext: 300 },
    strategist:  { level: 1, xp: 0, xpToNext: 300 },
    gladiator:   { level: 1, xp: 0, xpToNext: 300 },
    vitality:    { level: 1, xp: 0, xpToNext: 300 },
  },
  habits: {
    daily: [
      { id: "h1", name: "Plan the day (5 min)",          xp: 5,  stat: "vitality",   done: false, phase: 1 },
      { id: "h2", name: "1 deep work block (25 min)",    xp: 10, stat: "intellect",  done: false, phase: 1 },
      { id: "h3", name: "Log what got done",             xp: 5,  stat: "vitality",   done: false, phase: 1 },
      { id: "h4", name: "Lights out by midnight",        xp: 15, stat: "vitality",   done: false, phase: 1 },
      { id: "h5", name: "15 min coding / skill",         xp: 10, stat: "mastery",    done: false, phase: 2 },
      { id: "h6", name: "Log spending today",            xp: 5,  stat: "strategist", done: false, phase: 2 },
      { id: "h7", name: "Physical movement (15 min)",    xp: 15, stat: "warrior",    done: false, phase: 2 },
      { id: "h8", name: "2-minute rule: do it now",      xp: 5,  stat: "vitality",   done: false, phase: 3 },
      { id: "h9", name: "Daily win log entry",           xp: 5,  stat: "vitality",   done: false, phase: 3 },
    ],
    streak: 0,
    phase: 1,
    revivals: 1,
  },
  quests: {
    main: [
      { id: "a1", label: "Arc 1", name: "The Certificate Grind", desc: "IELTS 7.0+ and SAT 1400+",        stat: "intellect", active: true,  progress: 0 },
      { id: "a2", label: "Arc 2", name: "The First Build",       desc: "Idea → MVP → first real user",    stat: "builder",   active: false, progress: 0 },
      { id: "a3", label: "Arc 3", name: "Codebreaker",           desc: "Complete a full-stack project",   stat: "mastery",   active: false, progress: 0 },
      { id: "a4", label: "Arc 4", name: "Arena Entry",           desc: "Compete in 2+ olympiads/hackathons", stat: "gladiator", active: false, progress: 0 },
      { id: "a5", label: "Arc 5", name: "Body of a Founder",     desc: "3× workouts/week for 8 weeks",   stat: "warrior",   active: false, progress: 0 },
    ],
    weekly: [],
    boss: [
      { id: "b1", name: "Exam Day",                xpRange: "200–800", date: "" },
      { id: "b2", name: "Hackathon / Olympiad",    xpRange: "150–700", date: "" },
      { id: "b3", name: "University Application",  xpRange: "500",     date: "" },
      { id: "b4", name: "Startup Pitch",           xpRange: "300",     date: "" },
    ],
  },
  startup: {
    name: "",
    idea: "",
    stage: 0,
    stages: ["Idea", "Validation", "MVP", "First User", "First Revenue", "First $100", "Scale"],
    experiments: [],
    mentor: "",
  },
  finance: {
    income: [],
    expenses: [],
    warChest: 0,
    savingsGoal: 200,
  },
  mood: [],
  wins: [],
  reading: [],
  heatmap: {},
  skillTree: {
    nodes: [
      { id: "s1", name: "HTML & CSS",           unlocked: false, xp: 50,  deps: [],      row: 0 },
      { id: "s2", name: "JavaScript",           unlocked: false, xp: 80,  deps: ["s1"],  row: 0 },
      { id: "s3", name: "React",                unlocked: false, xp: 100, deps: ["s2"],  row: 0 },
      { id: "s4", name: "Full-stack project",   unlocked: false, xp: 150, deps: ["s3"],  row: 0 },
      { id: "s5", name: "Python",               unlocked: false, xp: 60,  deps: [],      row: 1 },
      { id: "s6", name: "Data structures",      unlocked: false, xp: 80,  deps: ["s5"],  row: 1 },
      { id: "s7", name: "Algorithms",           unlocked: false, xp: 100, deps: ["s6"],  row: 1 },
      { id: "s8", name: "LeetCode ×50",         unlocked: false, xp: 120, deps: ["s7"],  row: 1 },
    ]
  },
  distraction: {
    hp: 100,
    hits: 0,
  },
  season: {
    name: "Spring 2026",
    theme: "Foundation — build the base",
  },
};
```

---

## Appendix B: Claude API Notes

- Model: `claude-sonnet-4-20250514`
- Max tokens: `1000` (sufficient for most agent responses)
- The API key must be provided by the user — do not hardcode
- CORS: The Anthropic API supports browser-side requests (no proxy needed for `api.anthropic.com`)
- Rate limits: The standard API rate limits apply. No special handling needed for a personal tool.
- Cost estimate: Each agent message costs approximately $0.003–0.015 depending on state size

---

## Appendix C: Enhancements (Optional / Future)

These are not required for v1 but are worth considering:

1. **Mobile PWA** — Add a manifest.json and service worker for installable mobile app
2. **Export/Import** — JSON backup and restore via file download/upload
3. **Custom habits** — Let user add new habits beyond the default 9
4. **Notification reminders** — Browser notifications at set times (e.g. 9am plan day, 10pm sleep reminder)
5. **Weekly review template** — A structured Sunday review form that auto-populates with the week's stats
6. **Boss prep auto-trigger** — When a boss fight date is within 14 days, automatically show a banner
7. **Rival system** — Compare this week's XP vs last week's (self-competition only, no external)
8. **Dark/light mode toggle** — Currently dark-only; a toggle would help in bright environments
9. **Startup name on milestone tree** — Show the startup name above the tree once set
10. **Certificate roadmap** — Visual IELTS/SAT prep timeline with band targets as nodes

---

*Document version: 1.0 — June 2026*
*Built for: An ambitious 16–17 year old student in Tashkent with startup ambitions and university dreams.*
*Author: Generated via deep research + design session with Claude.*
