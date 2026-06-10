import React from 'react';
import type { SkillTree as SkillTreeType, SkillNode } from '../../types';

interface SkillTreeProps {
  skillTree: SkillTreeType;
  onUnlockNode: (nodeId: string) => void;
}

export function SkillTree({ skillTree, onUnlockNode }: SkillTreeProps) {
  // Split nodes into Web track and CS track
  const webTrack = skillTree.nodes.filter(n => n.row === 0);
  const csTrack = skillTree.nodes.filter(n => n.row === 1);

  const canUnlock = (node: SkillNode) => {
    if (node.unlocked) return false;
    // Check if all dependency nodes are unlocked
    return node.deps.every(depId => {
      const depNode = skillTree.nodes.find(n => n.id === depId);
      return depNode?.unlocked === true;
    });
  };

  const renderTrack = (nodes: SkillNode[], title: string) => {
    return (
      <div style={styles.trackContainer}>
        <div style={styles.trackTitle}>{title}</div>
        <div style={styles.nodesList}>
          {nodes.map((node, index) => {
            const isUnlocked = node.unlocked;
            const unlockable = canUnlock(node);
            const isLocked = !isUnlocked && !unlockable;

            let bgColor = 'var(--bg-2)';
            let borderColor = 'var(--border-2)';
            let textColor = 'var(--text-3)';
            let cursorStyle = 'default';

            if (isUnlocked) {
              bgColor = 'var(--blue)';
              borderColor = 'var(--blue)';
              textColor = '#ffffff';
            } else if (unlockable) {
              bgColor = 'rgba(55, 138, 221, 0.1)';
              borderColor = 'var(--blue)';
              textColor = 'var(--blue)';
              cursorStyle = 'pointer';
            }

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div
                  onClick={() => unlockable && onUnlockNode(node.id)}
                  style={{
                    ...styles.nodeBox,
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    color: textColor,
                    cursor: cursorStyle,
                    opacity: isLocked ? 0.4 : 1,
                  }}
                  title={
                    isUnlocked
                      ? 'Unlocked! (+XP Claimed)'
                      : unlockable
                      ? `Click to Unlock (+${node.xp} Mastery XP)`
                      : `Locked (Prerequisites needed: ${node.deps.join(', ')})`
                  }
                >
                  <div style={styles.nodeName}>{node.name}</div>
                  <div style={styles.nodeXp}>+{node.xp} XP</div>
                </div>

                {/* Connecting arrow */}
                {index < nodes.length - 1 && (
                  <div 
                    style={{ 
                      ...styles.arrow, 
                      color: nodes[index].unlocked ? 'var(--blue)' : 'var(--text-3)' 
                    }}
                  >
                    →
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {renderTrack(webTrack, "Web & Full-stack Development Track")}
      <div style={styles.divider} />
      {renderTrack(csTrack, "Computer Science & Algorithmic Foundation")}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    padding: '4px 0'
  },
  trackContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  trackTitle: {
    fontSize: '10px',
    color: 'var(--text-2)',
    fontWeight: 600
  },
  nodesList: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '8px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  nodeBox: {
    border: '1.5px solid',
    borderRadius: 'var(--radius)',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    minWidth: '110px',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  },
  nodeName: {
    fontSize: '11px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  nodeXp: {
    fontSize: '9px',
    opacity: 0.8
  },
  arrow: {
    fontSize: '16px',
    fontWeight: 'bold',
    userSelect: 'none',
    padding: '0 2px'
  },
  divider: {
    height: '0.5px',
    backgroundColor: 'var(--border)',
    margin: '4px 0'
  }
};

export default SkillTree;
