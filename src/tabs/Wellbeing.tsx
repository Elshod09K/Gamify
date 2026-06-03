import React, { useState } from 'react';
import { AppState, StatKey } from '../types';
import { STAT_META } from '../utils/constants';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import Btn from '../components/ui/Btn';
import MoodChart from '../components/widgets/MoodChart';

interface WellbeingProps {
  state: AppState;
  onAddMood: (val: 1 | 2 | 3 | 4 | 5) => void;
  onAddWin: (text: string) => void;
  onAddReading: (title: string, stat: StatKey) => void;
}

const MOODS: { val: 1 | 2 | 3 | 4 | 5; label: string; icon: string }[] = [
  { val: 5, label: 'Ecstatic', icon: '😁' },
  { val: 4, label: 'Good', icon: '🙂' },
  { val: 3, label: 'Neutral', icon: '😐' },
  { val: 2, label: 'Low', icon: '😟' },
  { val: 1, label: 'Awful', icon: '😭' }
];

export function Wellbeing({ state, onAddMood, onAddWin, onAddReading }: WellbeingProps) {
  // Win logger form state
  const [winText, setWinText] = useState('');

  // Reading logger form state
  const [bookTitle, setBookTitle] = useState('');
  const [bookStat, setBookStat] = useState<StatKey>('intellect');

  // Low mood notification message
  const [moodWarning, setMoodWarning] = useState<string | null>(null);

  const handleAddMood = (val: 1 | 2 | 3 | 4 | 5) => {
    onAddMood(val);
    if (val <= 2) {
      setMoodWarning(
        "⚠️ Low mood registered. Remember: Consistency does not mean burnout. Protect your health. If you are struggling, consider declaring a Rest Day to protect your streaks, or take a break."
      );
    } else {
      setMoodWarning(null);
    }
  };

  const handleAddWin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winText.trim()) return;
    onAddWin(winText.trim());
    setWinText('');
  };

  const handleAddReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;
    onAddReading(bookTitle.trim(), bookStat);
    setBookTitle('');
  };

  return (
    <div>
      {/* 1. Mood Tracker & Chart */}
      <div className="section-label">MOOD MAPPING (LAST 14 DAYS)</div>
      <Card>
        {/* Mood buttons grid */}
        <div style={styles.moodHeader}>How is your mental state today?</div>
        <div style={styles.moodSelectorGrid}>
          {MOODS.map(m => (
            <button
              key={m.val}
              onClick={() => handleAddMood(m.val)}
              style={styles.moodSelectBtn}
              title={m.label}
            >
              <span style={styles.moodEmoji}>{m.icon}</span>
              <span style={styles.moodBtnLabel}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Warning notification */}
        {moodWarning && (
          <div style={styles.warningAlert}>
            {moodWarning}
            <button onClick={() => setMoodWarning(null)} style={styles.closeAlertBtn}>✕</button>
          </div>
        )}

        <div style={styles.divider} />
        
        {/* Mood Chart Widget */}
        <MoodChart moods={state.mood} />
      </Card>

      <div className="grid-2" style={{ marginTop: '12px' }}>
        {/* 2. Daily Win Logger */}
        <div>
          <div className="section-label">LOG DAILY WIN (+10 VITALITY XP)</div>
          <Card style={styles.columnCard}>
            <form onSubmit={handleAddWin} style={styles.form}>
              <div style={styles.formGroup}>
                <textarea
                  placeholder="What is one positive thing you accomplished today? e.g. Finished SAT practice exam"
                  value={winText}
                  onChange={e => setWinText(e.target.value)}
                  style={{ fontSize: '11px', padding: '6px' }}
                  rows={2}
                  required
                />
              </div>
              <Btn type="submit" variant="accent" style={{ width: '100%', padding: '6px', fontSize: '10px' }}>
                🏆 Log Daily Victory
              </Btn>
            </form>
          </Card>
        </div>

        {/* 3. Book Reading Logger */}
        <div>
          <div className="section-label">LOG ALIGNED BOOK READING (+25 XP)</div>
          <Card style={styles.columnCard}>
            <form onSubmit={handleAddReading} style={styles.form}>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="Book Title (e.g. Zero to One)"
                  value={bookTitle}
                  onChange={e => setBookTitle(e.target.value)}
                  style={{ fontSize: '10px', padding: '6px' }}
                  required
                />
              </div>
              <div style={styles.formRow}>
                <select
                  value={bookStat}
                  onChange={e => setBookStat(e.target.value as StatKey)}
                  style={styles.select}
                >
                  {Object.entries(STAT_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
                <Btn type="submit" variant="primary" style={styles.submitBtn}>
                  📚 Log Read
                </Btn>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '12px' }}>
        {/* 4. Daily Wins Log History */}
        <div>
          <div className="section-label">DAILY WINS HISTORY ({state.wins.length})</div>
          <Card style={styles.historyCard}>
            {state.wins.length === 0 ? (
              <div style={styles.emptyText}>No daily wins logged. Capture your positive progress!</div>
            ) : (
              <div style={styles.historyList}>
                {state.wins.slice().reverse().map((win, idx) => (
                  <div key={idx} style={styles.historyRow}>
                    <span style={styles.historyDate}>{win.date}</span>
                    <span style={styles.historyText}>{win.text}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* 5. Reading History */}
        <div>
          <div className="section-label">READING HISTORY ({state.reading.length})</div>
          <Card style={styles.historyCard}>
            {state.reading.length === 0 ? (
              <div style={styles.emptyText}>No books read logged yet. Keep expanding your mind!</div>
            ) : (
              <div style={styles.historyList}>
                {state.reading.slice().reverse().map((r, idx) => {
                  const meta = STAT_META[r.stat];
                  return (
                    <div key={idx} style={styles.historyRow}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={styles.historyText}>📖 <strong>{r.title}</strong></span>
                        <Pill color={meta.color} style={{ fontSize: '7px' }}>
                          {meta.icon} +{r.xp} {meta.label}
                        </Pill>
                      </div>
                      <span style={styles.historyDate}>{r.date}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  moodHeader: {
    fontSize: '11px',
    color: 'var(--text-2)',
    marginBottom: '10px'
  },
  moodSelectorGrid: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap'
  },
  moodSelectBtn: {
    flex: 1,
    minWidth: '70px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 4px',
    backgroundColor: 'var(--bg-2)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  moodEmoji: {
    fontSize: '20px'
  },
  moodBtnLabel: {
    fontSize: '9px',
    color: 'var(--text-2)'
  },
  warningAlert: {
    backgroundColor: 'rgba(216, 90, 48, 0.12)',
    border: '0.5px solid var(--coral)',
    borderRadius: 'var(--radius)',
    padding: '10px',
    color: 'var(--text-1)',
    fontSize: '10px',
    lineHeight: '1.4',
    marginTop: '12px',
    position: 'relative'
  },
  closeAlertBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-2)',
    cursor: 'pointer',
    position: 'absolute',
    top: '4px',
    right: '8px',
    fontSize: '10px',
    padding: '4px'
  },
  divider: {
    height: '0.5px',
    backgroundColor: 'var(--border)',
    margin: '14px 0'
  },
  columnCard: {
    minHeight: '110px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 0
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
  submitBtn: {
    padding: '6px 12px',
    fontSize: '10px',
    whiteSpace: 'nowrap'
  },
  historyCard: {
    padding: '12px',
    minHeight: '160px',
    marginBottom: 0
  },
  emptyText: {
    color: 'var(--text-3)',
    textAlign: 'center',
    padding: '45px 0',
    fontSize: '11px',
    lineHeight: '1.4'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '140px',
    overflowY: 'auto'
  },
  historyRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '6px',
    backgroundColor: 'var(--bg-2)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius)'
  },
  historyText: {
    fontSize: '11px',
    color: 'var(--text-1)',
    lineHeight: '1.3'
  },
  historyDate: {
    fontSize: '8px',
    color: 'var(--text-3)',
    alignSelf: 'flex-start'
  }
};

export default Wellbeing;
