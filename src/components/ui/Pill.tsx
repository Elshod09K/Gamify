import React from 'react';

interface PillProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Pill({ children, color = '#7F77DD', className = '', style }: PillProps) {
  const pillStyle: React.CSSProperties = {
    backgroundColor: `${color}18`, // 10% opacity in hex
    color: color,
    border: `0.5px solid ${color}44`,
    ...style
  };

  return (
    <span className={`pill ${className}`} style={pillStyle}>
      {children}
    </span>
  );
}
export default Pill;
