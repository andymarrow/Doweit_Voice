"use client";
import React, { useState } from 'react';
import {
  User, Bell, Lock, CreditCard, Globe, Shield,
  Save, CheckCircle2, Camera, Trash2, AlertTriangle,
  Zap, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'profile',       label: 'Profile',       icon: User,       desc: 'Your personal info and avatar' },
  { id: 'notifications', label: 'Notifications', icon: Bell,       desc: 'Alerts and reminder settings' },
  { id: 'security',      label: 'Security',      icon: Lock,       desc: 'Password and 2FA' },
  { id: 'billing',       label: 'Billing',       icon: CreditCard, desc: 'Subscription and invoices' },
  { id: 'integrations',  label: 'Integrations',  icon: Globe,      desc: 'Connect external tools' },
];

export const TraineeSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 text-xs font-medium transition-all outline-none";

  const renderProfile = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden shadow-xl shadow-purple-200">
            <span className="text-white font-black text-3xl">T</span>
          </div>
          <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-white border border-gray-100 shadow-lg text-gray-500 hover:text-purple-600 transition-colors">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h3 className="text-base font-black tracking-tight">Profile Picture</h3>
          <p className="text-xs text-gray-400">JPG, GIF or PNG. Max 2 MB.</p>
          <div className="flex gap-2 mt-3">
            <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black hover:from-purple-700 hover:to-blue-700 transition-all">Upload New</button>
            <button className="px-4 py-1.5 rounded-xl border border-gray-100 text-[10px] font-bold hover:bg-gray-50 transition-all text-gray-500">Remove</button>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { label: 'Full Name',   defaultValue: 'Alex Johnson',        type: 'text' },
          { label: 'Email',       defaultValue: 'alex.j@email.com',    type: 'email' },
          { label: 'Job Title',   defaultValue: 'Software Engineer',   type: 'text' },
          { label: 'Target Role', defaultValue: 'Senior Engineer',     type: 'text' },
        ].map(({ label, defaultValue, type }) => (
          <div key={label} className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</label>
            <input type={type} defaultValue={defaultValue} className={inputCls} />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Bio</label>
        <textarea
          rows={3}
          defaultValue="Preparing for senior engineering interviews. Focused on system design and DSA."
          className={cn(inputCls, 'resize-none')}
        />
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Smart notif banner */}
      <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-purple-100 text-purple-600 flex-shrink-0">
          <Zap size={18} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-purple-900">AI Reminders</h4>
          <p className="text-[11px] text-purple-700">Smart nudges to keep your training streak alive.</p>
        </div>
        <button className="w-10 h-5 rounded-full bg-purple-600 relative flex-shrink-0">
          <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
        </button>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Session Reminders',     desc: 'Daily reminder to complete a training session.' },
          { label: 'Score Achievements',    desc: 'Celebrate when you hit a new personal best.' },
          { label: 'New Agents Available',  desc: 'Get notified when new AI coaches are added.' },
          { label: 'Token Balance Alerts',  desc: 'Notify when tokens are running low.' },
          { label: 'Weekly Progress Report',desc: 'Summary of your training performance each week.' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all">
            <div>
              <h5 className="text-xs font-bold">{item.label}</h5>
              <p className="text-[10px] text-gray-400">{item.desc}</p>
            </div>
            <button className="w-10 h-5 rounded-full bg-gray-200 relative flex-shrink-0">
              <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const placeholder = (icon, title, desc, btnLabel) => (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center">
        {React.createElement(icon, { size: 30 })}
      </div>
      <div>
        <h3 className="text-base font-black tracking-tight">{title}</h3>
        <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">{desc}</p>
      </div>
      <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-200">
        {btnLabel}
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight">Account Settings</h2>
          <p className="text-xs text-gray-400">Manage your preferences and profile.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg',
            isSaving
              ? 'bg-purple-100 text-purple-600 shadow-none'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-purple-200'
          )}
        >
          {isSaving ? <CheckCircle2 size={15} className="animate-in zoom-in" /> : <Save size={15} />}
          {isSaving ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-7">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-1.5">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group',
                activeTab === s.id ? 'bg-white shadow-md border border-gray-100' : 'hover:bg-white/50'
              )}
            >
              <div className={cn(
                'p-2 rounded-xl transition-all',
                activeTab === s.id ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600'
              )}>
                <s.icon size={16} />
              </div>
              <div className="min-w-0">
                <p className={cn('text-xs font-bold', activeTab === s.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900')}>{s.label}</p>
                <p className="text-[9px] text-gray-400 truncate">{s.desc}</p>
              </div>
            </button>
          ))}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <button className="w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-7">
              {activeTab === 'profile'       && renderProfile()}
              {activeTab === 'notifications' && renderNotifications()}
              {activeTab === 'security'      && placeholder(Shield,     'Security Settings',       'Manage your password and two-factor authentication to keep your account safe.',       'Enable 2FA')}
              {activeTab === 'billing'       && placeholder(CreditCard,  'Billing & Subscription',  'View your plan, download invoices, and update your payment method.',                 'Manage Billing')}
              {activeTab === 'integrations'  && placeholder(Globe,       'App Integrations',        'Connect tools like Slack, LinkedIn, and Google Calendar to your training workflow.', 'Browse Apps')}
            </div>
          </div>

          {/* Danger Zone */}
          {activeTab === 'profile' && (
            <div className="mt-6 p-5 rounded-2xl border border-red-100 bg-red-50/30 space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={18} />
                <h4 className="text-sm font-black tracking-tight">Danger Zone</h4>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800">Delete Account</p>
                  <p className="text-[10px] text-gray-400">All your data will be permanently removed. This cannot be undone.</p>
                </div>
                <button className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[10px] font-bold hover:bg-red-50 transition-all">Delete Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
