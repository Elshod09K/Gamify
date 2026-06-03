import React from 'react';
import { AppState } from '../types';
import { STAT_META } from '../utils/constants';
import { getHabitXPMultiplier } from '../utils/xpEngine';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import Btn from '../components/ui/Btn';

interface HabitsProps {
  state: AppState;
  onCompleteHabit: (habitId: string) => void;
  onJustStartHabit: (habitId: string) => void;
  onTogglePhase: (phaseNum: 1 | 2 | 3) => void;
  onDeclareRestDay: () => void;
  onUseRevival: (restoreVal: number) => void;
  onBuyRevival: () => void;
}

export function Habits({
  state,
  onCompleteHabit,
  onJustStartHabit,
  onTogglePhase,
  onDeclareRestDay,
  onUseRevival,
  onBuyRevival
}: HabitsProps) {
  
  // Show habits that belong to the active phase or lower
  const activeHabits = state.habits.daily.filter(
    h => h.phase <= state.habits.phase
  );

  const streakMultiplier = getHabitXPMultiplier(state.habits.streak);

  // Enforce once a week rest day rule
  const lastRestDate = state.habits.lastRestDayDeclared;
  let canDeclareRest = !state.habits.restDayActiveToday;
  let daysSinceLastRest = 999;
  
  if (lastRestDate) {
    const diffTime = Math.abs(Date.now() - new Date(lastRestDate).getTime());
    daysSinceLastRest = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysSinceLastRest < 7) {
      canDeclareRest = false;
    }
  }

  const handleUseRevival = () => {
    if (state.habits.revivals <= 0) return;
    const input = prompt("Enter your previous streak to restore:");
    const restoreVal = parseInt(input || '0');
    if (!isNaN(restoreVal) && restoreVal > 0) {
      onUseRevival(restoreVal);
    }
  };

  return (
    <div>
      {/* 1. Streak & Status Dashboard */}
      <div className="section-label">CONSISTENCY OVERVIEW</div>
      <Card style={styles.summaryCard}>
        <div style={styles.summaryGrid}>
          {/* Streak display */}
          <div style={styles.metricBlock}>
            <span style={styles.metricLabel}>STREAK</span>
            <div style={styles.streakDisplay}>
              <span style={styles.streakValue}>{state.habits.streak}</span>
              <span style={styles.streakUnit}>days</span>
            </div>
            {streakMultiplier > 1.0 && (
              <Pill color="var(--amber)" style={{ marginTop: '4px' }}>
                {streakMultiplier}x XP Multiplier
              </Pill>
            )}
          </div>

          {/* Revivals */}
          <div style={styles.metricBlock}>
            <span style={styles.metricLabel}>REVIVALS</span>
            <div style={styles.revivalDisplay}>
              <span style={styles.revivalValue}>🧪 {state.habits.revivals}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <Btn 
                onClick={handleUseRevival} 
                disabled={state.habits.revivals <= 0}
                variant="secondary"
                style={styles.microBtn}
              >
                Use
              </Btn>
              <Btn 
                onClick={onBuyRevival} 
                disabled={state.character.coins < 2}
                variant="accent"
                style={styles.microBtn}
                title="Buy 1 Revival for 2 Coins"
              >
                Buy (2c)
              </Btn>
            </div>
          </div>

          {/* Rest Day */}
          <div style={styles.metricBlock}>
            <span style={styles.metricLabel}>REST STATUS</span>
            <div style={styles.restDisplay}>
              {state.habits.restDayActiveToday ? (
                <Pill color="var(--amber)">REST DAY ACTIVE</Pill>
              ) : (
                <span style={styles.restText}>Active Duty</span>
              )}
            </div>
            <Btn 
              onClick={onDeclareRestDay} 
              disabled={!canDeclareRest}
              variant="secondary"
              style={{ ...styles.microBtn, marginTop: '8px', width: '100%' }}
              title={
                state.habits.restDayActiveToday
                  ? "Rest day is active for today."
                  : !canDeclareRest && lastRestDate
                  ? `Locked. Last declared ${daysSinceLastRest} days ago (Requires 7 days).`
                  : "Protect your streak for tomorrow."
              }
            >
              Declare Rest Day
            </Btn>
          </div>
        </div>
      </Card>

      {/* 2. Phase Locking Selector */}
      <div className="section-label">HABIT DEVELOPMENT PHASE GATING</div>
      <Card style={{ padding: '8px 12px' }}>
        <div style={styles.phaseSelector}>
          {[1, 2, 3].map(p => {
            const phaseNum = p as 1 | 2 | 3;
            const isActive = state.habits.phase === phaseNum;
            const habitsCount = state.habits.daily.filter(h => h.phase === phaseNum).length;

            return (
              <button
                key={phaseNum}
                onClick={() => onTogglePhase(phaseNum)}
                style={{
                  ...styles.phaseBtn,
                  backgroundColor: isActive ? 'var(--purple)' : 'var(--bg-2)',
                  color: isActive ? '#ffffff' : 'var(--text-2)',
                  borderColor: isActive ? 'var(--purple)' : 'var(--border)'
                }}
              >
                Phase {phaseNum} ({habitsCount} habits)
              </button>
            );
          })}
        </div>
        <div style={styles.phaseDesc}>
          {state.habits.phase === 1 && "Phase 1: Basic fundamentals. Focus on planning, deep work, logging, and sleep."}
          {state.habits.phase === 2 && "Phase 2: Intermediate habits. Adds coding skill grind, budget tracking, and movement."}
          {state.habits.phase === 3 && "Phase 3: High performer. Adds the 2-minute rule and daily gratitude/win logs."}
        </div>
      </Card>

      {/* 3. Daily Checklist */}
      <div className="section-label">TODAY'S CHECKLIST (PHASE 1-{state.habits.phase} ACTIVE)</div>
      <Card style={{ padding: '12px' }}>
        <div style={styles.checklist}>
          {activeHabits.map(h => {
            const meta = STAT_META[h.stat];
            const isCompleted = h.done || h.started;
            const fullDone = h.done;
            const justStart = h.started;

            return (
              <div 
                key={h.id} 
                style={{
                  ...styles.habitRow,
                  borderLeft: `3px solid ${meta.color}`,
                  opacity: fullDone ? 0.5 : 1
                }}
              >
                {/* Complete checkbox */}
                <div 
                  className={`checkbox-icon ${fullDone ? 'checked' : ''}`}
                  onClick={() => !fullDone && onCompleteHabit(h.id)}
                  style={{
                    backgroundColor: fullDone ? 'var(--teal)' : 'transparent',
                    borderColor: fullDone ? 'var(--teal)' : 'var(--border-2)'
                  }}
                >
                  {fullDone ? '✓' : ''}
                </div>

                {/* Habit details */}
                <div style={styles.habitMeta}>
                  <span style={{ 
                    ...styles.habitName, 
                    textDecoration: fullDone ? 'line-through' : 'none' 
                  }}>
                    {h.name}
                  </span>
                  <div style={styles.habitStats}>
                    <span style={{ color: meta.color, fontWeight: 'bold' }}>
                      {meta.icon} {meta.label}
                    </span>
                    <span> · </span>
                    <span>+{h.xp} XP base</span>
                    {justStart && (
                      <span style={{ color: 'var(--amber)', fontWeight: 'bold' }}>
                        {" "}· Started (+{Math.round(h.xp * 0.25)} XP)
                      </span>
                    )}
                  </div>
                </div>

                {/* Just Start Button */}
                {!isCompleted && (
                  <Btn
                    variant="secondary"
                    onClick={() => onJustStartHabit(h.id)}
                    style={styles.justStartBtn}
                    title="Earn 25% XP and protect streak for today"
                  >
                    Just Start
                  </Btn>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  summaryCard: {
    padding: '16px',
    marginBottom: '12px'
  },
  summaryGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  },
  metricBlock: {
    flex: 1,
    minWidth: '150px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    backgroundColor: 'var(--bg-2)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius)'
  },
  metricLabel: {
    fontSize: '9px',
    fontWeight: 600,
    color: 'var(--text-3)',
    letterSpacing: '.05em',
    marginBottom: '6px'
  },
  streakDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px'
  },
  streakValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'var(--amber)'
  },
  streakUnit: {
    fontSize: '11px',
    color: 'var(--text-2)'
  },
  revivalDisplay: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '2px'
  },
  microBtn: {
    padding: '3px 8px',
    fontSize: '9px'
  },
  restDisplay: {
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  restText: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'var(--teal)'
  },
  phaseSelector: {
    display: 'flex',
    gap: '6px',
    width: '100%'
  },
  phaseBtn: {
    flex: 1,
    padding: '6px',
    fontSize: '10px',
    fontWeight: 'bold',
    border: '0.5px solid',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  phaseDesc: {
    fontSize: '9.5px',
    color: 'var(--text-2)',
    marginTop: '8px',
    lineHeight: '1.4',
    fontStyle: 'italic'
  },
  checklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  habitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    backgroundColor: 'var(--bg-2)',
    borderRadius: 'var(--radius)',
    border: '0.5px solid var(--border)',
    transition: 'opacity 0.2s ease'
  },
  habitMeta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  habitName: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--text-1)'
  },
  habitStats: {
    fontSize: '9px',
    color: 'var(--text-3)'
  },
  justStartBtn: {
    padding: '4px 10px',
    fontSize: '9px'
  }
};

export default Habits;
