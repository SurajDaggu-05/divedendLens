import React, { useState } from 'react';
import { RefreshCw, RotateCcw, ShieldCheck, LogOut } from 'lucide-react';
import { triggerSwarmRefresh, resetDemoData } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../lib/format';

interface NavbarProps {
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSignOut }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { user, logout } = useAuth();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await triggerSwarmRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 800);
  };

  const handleReset = async () => {
    if (confirm('Reset demo state to default seed data?')) {
      setIsResetting(true);
      await resetDemoData();
      setTimeout(() => {
        setIsResetting(false);
        window.location.reload();
      }, 800);
    }
  };

  const handleSignOutAction = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await logout();
    }
  };

  const userName = user?.name || 'User';
  const initials = getInitials(userName);

  return (
    <header className="h-16 bg-white border-b border-border sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
          D
        </div>
        <div>
          <span className="font-bold text-base text-text tracking-tight">DividendLens</span>
          <span className="ml-2.5 inline-flex items-center gap-1 text-[11px] font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            Swarm Prototype
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-text text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          title="Trigger Swarm Refresh Cycle"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          <span>{isRefreshing ? 'Refreshing Swarm...' : 'Refresh Swarm Data'}</span>
        </button>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="px-3 py-1.5 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          title="Reset Demo Data State"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo</span>
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-border">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <span className="text-xs font-medium text-text">{userName}</span>
          </div>

          <button
            onClick={handleSignOutAction}
            className="p-1.5 rounded-lg border border-border bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 text-xs font-medium transition-colors cursor-pointer"
            title="Sign Out to Return to Sign In Screen"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
