// voice-agents-dashboard/_components/AgentTable.jsx
"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    FiMoreVertical,
    FiChevronLeft, FiChevronRight,
    FiPhoneOff
} from 'react-icons/fi';

// Import shared constants
import {
    uiAccentClasses
} from '../_constants/uiConstants';

// Utility to format date
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        // Format like 'Month Day, Year' e.g., 'Jun 7, 2025'
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
        console.error("Error formatting date:", isoString, error);
        return 'Invalid Date';
    }
};

// Component now receives 'agents' array as a prop
// The parent CallAgentsMainPage handles loading and empty states before rendering this.
function AgentTable({ agents }) { // Removed isLoading prop as parent handles loading state
    const router = useRouter();

    const handleRowClick = (agentid) => {
        console.log('Navigating to agent ID:', agentid);
        router.push(`/callagents/${agentid}`);
    };

    // The parent handles the case where agents array is empty or loading,
    // so we can assume 'agents' is an array here.
    // No need for isLoading or empty state checks inside this component anymore.

    return (
        <>
            {/* Table Container */}
            <div className={`rounded-lg overflow-hidden shadow-sm ${uiAccentClasses.borderColor} border`}>
                 <div className="overflow-x-auto hide-scrollbar">
                    <table className={`min-w-full divide-y ${uiAccentClasses.borderColor}`}>
                        {/* Table Header */}
                        <thead className={`${uiAccentClasses.bgPrimary}`}>
                            <tr>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                    {/* Checkbox - Placeholder */}
                                    <input type="checkbox" className={`form-checkbox rounded ${uiAccentClasses.textAccent} ${uiAccentClasses.ringAccentShade} focus:ring-offset-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700`} />
                                </th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voice Engine</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                                {/* Using updatedAt for 'Last Edited' */}
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Edited</th>
                                <th scope="col" className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Type</th>
                                <th scope="col" className="relative p-3 w-12">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className={`divide-y ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} `}>
                            {/* Map over the 'agents' prop - this will be the actual data */}
                            {agents.map(agent => (
                                <tr
                                    key={agent.id} // Use agent.id from the DB
                                    className={`transition-colors ${uiAccentClasses.hoverBgSubtle} cursor-pointer`}
                                     // Navigate using the real agent.id
                                    onClick={() => handleRowClick(agent.id)}
                                >
                                    {/* Checkbox Cell - Keep stopPropagation */}
                                    <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-900 w-12">
                                        <input type="checkbox" className={`form-checkbox rounded ${uiAccentClasses.textAccent} ${uiAccentClasses.ringAccentShade} focus:ring-offset-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 pointer-events-none`} onClick={(e) => e.stopPropagation()} />
                                    </td>
                                    {/* Name Cell (with Avatar) */}
                                    <td className={`p-3 whitespace-nowrap text-sm font-medium ${uiAccentClasses.textPrimary}`}>
                                        <div className="flex items-center">
                                            {agent.avatarUrl ? (
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden mr-3 relative"> {/* <-- ADDED relative class here */}
                                                    <Image src={agent.avatarUrl} alt={`${agent.name}'s avatar`} fill style={{objectFit:"cover"}} sizes="32px" />
                                                </div>
                                            ) : (
                                                // Placeholder avatar
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    {agent.name ? agent.name.charAt(0).toUpperCase() + agent.name.slice(1) : ''}
                                                </div>
                                            )}
                                            {agent.name}
                                        </div>
                                    </td>
                                    {/* Data Cells - Use actual agent data */}
                                    {/* Use default value '—' if property is null or undefined */}
                                    <td className={`p-3 whitespace-nowrap text-sm ${uiAccentClasses.textSecondary}`}>{agent.voiceEngine || '—'}</td>
                                     <td className={`p-3 whitespace-nowrap text-sm ${uiAccentClasses.textSecondary}`}>
                                         {agent.phoneNumber ? (
                                             agent.phoneNumber
                                         ) : (
                                              <span className="flex items-center">
                                                   <FiPhoneOff className="mr-1 text-gray-400 dark:text-gray-500" />
                                                   —
                                              </span>
                                         )}
                                    </td>
                                    {/* Format and display Last Edited (using updatedAt) */}
                                    <td className={`p-3 whitespace-nowrap text-sm ${uiAccentClasses.textSecondary}`}>{formatDate(agent.updatedAt)}</td>
                                    {/* Type Badge Cell */}
                                    <td className="p-3 whitespace-nowrap text-sm w-28">
                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${uiAccentClasses.typeBadgeBg} ${uiAccentClasses.typeBadgeText}`}>
                                            {/* Ensure type is uppercase first letter */}
                                            {agent.type ? agent.type.charAt(0).toUpperCase() + agent.type.slice(1) : 'Unknown'}
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

            {/* Footer (Pagination and Results) - Still placeholders, assumes data handling in parent */}
            <div className={`flex items-center justify-between px-4 py-3 border-t ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} text-sm text-gray-700 dark:text-gray-300`}>
                <div className="flex flex-1 justify-between sm:hidden">
                    <button className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} ${uiAccentClasses.textSecondary} ${uiAccentClasses.hoverBgSubtle}`}>Previous</button>
                    <button className={`relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} ${uiAccentClasses.textSecondary} ${uiAccentClasses.hoverBgSubtle}`}>Next</button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    {/* Results Count */}
                    <div>
                         <p className="text-sm text-gray-700 dark:text-gray-300">
                             Showing <span className="font-medium">1</span> to <span className="font-medium">{agents.length}</span> of <span className="font-medium">{agents.length}</span> results
                         </p>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex items-center space-x-4">
                         <div className="flex items-center">
                              <label htmlFor="rowsPerPage" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Rows per page:</label>
                              <select id="rowsPerPage" className={`block w-fit rounded-md border py-1 pl-2 pr-7 text-sm ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} ${uiAccentClasses.textSecondary}`}>
                                   <option value="10">10</option>
                                   <option value="25">25</option>
                                   <option value="50">50</option>
                              </select>
                         </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ${uiAccentClasses.borderColor} ${uiAccentClasses.hoverBgSubtle} focus:z-20`}>
                                    <span className="sr-only">Previous</span>
                                    <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <span aria-current="page" className={`relative z-10 inline-flex items-center ${uiAccentClasses.activeTabText} ${uiAccentClasses.activeTabBg} px-4 py-2 text-sm font-semibold focus:z-20`}>
                                    1
                                </span>
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