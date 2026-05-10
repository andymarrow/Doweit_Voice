import React, { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  CreditCard,
  Globe,
  Shield,



  Save,
  CheckCircle2,
  Camera,
  Trash2,
  AlertTriangle,

  Zap,
  LogOut } from

'lucide-react';
import { cn } from '@/lib/utils';

const settingsSections = [
{ id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information and public profile.' },
{ id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure how you receive alerts and updates.' },
{ id: 'security', label: 'Security', icon: Lock, description: 'Protect your account with 2FA and password management.' },
{ id: 'billing', label: 'Billing', icon: CreditCard, description: 'Manage your subscription and payment methods.' },
{ id: 'integrations', label: 'Integrations', icon: Globe, description: 'Connect with other tools like Slack and LinkedIn.' }];


export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const renderProfileSettings = () =>
  <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            <img src="https://picsum.photos/seed/recruiter/200/200" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-white border border-black/5 shadow-lg text-gray-600 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight">Profile Picture</h3>
          <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
          <div className="flex gap-2 mt-3">
            <button className="px-4 py-1.5 rounded-xl bg-gray-900 text-white text-[10px] font-bold hover:bg-black transition-all">Upload New</button>
            <button className="px-4 py-1.5 rounded-xl border border-black/5 text-[10px] font-bold hover:bg-gray-50 transition-all">Remove</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
          <input type="text" defaultValue="Sarah Jenkins" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-medium transition-all" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
          <input type="email" defaultValue="sarah.j@company.com" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-medium transition-all" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Job Title</label>
          <input type="text" defaultValue="Senior Talent Acquisition" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-medium transition-all" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Company</label>
          <input type="text" defaultValue="TechFlow Inc." className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-medium transition-all" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bio</label>
        <textarea rows={4} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-medium transition-all resize-none" defaultValue="Passionate about connecting top talent with innovative companies. 8+ years of experience in tech recruitment." />
      </div>
    </div>;


  const renderNotificationSettings = () =>
  <div className="space-y-6 animate-in fade-in duration-500">
      <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
          <Zap size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900">Smart Notifications</h4>
          <p className="text-[11px] text-emerald-700">AI-powered alerts for top-tier candidates matching your criteria.</p>
        </div>
        <div className="ml-auto">
          <button className="w-10 h-5 rounded-full bg-emerald-600 relative transition-all">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {[
      { label: 'New Candidate Applications', desc: 'Get notified when someone applies to your job.' },
      { label: 'Interview Reminders', desc: 'Receive alerts 15 minutes before an interview starts.' },
      { label: 'Evaluation Reports', desc: 'Get a summary when AI completes an interview analysis.' },
      { label: 'Token Balance Alerts', desc: 'Notify when tokens are running low.' }].
      map((item, i) =>
      <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-black/5 hover:bg-gray-50 transition-all">
            <div>
              <h5 className="text-xs font-bold">{item.label}</h5>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
            <button className="w-10 h-5 rounded-full bg-gray-200 relative transition-all">
              <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
      )}
      </div>
    </div>;


  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Account Settings</h2>
          <p className="text-xs text-muted-foreground">Manage your account preferences and configurations.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg",
            isSaving ?
            "bg-emerald-100 text-emerald-600 shadow-none" :
            "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
          )}>
          
          {isSaving ? <CheckCircle2 size={16} className="animate-in zoom-in" /> : <Save size={16} />}
          {isSaving ? 'Changes Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {settingsSections.map((section) =>
          <button
            key={section.id}
            onClick={() => setActiveTab(section.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group",
              activeTab === section.id ?
              "bg-white shadow-md border border-black/5" :
              "hover:bg-white/50"
            )}>
            
              <div className={cn(
              "p-2 rounded-xl transition-all",
              activeTab === section.id ?
              "bg-emerald-600 text-white" :
              "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-emerald-600"
            )}>
                <section.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className={cn(
                "text-xs font-bold transition-colors",
                activeTab === section.id ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900"
              )}>
                  {section.label}
                </p>
                <p className="text-[9px] text-muted-foreground truncate">{section.description}</p>
              </div>
            </button>
          )}
          <div className="pt-4 mt-4 border-t border-black/5">
            <button className="w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
            <div className="p-8">
              {activeTab === 'profile' && renderProfileSettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'security' &&
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
                  <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Shield size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Security Settings</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">Configure your password, 2FA, and active sessions to keep your account secure.</p>
                  </div>
                  <button className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-all">Enable 2FA</button>
                </div>
              }
              {activeTab === 'billing' &&
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CreditCard size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Billing & Subscription</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">Manage your current plan, view invoices, and update payment methods.</p>
                  </div>
                  <button className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-all">Manage Subscription</button>
                </div>
              }
              {activeTab === 'integrations' &&
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
                  <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Globe size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">App Integrations</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">Connect your favorite tools to streamline your recruitment workflow.</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-all">Browse Apps</button>
                  </div>
                </div>
              }
            </div>
          </div>

          {/* Danger Zone */}
          {activeTab === 'profile' &&
          <div className="mt-8 p-6 rounded-3xl border border-red-100 bg-red-50/30 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle size={20} />
                <h4 className="text-sm font-black tracking-tight">Danger Zone</h4>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">Delete Account</p>
                  <p className="text-[10px] text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
                </div>
                <button className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[10px] font-bold hover:bg-red-50 transition-all">Delete Account</button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>);

};