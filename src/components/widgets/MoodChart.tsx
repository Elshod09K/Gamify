import React from 'react';
import { MoodEntry } from '../../types';

interface MoodChartProps {
  moods: MoodEntry[];
}

const MOOD_META = {
  5: { color: 'var(--green)', label: 'Ecstatic' },
  4: { color: 'var(--teal)', label: 'Good' },
  3: { color: 'var(--amber)', label: 'Neutral' },
  2: { color: 'var(--coral)', label: 'Low' },
  1: { color: '#b91c1c', label: 'Awful' } // Deep red
};

export function MoodChart({ moods }: MoodChartProps) {
  const today = new Date();
  
  // Generate last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    const k = d.toISOString().slice(0, 10);
    
    // Find matching mood entry
    // Mood logs could contain multiple entries for a day, take the last one
    const matching = moods.filter(m => m.date === k);
    const lastVal = matching.length > 0 ? matching[matching.length - 1].val : null;

    return {
      dateStr: k,
      val: lastVal,
      label: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
    };
  });

  return (
    <div style={styles.container}>
      <div style={styles.chartArea}>
        {days.map((d, idx) => {
          const hasMood = d.val !== null;
          const val = d.val || 1;
          const heightPct = hasMood ? (val / 5) * 100 : 8; // Small height for empty
          const meta = hasMood ? MOOD_META[val] : null;
          const barColor = meta ? meta.color : 'var(--bg-3)';
          const tooltip = hasMood 
            ? `${d.label}: ${meta?.label} (${val}/5)` 
            : `${d.label}: No entry`;

          return (
            <div key={idx} style={styles.barColumn}>
              {/* Bar Container */}
              <div style={styles.barTrack} data-tooltip={tooltip}>
                <div
                  style={{
                    ...styles.barFill,
                    height: `${heightPct}%`,
                    backgroundColor: barColor,
                    borderRadius: hasMood ? '4px 4px 0 0' : '2px'
                  }}
                />
              </div>
              {/* Date Label */}
              <div style={styles.dateLabel}>{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    padding: '8px 0'
  },
  chartArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '110px',
    borderBottom: '0.5px solid var(--border)',
    paddingBottom: '4px',
    gap: '4px'
  },
  barColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    height: '100%'
  },
  barTrack: {
    width: '100%',
    height: '92px',
    display: 'flex',
    alignItems: 'flex-end',
    cursor: 'pointer',
    borderRadius: '4px',
    padding: '0 2px'
  },
  barFill: {
    width: '100%',
    transition: 'height 0.3s ease, background-color 0.3s ease'
  },
  dateLabel: {
    fontSize: '8px',
    color: 'var(--text-3)',
    marginTop: '4px',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  }
};

export default MoodChart;
