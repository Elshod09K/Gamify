import React, { useState } from 'react';
import { AppState } from '../types';
import { CLASSES, TITLES } from '../utils/constants';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import Btn from '../components/ui/Btn';
import SkillTree from '../components/widgets/SkillTree';

interface CharacterProps {
  state: AppState;
  onSelectClass: (clsId: string) => void;
  onSaveBackstory: (text: string) => void;
  onUnlockSkillNode: (nodeId: string) => void;
}

export function Character({ state, onSelectClass, onSaveBackstory, onUnlockSkillNode }: CharacterProps) {
  const [backstoryText, setBackstoryText] = useState(state.character.backstory);
  const [isEditingBackstory, setIsEditingBackstory] = useState(false);

  const currentClass = CLASSES.find(c => c.id === state.character.class);

  const handleSaveBackstory = () => {
    onSaveBackstory(backstoryText);
    setIsEditingBackstory(false);
  };

  return (
    <div>
      {/* 1. Character Class Selection / Display */}
      <div className="section-label">CLASS ACQUISITION</div>
      
      {state.character.class === null ? (
        <Card>
          <div style={styles.classPrompt}>
            <span style={{ fontSize: '20px' }}>⚔️</span> Choose your starting path. This choice is <strong>permanent</strong> and determines your XP multipliers!
          </div>
          <div className="grid-2" style={{ gap: '10px', marginTop: '12px' }}>
            {CLASSES.map(c => (
              <Card key={c.id} style={styles.classCard}>
                <div style={styles.classHeader}>
                  <span style={styles.classIcon}>{c.icon}</span>
                  <div>
                    <h3 style={styles.className}>{c.name}</h3>
                    <Pill color="var(--purple)" style={{ fontSize: '8px', padding: '1px 6px' }}>{c.bonus}</Pill>
                  </div>
                </div>
                <p style={styles.classDesc}>{c.desc}</p>
                <Btn 
                  onClick={() => onSelectClass(c.id)} 
                  style={{ width: '100%', padding: '6px', fontSize: '10px', marginTop: '10px' }}
                >
                  Select Path
                </Btn>
              </Card>
            ))}
          </div>
        </Card>
      ) : (
        <Card style={styles.activeClassCard}>
          <div style={styles.activeClassLeft}>
            <span style={styles.activeClassIcon}>{currentClass?.icon}</span>
            <div>
              <h2 style={styles.activeClassName}>{currentClass?.name}</h2>
              <div style={styles.activeClassSubtitle}>{state.character.epithet}</div>
              <div style={{ marginTop: '4px' }}>
                <Pill color="var(--teal)">{currentClass?.bonus}</Pill>
              </div>
            </div>
          </div>
          <div style={styles.activeClassRight}>
            <p style={{ fontStyle: 'italic', fontSize: '11px', color: 'var(--text-2)' }}>
              "{currentClass?.desc}"
            </p>
          </div>
        </Card>
      )}

      {/* 2. Origin Story Editor */}
      <div className="section-label">ORIGIN STORY</div>
      <Card>
        {isEditingBackstory ? (
          <div>
            <textarea
              value={backstoryText}
              onChange={e => setBackstoryText(e.target.value)}
              placeholder="Write your developer / founder backstory here..."
              rows={4}
              style={{ width: '100%', marginBottom: '10px', fontSize: '11px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Btn onClick={handleSaveBackstory} variant="primary" style={{ padding: '6px 12px' }}>
                Save Story
              </Btn>
              <Btn 
                onClick={() => {
                  setBackstoryText(state.character.backstory);
                  setIsEditingBackstory(false);
                }} 
                variant="secondary"
                style={{ padding: '6px 12px' }}
              >
                Cancel
              </Btn>
            </div>
          </div>
        ) : (
          <div>
            {state.character.backstory ? (
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '11px', color: 'var(--text-1)' }}>
                {state.character.backstory}
              </p>
            ) : (
              <p style={{ color: 'var(--text-3)', fontSize: '11px', fontStyle: 'italic' }}>
                No origin story written yet. Define your starting purpose!
              </p>
            )}
            <Btn 
              onClick={() => setIsEditingBackstory(true)} 
              variant="secondary" 
              style={{ marginTop: '10px', padding: '4px 10px', fontSize: '10px' }}
            >
              📝 Edit Story
            </Btn>
          </div>
        )}
      </Card>

      {/* 3. Skill Tree Development */}
      <div className="section-label">SKILL TREE PATHS</div>
      <Card>
        <SkillTree skillTree={state.skillTree} onUnlockNode={onUnlockSkillNode} />
      </Card>

      {/* 4. Title Ladder List */}
      <div className="section-label">LADDER OF TITLES</div>
      <Card style={{ padding: '8px 16px' }}>
        <div style={styles.ladderList}>
          {TITLES.map(([xpReq, titleName]) => {
            const isUnlocked = state.character.totalXP >= xpReq;
            const isCurrent = state.character.epithet === titleName;
            
            return (
              <div 
                key={titleName}
                style={{
                  ...styles.ladderRow,
                  opacity: isUnlocked ? 1 : 0.4,
                  borderLeft: isCurrent ? '3px solid var(--purple)' : '3px solid transparent',
                  paddingLeft: isCurrent ? '8px' : '4px'
                }}
              >
                <span style={{ 
                  ...styles.ladderTitle, 
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  color: isCurrent ? 'var(--purple)' : 'var(--text-1)' 
                }}>
                  {titleName} {isCurrent && '🏆'}
                </span>
                <span style={styles.ladderXp}>{xpReq.toLocaleString()} XP</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  classPrompt: {
    fontSize: '11px',
    color: 'var(--text-2)',
    lineHeight: '1.4'
  },
  classCard: {
    padding: '12px',
    backgroundColor: 'var(--bg-2)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    marginBottom: 0
  },
  classHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  },
  classIcon: {
    fontSize: '24px'
  },
  className: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'var(--text-1)'
  },
  classDesc: {
    fontSize: '10px',
    color: 'var(--text-2)',
    flex: 1,
    lineHeight: '1.4'
  },
  activeClassCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap'
  },
  activeClassLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  activeClassIcon: {
    fontSize: '38px',
    userSelect: 'none'
  },
  activeClassName: {
    fontSize: '15px',
    fontWeight: 'bold'
  },
  activeClassSubtitle: {
    fontSize: '11px',
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '.05em'
  },
  activeClassRight: {
    flex: 1,
    minWidth: '200px'
  },
  ladderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '4px 0'
  },
  ladderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    padding: '2px 0'
  },
  ladderTitle: {
    fontSize: '11px'
  },
  ladderXp: {
    color: 'var(--text-3)',
    fontSize: '10px'
  }
};

export default Character;
