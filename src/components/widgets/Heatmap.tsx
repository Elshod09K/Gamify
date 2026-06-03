import React from 'react';

interface HeatmapProps {
  heatmap: Record<string, number>;
}

export function Heatmap({ heatmap }: HeatmapProps) {
  const today = new Date();
  
  // Generate last 90 days
  const days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (89 - i));
    const k = d.toISOString().slice(0, 10);
    return {
      dateStr: k,
      xp: heatmap[k] || 0,
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    };
  });

  const maxXp = Math.max(...days.map(d => d.xp), 1);

  // Group into columns of 7 days (weeks) to represent a standard contribution grid
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>Last 90 days</div>
      <div style={styles.grid}>
        {/* Render columns of weeks */}
        {weeks.map((week, wIdx) => (
          <div key={wIdx} style={styles.column}>
            {week.map(d => {
              const opacity = d.xp === 0 
                ? 0.1 
                : 0.12 + 0.88 * (d.xp / maxXp);
              
              const color = d.xp === 0
                ? 'rgba(128, 128, 128, 0.1)'
                : `rgba(127, 119, 221, ${opacity})`;

              return (
                <div
                  key={d.dateStr}
                  className="heatmap-day"
                  style={{ backgroundColor: color }}
                  data-tooltip={`${d.label}: ${d.xp} XP`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div style={styles.legend}>
        <span style={styles.legendText}>less</span>
        <div style={styles.legendSquares}>
          <div style={{ ...styles.legendSquare, backgroundColor: 'rgba(128, 128, 128, 0.1)' }} />
          <div style={{ ...styles.legendSquare, backgroundColor: 'rgba(127, 119, 221, 0.25)' }} />
          <div style={{ ...styles.legendSquare, backgroundColor: 'rgba(127, 119, 221, 0.5)' }} />
          <div style={{ ...styles.legendSquare, backgroundColor: 'rgba(127, 119, 221, 0.75)' }} />
          <div style={{ ...styles.legendSquare, backgroundColor: 'var(--purple)' }} />
        </div>
        <span style={styles.legendText}>more</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%'
  },
  header: {
    fontSize: '10px',
    color: 'var(--text-3)'
  },
  grid: {
    display: 'flex',
    gap: '3px',
    overflowX: 'auto',
    paddingBottom: '6px',
    userSelect: 'none'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px'
  },
  legendText: {
    fontSize: '9px',
    color: 'var(--text-3)'
  },
  legendSquares: {
    display: 'flex',
    gap: '2px'
  },
  legendSquare: {
    width: '9px',
    height: '9px',
    borderRadius: '2px'
  }
};

export default Heatmap;
