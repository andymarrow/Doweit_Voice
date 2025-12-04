// app/agents/recruiter/candidates/page.jsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiDownload, FiMail, FiPhone, FiExternalLink } from 'react-icons/fi';
import { uiColors, itemVariants } from '@/app/callagents/_constants/uiConstants';

const GLOBAL_CANDIDATES = [
    { id: 1, name: "Alice Johnson", role: "Senior React Dev", email: "alice@example.com", score: 92, status: "Shortlisted", applied: "2 days ago" },
    { id: 2, name: "Bob Smith", role: "Sales Rep", email: "bob@tech.com", score: 74, status: "Review", applied: "5 hrs ago" },
    { id: 3, name: "Charlie Day", role: "Sales Rep", email: "charlie@mail.com", score: 45, status: "Rejected", applied: "1 day ago" },
    { id: 4, name: "Dana White", role: "Senior React Dev", email: "dana@ufc.com", score: 88, status: "Shortlisted", applied: "3 days ago" },
    { id: 5, name: "Evan Wright", role: "Marketing Intern", email: "evan@write.com", score: 62, status: "Review", applied: "1 week ago" },
    { id: 6, name: "Fiona Gallagher", role: "Marketing Intern", email: "fiona@chi.com", score: 95, status: "Hired", applied: "2 weeks ago" },
];

export default function GlobalCandidatesPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = GLOBAL_CANDIDATES.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Candidate Database</h1>
                    <p className={`${uiColors.textSecondary}`}>Manage talent across all your active pipelines.</p>
                </div>
                <div className="flex gap-2">
                    <button className={`p-2 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} hover:bg-gray-200 dark:hover:bg-gray-700`}>
                        <FiFilter />
                    </button>
                    <button className={`p-2 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} hover:bg-gray-200 dark:hover:bg-gray-700`}>
                        <FiDownload />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className={`flex items-center px-4 py-3 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}>
                <FiSearch className={`mr-3 ${uiColors.textSecondary}`} />
                <input 
                    type="text" 
                    placeholder="Search by name, role, or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`bg-transparent outline-none w-full ${uiColors.textPrimary}`}
                />
            </div>

            {/* Table */}
            <div className={`flex-1 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm overflow-hidden`}>
                <div className="overflow-x-auto h-full">
                    <table className="w-full text-sm text-left">
                        <thead className={`text-xs uppercase bg-gray-50 dark:bg-gray-900/50 ${uiColors.textSecondary} sticky top-0`}>
                            <tr>
                                <th className="px-6 py-4 font-medium">Candidate</th>
                                <th className="px-6 py-4 font-medium">Role Applied For</th>
                                <th className="px-6 py-4 font-medium">Fit Score</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 text-right">Contact</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${uiColors.borderPrimary}`}>
                            {filtered.map((c) => (
                                <motion.tr 
                                    key={c.id} 
                                    variants={itemVariants} 
                                    initial="hidden" 
                                    animate="visible"
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 mr-3`}>
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className={`font-medium ${uiColors.textPrimary}`}>{c.name}</div>
                                            <div className={`text-xs ${uiColors.textSecondary}`}>{c.email}</div>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 ${uiColors.textPrimary}`}>{c.role}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${c.score > 80 ? 'text-green-600' : c.score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>{c.score}%</span>
                                            <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className={`h-full ${c.score > 80 ? 'bg-green-500' : c.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${c.score}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs border ${
                                            c.status === 'Hired' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                            c.status === 'Shortlisted' ? 'bg-green-100 text-green-700 border-green-200' :
                                            c.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-gray-100 text-gray-700 border-gray-200'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-gray-400">
                                            <button className="hover:text-blue-500"><FiMail /></button>
                                            <button className="hover:text-green-500"><FiPhone /></button>
                                            <button className="hover:text-cyan-500"><FiExternalLink /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}