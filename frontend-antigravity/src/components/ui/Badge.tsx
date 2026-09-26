import React from 'react';

export type BadgeVariant =
  | 'valid'
  | 'verified'
  | 'estimate'
  | 'conflict'
  | 'warning'
  | 'stale'
  | 'failed'
  | 'user_reported'
  | 'simulated'
  | 'online'
  | 'offline'
  | 'info';

interface BadgeProps {
  variant?: BadgeVariant | string;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children, className = '' }) => {
  const getVariantStyles = (v: string): string => {
    switch (v) {
      case 'valid':
      case 'verified':
      case 'online':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'estimate':
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'conflict':
      case 'warning':
      case 'stale':
      case 'needs_review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'failed':
      case 'offline':
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'user_reported':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'simulated':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantStyles(
        variant
      )} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        ['valid', 'verified', 'online'].includes(variant) ? 'bg-emerald-500' :
        ['conflict', 'warning', 'stale'].includes(variant) ? 'bg-amber-500' :
        ['failed', 'offline'].includes(variant) ? 'bg-rose-500' :
        ['simulated'].includes(variant) ? 'bg-purple-500' : 'bg-blue-500'
      }`} />
      {children}
    </span>
  );
};
