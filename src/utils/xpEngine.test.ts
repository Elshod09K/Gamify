import { describe, it, expect } from 'vitest';
import { INITIAL_STATE } from './constants';
import { xpNext, addXP, getTitle, resetHabitsOnNewDay, applyMutation } from './xpEngine';
import { AppState } from '../types';

describe('xpEngine tests', () => {
  it('should calculate correct xp to next level', () => {
    expect(xpNext(1)).toBe(300);
    expect(xpNext(2)).toBe(420);
    expect(xpNext(3)).toBe(588);
  });

  it('should calculate correct title based on total XP', () => {
    expect(getTitle(0)).toBe('Recruit');
    expect(getTitle(500)).toBe('Apprentice');
    expect(getTitle(1499)).toBe('Apprentice');
    expect(getTitle(1500)).toBe('Specialist');
    expect(getTitle(20000)).toBe('Legend');
    expect(getTitle(40000)).toBe('Immortal');
  });

  it('should add XP without multiplier if class is not set', () => {
    let state = JSON.parse(JSON.stringify(INITIAL_STATE)) as AppState;
    state = addXP(state, 'intellect', 10);
    
    expect(state.stats.intellect.xp).toBe(10);
    expect(state.character.totalXP).toBe(10);
    expect(state.character.coins).toBe(0);
  });

  it('should apply 1.5x multiplier for Scholar on intellect stat', () => {
    let state = JSON.parse(JSON.stringify(INITIAL_STATE)) as AppState;
    state.character.class = 'scholar';
    
    // raw 100 XP -> should become 150
    state = addXP(state, 'intellect', 100);
    expect(state.stats.intellect.xp).toBe(150);
    expect(state.character.totalXP).toBe(150);

    // raw 100 XP on other stat -> should stay 100
    state = addXP(state, 'builder', 100);
    expect(state.stats.builder.xp).toBe(100);
    expect(state.character.totalXP).toBe(250);
  });

  it('should apply 1.1x multiplier for Polymath on all stats', () => {
    let state = JSON.parse(JSON.stringify(INITIAL_STATE)) as AppState;
    state.character.class = 'polymath';
    
    // raw 100 XP on intellect -> 110
    state = addXP(state, 'intellect', 100);
    expect(state.stats.intellect.xp).toBe(110);

    // raw 100 XP on builder -> 110
    state = addXP(state, 'builder', 100);
    expect(state.stats.builder.xp).toBe(110);
  });

  it('should apply streak multipliers for habits', () => {
    let state = JSON.parse(JSON.stringify(INITIAL_STATE)) as AppState;
    
    // 0-day streak: 1.0x (raw 10 -> 10)
    state = addXP(state, 'vitality', 10, true);
    expect(state.stats.vitality.xp).toBe(10);

    // 8-day streak: 1.5x (raw 10 -> 15)
    state.habits.streak = 8;
    state = addXP(state, 'vitality', 10, true);
    expect(state.stats.vitality.xp).toBe(25); // 10 + 15

    // 30-day streak: 2.0x (raw 10 -> 20)
    state.habits.streak = 30;
    state = addXP(state, 'vitality', 10, true);
    expect(state.stats.vitality.xp).toBe(45); // 25 + 20
  });

  it('should handle leveling up correctly', () => {
    let state = JSON.parse(JSON.stringify(INITIAL_STATE)) as AppState;
    
    // Level 1 needs 300 XP
    // Add 310 XP
    state = addXP(state, 'intellect', 310);
    
    expect(state.stats.intellect.level).toBe(2);
    expect(state.stats.intellect.xp).toBe(10);
    expect(state.stats.intellect.xpToNext).toBe(420);
  });

  it('should reset habits on new day and increment streak if all active habits completed', () => {
    let state = JSON.parse(JSON.stringify(INITIAL_STATE)) as AppState;
    state.lastResetDate = '2026-06-01';
    
    // Mark active habits done (phase 1: 4 habits)
    state.habits.daily = state.habits.daily.map(h => {
      if (h.phase === 1) return { ...h, done: true };
      return h;
    });

    state = resetHabitsOnNewDay(state, '2026-06-02');
    
    expect(state.habits.streak).toBe(1);
    expect(state.habits.daily.every(h => !h.done)).toBe(true);
    expect(state.lastResetDate).toBe('2026-06-02');
  });

  it('should reset streak to 0 on reset if habits not done and not rest day', () => {
    let state = JSON.parse(JSON.stringify(INITIAL_STATE)) as AppState;
    state.lastResetDate = '2026-06-01';
    state.habits.streak = 5;
    
    // Habits are not done
    state = resetHabitsOnNewDay(state, '2026-06-02');
    
    expect(state.habits.streak).toBe(0);
  });

  it('should maintain streak on reset if it was a declared rest day yesterday', () => {
    let state = JSON.parse(JSON.stringify(INITIAL_STATE)) as AppState;
    state.lastResetDate = '2026-06-01';
    state.habits.streak = 5;
    state.habits.restDayActiveToday = true; // Declared yesterday
    
    // Habits are not done
    state = resetHabitsOnNewDay(state, '2026-06-02');
    
    expect(state.habits.streak).toBe(5);
    expect(state.habits.restDayActiveToday).toBe(false); // Resets for today
  });

  it('should ignore negative XP mutations for agent safety', () => {
    let state = JSON.parse(JSON.stringify(INITIAL_STATE)) as AppState;
    state.stats.builder.xp = 100;
    
    const mutation = {
      stats: {
        builder: {
          xp: -50
        }
      }
    };

    state = applyMutation(state, mutation);
    expect(state.stats.builder.xp).toBe(100); // Should not change
  });
});
