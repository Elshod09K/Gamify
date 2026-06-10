import React from 'react';
import type { StartupTracker } from '../../types';

interface StartupTreeProps {
  startup: StartupTracker;
}

export function StartupTree({ startup }: StartupTreeProps) {
  const currentStage = startup.stage;

  return (
    <div style={styles.outerContainer}>
      <div style={styles.scrollWrapper}>
        <div style={styles.treeContainer}>
          {startup.stages.map((stageName, idx) => {
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;
            const isFuture = idx > currentStage;

            // Styles based on status
            const circleColor = isCompleted
              ? 'var(--teal)'
              : isCurrent
              ? 'rgba(29, 158, 117, 0.15)'
              : 'rgba(128, 128, 128, 0.1)';

            const borderStyle = isCompleted
              ? '1.5px solid var(--teal)'
              : isCurrent
              ? '1.5px dashed var(--teal)'
              : '1.5px solid var(--border-2)';

            const textColor = isCurrent
              ? 'var(--teal)'
              : isCompleted
              ? 'var(--text-1)'
              : 'var(--text-3)';

            return (
              <React.Fragment key={idx}>
                {/* Node */}
                <div style={styles.node}>
                  <div 
                    className={isCurrent ? 'pulse-indicator' : ''}
                    style={{
                      ...styles.circle,
                      backgroundColor: circleColor,
                      border: borderStyle,
                      color: isCompleted ? '#ffffff' : isCurrent ? 'var(--teal)' : 'var(--text-3)'
                    }}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div style={{ ...styles.label, color: textColor }}>
                    {stageName}
                  </div>
                </div>

                {/* Connecting Line */}
                {idx < startup.stages.length - 1 && (
                  <div 
                    style={{
                      ...styles.connector,
                      backgroundColor: isCompleted ? 'var(--teal)' : 'var(--border-2)'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  outerContainer: {
    width: '100%',
    overflow: 'hidden',
    padding: '8px 0'
  },
  scrollWrapper: {
    overflowX: 'auto',
    width: '100%',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  treeContainer: {
    display: 'flex',
    alignItems: 'center',
    minWidth: '600px', // Ensure it doesn't wrap, forces horizontal scroll
    justifyContent: 'space-between',
    padding: '10px 16px'
  },
  node: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    width: '74px',
    flexShrink: 0
  },
  circle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '11px',
    transition: 'all 0.3s ease',
    userSelect: 'none'
  },
  label: {
    fontSize: '9px',
    textAlign: 'center',
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 500
  },
  connector: {
    flex: 1,
    height: '1.5px',
    minWidth: '16px',
    alignSelf: 'center',
    transform: 'translateY(-8px)', // align with circle centers (approximate based on labels height)
    transition: 'background-color 0.3s ease'
  }
};

export default StartupTree;
