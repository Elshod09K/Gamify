import React from 'react';
import Pill from '../ui/Pill';
import { AppState } from '../../types';
import { getTitle } from '../../utils/xpEngine';

interface HeaderProps {
  state: AppState;
  isLightMode: boolean;
  onToggleTheme: () => void;
  user: any;
  onLogout: () => void;
}

export function Header({ state, isLightMode, onToggleTheme, user, onLogout }: HeaderProps) {
  // Overall Character Level = average of all 7 stats (round down)
  const avgLvl = Math.floor(
    Object.values(state.stats).reduce((sum, s) => sum + s.level, 0) / 7
  );

  const title = getTitle(state.character.totalXP);

  return (
    <header style={styles.header}>
      {/* Left side: Brand */}
      <div style={styles.brandContainer}>
        <div style={styles.appIcon}>⚡</div>
        <div>
          <h1 style={styles.appName}>FOUNDER'S OS</h1>
          <div style={styles.seasonInfo}>
            {state.season.name.toUpperCase()} · {state.season.theme}
          </div>
        </div>
      </div>

      {/* Right side: Stats & Controls */}
      <div style={styles.statsContainer}>
        {/* Core Metrics */}
        <div style={styles.metricGroup}>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>LVL</span>
            <span style={styles.metricVal}>{avgLvl}</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>XP</span>
            <span style={{ ...styles.metricVal, color: 'var(--amber)' }}>
              {state.character.totalXP.toLocaleString()}
            </span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>COINS</span>
            <span style={{ ...styles.metricVal, color: 'var(--teal)' }}>
              {state.character.coins}
            </span>
          </div>
          <Pill color="var(--purple)">{title}</Pill>
        </div>

        {/* Action Controls */}
        <div style={styles.controls}>
          <button 
            onClick={onToggleTheme} 
            style={styles.themeBtn}
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLightMode ? '🌙' : '☀️'}
          </button>
          
          {user && (
            <button 
              onClick={onLogout} 
              style={styles.logoutBtn}
              title="Logout"
            >
              🚪
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    borderBottom: '0.5px solid var(--border)',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-1)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '10px'
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  appIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--purple), var(--teal))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  appName: {
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '.06em',
    color: 'var(--text-1)'
  },
  seasonInfo: {
    fontSize: '9px',
    color: 'var(--text-3)',
    letterSpacing: '.08em',
    marginTop: '1px'
  },
  statsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginLeft: 'auto',
    flexWrap: 'wrap'
  },
  metricGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  metric: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column'
  },
  metricLabel: {
    fontSize: '8px',
    color: 'var(--text-3)',
    letterSpacing: '.05em',
    fontWeight: 600
  },
  metricVal: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--purple)',
    lineHeight: '1.2'
  },
  controls: {
    display: 'flex',
    gap: '6px'
  },
  themeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
  }
};

export default Header;
