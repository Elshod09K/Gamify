import React, { useState } from 'react';
import { AppState } from '../types';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import Btn from '../components/ui/Btn';
import XPBar from '../components/ui/XPBar';

interface FinanceProps {
  state: AppState;
  onAddIncome: (desc: string, amt: number) => void;
  onAddExpense: (desc: string, amt: number) => void;
  onSetSavingsGoal: (goal: number) => void;
}

export function Finance({ state, onAddIncome, onAddExpense, onSetSavingsGoal }: FinanceProps) {
  // Goal editor state
  const [goalInput, setGoalInput] = useState(state.finance.savingsGoal.toString());
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Income form state
  const [incDesc, setIncDesc] = useState('');
  const [incAmt, setIncAmt] = useState('');

  // Expense form state
  const [expDesc, setExpDesc] = useState('');
  const [expAmt, setExpAmt] = useState('');

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedGoal = parseFloat(goalInput);
    if (!isNaN(parsedGoal) && parsedGoal > 0) {
      onSetSavingsGoal(parsedGoal);
      setIsEditingGoal(false);
    }
  };

  const handleAddInc = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incAmt);
    if (!incDesc.trim() || isNaN(amt) || amt <= 0) return;
    onAddIncome(incDesc.trim(), amt);
    setIncDesc('');
    setIncAmt('');
  };

  const handleAddExp = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmt);
    if (!expDesc.trim() || isNaN(amt) || amt <= 0) return;
    onAddExpense(expDesc.trim(), amt);
    setExpDesc('');
    setExpAmt('');
  };

  // Savings progress calculation
  const savingsPct = Math.min(
    100,
    state.finance.savingsGoal > 0
      ? Math.round((state.finance.warChest / state.finance.savingsGoal) * 100)
      : 0
  );

  return (
    <div>
      {/* 1. War Chest Dashboard */}
      <div className="section-label">WAR CHEST SAVINGS ACCOUNT</div>
      <Card style={styles.dashboardCard}>
        <div style={styles.dashboardGrid}>
          {/* Fund Details */}
          <div style={styles.metricsCol}>
            <div style={styles.warChestDisplay}>
              <span style={styles.dollarSign}>$</span>
              <span style={styles.warChestVal}>{state.finance.warChest.toFixed(2)}</span>
            </div>
            <div style={styles.goalDisplay}>
              {isEditingGoal ? (
                <form onSubmit={handleSaveGoal} style={styles.goalForm}>
                  <input
                    type="number"
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    style={styles.goalInput}
                    required
                  />
                  <Btn type="submit" variant="primary" style={styles.goalBtn}>Save</Btn>
                  <Btn 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setGoalInput(state.finance.savingsGoal.toString());
                      setIsEditingGoal(false);
                    }} 
                    style={styles.goalBtn}
                  >
                    ✕
                  </Btn>
                </form>
              ) : (
                <React.Fragment>
                  <span style={styles.goalLabel}>
                    Savings Goal: <strong>${state.finance.savingsGoal}</strong>
                  </span>
                  <Btn 
                    variant="secondary" 
                    onClick={() => setIsEditingGoal(true)}
                    style={styles.editGoalBtn}
                  >
                    ✏️ Edit
                  </Btn>
                </React.Fragment>
              )}
            </div>
          </div>
          
          {/* Progress fill bar */}
          <div style={styles.progressCol}>
            <div style={styles.pctLabel}>
              <span>Funded Progress</span>
              <span>{savingsPct}%</span>
            </div>
            <XPBar 
              val={state.finance.warChest} 
              max={state.finance.savingsGoal} 
              color="var(--teal)" 
              height={10} 
            />
          </div>
        </div>
      </Card>

      {/* 2. Logging Panels */}
      <div className="grid-2">
        {/* Income Log Form */}
        <div>
          <div className="section-label">LOG STARTUP INCOME (+25 STRATEGIST XP)</div>
          <Card style={styles.logCard}>
            <form onSubmit={handleAddInc} style={styles.form}>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="e.g. Freelance consulting payment"
                  value={incDesc}
                  onChange={e => setIncDesc(e.target.value)}
                  style={{ fontSize: '11px', padding: '6px' }}
                  required
                />
              </div>
              <div style={styles.formRow}>
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={incAmt}
                  onChange={e => setIncAmt(e.target.value)}
                  style={{ fontSize: '11px', padding: '6px', flex: 1 }}
                  required
                />
                <Btn type="submit" variant="accent" style={styles.submitBtn}>
                  💵 Log Income
                </Btn>
              </div>
            </form>
          </Card>
        </div>

        {/* Expense Log Form */}
        <div>
          <div className="section-label">LOG BUSINESS EXPENSE (0 XP)</div>
          <Card style={styles.logCard}>
            <form onSubmit={handleAddExp} style={styles.form}>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="e.g. Hosting billing, domain registration"
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  style={{ fontSize: '11px', padding: '6px' }}
                  required
                />
              </div>
              <div style={styles.formRow}>
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={expAmt}
                  onChange={e => setExpAmt(e.target.value)}
                  style={{ fontSize: '11px', padding: '6px', flex: 1 }}
                  required
                />
                <Btn type="submit" variant="danger" style={styles.submitBtn}>
                  💸 Log Expense
                </Btn>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* 3. Transaction History Columns */}
      <div className="grid-2" style={{ marginTop: '12px' }}>
        {/* Income Logs List */}
        <div>
          <div className="section-label">INFLOWS ({state.finance.income.length})</div>
          <Card style={styles.historyCard}>
            {state.finance.income.length === 0 ? (
              <div style={styles.emptyText}>No income logs registered.</div>
            ) : (
              <div style={styles.historyList}>
                {state.finance.income.slice().reverse().map((item, idx) => (
                  <div key={idx} style={styles.historyRow}>
                    <div style={styles.histDescCol}>
                      <span style={styles.histDesc}>{item.desc}</span>
                      <span style={styles.histDate}>{item.date}</span>
                    </div>
                    <span style={styles.incAmt}>+${parseFloat(item.amt).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Expense Logs List */}
        <div>
          <div className="section-label">OUTFLOWS ({state.finance.expenses.length})</div>
          <Card style={styles.historyCard}>
            {state.finance.expenses.length === 0 ? (
              <div style={styles.emptyText}>No expense logs registered.</div>
            ) : (
              <div style={styles.historyList}>
                {state.finance.expenses.slice().reverse().map((item, idx) => (
                  <div key={idx} style={styles.historyRow}>
                    <div style={styles.histDescCol}>
                      <span style={styles.histDesc}>{item.desc}</span>
                      <span style={styles.histDate}>{item.date}</span>
                    </div>
                    <span style={styles.expAmt}>-${parseFloat(item.amt).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  dashboardCard: {
    padding: '16px',
    marginBottom: 0
  },
  dashboardGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    flexWrap: 'wrap'
  },
  metricsCol: {
    flex: '1 1 200px'
  },
  warChestDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px'
  },
  dollarSign: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--teal)'
  },
  warChestVal: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--text-1)'
  },
  goalDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: 'var(--text-2)',
    marginTop: '4px'
  },
  goalLabel: {
    fontSize: '11px'
  },
  editGoalBtn: {
    padding: '2px 6px',
    fontSize: '9px'
  },
  goalForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  goalInput: {
    width: '80px',
    padding: '3px 6px',
    fontSize: '11px'
  },
  goalBtn: {
    padding: '3px 6px',
    fontSize: '9px'
  },
  progressCol: {
    flex: '1 1 250px'
  },
  pctLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: 'var(--text-2)',
    marginBottom: '4px',
    fontWeight: 500
  },
  logCard: {
    padding: '12px',
    marginBottom: 0,
    minHeight: '84px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
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
  submitBtn: {
    padding: '6px 12px',
    fontSize: '10px',
    whiteSpace: 'nowrap'
  },
  historyCard: {
    padding: '12px',
    minHeight: '180px',
    marginBottom: 0
  },
  emptyText: {
    color: 'var(--text-3)',
    textAlign: 'center',
    padding: '50px 0',
    fontSize: '11px'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '160px',
    overflowY: 'auto'
  },
  historyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px',
    backgroundColor: 'var(--bg-2)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius)'
  },
  histDescCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1
  },
  histDesc: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--text-1)',
    lineHeight: '1.2'
  },
  histDate: {
    fontSize: '9px',
    color: 'var(--text-3)'
  },
  incAmt: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--teal)'
  },
  expAmt: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--coral)'
  }
};

export default Finance;
