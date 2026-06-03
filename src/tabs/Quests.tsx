import React, { useState } from 'react';
import { AppState, StatKey } from '../types';
import { STAT_META } from '../utils/constants';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import Btn from '../components/ui/Btn';
import XPBar from '../components/ui/XPBar';

interface QuestsProps {
  state: AppState;
  onToggleMainQuestActive: (questId: string) => void;
  onUpdateMainQuestProgress: (questId: string, progress: number) => void;
  onAddWeeklyQuest: (name: string, stat: StatKey, xp: number) => void;
  onCompleteWeeklyQuest: (questId: string) => void;
  onDeleteWeeklyQuest: (questId: string) => void;
  onSetBossDate: (bossId: string, date: string) => void;
  onCompleteBossFight: (bossId: string, earnedXp: number, statKey: StatKey) => void;
}

export function Quests({
  state,
  onToggleMainQuestActive,
  onUpdateMainQuestProgress,
  onAddWeeklyQuest,
  onCompleteWeeklyQuest,
  onDeleteWeeklyQuest,
  onSetBossDate,
  onCompleteBossFight
}: QuestsProps) {
  // Weekly Quest Form State
  const [newQuestName, setNewQuestName] = useState('');
  const [newQuestStat, setNewQuestStat] = useState<StatKey>('intellect');
  const [newQuestDifficulty, setNewQuestDifficulty] = useState<'15' | '30' | '60'>('30');

  // Active Main Quest editing states
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);

  // Boss fight award state
  const [completingBossId, setCompletingBossId] = useState<string | null>(null);
  const [bossEarnedXp, setBossEarnedXp] = useState<number>(300);
  const [bossAwardStat, setBossAwardStat] = useState<StatKey>('gladiator');

  const handleAddWeekly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestName.trim()) return;
    onAddWeeklyQuest(newQuestName.trim(), newQuestStat, parseInt(newQuestDifficulty));
    setNewQuestName('');
  };

  const startEditProgress = (id: string, currentProgress: number) => {
    setEditingQuestId(id);
    setTempProgress(currentProgress);
  };

  const saveEditProgress = (id: string) => {
    onUpdateMainQuestProgress(id, tempProgress);
    setEditingQuestId(null);
  };

  const handleCompleteBoss = (bossId: string) => {
    onCompleteBossFight(bossId, bossEarnedXp, bossAwardStat);
    setCompletingBossId(null);
  };

  return (
    <div>
      {/* 1. Main Arcs (Campaigns) */}
      <div className="section-label">MAIN CAMPAIGN ARCS (ONE ACTIVE AT A TIME)</div>
      <div style={styles.questsList}>
        {state.quests.main.map(q => {
          const meta = STAT_META[q.stat];
          const isEditing = editingQuestId === q.id;

          return (
            <Card key={q.id} style={{ ...styles.questCard, borderColor: q.active ? 'var(--purple)' : 'var(--border)' }}>
              <div style={styles.questHeader}>
                <div style={styles.questHeaderLeft}>
                  <Pill color={meta.color}>{q.label}</Pill>
                  <h3 style={styles.questName}>{q.name}</h3>
                </div>
                <div style={styles.questHeaderRight}>
                  {q.active ? (
                    <Pill color="var(--purple)">ACTIVE FOCUS</Pill>
                  ) : (
                    <Btn 
                      variant="secondary" 
                      onClick={() => onToggleMainQuestActive(q.id)}
                      style={styles.actionBtn}
                    >
                      Set Active Focus
                    </Btn>
                  )}
                </div>
              </div>
              <p style={styles.questDesc}>{q.desc}</p>
              
              <div style={styles.statLine}>
                Associated Stat: <span style={{ color: meta.color, fontWeight: 'bold' }}>{meta.icon} {meta.label}</span>
              </div>

              {/* Progress info */}
              <div style={styles.progressContainer}>
                <div style={styles.progressInfo}>
                  <span style={styles.progressLabel}>Arc Progress</span>
                  <span style={styles.progressValue}>{q.progress}%</span>
                </div>
                
                {isEditing ? (
                  <div style={styles.editProgressRow}>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={tempProgress}
                      onChange={e => setTempProgress(parseInt(e.target.value))}
                      style={styles.slider}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Btn onClick={() => saveEditProgress(q.id)} variant="accent" style={styles.sliderBtn}>✓</Btn>
                      <Btn onClick={() => setEditingQuestId(null)} variant="secondary" style={styles.sliderBtn}>✕</Btn>
                    </div>
                  </div>
                ) : (
                  <div style={styles.progressDisplayRow}>
                    <XPBar val={q.progress} max={100} color={meta.color} height={6} style={{ flex: 1 }} />
                    {q.active && (
                      <Btn 
                        variant="secondary" 
                        onClick={() => startEditProgress(q.id, q.progress)}
                        style={styles.editProgressBtn}
                      >
                        ⚙️ Update
                      </Btn>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid-2" style={{ marginTop: '12px' }}>
        {/* 2. Weekly Side Quests Checklist */}
        <div>
          <div className="section-label">WEEKLY SIDE QUESTS</div>
          
          {/* Add Form */}
          <Card style={{ marginBottom: '8px', padding: '12px' }}>
            <form onSubmit={handleAddWeekly} style={styles.form}>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="New weekly quest..."
                  value={newQuestName}
                  onChange={e => setNewQuestName(e.target.value)}
                  style={{ fontSize: '11px' }}
                />
              </div>
              <div style={styles.formRow}>
                <select
                  value={newQuestStat}
                  onChange={e => setNewQuestStat(e.target.value as StatKey)}
                  style={styles.select}
                >
                  {Object.entries(STAT_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
                <select
                  value={newQuestDifficulty}
                  onChange={e => setNewQuestDifficulty(e.target.value as any)}
                  style={styles.select}
                >
                  <option value="15">Easy (+15 XP)</option>
                  <option value="30">Medium (+30 XP)</option>
                  <option value="60">Hard (+60 XP)</option>
                </select>
                <Btn type="submit" style={styles.addBtn}>Add</Btn>
              </div>
            </form>
          </Card>

          {/* List */}
          <Card style={{ minHeight: '200px', padding: '12px' }}>
            {state.quests.weekly.length === 0 ? (
              <div style={styles.emptyText}>No weekly quests scheduled. Add one above!</div>
            ) : (
              <div style={styles.weeklyList}>
                {state.quests.weekly.map(wq => {
                  const meta = STAT_META[wq.stat];
                  return (
                    <div key={wq.id} style={styles.weeklyRow}>
                      <div 
                        className={`checkbox-icon ${wq.done ? 'checked' : ''}`}
                        onClick={() => !wq.done && onCompleteWeeklyQuest(wq.id)}
                      >
                        {wq.done ? '✓' : ''}
                      </div>
                      <div style={{
                        ...styles.weeklyDetails,
                        textDecoration: wq.done ? 'line-through' : 'none',
                        opacity: wq.done ? 0.5 : 1
                      }}>
                        <span style={styles.weeklyName}>{wq.name}</span>
                        <span style={{ color: meta.color, fontSize: '9px', fontWeight: 600 }}>
                          {meta.icon} +{wq.xp} XP
                        </span>
                      </div>
                      <button 
                        onClick={() => onDeleteWeeklyQuest(wq.id)} 
                        style={styles.deleteBtn}
                        title="Delete quest"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* 3. Boss Fights (Scheduled Events) */}
        <div>
          <div className="section-label">BOSS FIGHTS (SCHEDULER)</div>
          <div style={styles.questsList}>
            {state.quests.boss.map(b => {
              const isCompleting = completingBossId === b.id;

              return (
                <Card key={b.id} style={{ padding: '12px', marginBottom: '8px' }}>
                  <div style={styles.bossTitleRow}>
                    <span style={{ fontSize: '18px' }}>👹</span>
                    <div>
                      <h4 style={styles.bossTitleName}>{b.name}</h4>
                      <div style={styles.bossReward}>Reward: {b.xpRange} XP</div>
                    </div>
                  </div>

                  <div style={styles.bossDateRow}>
                    <span style={styles.bossDateLabel}>Scheduled Date:</span>
                    <input 
                      type="date" 
                      value={b.date} 
                      onChange={e => onSetBossDate(b.id, e.target.value)}
                      style={styles.dateInput}
                    />
                  </div>

                  {isCompleting ? (
                    <div style={styles.bossForm}>
                      <div style={styles.bossFormRow}>
                        <div style={{ flex: 1 }}>
                          <label style={styles.miniLabel}>XP Reward</label>
                          <input 
                            type="number" 
                            value={bossEarnedXp} 
                            onChange={e => setBossEarnedXp(parseInt(e.target.value) || 0)}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={styles.miniLabel}>Stat Unlocked</label>
                          <select 
                            value={bossAwardStat} 
                            onChange={e => setBossAwardStat(e.target.value as StatKey)}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            {Object.entries(STAT_META).map(([k, v]) => (
                              <option key={k} value={k}>{v.icon} {v.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        <Btn onClick={() => handleCompleteBoss(b.id)} variant="accent" style={{ padding: '4px 8px', fontSize: '10px' }}>
                          Claim Victory
                        </Btn>
                        <Btn onClick={() => setCompletingBossId(null)} variant="secondary" style={{ padding: '4px 8px', fontSize: '10px' }}>
                          Cancel
                        </Btn>
                      </div>
                    </div>
                  ) : (
                    <Btn 
                      variant="danger" 
                      onClick={() => {
                        setCompletingBossId(b.id);
                        // Default to midpoint of range
                        const parts = b.xpRange.split('–');
                        const defaultXp = parts.length > 1 ? Math.round((parseInt(parts[0]) + parseInt(parts[1])) / 2) : parseInt(b.xpRange) || 300;
                        setBossEarnedXp(defaultXp);
                        setBossAwardStat(b.name.includes('Exam') ? 'intellect' : 'gladiator');
                      }}
                      style={{ width: '100%', marginTop: '10px', padding: '4px 8px', fontSize: '10px' }}
                    >
                      ⚔️ Record Boss Slain
                    </Btn>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  questsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  questCard: {
    borderWidth: '1.5px',
    marginBottom: 0
  },
  questHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  questHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  questHeaderRight: {
    marginLeft: 'auto'
  },
  questName: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'var(--text-1)'
  },
  actionBtn: {
    padding: '4px 10px',
    fontSize: '9px'
  },
  questDesc: {
    fontSize: '10px',
    color: 'var(--text-2)',
    marginTop: '6px',
    lineHeight: '1.4'
  },
  statLine: {
    fontSize: '9px',
    color: 'var(--text-3)',
    marginTop: '6px'
  },
  progressContainer: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: 'var(--text-2)'
  },
  progressLabel: {
    fontSize: '9px'
  },
  progressValue: {
    fontWeight: 'bold'
  },
  progressDisplayRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  editProgressBtn: {
    padding: '3px 8px',
    fontSize: '9px'
  },
  editProgressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  slider: {
    flex: 1,
    padding: 0
  },
  sliderBtn: {
    width: '24px',
    height: '24px',
    padding: 0,
    fontSize: '10px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formGroup: {
    width: '100%'
  },
  formRow: {
    display: 'flex',
    gap: '6px'
  },
  select: {
    flex: 1,
    padding: '6px',
    fontSize: '10px'
  },
  addBtn: {
    padding: '6px 12px',
    fontSize: '10px'
  },
  emptyText: {
    color: 'var(--text-3)',
    textAlign: 'center',
    padding: '60px 0',
    fontSize: '11px'
  },
  weeklyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  weeklyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '2px 0'
  },
  weeklyDetails: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  weeklyName: {
    fontSize: '11px',
    color: 'var(--text-1)'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-3)',
    cursor: 'pointer',
    fontSize: '11px',
    padding: '4px'
  },
  bossTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  },
  bossTitleName: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--text-1)'
  },
  bossReward: {
    fontSize: '9px',
    color: 'var(--text-3)'
  },
  bossDateRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: 'var(--text-2)'
  },
  bossDateLabel: {
    fontSize: '10px'
  },
  dateInput: {
    width: '110px',
    padding: '3px 6px',
    fontSize: '10px'
  },
  bossForm: {
    marginTop: '10px',
    padding: '8px',
    backgroundColor: 'var(--bg-2)',
    borderRadius: 'var(--radius)',
    border: '0.5px solid var(--border)'
  },
  bossFormRow: {
    display: 'flex',
    gap: '6px'
  },
  miniLabel: {
    display: 'block',
    fontSize: '8px',
    color: 'var(--text-3)',
    marginBottom: '2px',
    textTransform: 'uppercase'
  }
};

export default Quests;
