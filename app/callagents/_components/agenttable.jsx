// voice-agents-dashboard/_components/AgentTable.jsx
"use client";

import React from 'react';
// Remove Link import as we are using router.push instead
// import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter

import {
    FiMoreVertical, // Vertical ellipsis for actions
    FiChevronLeft, FiChevronRight, // Pagination arrows
} from 'react-icons/fi';

// Import shared constants
import {
    uiAccentClasses // Specific UI colors
} from '../_constants/uiConstants';


// --- Sample Data (Moved here as the table component will use it) ---
// In a real app, you'd likely fetch this data and pass it down as a prop
const sampleAgents = [
    { id: 1, name: 'Mela from Repli', voiceEngine: '2.0', phoneNumber: '+3197010207769', lastEdited: 'Jun 7, 2025', type: 'Outbound', avatar: '/placeholders/avatar1.png' },
    { id: 2, name: 'Alex', voiceEngine: '2.0', phoneNumber: '—', lastEdited: 'May 14, 2025', type: 'Outbound', avatar: '/placeholders/avatar2.png' },
    { id: 3, name: 'Emma from AutoTrust', voiceEngine: '2.0', phoneNumber: '+3197010207769', lastEdited: 'May 14, 2025', type: 'Inbound', avatar: '/placeholders/avatar3.png' },
    { id: 4, name: 'auto trust assistant Dutch', voiceEngine: '2.0', phoneNumber: '—', lastEdited: 'May 17, 2025', type: 'Inbound', avatar: '/placeholders/avatar4.png' },
    { id: 5, name: 'QuickBite Order Assistant', voiceEngine: '2.0', phoneNumber: '—', lastEdited: 'May 12, 2025', type: 'Inbound', avatar: '/placeholders/avatar5.png' },
    { id: 6, name: 'Johan quick byte dutch assistant', voiceEngine: '2.0', phoneNumber: '—', lastEdited: 'May 17, 2025', type: 'Inbound', avatar: '/placeholders/avatar6.png' },
];
// --- End Sample Data ---


function AgentTable() {
    // State for pagination, filtering, etc. would go here if you add logic
    const router = useRouter(); // Initialize useRouter

    const handleRowClick = (agentid) => {
        console.log('Navigating to agent ID:', agentid);
        router.push(`/callagents/${agentid}`);
    };

    return (
        <> {/* Use a fragment to group the table and footer */}
            {/* Table Container */}
              <div className={`rounded-lg overflow-hidden shadow-sm ${uiAccentClasses.borderColor} border`}>
                 <div className="overflow-x-auto hide-scrollbar">
                    <table className={`min-w-full divide-y ${uiAccentClasses.borderColor}`}>
                        {/* Table Header */}
                        <thead className={`${uiAccentClasses.bgPrimary}`}>
                            <tr>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                    <input type="checkbox" className={`form-checkbox rounded ${uiAccentClasses.textAccent} ${uiAccentClasses.ringAccentShade} focus:ring-offset-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700`} />
                                </th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voice Engine</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Edited</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Type</th>
                                <th scope="col" className="relative p-3 w-12">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className={`divide-y ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} `}>
                            {sampleAgents.map(agent => (
                                <tr
                                    key={agent.id}
                                    className={`transition-colors ${uiAccentClasses.hoverBgSubtle} cursor-pointer`} 
                                    onClick={() => handleRowClick(agent.id)}
                               
                                >
                                    {/* Checkbox Cell - Keep stopPropagation */}
                                    <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-900 w-12">
                                        <input type="checkbox" className={`form-checkbox rounded ${uiAccentClasses.textAccent} ${uiAccentClasses.ringAccentShade} focus:ring-offset-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 pointer-events-none`} onClick={(e) => e.stopPropagation()} />
                                    </td>
                                    {/* Name Cell (with Avatar) */}
                                    <td className={`p-3 whitespace-nowrap text-sm font-medium ${uiAccentClasses.textPrimary}`}>
                                        <div className="flex items-center">
                                            {/* Avatar Placeholder */}
                                            {agent.avatar ? (
                                                 <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden mr-3">
                                                      <Image src={agent.avatar} alt={`${agent.name}'s avatar`} width={32} height={32} objectFit="cover"  />
                                                 </div>
                                             ) : (
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    {agent.name.charAt(0)}
                                                </div>
                                             )}
                                            {agent.name}
                                        </div>
                                    </td>
                                    {/* Data Cells */}
                                    <td className={`p-3 whitespace-nowrap text-sm ${uiAccentClasses.textSecondary}`}>{agent.voiceEngine}</td>
                                    <td className={`p-3 whitespace-nowrap text-sm ${uiAccentClasses.textSecondary}`}>{agent.phoneNumber}</td>
                                    <td className={`p-3 whitespace-nowrap text-sm ${uiAccentClasses.textSecondary}`}>{agent.lastEdited}</td>
                                    {/* Type Badge Cell */}
                                    <td className="p-3 whitespace-nowrap text-sm w-28">
                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${uiAccentClasses.typeBadgeBg} ${uiAccentClasses.typeBadgeText}`}>
                                            {agent.type}
                                        </span>
                                    </td>
                                    {/* Actions Cell - Keep stopPropagation */}
                                    <td className="p-3 whitespace-nowrap text-right text-sm font-medium w-12" >
                                        <button className={`p-1 rounded-md transition-colors ${uiAccentClasses.hoverBgSubtle}`}  >
                                            <FiMoreVertical className="text-gray-400 dark:text-gray-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>

            {/* Footer (Pagination and Results) */}
            <div className={`flex items-center justify-between px-4 py-3 border-t ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} text-sm text-gray-700 dark:text-gray-300`}>
                {/* Pagination */}
                <div className="flex flex-1 justify-between sm:hidden">
                    <button className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} ${uiAccentClasses.textSecondary} ${uiAccentClasses.hoverBgSubtle}`}>Previous</button>
                    <button className={`relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} ${uiAccentClasses.textSecondary} ${uiAccentClasses.hoverBgSubtle}`}>Next</button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    {/* Results Count */}
                    <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">{sampleAgents.length}</span> of <span className="font-medium">{sampleAgents.length}</span> results
                        </p>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex items-center space-x-4">
                         {/* Rows per page */}
                         <div className="flex items-center">
                              <label htmlFor="rowsPerPage" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Rows per page:</label>
                              <select id="rowsPerPage" className={`block w-fit rounded-md border py-1 pl-2 pr-7 text-sm ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} ${uiAccentClasses.textSecondary}`}>
                                   <option value="10">10</option>
                                   <option value="25">25</option>
                                   <option value="50">50</option>
                              </select>
                         </div>
                        {/* Page Navigation */}
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ${uiAccentClasses.borderColor} ${uiAccentClasses.hoverBgSubtle} focus:z-20`}>
                                    <span className="sr-only">Previous</span>
                                    <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                {/* Current Page (static for now) */}
                                <span aria-current="page" className={`relative z-10 inline-flex items-center ${uiAccentClasses.activeTabText} ${uiAccentClasses.activeTabBg} px-4 py-2 text-sm font-semibold focus:z-20`}>
                                    1
                                </span>
                                {/* Other pages would go here */}
                                <button className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ${uiAccentClasses.borderColor} ${uiAccentClasses.hoverBgSubtle} focus:z-20`}>
                                    <span className="sr-only">Next</span>
                                    <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AgentTable;