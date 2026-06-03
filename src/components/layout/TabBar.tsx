import React from 'react';

export type TabType = 
  | 'dashboard'
  | 'character'
  | 'quests'
  | 'habits'
  | 'startup'
  | 'finance'
  | 'wellbeing'
  | 'analytics'
  | 'agent';

interface TabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

const TABS: TabType[] = [
  'dashboard',
  'character',
  'quests',
  'habits',
  'startup',
  'finance',
  'wellbeing',
  'analytics',
  'agent'
];

const TLABELS: Record<TabType, string> = {
  dashboard: 'Dashboard',
  character: 'Character',
  quests: 'Quests',
  habits: 'Habits',
  startup: 'Startup',
  finance: 'Finance',
  wellbeing: 'Wellbeing',
  analytics: 'Analytics',
  agent: '⚡ Agent'
};

export function TabBar({ activeTab, onChangeTab }: TabBarProps) {
  return (
    <div style={styles.navContainer}>
      <nav style={styles.nav}>
        {TABS.map(t => {
          const isActive = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => onChangeTab(t)}
              style={{
                ...styles.tabBtn,
                color: isActive ? 'var(--text-1)' : 'var(--text-3)',
                borderBottom: `2px solid ${isActive ? 'var(--purple)' : 'transparent'}`
              }}
            >
              {TLABELS[t].toUpperCase()}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  navContainer: {
    borderBottom: '0.5px solid var(--border)',
    backgroundColor: 'var(--bg-1)',
    position: 'sticky',
    top: '49px', // Offset of header
    zIndex: 9
  },
  nav: {
    display: 'flex',
    overflowX: 'auto',
    width: '100%',
    scrollbarWidth: 'none', // Hide scrollbar for Firefox
    msOverflowStyle: 'none' // Hide scrollbar for IE/Edge
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '10px 14px',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '.05em',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all .15s ease',
    borderRadius: 0,
    display: 'inline-flex',
    alignItems: 'center',
    height: '36px'
  }
};

export default TabBar;
