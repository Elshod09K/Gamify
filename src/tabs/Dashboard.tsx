import React from 'react';
import { AppState, StatKey } from '../types';
import { STAT_META } from '../utils/constants';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import XPBar from '../components/ui/XPBar';
import Btn from '../components/ui/Btn';
import Heatmap from '../components/widgets/Heatmap';
import { TabType } from '../components/layout/TabBar';

interface DashboardProps {
  state: AppState;
  onCompleteHabit: (habitId: string) => void;
  onDamageBoss: () => void;
  onNavigateToTab: (tab: TabType) => void;
}

export function Dashboard({ state, onCompleteHabit, onDamageBoss, onNavigateToTab }: DashboardProps) {
  // Get active habits for today
  const activeHabits = state.habits.daily.filter(
    h => h.phase <= state.habits.phase
  );
  
  const pendingHabits = activeHabits.filter(h => !h.done);

  // Active main quests
  const activeQuests = state.quests.main.filter(q => q.active);

  return (
    <div>
      {/* 1. Stat Levels Radar / Summary Grid */}
      <div className="section-label">STAT LEVELS</div>
      <div className="grid-2">
        {Object.entries(state.stats).map(([k, v]) => {
          const key = k as StatKey;
          const meta = STAT_META[key];
          return (
            <Card key={key} style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statIcon}>{meta.icon}</span>
                <div style={styles.statMeta}>
                  <div style={styles.statLabel}>{meta.label}</div>
                  <div style={styles.statDesc}>{meta.desc}</div>
                </div>
                <div style={styles.statLevel}>LVL {v.level}</div>
              </div>
              <div style={styles.xpInfo}>
                <span style={styles.xpLabel}>XP {v.xp} / {v.xpToNext}</span>
              </div>
              <XPBar val={v.xp} max={v.xpToNext} color={meta.color} height={4} />
            </Card>
          );
        })}
      </div>

      {/* 2. Today's Core focus & Heatmap */}
      <div className="section-label">CONSISTENCY & ACTIVITY</div>
      <Card>
        <Heatmap heatmap={state.heatmap} />
      </Card>

      <div className="grid-2">
        {/* 3. Today's Habits Quick Checklist */}
        <div>
          <div className="section-label">TODAY'S HABITS ({activeHabits.filter(h => h.done).length}/{activeHabits.length})</div>
          <Card style={styles.listCard}>
            {pendingHabits.length === 0 ? (
              <div style={styles.emptyText}>
                ✨ All active habits done for today!
              </div>
            ) : (
              <div style={styles.habitsList}>
                {pendingHabits.slice(0, 4).map(h => {
                  const meta = STAT_META[h.stat];
                  return (
                    <div 
                      key={h.id} 
                      style={styles.habitRow}
                      onClick={() => onCompleteHabit(h.id)}
                    >
                      <div className="checkbox-icon" />
                      <div style={styles.habitDetails}>
                        <span style={styles.habitName}>{h.name}</span>
                        <span style={{ color: meta.color, fontSize: '9px', fontWeight: 600 }}>
                          {meta.icon} +{h.xp} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
                {pendingHabits.length > 4 && (
                  <Btn 
                    variant="secondary" 
                    style={{ marginTop: '8px', width: '100%', fontSize: '10px', padding: '6px' }}
                    onClick={() => onNavigateToTab('habits')}
                  >
                    View all {pendingHabits.length} pending habits
                  </Btn>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* 4. Distraction Boss */}
        <div>
          <div className="section-label">DISTRACTION BOSS</div>
          <Card style={styles.bossCard}>
            <div style={styles.bossIcon}>👹</div>
            <div style={styles.bossMeta}>
              <div style={styles.bossName}>Social Media Goblin</div>
              <div style={styles.bossHpText}>HP: {state.distraction.hp}/100</div>
              <XPBar 
                val={state.distraction.hp} 
                max={100} 
                color="var(--coral)" 
                height={8} 
                style={{ marginTop: '4px', marginBottom: '8px' }} 
              />
              <div style={styles.bossStats}>
                Hits Landed: <span style={{ fontWeight: 'bold', color: 'var(--coral)' }}>{state.distraction.hits}</span>
              </div>
              <Btn 
                variant="danger" 
                onClick={onDamageBoss}
                disabled={state.distraction.hp <= 0}
                style={{ width: '100%', padding: '6px 12px', fontSize: '10px' }}
              >
                ⚔️ Hit boss (Focus mode)
              </Btn>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. Active Quests */}
      {activeQuests.length > 0 && (
        <React.Fragment>
          <div className="section-label">ACTIVE CAMPAIGNS</div>
          <div style={styles.questsContainer}>
            {activeQuests.map(q => {
              const meta = STAT_META[q.stat];
              return (
                <Card key={q.id}>
                  <div style={styles.questHeader}>
                    <div>
                      <Pill color={meta.color} style={{ marginRight: '8px' }}>{q.label}</Pill>
                      <span style={styles.questName}>{q.name}</span>
                    </div>
                    <span style={styles.questProgressText}>{q.progress}%</span>
                  </div>
                  <div style={styles.questDesc}>{q.desc}</div>
                  <XPBar val={q.progress} max={100} color={meta.color} height={6} style={{ marginTop: '8px' }} />
                </Card>
              );
            })}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  statCard: {
    padding: '12px',
    marginBottom: '0'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  statIcon: {
    fontSize: '18px'
  },
  statMeta: {
    flex: 1
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'var(--text-1)'
  },
  statDesc: {
    fontSize: '9px',
    color: 'var(--text-3)'
  },
  statLevel: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--purple)'
  },
  xpInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: 'var(--text-2)',
    marginBottom: '4px'
  },
  xpLabel: {
    fontSize: '9px'
  },
  listCard: {
    minHeight: '142px',
    marginBottom: '0'
  },
  emptyText: {
    color: 'var(--text-3)',
    textAlign: 'center',
    padding: '40px 0',
    fontSize: '11px'
  },
  habitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  habitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '4px 0'
  },
  habitDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  habitName: {
    fontSize: '11px',
    color: 'var(--text-1)'
  },
  bossCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minHeight: '142px',
    marginBottom: '0'
  },
  bossIcon: {
    fontSize: '44px',
    userSelect: 'none'
  },
  bossMeta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  bossName: {
    fontSize: '12px',
    fontWeight: 'bold'
  },
  bossHpText: {
    fontSize: '10px',
    color: 'var(--text-2)',
    marginTop: '2px'
  },
  bossStats: {
    fontSize: '10px',
    color: 'var(--text-3)',
    marginBottom: '8px'
  },
  questsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  questHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  questName: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'var(--text-1)'
  },
  questProgressText: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--text-2)'
  },
  questDesc: {
    fontSize: '10px',
    color: 'var(--text-2)',
    marginTop: '4px'
  }
};

export default Dashboard;
