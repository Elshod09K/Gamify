import { AppState, StatKey, Habit } from '../types';
import { CLASSES, TITLES } from './constants';

export function getHabitXPMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 7) return 1.5;
  return 1.0;
}

export function getTitle(totalXP: number): string {
  return TITLES.find(([xpReq]) => totalXP >= xpReq)?.[1] || "Recruit";
}

export function xpNext(level: number): number {
  return Math.round(300 * Math.pow(1.4, level - 1));
}

export function addXP(prev: AppState, statKey: StatKey, rawAmt: number, isHabit = false): AppState {
  if (rawAmt <= 0) return prev; // Safety: no negative or zero XP additions

  const s = JSON.parse(JSON.stringify(prev)) as AppState;
  let amt = rawAmt;

  // 1. Apply class multiplier
  if (s.character.class) {
    const cls = CLASSES.find(c => c.id === s.character.class);
    if (cls?.stat === statKey) {
      amt = Math.round(amt * 1.5);
    } else if (cls?.stat === 'all') {
      amt = Math.round(amt * 1.1);
    }
  }

  // 2. Apply streak multiplier for habits
  if (isHabit) {
    const streakMult = getHabitXPMultiplier(s.habits.streak);
    amt = Math.round(amt * streakMult);
  }

  // 3. Add XP to specific stat
  const st = s.stats[statKey];
  st.xp += amt;
  s.character.totalXP += amt;

  // 4. Update heatmap
  const today = new Date().toISOString().slice(0, 10);
  s.heatmap[today] = (s.heatmap[today] || 0) + amt;

  // 5. Level up loop
  while (st.xp >= st.xpToNext) {
    st.xp -= st.xpToNext;
    st.level += 1;
    st.xpToNext = xpNext(st.level);
  }

  // 6. Update coins (floor(totalXP / 500))
  s.character.coins = Math.floor(s.character.totalXP / 500);

  // 7. Update title
  s.character.epithet = getTitle(s.character.totalXP);

  return s;
}

export function resetHabitsOnNewDay(prev: AppState, todayStr: string): AppState {
  const s = JSON.parse(JSON.stringify(prev)) as AppState;
  
  if (!s.lastResetDate) {
    s.lastResetDate = todayStr;
    return s;
  }

  if (s.lastResetDate === todayStr) {
    return s; // Already reset for today
  }

  // Calculate if yesterday was completed
  const activeHabits = s.habits.daily.filter(h => h.phase <= s.habits.phase);
  const allActiveDone = activeHabits.length > 0 && activeHabits.every(h => h.done || h.started);

  const wasYesterdayRestDay = s.habits.restDayActiveToday; // This represents yesterday's state before reset

  if (allActiveDone) {
    // Increment streak
    s.habits.streak += 1;
    
    // Auto-earn revival potion every 30 days of consistency
    if (s.habits.streak > 0 && s.habits.streak % 30 === 0) {
      s.habits.revivals += 1;
    }
  } else if (wasYesterdayRestDay) {
    // Protected by rest day: streak remains same, does not reset, does not increment
  } else {
    // Streak resets to 0 (user can manually use revival if they have one)
    s.habits.streak = 0;
  }

  // Reset habits done status
  s.habits.daily = s.habits.daily.map(h => ({
    ...h,
    done: false,
    started: false
  }));

  // Reset rest day active flag for the new day
  s.habits.restDayActiveToday = false;

  // Update last reset date
  s.lastResetDate = todayStr;

  return s;
}

export function applyMutation(prev: AppState, mut: any): AppState {
  let s = JSON.parse(JSON.stringify(prev)) as AppState;

  // Helper function to safely parse integer
  const safeInt = (val: any, fallback = 0) => {
    const parsed = parseInt(val);
    return isNaN(parsed) ? fallback : parsed;
  };

  // 1. Stats modifications (with safety: no negative XP allowed)
  if (mut.stats) {
    for (const [k, v] of Object.entries(mut.stats)) {
      const statKey = k as StatKey;
      if (s.stats[statKey] && v && typeof v === 'object') {
        const changes = v as any;
        if (changes.xp != null) {
          const xpToAdd = safeInt(changes.xp);
          if (xpToAdd > 0) {
            s = addXP(s, statKey, xpToAdd);
          }
        }
        if (changes.level != null) {
          const targetLvl = Math.max(1, Math.min(10, safeInt(changes.level)));
          s.stats[statKey].level = targetLvl;
          s.stats[statKey].xpToNext = xpNext(targetLvl);
        }
      }
    }
  }

  // 2. Character fields (preventing negative totalXP or coins direct injection)
  if (mut.character && typeof mut.character === 'object') {
    const char = mut.character;
    if (char.name !== undefined) s.character.name = String(char.name);
    if (char.class !== undefined && CLASSES.some(c => c.id === char.class)) {
      s.character.class = char.class;
      s.character.archetype = CLASSES.find(c => c.id === char.class)?.name || null;
    }
    if (char.backstory !== undefined) s.character.backstory = String(char.backstory);
    if (char.epithet !== undefined) s.character.epithet = String(char.epithet);
  }

  // 3. Habits
  if (mut.habits && typeof mut.habits === 'object') {
    const hab = mut.habits;
    if (hab.streak != null) s.habits.streak = Math.max(0, safeInt(hab.streak));
    if (hab.phase != null) s.habits.phase = Math.max(1, Math.min(3, safeInt(hab.phase))) as 1 | 2 | 3;
    if (hab.revivals != null) s.habits.revivals = Math.max(0, safeInt(hab.revivals));
    
    // Merge habits list if provided
    if (Array.isArray(hab.daily)) {
      s.habits.daily = s.habits.daily.map(existing => {
        const matching = hab.daily.find((d: any) => d.id === existing.id);
        if (matching) {
          return {
            ...existing,
            done: matching.done !== undefined ? !!matching.done : existing.done,
            started: matching.started !== undefined ? !!matching.started : existing.started,
            phase: matching.phase !== undefined ? safeInt(matching.phase, existing.phase) as 1 | 2 | 3 : existing.phase,
            xp: matching.xp !== undefined ? safeInt(matching.xp, existing.xp) : existing.xp,
          };
        }
        return existing;
      });
    }
  }

  // 4. Quests
  if (mut.quests && typeof mut.quests === 'object') {
    const q = mut.quests;
    if (Array.isArray(q.weekly)) {
      // Append weekly quests, capping total to prevent memory bloat
      const newQuests = q.weekly.map((item: any) => ({
        id: item.id || "w" + Date.now() + Math.random().toString(36).substr(2, 5),
        name: String(item.name || "Unnamed side quest"),
        xp: Math.max(0, safeInt(item.xp, 30)),
        stat: (item.stat && s.stats[item.stat as StatKey] ? item.stat : "intellect") as StatKey,
        done: !!item.done
      }));
      s.quests.weekly = [...s.quests.weekly, ...newQuests].slice(-50);
    }
    
    if (Array.isArray(q.main)) {
      s.quests.main = s.quests.main.map(existing => {
        const matching = q.main.find((m: any) => m.id === existing.id);
        if (matching) {
          return {
            ...existing,
            active: matching.active !== undefined ? !!matching.active : existing.active,
            progress: matching.progress !== undefined ? Math.max(0, Math.min(100, safeInt(matching.progress))) : existing.progress
          };
        }
        return existing;
      });
    }

    if (Array.isArray(q.boss)) {
      s.quests.boss = s.quests.boss.map(existing => {
        const matching = q.boss.find((b: any) => b.id === existing.id);
        if (matching) {
          return {
            ...existing,
            date: matching.date !== undefined ? String(matching.date) : existing.date
          };
        }
        return existing;
      });
    }
  }

  // 5. Startup
  if (mut.startup && typeof mut.startup === 'object') {
    const setup = mut.startup;
    if (setup.name !== undefined) s.startup.name = String(setup.name);
    if (setup.idea !== undefined) s.startup.idea = String(setup.idea);
    if (setup.mentor !== undefined) s.startup.mentor = String(setup.mentor);
    if (setup.stage != null) {
      const maxStage = s.startup.stages.length - 1;
      s.startup.stage = Math.max(0, Math.min(maxStage, safeInt(setup.stage)));
    }
    if (Array.isArray(setup.experiments)) {
      const newExps = setup.experiments.map((e: any) => ({
        date: e.date || new Date().toISOString().slice(0, 10),
        idea: String(e.idea || ""),
        result: String(e.result || ""),
        xp: 40
      }));
      s.startup.experiments = [...s.startup.experiments, ...newExps].slice(-100);
    }
  }

  // 6. Finance
  if (mut.finance && typeof mut.finance === 'object') {
    const fin = mut.finance;
    if (fin.warChest != null) s.finance.warChest = Math.max(0, parseFloat(fin.warChest) || 0);
    if (fin.savingsGoal != null) s.finance.savingsGoal = Math.max(1, parseFloat(fin.savingsGoal) || 200);
    
    if (Array.isArray(fin.income)) {
      const entries = fin.income.map((e: any) => ({
        desc: String(e.desc || ""),
        amt: String(parseFloat(e.amt) || 0),
        date: e.date || new Date().toISOString().slice(0, 10)
      }));
      s.finance.income = [...s.finance.income, ...entries].slice(-100);
    }
    
    if (Array.isArray(fin.expenses)) {
      const entries = fin.expenses.map((e: any) => ({
        desc: String(e.desc || ""),
        amt: String(parseFloat(e.amt) || 0),
        date: e.date || new Date().toISOString().slice(0, 10)
      }));
      s.finance.expenses = [...s.finance.expenses, ...entries].slice(-100);
    }
  }

  // 7. Arrays (mood, wins, reading — append with safety limits)
  if (Array.isArray(mut.mood)) {
    const entries = mut.mood.map((m: any) => ({
      date: m.date || new Date().toISOString().slice(0, 10),
      val: Math.max(1, Math.min(5, safeInt(m.val, 3))) as 1 | 2 | 3 | 4 | 5
    }));
    s.mood = [...s.mood, ...entries].slice(-100);
  }

  if (Array.isArray(mut.wins)) {
    const entries = mut.wins.map((w: any) => ({
      date: w.date || new Date().toISOString().slice(0, 10),
      text: String(w.text || "")
    }));
    s.wins = [...s.wins, ...entries].slice(-100);
  }

  if (Array.isArray(mut.reading)) {
    const entries = mut.reading.map((r: any) => ({
      date: r.date || new Date().toISOString().slice(0, 10),
      title: String(r.title || ""),
      stat: (r.stat && s.stats[r.stat as StatKey] ? r.stat : "intellect") as StatKey,
      xp: 25
    }));
    s.reading = [...s.reading, ...entries].slice(-100);
  }

  // 8. Distraction boss
  if (mut.distraction && typeof mut.distraction === 'object') {
    const dist = mut.distraction;
    if (dist.hp != null) s.distraction.hp = Math.max(0, Math.min(100, safeInt(dist.hp)));
    if (dist.hits != null) s.distraction.hits = Math.max(0, safeInt(dist.hits));
  }

  // 9. Season
  if (mut.season && typeof mut.season === 'object') {
    const seas = mut.season;
    if (seas.name !== undefined) s.season.name = String(seas.name);
    if (seas.theme !== undefined) s.season.theme = String(seas.theme);
  }

  return s;
}
