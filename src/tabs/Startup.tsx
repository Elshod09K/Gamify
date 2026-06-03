import React, { useState } from 'react';
import { AppState } from '../types';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import Btn from '../components/ui/Btn';
import StartupTree from '../components/widgets/StartupTree';

interface StartupProps {
  state: AppState;
  onSetStartupDetails: (name: string, idea: string) => void;
  onAdvanceStage: () => void;
  onDemoteStage: () => void;
  onSaveMentor: (mentorName: string) => void;
  onAddExperiment: (idea: string, result: string) => void;
}

export function Startup({
  state,
  onSetStartupDetails,
  onAdvanceStage,
  onDemoteStage,
  onSaveMentor,
  onAddExperiment
}: StartupProps) {
  // Startup setup states
  const [nameInput, setNameInput] = useState(state.startup.name);
  const [ideaInput, setIdeaInput] = useState(state.startup.idea);
  const [isEditingStartup, setIsEditingStartup] = useState(!state.startup.name);

  // Mentor state
  const [mentorInput, setMentorInput] = useState(state.startup.mentor);
  const [isEditingMentor, setIsEditingMentor] = useState(false);

  // Experiment form states
  const [expIdea, setExpIdea] = useState('');
  const [expResult, setExpResult] = useState('');

  const handleSaveStartupDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onSetStartupDetails(nameInput.trim(), ideaInput.trim());
    setIsEditingStartup(false);
  };

  const handleSaveMentor = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMentor(mentorInput.trim());
    setIsEditingMentor(false);
  };

  const handleAddExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expIdea.trim() || !expResult.trim()) return;
    onAddExperiment(expIdea.trim(), expResult.trim());
    setExpIdea('');
    setExpResult('');
  };

  const isCompleted = state.startup.stage >= state.startup.stages.length - 1;

  return (
    <div>
      {/* 1. Startup Setup & Details */}
      <div className="section-label">STARTUP CORE VENTURE</div>
      
      {isEditingStartup ? (
        <Card>
          <form onSubmit={handleSaveStartupDetails} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Venture Name</label>
              <input
                type="text"
                placeholder="e.g. Gamify Life Inc."
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                style={{ fontSize: '11px' }}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Core Value Proposition / Idea</label>
              <textarea
                placeholder="What problem does it solve and for whom?"
                value={ideaInput}
                onChange={e => setIdeaInput(e.target.value)}
                style={{ fontSize: '11px' }}
                rows={3}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Btn type="submit" variant="primary" style={{ padding: '6px 12px' }}>
                Save Venture Details
              </Btn>
              {state.startup.name && (
                <Btn 
                  type="button"
                  variant="secondary" 
                  onClick={() => {
                    setNameInput(state.startup.name);
                    setIdeaInput(state.startup.idea);
                    setIsEditingStartup(false);
                  }}
                  style={{ padding: '6px 12px' }}
                >
                  Cancel
                </Btn>
              )}
            </div>
          </form>
        </Card>
      ) : (
        <Card style={styles.ventureCard}>
          <div style={styles.ventureHeader}>
            <div>
              <h2 style={styles.ventureTitle}>{state.startup.name}</h2>
              <p style={styles.ventureIdea}>{state.startup.idea}</p>
            </div>
            <Btn 
              variant="secondary" 
              onClick={() => setIsEditingStartup(true)}
              style={styles.editVentureBtn}
            >
              ⚙️ Edit
            </Btn>
          </div>
          
          <div style={styles.divider} />
          
          {/* Milestone steps progress bar */}
          <div style={styles.treeSection}>
            <div style={styles.treeHeader}>
              <span style={styles.treeTitle}>VENTURE MILESTONES PROGRESS</span>
              <Pill color="var(--teal)">
                Stage {state.startup.stage + 1}: {state.startup.stages[state.startup.stage]}
              </Pill>
            </div>
            <StartupTree startup={state.startup} />
            <div style={styles.stageActions}>
              <Btn 
                onClick={onAdvanceStage} 
                disabled={isCompleted}
                variant="accent"
                style={{ padding: '4px 10px', fontSize: '10px' }}
                title="Advance to next milestone (+100 Builder XP)"
              >
                🚀 Level Up Stage (+100 XP)
              </Btn>
              <Btn 
                onClick={onDemoteStage} 
                disabled={state.startup.stage === 0}
                variant="secondary"
                style={{ padding: '4px 10px', fontSize: '10px' }}
              >
                Demote Stage
              </Btn>
            </div>
          </div>
        </Card>
      )}

      <div className="grid-2" style={{ marginTop: '12px' }}>
        {/* 2. Mentor Connection Tracker */}
        <div>
          <div className="section-label">MENTOR CONNECT QUEST</div>
          <Card style={{ minHeight: '142px' }}>
            {isEditingMentor ? (
              <form onSubmit={handleSaveMentor} style={styles.form}>
                <input
                  type="text"
                  placeholder="Mentor's Name or Role..."
                  value={mentorInput}
                  onChange={e => setMentorInput(e.target.value)}
                  style={{ fontSize: '11px', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Btn type="submit" variant="primary" style={{ padding: '4px 8px', fontSize: '10px' }}>
                    Save Mentor
                  </Btn>
                  <Btn 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setMentorInput(state.startup.mentor);
                      setIsEditingMentor(false);
                    }} 
                    style={{ padding: '4px 8px', fontSize: '10px' }}
                  >
                    Cancel
                  </Btn>
                </div>
              </form>
            ) : (
              <div>
                {state.startup.mentor ? (
                  <div>
                    <div style={styles.mentorSuccess}>
                      🤝 Mentor Contact Logged:
                    </div>
                    <div style={styles.mentorName}>{state.startup.mentor}</div>
                    <div style={styles.mentorDesc}>
                      Venture guidance connection secured. Completed (+50 Builder XP awarded on claim).
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={styles.mentorEmpty}>
                      No mentor logged yet. Find a tech or startup founder to guide your journey.
                    </div>
                  </div>
                )}
                <Btn 
                  onClick={() => setIsEditingMentor(true)} 
                  variant="secondary" 
                  style={{ marginTop: '10px', padding: '4px 8px', fontSize: '10px' }}
                >
                  {state.startup.mentor ? '📝 Edit Mentor' : '🤝 Log Mentor Contact'}
                </Btn>
              </div>
            )}
          </Card>
        </div>

        {/* 3. Scientific Experiments Logger */}
        <div>
          <div className="section-label">LOG SCIENTIFIC EXPERIMENT (+40 BUILDER XP)</div>
          <Card style={{ minHeight: '142px', padding: '12px' }}>
            <form onSubmit={handleAddExp} style={styles.form}>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="Hypothesis / Action Idea (e.g. Cold outreach)"
                  value={expIdea}
                  onChange={e => setExpIdea(e.target.value)}
                  style={{ fontSize: '10px', padding: '6px' }}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="Result / Validation Metric (e.g. 5 signups)"
                  value={expResult}
                  onChange={e => setExpResult(e.target.value)}
                  style={{ fontSize: '10px', padding: '6px' }}
                  required
                />
              </div>
              <Btn type="submit" variant="accent" style={{ width: '100%', padding: '6px', fontSize: '10px' }}>
                🧪 Log Validate Experiment
              </Btn>
            </form>
          </Card>
        </div>
      </div>

      {/* 4. Experiments History Logs */}
      {state.startup.experiments.length > 0 && (
        <React.Fragment>
          <div className="section-label">EXPERIMENT LOG HISTORY ({state.startup.experiments.length})</div>
          <div style={styles.expHistory}>
            {state.startup.experiments.slice().reverse().map((exp, idx) => (
              <Card key={idx} style={{ padding: '12px', marginBottom: '6px' }}>
                <div style={styles.expRowHeader}>
                  <Pill color="var(--teal)">VALIDATION EXP</Pill>
                  <span style={styles.expDate}>{exp.date}</span>
                </div>
                <div style={styles.expDetail}>
                  <strong>Hypothesis:</strong> {exp.idea}
                </div>
                <div style={styles.expDetail}>
                  <strong>Result:</strong> {exp.result}
                </div>
              </Card>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  label: {
    fontSize: '9px',
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    fontWeight: 600
  },
  ventureCard: {
    padding: '16px',
    marginBottom: 0
  },
  ventureHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
  },
  ventureTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'var(--text-1)'
  },
  ventureIdea: {
    fontSize: '11px',
    color: 'var(--text-2)',
    marginTop: '4px',
    lineHeight: '1.4'
  },
  editVentureBtn: {
    padding: '4px 8px',
    fontSize: '10px'
  },
  divider: {
    height: '0.5px',
    backgroundColor: 'var(--border)',
    margin: '12px 0'
  },
  treeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  treeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  treeTitle: {
    fontSize: '9px',
    color: 'var(--text-3)',
    fontWeight: 600,
    letterSpacing: '.05em'
  },
  stageActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  mentorSuccess: {
    fontSize: '11px',
    color: 'var(--teal)',
    fontWeight: 'bold'
  },
  mentorName: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: 'var(--text-1)',
    marginTop: '4px'
  },
  mentorDesc: {
    fontSize: '10px',
    color: 'var(--text-3)',
    marginTop: '2px',
    lineHeight: '1.3'
  },
  mentorEmpty: {
    fontSize: '10px',
    color: 'var(--text-3)',
    fontStyle: 'italic',
    lineHeight: '1.4'
  },
  expHistory: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  expRowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  expDate: {
    fontSize: '9px',
    color: 'var(--text-3)'
  },
  expDetail: {
    fontSize: '11px',
    lineHeight: '1.4',
    color: 'var(--text-1)',
    marginTop: '2px'
  }
};

export default Startup;
