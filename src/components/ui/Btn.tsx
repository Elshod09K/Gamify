import React from 'react';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  className?: string;
}

export function Btn({ children, variant = 'primary', className = '', ...props }: BtnProps) {
  const btnClass = `btn-${variant} ${className}`;
  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
}
export default Btn;
