import React from 'react';

interface XPBarProps {
  val: number;
  max: number;
  color: string;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function XPBar({ val, max, color, height = 5, className = '', style }: XPBarProps) {
  // Enforce boundary logic
  const pct = Math.max(0, Math.min(100, max > 0 ? Math.round((val / max) * 100) : 0));
  
  return (
    <div 
      className={`xp-bar-container ${className}`} 
      style={{ height, ...style }}
    >
      <div 
        className="xp-bar-fill" 
        style={{ 
          width: `${pct}%`, 
          backgroundColor: color 
        }} 
      />
    </div>
  );
}
export default XPBar;
