import React, { useState, useRef } from 'react';
import { AppState } from '../types';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import Btn from '../components/ui/Btn';
import Heatmap from '../components/widgets/Heatmap';

interface AnalyticsProps {
  state: AppState;
  onSaveSeason: (name: string, theme: string) => void;
  onImportState: (newState: AppState) => void;
}

export function Analytics({ state, onSaveSeason, onImportState }: AnalyticsProps) {
  // Season inputs state
  const [seasonName, setSeasonName] = useState(state.season.name);
  const [seasonTheme, setSeasonTheme] = useState(state.season.theme);
  const [isEditingSeason, setIsEditingSeason] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Overall Character Level = average of all 7 stats (round down)
  const avgLvl = Math.floor(
    Object.values(state.stats).reduce((sum, s) => sum + s.level, 0) / 7
  );

  const handleSaveSeason = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSeason(seasonName.trim(), seasonTheme.trim());
    setIsEditingSeason(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `founders_os_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Simple validation check: ensure it has character and stats
        if (parsed.character && parsed.stats) {
          if (confirm("Importing this backup will overwrite your current state. Proceed?")) {
            onImportState(parsed as AppState);
            alert("Backup imported successfully!");
          }
        } else {
          alert("Invalid backup file: missing required fields.");
        }
      } catch (err) {
        alert("Failed to parse JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  // Helper metrics
  const activeMainQuest = state.quests.main.find(q => q.active);
  const totalInflows = state.finance.income.reduce((sum, item) => sum + parseFloat(item.amt || '0'), 0);
  const totalOutflows = state.finance.expenses.reduce((sum, item) => sum + parseFloat(item.amt || '0'), 0);

  return (
    <div>
      {/* 1. Snapshot Metrics Grid */}
      <div className="section-label">FOUNDATION SNAPSHOT METRICS</div>
      <div className="grid-3" style={{ gap: '10px' }}>
        <Card style={styles.metricCard}>
          <span style={styles.metricLabel}>AVERAGE STAT LEVEL</span>
          <span style={styles.metricValue}>{avgLvl}</span>
        </Card>
        <Card style={styles.metricCard}>
          <span style={styles.metricLabel}>ACTIVE STRATEGY FOCUS</span>
          <span style={{ ...styles.metricValue, fontSize: '11px', lineHeight: '1.4' }}>
            {activeMainQuest ? activeMainQuest.name : "None active"}
          </span>
        </Card>
        <Card style={styles.metricCard}>
          <span style={styles.metricLabel}>STREAK RETENTION</span>
          <span style={{ ...styles.metricValue, color: 'var(--amber)' }}>{state.habits.streak} days</span>
        </Card>
      </div>

      <div className="grid-3" style={{ gap: '10px', marginTop: '10px' }}>
        <Card style={styles.metricCard}>
          <span style={styles.metricLabel}>VALIDATION EXPERIMENTS</span>
          <span style={{ ...styles.metricValue, color: 'var(--teal)' }}>
            {state.startup.experiments.length} logged
          </span>
        </Card>
        <Card style={styles.metricCard}>
          <span style={styles.metricLabel}>WAR CHEST INFLOWS</span>
          <span style={{ ...styles.metricValue, color: 'var(--teal)' }}>
            ${totalInflows.toFixed(2)}
          </span>
        </Card>
        <Card style={styles.metricCard}>
          <span style={styles.metricLabel}>WAR CHEST OUTFLOWS</span>
          <span style={{ ...styles.metricValue, color: 'var(--coral)' }}>
            ${totalOutflows.toFixed(2)}
          </span>
        </Card>
      </div>

      {/* 2. Heatmap display */}
      <div className="section-label">ANNUAL CALENDAR ACTIVITY HEATMAP</div>
      <Card>
        <Heatmap heatmap={state.heatmap} />
      </Card>

      <div className="grid-2">
        {/* 3. Season Settings */}
        <div>
          <div className="section-label">SEASON SETTINGS & FOCUS</div>
          <Card style={{ minHeight: '150px' }}>
            {isEditingSeason ? (
              <form onSubmit={handleSaveSeason} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.miniLabel}>Season Label</label>
                  <input
                    type="text"
                    value={seasonName}
                    onChange={e => setSeasonName(e.target.value)}
                    style={{ fontSize: '11px', padding: '6px' }}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.miniLabel}>Theme / Strategy Goal</label>
                  <input
                    type="text"
                    value={seasonTheme}
                    onChange={e => setSeasonTheme(e.target.value)}
                    style={{ fontSize: '11px', padding: '6px' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <Btn type="submit" variant="primary" style={styles.smallBtn}>Save</Btn>
                  <Btn 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setSeasonName(state.season.name);
                      setSeasonTheme(state.season.theme);
                      setIsEditingSeason(false);
                    }} 
                    style={styles.smallBtn}
                  >
                    Cancel
                  </Btn>
                </div>
              </form>
            ) : (
              <div>
                <div style={styles.seasonDetail}>
                  <strong>Active Season:</strong> {state.season.name}
                </div>
                <div style={styles.seasonDetail}>
                  <strong>Strategic Theme:</strong> {state.season.theme}
                </div>
                <Btn 
                  onClick={() => setIsEditingSeason(true)} 
                  variant="secondary" 
                  style={{ marginTop: '14px', padding: '4px 8px', fontSize: '10px' }}
                >
                  ⚙️ Update Season Details
                </Btn>
              </div>
            )}
          </Card>
        </div>

        {/* 4. Import / Export Backup */}
        <div>
          <div className="section-label">DATA MANAGEMENT & BACKUPS</div>
          <Card style={{ minHeight: '150px', display: 'flex', flexDirection: 'column', justifyRendering: 'center', gap: '10px' }}>
            <p style={styles.descText}>
              Your data is stored in the cloud (if logged in) or local browser storage. Export JSON backups to secure your milestones.
            </p>
            <div style={styles.actionCol}>
              <Btn onClick={handleExport} variant="accent" style={{ width: '100%', fontSize: '11px', padding: '8px' }}>
                📥 Export Backup (JSON)
              </Btn>
              <Btn onClick={handleImportClick} variant="secondary" style={{ width: '100%', fontSize: '11px', padding: '8px' }}>
                📤 Import Backup (JSON)
              </Btn>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                style={{ display: 'none' }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  metricCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '12px',
    minHeight: '80px',
    marginBottom: 0
  },
  metricLabel: {
    fontSize: '8px',
    color: 'var(--text-3)',
    fontWeight: 600,
    letterSpacing: '.05em',
    marginBottom: '6px'
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--purple)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  miniLabel: {
    fontSize: '8px',
    color: 'var(--text-3)',
    textTransform: 'uppercase'
  },
  smallBtn: {
    padding: '4px 10px',
    fontSize: '10px'
  },
  seasonDetail: {
    fontSize: '11px',
    color: 'var(--text-1)',
    marginTop: '6px',
    lineHeight: '1.4'
  },
  descText: {
    fontSize: '10px',
    color: 'var(--text-2)',
    lineHeight: '1.4'
  },
  actionCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: 'auto'
  }
};

export default Analytics;
