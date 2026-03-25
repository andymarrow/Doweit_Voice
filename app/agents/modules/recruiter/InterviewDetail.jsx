import React, { useState } from 'react';
import {
  ChevronLeft,
  Users,
  Clock,
  Target,


  ExternalLink,




  FileText,





  Search,
  Filter,
  Trash2,
  UserCheck,
  UserX,
  Download,
  Plus,
  Edit,
  Mic,


  Zap,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ShoppingBag } from


'lucide-react';
import { cn } from '../../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell } from





'recharts';










const scoreData = [
{ name: 'Technical', score: 85 },
{ name: 'Comm.', score: 72 },
{ name: 'Problem', score: 90 },
{ name: 'Culture', score: 88 },
{ name: 'Confidence', score: 75 }];


const statusData = [
{ name: 'Completed', value: 45, color: '#10b981' },
{ name: 'In Progress', value: 25, color: '#3b82f6' },
{ name: 'Not Started', value: 30, color: '#94a3b8' }];


export const InterviewDetail = ({ interviewId, onBack, activeTab, onTabChange }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const renderDashboard = () =>
  <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
      { label: 'Total Candidates', value: '156', icon: Users, color: 'text-blue-600' },
      { label: 'Avg. Fit Score', value: '78%', icon: Target, color: 'text-emerald-600' },
      { label: 'Avg. Duration', value: '24m', icon: Clock, color: 'text-orange-600' },
      { label: 'Shortlisted', value: '12', icon: UserCheck, color: 'text-purple-600' },
      { label: 'Total Hired', value: '3', icon: Briefcase, color: 'text-pink-600' },
      { label: 'AI Confidence', value: '94%', icon: Zap, color: 'text-yellow-600' }].
      map((stat, i) =>
      <div key={i} className="p-3 rounded-xl bg-white border border-black/5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon size={12} className={stat.color} />
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
            <h3 className="text-base font-bold">{stat.value}</h3>
          </div>
      )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
          <h3 className="text-sm font-bold mb-4">Score Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
          <h3 className="text-sm font-bold mb-4">Interview Status Breakdown</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value">
                
                  {statusData.map((entry, index) =>
                <Cell key={`cell-${index}`} fill={entry.color} />
                )}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>;


  const renderCandidates = () => {
    if (selectedCandidate) {
      return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900">
              
              <ChevronLeft size={16} />
              Back to Candidates
            </button>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100">
                Reject Candidate
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-2">
                <Download size={14} />
                Export Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-white border border-black/5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold">View Profile</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border border-black/5">
                    <img src={`https://picsum.photos/seed/${selectedCandidate.name}/200/200`} alt="" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold">{selectedCandidate.name}</h4>
                    <p className="text-xs text-muted-foreground">{selectedCandidate.email}</p>
                  </div>
                </div>
                <button className="w-full py-2 rounded-lg border border-black/5 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-2">
                  <FileText size={14} />
                  View CV / Resume
                </button>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2">
                <h3 className="text-sm font-bold text-emerald-900">AI Evaluation</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-emerald-600">{selectedCandidate.score}%</span>
                  <span className="text-xs font-bold text-emerald-700 mb-1">Fit Score</span>
                </div>
                <div className="pt-2">
                  <div className="h-1.5 w-full bg-emerald-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600" style={{ width: `${selectedCandidate.score}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
                <h3 className="text-sm font-bold mb-4">Shortlist Candidate</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Move this candidate to the next stage of the recruitment process.
                </p>
                <button className="w-full py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black">
                  Shortlist Now
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
                <h3 className="text-sm font-bold mb-4">View Transcript</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                  { role: 'ai', text: 'Can you describe your experience with React and state management?' },
                  { role: 'user', text: 'I have been working with React for over 4 years. I usually prefer Redux Toolkit for large-scale applications, but I am also proficient with Context API and Zustand for smaller projects.' },
                  { role: 'ai', text: 'That sounds great. How do you handle performance optimization in React?' },
                  { role: 'user', text: 'I use memoization techniques like useMemo and useCallback. I also focus on code-splitting using React.lazy and Suspense to reduce initial bundle size.' }].
                  map((msg, i) =>
                  <div key={i} className={cn(
                    "p-3 rounded-xl text-xs leading-relaxed",
                    msg.role === 'ai' ? "bg-gray-50 border border-black/5 mr-12" : "bg-emerald-50 border border-emerald-100 ml-12"
                  )}>
                      <p className="font-bold mb-1 uppercase text-[8px] tracking-widest opacity-50">
                        {msg.role === 'ai' ? 'Interviewer' : 'Candidate'}
                      </p>
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>);

    }

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-black/5 text-xs" />
            
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 rounded-xl bg-white border border-black/5 text-xs font-bold">
              <option>Evaluation Status</option>
              <option>Recommended</option>
              <option>Review</option>
              <option>Rejected</option>
            </select>
            <button className="p-2 rounded-xl bg-white border border-black/5 hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-black/5">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Candidate Name</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fit Score</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confidence</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
              { name: 'Sarah Johnson', email: 'sarah.j@example.com', score: 92, confidence: 88, status: 'Completed', date: '2024-03-12' },
              { name: 'Michael Chen', email: 'm.chen@example.com', score: 84, confidence: 76, status: 'Completed', date: '2024-03-11' },
              { name: 'Emma Wilson', email: 'emma.w@example.com', score: 76, confidence: 92, status: 'In Progress', date: '2024-03-10' }].
              map((c, i) =>
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-emerald-600">{c.score}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-blue-600">{c.confidence}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                    c.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                  )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.date}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                      onClick={() => setSelectedCandidate(c)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900">
                      
                        <ExternalLink size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                        <UserX size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>);

  };

  const renderConfiguration = () =>
  <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-6">
            <h3 className="text-sm font-bold">Identity & Persona</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden border border-black/5">
                  <img src="https://picsum.photos/seed/agent/200/200" alt="" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-white border border-black/5 shadow-sm text-gray-500">
                  <Edit size={14} />
                </button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Internal Agent Name</label>
                  <input type="text" defaultValue="Viktor" className="w-full px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Conversation Style</label>
                  <select className="w-full px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs">
                    <option>Formal & Professional</option>
                    <option>Friendly & Casual</option>
                    <option>Strict & Technical</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interviewer Voice</label>
                <select className="w-full px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs">
                  <option>Professional Male (US)</option>
                  <option>Professional Female (UK)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Voice AI Platform</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-xs font-bold">
                  <Mic size={14} className="text-emerald-600" />
                  Vapi AI
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Greeting Message</label>
              <textarea rows={3} defaultValue="Hello! I'm Viktor. I'll be conducting your interview today. Ready to start?" className="w-full px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs resize-none" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-6">
            <h3 className="text-sm font-bold">Marketplace Settings</h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold">Publish to Marketplace</p>
                  <p className="text-[10px] text-muted-foreground">Allow others to use this agent</p>
                </div>
              </div>
              <button className="w-10 h-5 rounded-full bg-emerald-600 relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Owner Access</p>
                  <div className="w-8 h-4 rounded-full bg-emerald-600 relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" /></div>
                </div>
                <p className="text-[10px] text-emerald-800">Full control, editable prompt & knowledge base.</p>
              </div>
              <div className="p-4 rounded-xl border border-black/5 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Train-Only</p>
                  <div className="w-8 h-4 rounded-full bg-gray-200 relative"><div className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white" /></div>
                </div>
                <p className="text-[10px] text-gray-500">Practice mode access, locked configuration.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Token Price</label>
                <input type="number" defaultValue="50" className="w-full px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button className="px-4 py-2 rounded-lg border border-black/5 text-xs font-bold hover:bg-gray-50">Cancel</button>
                <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">Save Config</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-6">
            <h3 className="text-sm font-bold">Job Context</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Job Title</label>
                <input type="text" defaultValue="Senior Frontend Engineer" className="w-full px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Job Description</label>
                <div className="flex gap-2 mb-2">
                  <button className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">Paste Text</button>
                  <button className="flex-1 py-1.5 rounded-lg bg-gray-50 text-gray-500 text-[10px] font-bold border border-black/5">Upload PDF</button>
                </div>
                <textarea rows={6} className="w-full px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs resize-none" defaultValue="We are looking for a Senior Frontend Engineer to join our team..." />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-6">
            <h3 className="text-sm font-bold">Knowledge Base</h3>
            <p className="text-[10px] text-muted-foreground">Additional training material for the AI interviewer.</p>
            <div className="space-y-2">
              {[
            { name: 'Company Culture.pdf', size: '1.2 MB' },
            { name: 'Engineering Standards.docx', size: '850 KB' }].
            map((doc, i) =>
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-black/5">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-600" />
                    <span className="text-[10px] font-bold">{doc.name}</span>
                  </div>
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 size={12} />
                  </button>
                </div>
            )}
              <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 hover:border-emerald-500 hover:text-emerald-600 transition-all">
                + Upload Material
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;


  const renderEvaluation = () =>
  <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">Evaluation Criteria</h3>
          <p className="text-[10px] text-muted-foreground">Define how candidates are scored by the AI.</p>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-2">
          <Plus size={14} />
          Add Criteria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
      { name: 'Technical Knowledge', weight: 40, range: '0-100', method: 'AI Semantic Analysis' },
      { name: 'Communication Skills', weight: 20, range: '0-100', method: 'Tone & Sentiment' },
      { name: 'Problem Solving', weight: 20, range: '0-100', method: 'Logic Evaluation' },
      { name: 'Cultural Fit', weight: 10, range: '0-100', method: 'Value Alignment' },
      { name: 'Confidence', weight: 10, range: '0-100', method: 'Behavioral Analysis' }].
      map((criteria, i) =>
      <div key={i} className="p-4 rounded-xl bg-white border border-black/5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="text-xs font-bold">{criteria.name}</h4>
              <button className="p-1 rounded-lg hover:bg-gray-50 text-gray-400">
                <Edit size={12} />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Importance Weight</span>
                <span className="font-bold text-emerald-600">{criteria.weight}%</span>
              </div>
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600" style={{ width: `${criteria.weight}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-gray-50">
                <p className="text-[8px] uppercase font-bold text-muted-foreground mb-0.5">Method</p>
                <p className="text-[9px] font-bold">{criteria.method}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <p className="text-[8px] uppercase font-bold text-muted-foreground mb-0.5">Range</p>
                <p className="text-[9px] font-bold">{criteria.range}</p>
              </div>
            </div>
          </div>
      )}
      </div>
    </div>;


  const renderQuestions = () =>
  <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">Interview Questions</h3>
          <p className="text-[10px] text-muted-foreground">Manage the questions the AI will ask during the interview.</p>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-2">
          <Plus size={14} />
          Add Question
        </button>
      </div>

      <div className="space-y-3">
        {[
      { text: 'Can you explain the difference between useMemo and useCallback?', type: 'Technical', difficulty: 'Medium' },
      { text: 'Describe a time you had to resolve a conflict within your team.', type: 'Behavioral', difficulty: 'Medium' },
      { text: 'How would you architect a real-time chat application using React?', type: 'System Design', difficulty: 'Hard' },
      { text: 'What are the pros and cons of using CSS-in-JS vs Tailwind CSS?', type: 'Technical', difficulty: 'Low' }].
      map((q, i) =>
      <div key={i} className="p-4 rounded-xl bg-white border border-black/5 shadow-sm flex items-start justify-between group">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
                {i + 1}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium leading-relaxed">{q.text}</p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[8px] font-bold uppercase tracking-wider">{q.type}</span>
                  <span className={cn(
                "px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider",
                q.difficulty === 'Hard' ? "bg-red-50 text-red-600" : q.difficulty === 'Medium' ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
              )}>
                    {q.difficulty}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-900">
                <Edit size={14} />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
      )}
      </div>
    </div>;


  const renderActivity = () =>
  <div className="space-y-6 animate-in fade-in duration-500">
      <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
        <h3 className="text-sm font-bold mb-6">System Activity Logs</h3>
        <div className="space-y-6">
          {[
        { type: 'CANDIDATE COMPLETED', user: 'Sarah Johnson', time: '2h ago', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { type: 'EVALUATION FINISHED', user: 'AI System', time: '2h ago', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
        { type: 'ANTI CHEAT FLAG', user: 'Michael Chen', time: '5h ago', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { type: 'MARKETPLACE PURCHASE', user: 'TechCorp Inc.', time: '1d ago', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' }].
        map((log, i) =>
        <div key={i} className="flex items-start gap-4 relative">
              {i !== 3 && <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-gray-100" />}
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", log.bg, log.color)}>
                <log.icon size={16} />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest">{log.type}</p>
                  <span className="text-[10px] text-muted-foreground">{log.time}</span>
                </div>
                <p className="text-xs text-gray-600">
                  <span className="font-bold text-gray-900">{log.user}</span> 
                  {log.type === 'CANDIDATE COMPLETED' ? ' successfully finished the interview session.' :
              log.type === 'EVALUATION FINISHED' ? ' generated the final fit score for Sarah Johnson.' :
              log.type === 'ANTI CHEAT FLAG' ? ' detected multiple voices during the session.' :
              ' purchased the "Senior Frontend" agent license.'}
                </p>
              </div>
            </div>
        )}
        </div>
      </div>
    </div>;


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-black/5 transition-all">
            
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Senior Frontend Engineer</h2>
            <p className="text-xs text-muted-foreground">ID: {interviewId} • Created 2 weeks ago</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-black/5 bg-white text-xs font-bold hover:bg-gray-50">
            Edit Agent
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
            Share Link
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'candidate' && renderCandidates()}
        {activeTab === 'configuration' && renderConfiguration()}
        {activeTab === 'evaluation' && renderEvaluation()}
        {activeTab === 'questions' && renderQuestions()}
        {activeTab === 'activity' && renderActivity()}
      </div>
    </div>);

};