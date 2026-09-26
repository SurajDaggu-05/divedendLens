import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PieChart,
  Calendar,
  History,
  AlertTriangle,
  Cpu,
  BookOpen
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/portfolio', label: 'Portfolio', icon: PieChart },
    { to: '/calendar', label: 'Dividend Calendar', icon: Calendar },
    { to: '/history', label: 'Payment History', icon: History },
    { to: '/alerts', label: 'Data Quality & Alerts', icon: AlertTriangle, badge: '1' },
    { to: '/activity', label: 'Swarm Agent Activity', icon: Cpu },
    { to: '/glossary', label: 'Glossary & Guide', icon: BookOpen },
  ];

  return (
    <aside className="w-60 bg-white border-r border-border min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-border mt-6">
        <h5 className="text-xs font-semibold text-slate-800 mb-1">Swarm Verification</h5>
        <p className="text-[11px] text-slate-500 leading-normal">
          Financial calculations are 100% deterministic code. Multi-agent validation flags discrepancies before estimates are displayed.
        </p>
      </div>
    </aside>
  );
};
