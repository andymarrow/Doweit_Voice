"use client";
import Sidebar from './Sidebar';
import { RefreshCw } from 'lucide-react';

const TITLES = {
  dashboard: 'Dashboard',
  wallet:    'Wallet — Tokens, Balances & Transactions',
  recruiter: 'Recruiter Sessions',
  trainee:   'Trainee Sessions',
};

export default function AdminLayout({ page, onNav, onLogout, onRefresh, refreshing, children }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Sidebar active={page} onNav={onNav} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-11 border-b border-gray-200 dark:border-gray-800 px-5 flex items-center justify-between shrink-0 bg-white dark:bg-gray-950">
          <h1 className="text-xs font-semibold text-gray-700 dark:text-gray-300">{TITLES[page]}</h1>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {children}
        </main>
      </div>
    </div>
  );
}
