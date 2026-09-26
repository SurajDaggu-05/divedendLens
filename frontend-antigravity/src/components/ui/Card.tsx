import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action, subtitle }) => {
  return (
    <div className={`bg-white rounded-xl border border-border shadow-xs overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-text">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
