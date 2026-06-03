export type StatKey = 'intellect' | 'builder' | 'mastery' | 'warrior' | 'strategist' | 'gladiator' | 'vitality';

export interface Character {
  name: string;
  class: string | null;       // null until chosen
  archetype: string | null;    // display name of class
  backstory: string;           // origin story text
  epithet: string;             // earned nickname, e.g. "The Relentless"
  totalXP: number;
  coins: number;               // floor(totalXP / 500)
}

export interface Stat {
  level: number;               // starts at 1, max 10
  xp: number;                  // current XP within level
  xpToNext: number;            // XP needed to reach next level
}

export interface Habit {
  id: string;
  name: string;
  xp: number;
  stat: StatKey;
  done: boolean;               // resets each day
  phase: 1 | 2 | 3;           // only shown/active when habits.phase >= this value
  started?: boolean;           // 'just start' mechanic partial credit
}

export interface HabitSystem {
  daily: Habit[];
  streak: number;
  phase: 1 | 2 | 3;
  revivals: number;
  lastRestDayDeclared?: string; // ISO date of last declared rest day (to enforce once a week)
  restDayActiveToday?: boolean; // Whether today is a declared rest day
}

export interface MainQuest {
  id: string;
  label: string;               // "Arc 1", "Arc 2", etc.
  name: string;
  desc: string;
  stat: StatKey;
  active: boolean;
  progress: number;            // 0–100 (percentage)
}

export interface WeeklyQuest {
  id: string;
  name: string;
  xp: number;
  stat: StatKey;
  done: boolean;
}

export interface BossFight {
  id: string;
  name: string;
  xpRange: string;             // display string e.g. "200–800"
  date: string;                // scheduled date
}

export interface QuestSystem {
  main: MainQuest[];
  weekly: WeeklyQuest[];
  boss: BossFight[];
}

export interface Experiment {
  date: string;                // ISO date
  idea: string;
  result: string;
  xp: number;                  // always 40
}

export interface StartupTracker {
  name: string;
  idea: string;
  stage: number;               // 0–6 index into stages array
  stages: string[];            // ["Idea","Validation","MVP","First User","First Revenue","First $100","Scale"]
  experiments: Experiment[];
  mentor: string;              // name of mentor contacted
}

export interface FinanceEntry {
  desc: string;
  amt: string;                 // stored as string, parsed to float
  date: string;
}

export interface FinanceTracker {
  income: FinanceEntry[];
  expenses: FinanceEntry[];
  warChest: number;            // startup savings fund (dollars)
  savingsGoal: number;         // target for war chest
}

export interface MoodEntry {
  date: string;
  val: 1 | 2 | 3 | 4 | 5;
}

export interface WinEntry {
  date: string;
  text: string;
}

export interface ReadingEntry {
  date: string;
  title: string;
  stat: StatKey;
  xp: number;                  // always 25
}

export interface SkillNode {
  id: string;
  name: string;
  unlocked: boolean;
  xp: number;                  // XP awarded to mastery stat when unlocked
  deps: string[];              // array of node IDs that must be unlocked first
  row: 0 | 1;                  // 0 = Web/Frontend track, 1 = CS/Algorithms track
}

export interface SkillTree {
  nodes: SkillNode[];
}

export interface DistractionBoss {
  hp: number;                  // starts at 100, min 0
  hits: number;                // total times hit
}

export interface Season {
  name: string;                // e.g. "Spring 2026"
  theme: string;               // e.g. "Foundation — build the base"
}

export interface AppState {
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
  lastResetDate?: string;      // Daily habit reset tracker ISO date
}
