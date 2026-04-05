"use client";
import React from 'react';
import { cn } from '../../lib/utils';
import {





  ArrowUpRight,
  ArrowDownRight } from
'lucide-react';
import {


  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar } from
'recharts';

const radarData = [
{ subject: 'Technical', A: 120, fullMark: 150 },
{ subject: 'Communication', A: 98, fullMark: 150 },
{ subject: 'Problem Solving', A: 86, fullMark: 150 },
{ subject: 'Culture Fit', A: 99, fullMark: 150 },
{ subject: 'Confidence', A: 85, fullMark: 150 }];


export const Analysis = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Analysis</h2>
          <p className="text-xs text-muted-foreground">Deep dive into your hiring performance.</p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-1.5 rounded-lg border border-black/5 bg-white text-xs font-bold">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
        { label: 'Interviewed', value: '432', trend: '+12%', up: true },
        { label: 'Avg. Score', value: '78%', trend: '+5%', up: true },
        { label: 'Completion', value: '94%', trend: '+2%', up: true },
        { label: 'Drop-off', value: '6%', trend: '-1%', up: true }].
        map((stat, i) =>
        <div key={i} className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-lg font-bold">{stat.value}</h3>
              <div className={cn("text-[10px] font-bold flex items-center gap-0.5", stat.up ? "text-emerald-500" : "text-red-500")}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
          <h3 className="text-sm font-bold mb-4">Skill Radar</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#666' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="Candidates"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5} />
                
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
          <h3 className="text-sm font-bold mb-4">Progress</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
              { name: 'W1', score: 65 },
              { name: 'W2', score: 72 },
              { name: 'W3', score: 68 },
              { name: 'W4', score: 85 },
              { name: 'W5', score: 78 },
              { name: 'W6', score: 82 }]
              }>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
        <h3 className="text-sm font-bold mb-4">Question Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-50">
                <th className="pb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Question</th>
                <th className="pb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="pb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Avg Score</th>
                <th className="pb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Difficulty</th>
                <th className="pb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Failure Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
              { q: 'Explain REST vs GraphQL', type: 'Technical', score: '72%', diff: 'Medium', fail: '12%' },
              { q: 'Conflict resolution story', type: 'Behavioral', score: '85%', diff: 'Medium', fail: '5%' },
              { q: 'System design for notifications', type: 'Scenario', score: '58%', diff: 'Hard', fail: '24%' },
              { q: 'Why do you want to join us?', type: 'Culture', score: '92%', diff: 'Low', fail: '2%' }].
              map((row, i) =>
              <tr key={i} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-xs font-medium">{row.q}</td>
                  <td className="py-3 text-xs text-muted-foreground">{row.type}</td>
                  <td className="py-3 text-xs font-bold text-emerald-600">{row.score}</td>
                  <td className="py-3">
                    <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider",
                    row.diff === 'Hard' ? "bg-red-50 text-red-600" :
                    row.diff === 'Medium' ? "bg-orange-50 text-orange-600" :
                    "bg-emerald-50 text-emerald-600"
                  )}>
                      {row.diff}
                    </span>
                  </td>
                  <td className="py-3 text-xs font-medium text-red-500">{row.fail}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

};
