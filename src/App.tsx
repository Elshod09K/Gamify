import { useState, useEffect } from 'react';
import useAuth from './hooks/useAuth';
import useAppState from './hooks/useAppState';
import { addXP, applyMutation } from './utils/xpEngine';
import type { AppState, StatKey } from './types';
import { CLASSES } from './utils/constants';
import supabase, { hasSupabaseKeys } from './supabaseClient';

// Layout & Atom Components
import Header from './components/layout/Header';
import TabBar, { type TabType } from './components/layout/TabBar';
import Card from './components/ui/Card';
import Btn from './components/ui/Btn';

// Tabs Components
import Dashboard from './tabs/Dashboard';
import Character from './tabs/Character';
import Quests from './tabs/Quests';
import Habits from './tabs/Habits';
import Startup from './tabs/Startup';
import Finance from './tabs/Finance';
import Wellbeing from './tabs/Wellbeing';
import Analytics from './tabs/Analytics';
import AgentTab from './tabs/AgentTab';

export function App() {
  // 1. Auth & State Sync
  const { user, loading: authLoading, signOut } = useAuth();
  const [offlineMode, setOfflineMode] = useState(() => {
    return localStorage.getItem('founders_os_offline') === 'true';
  });
  
  const { state, updateState, loading: stateLoading, error: syncError } = useAppState(
    offlineMode ? null : user
  );

  // Auth form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Theme settings (Default Dark Mode)
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('founders_os_theme') === 'light';
  });

  // Apply light-mode class to body
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('founders_os_theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('founders_os_theme', 'dark');
    }
  }, [isLightMode]);

  // Auth Submit Action
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseKeys) {
      setAuthError("Supabase connection is not configured in local environment.");
      return;
    }

    setAuthError(null);
    setAuthSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Verification email sent! Check your inbox.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSkipAuth = () => {
    localStorage.setItem('founders_os_offline', 'true');
    setOfflineMode(true);
  };

  const handleLogout = async () => {
    if (offlineMode) {
      localStorage.removeItem('founders_os_offline');
      setOfflineMode(false);
    } else {
      await signOut();
    }
    setActiveTab('dashboard');
  };

  // State actions handlers
  const handleCompleteHabit = (habitId: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      const habit = s.habits.daily.find(h => h.id === habitId);
      if (habit && !habit.done) {
        habit.done = true;
        habit.started = false;
        return addXP(s, habit.stat, habit.xp, true);
      }
      return prev;
    });
  };

  const handleJustStartHabit = (habitId: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      const habit = s.habits.daily.find(h => h.id === habitId);
      if (habit && !habit.done && !habit.started) {
        habit.started = true;
        const partialXp = Math.max(1, Math.round(habit.xp * 0.25));
        return addXP(s, habit.stat, partialXp, true);
      }
      return prev;
    });
  };

  const handleDamageBoss = () => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.distraction.hp = Math.max(0, s.distraction.hp - 10);
      s.distraction.hits += 1;
      return s;
    });
  };

  const handleSelectClass = (clsId: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      if (s.character.class === null) {
        s.character.class = clsId;
        s.character.archetype = CLASSES.find(c => c.id === clsId)?.name || null;
      }
      return s;
    });
  };

  const handleSaveBackstory = (text: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.character.backstory = text;
      return s;
    });
  };

  const handleUnlockSkillNode = (nodeId: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      const node = s.skillTree.nodes.find(n => n.id === nodeId);
      if (node && !node.unlocked) {
        node.unlocked = true;
        return addXP(s, 'mastery', node.xp);
      }
      return prev;
    });
  };

  const handleToggleMainQuestActive = (questId: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.quests.main = s.quests.main.map(q => ({
        ...q,
        active: q.id === questId ? !q.active : false
      }));
      return s;
    });
  };

  const handleUpdateMainQuestProgress = (questId: string, progress: number) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      const quest = s.quests.main.find(q => q.id === questId);
      if (quest) {
        quest.progress = Math.max(0, Math.min(100, progress));
      }
      return s;
    });
  };

  const handleAddWeeklyQuest = (name: string, stat: StatKey, xp: number) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.quests.weekly.push({
        id: "w" + Date.now(),
        name,
        stat,
        xp,
        done: false
      });
      return s;
    });
  };

  const handleCompleteWeeklyQuest = (questId: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      const quest = s.quests.weekly.find(q => q.id === questId);
      if (quest && !quest.done) {
        quest.done = true;
        return addXP(s, quest.stat, quest.xp);
      }
      return prev;
    });
  };

  const handleDeleteWeeklyQuest = (questId: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.quests.weekly = s.quests.weekly.filter(q => q.id !== questId);
      return s;
    });
  };

  const handleSetBossDate = (bossId: string, date: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      const boss = s.quests.boss.find(b => b.id === bossId);
      if (boss) boss.date = date;
      return s;
    });
  };

  const handleCompleteBossFight = (bossId: string, earnedXp: number, statKey: StatKey) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      const boss = s.quests.boss.find(b => b.id === bossId);
      if (boss) {
        return addXP(s, statKey, earnedXp);
      }
      return prev;
    });
  };

  const handleTogglePhase = (phaseNum: 1 | 2 | 3) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.habits.phase = phaseNum;
      return s;
    });
  };

  const handleDeclareRestDay = () => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.habits.restDayActiveToday = true;
      s.habits.lastRestDayDeclared = new Date().toISOString().slice(0, 10);
      return s;
    });
  };

  const handleUseRevival = (restoreVal: number) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      if (s.habits.revivals > 0) {
        s.habits.revivals -= 1;
        s.habits.streak = restoreVal;
      }
      return s;
    });
  };

  const handleBuyRevival = () => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      if (s.character.coins >= 2) {
        s.character.coins -= 2;
        s.habits.revivals += 1;
      }
      return s;
    });
  };

  const handleSetStartupDetails = (name: string, idea: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.startup.name = name;
      s.startup.idea = idea;
      return s;
    });
  };

  const handleAdvanceStage = () => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      const maxStage = s.startup.stages.length - 1;
      if (s.startup.stage < maxStage) {
        s.startup.stage += 1;
        return addXP(s, 'builder', 100);
      }
      return prev;
    });
  };

  const handleDemoteStage = () => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      if (s.startup.stage > 0) {
        s.startup.stage -= 1;
      }
      return s;
    });
  };

  const handleSaveMentor = (mentorName: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.startup.mentor = mentorName;
      return addXP(s, 'builder', 50);
    });
  };

  const handleAddExperiment = (idea: string, result: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.startup.experiments.push({
        date: new Date().toISOString().slice(0, 10),
        idea,
        result,
        xp: 40
      });
      return addXP(s, 'builder', 40);
    });
  };

  const handleAddIncome = (desc: string, amt: number) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.finance.warChest += amt;
      s.finance.income.push({
        desc,
        amt: amt.toString(),
        date: new Date().toISOString().slice(0, 10)
      });
      return addXP(s, 'strategist', 25);
    });
  };

  const handleAddExpense = (desc: string, amt: number) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.finance.warChest = Math.max(0, s.finance.warChest - amt);
      s.finance.expenses.push({
        desc,
        amt: amt.toString(),
        date: new Date().toISOString().slice(0, 10)
      });
      return s;
    });
  };

  const handleSetSavingsGoal = (goal: number) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.finance.savingsGoal = goal;
      return s;
    });
  };

  const handleAddMood = (val: 1 | 2 | 3 | 4 | 5) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.mood.push({
        date: new Date().toISOString().slice(0, 10),
        val
      });
      return s;
    });
  };

  const handleAddWin = (text: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.wins.push({
        date: new Date().toISOString().slice(0, 10),
        text
      });
      return addXP(s, 'vitality', 10);
    });
  };

  const handleAddReading = (title: string, stat: StatKey) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.reading.push({
        date: new Date().toISOString().slice(0, 10),
        title,
        stat,
        xp: 25
      });
      return addXP(s, stat, 25);
    });
  };

  const handleSaveSeason = (name: string, theme: string) => {
    updateState(prev => {
      const s = JSON.parse(JSON.stringify(prev)) as AppState;
      s.season.name = name;
      s.season.theme = theme;
      return s;
    });
  };

  const handleImportState = (newState: AppState) => {
    updateState(newState);
  };

  const handleApplyMutation = (mut: any) => {
    updateState(prev => applyMutation(prev, mut));
  };

  // Loading Screens
  if (authLoading || stateLoading) {
    return (
      <div style={styles.authContainer}>
        <Card style={styles.authCard}>
          <div style={styles.loadingPulse}>⚡</div>
          <h2 style={{ fontSize: '14px', marginTop: '10px' }}>Initializing System Session...</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '10px', marginTop: '4px' }}>
            Syncing matrix parameters & characters
          </p>
        </Card>
      </div>
    );
  }

  // Auth Screen (if not logged in AND not skipped to offline mode)
  if (!user && !offlineMode) {
    return (
      <div style={styles.authContainer}>
        <Card style={styles.authCard}>
          <div style={styles.logoCircle}>⚡</div>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '8px' }}>FOUNDER'S OS</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '10px', marginTop: '2px', marginBottom: '16px' }}>
            Gamify your life. Build the base.
          </p>

          {authError && (
            <div style={styles.errorText}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={styles.authForm}>
            <div style={styles.formGroup}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Btn type="submit" variant="primary" disabled={authSubmitting} style={{ width: '100%' }}>
              {authSubmitting ? "Authenticating..." : isSignUp ? "Sign Up" : "Sign In"}
            </Btn>
          </form>

          <div style={styles.authToggle}>
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              style={styles.toggleBtn}
            >
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
          </div>

          <div style={styles.divider} />

          <Btn 
            onClick={handleSkipAuth} 
            variant="secondary" 
            style={{ width: '100%', fontSize: '11px', marginTop: '4px' }}
          >
            Offline Local Mode (Dev/Testing)
          </Btn>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 1. Header Layout */}
      <Header 
        state={state}
        isLightMode={isLightMode}
        onToggleTheme={() => setIsLightMode(!isLightMode)}
        user={offlineMode ? null : user}
        onLogout={handleLogout}
      />

      {/* 2. Sync Error Alerts */}
      {syncError && (
        <div style={styles.syncErrorAlert}>
          ⚠️ {syncError}
        </div>
      )}

      {/* 3. Navigation Tab Bar */}
      <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* 4. Tab Content Window */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            state={state}
            onCompleteHabit={handleCompleteHabit}
            onDamageBoss={handleDamageBoss}
            onNavigateToTab={setActiveTab}
          />
        )}
        {activeTab === 'character' && (
          <Character 
            state={state}
            onSelectClass={handleSelectClass}
            onSaveBackstory={handleSaveBackstory}
            onUnlockSkillNode={handleUnlockSkillNode}
          />
        )}
        {activeTab === 'quests' && (
          <Quests 
            state={state}
            onToggleMainQuestActive={handleToggleMainQuestActive}
            onUpdateMainQuestProgress={handleUpdateMainQuestProgress}
            onAddWeeklyQuest={handleAddWeeklyQuest}
            onCompleteWeeklyQuest={handleCompleteWeeklyQuest}
            onDeleteWeeklyQuest={handleDeleteWeeklyQuest}
            onSetBossDate={handleSetBossDate}
            onCompleteBossFight={handleCompleteBossFight}
          />
        )}
        {activeTab === 'habits' && (
          <Habits 
            state={state}
            onCompleteHabit={handleCompleteHabit}
            onJustStartHabit={handleJustStartHabit}
            onTogglePhase={handleTogglePhase}
            onDeclareRestDay={handleDeclareRestDay}
            onUseRevival={handleUseRevival}
            onBuyRevival={handleBuyRevival}
          />
        )}
        {activeTab === 'startup' && (
          <Startup 
            state={state}
            onSetStartupDetails={handleSetStartupDetails}
            onAdvanceStage={handleAdvanceStage}
            onDemoteStage={handleDemoteStage}
            onSaveMentor={handleSaveMentor}
            onAddExperiment={handleAddExperiment}
          />
        )}
        {activeTab === 'finance' && (
          <Finance 
            state={state}
            onAddIncome={handleAddIncome}
            onAddExpense={handleAddExpense}
            onSetSavingsGoal={handleSetSavingsGoal}
          />
        )}
        {activeTab === 'wellbeing' && (
          <Wellbeing 
            state={state}
            onAddMood={handleAddMood}
            onAddWin={handleAddWin}
            onAddReading={handleAddReading}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics 
            state={state}
            onSaveSeason={handleSaveSeason}
            onImportState={handleImportState}
          />
        )}
        {activeTab === 'agent' && (
          <AgentTab 
            state={state}
            onApplyMutation={handleApplyMutation}
          />
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  authContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-0)',
    padding: '16px'
  },
  authCard: {
    width: '100%',
    maxWidth: '340px',
    padding: '24px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0
  },
  logoCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--purple), var(--teal))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    userSelect: 'none'
  },
  loadingPulse: {
    fontSize: '28px',
    animation: 'pulse 1.5s infinite',
    userSelect: 'none'
  },
  errorText: {
    backgroundColor: 'rgba(216, 90, 48, 0.12)',
    border: '0.5px solid var(--coral)',
    borderRadius: 'var(--radius)',
    padding: '8px 12px',
    color: 'var(--text-1)',
    fontSize: '10px',
    marginBottom: '12px',
    width: '100%',
    lineHeight: '1.4'
  },
  authForm: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  formGroup: {
    width: '100%'
  },
  authToggle: {
    marginTop: '12px'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--purple)',
    cursor: 'pointer',
    fontSize: '10px'
  },
  divider: {
    width: '100%',
    height: '0.5px',
    backgroundColor: 'var(--border)',
    margin: '14px 0'
  },
  syncErrorAlert: {
    backgroundColor: 'rgba(216, 90, 48, 0.12)',
    borderBottom: '0.5px solid var(--coral)',
    color: 'var(--text-1)',
    fontSize: '10px',
    padding: '6px 16px',
    textAlign: 'center'
  }
};

export default App;
