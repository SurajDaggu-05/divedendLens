import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  onSignOut?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, onSignOut }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB]">
      <Navbar onSignOut={onSignOut} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

