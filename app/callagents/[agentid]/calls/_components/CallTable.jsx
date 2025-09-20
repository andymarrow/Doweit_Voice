// voice-agents-CallAgents/[agentid]/calls/_components/CallTable.jsx
"use client";

import React,{useRef, useState} from 'react';
import { motion } from 'framer-motion';

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Ensure correct path
import { itemVariants, sectionVariants } from '@/app/callagents/_constants/uiConstants'; // Assuming variants
import { FiPlayCircle } from 'react-icons/fi';
// Removed accentClasses import as it wasn't used directly in the button class

// FIX: Accept agentName as a prop
function CallTable({ calls, onViewDetails, agentName,agentId, selectedCallIds, onSelectCall, onSelectAll  }) {

    const [loading, setLoading] = useState(false)
    const audioRef = useRef(null);

    if (!calls || calls.length === 0) {
        return (
            <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className={`text-center py-20 ${uiColors.textSecondary}`}
            >
                No calls found.
            </motion.div>
        );
    }

     // Helper to format duration from seconds (if stored as number)
     const formatDuration = (durationInSeconds) => {
         if (durationInSeconds === undefined || durationInSeconds === null) return 'N/A';
         const minutes = Math.floor(durationInSeconds / 60);
         const seconds = durationInSeconds % 60;
         return `${minutes}m ${seconds}s`;
     };

    const handlePlayRecording = async (call) => {
        console.log("passed value", call)
        if (!call.rawCallData?.vapiCallId) return

        setLoading(true)
        try {
            const res = await fetch(`/api/callagents/${agentId}/calls/${call.rawCallData?.vapiCallId}`)
            if (!res.ok) throw new Error("There was error fetching the vapi call details")

            const { call:vapiCall } = await res.json();
            const recordingUrl = vapiCall?.recordingUrl
            
            audioRef.current.src = recordingUrl;
            audioRef.current.play();
        } catch (error) {
            console.error(error.message)

        } finally {
            setLoading(false)
        }

    }


    const allVisibleSelected = calls.length > 0 && selectedCallIds.length === calls.length;

    return (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="overflow-x-auto">
            <audio ref={audioRef} className='hidden'/>
            <table className={`min-w-full divide-y ${uiColors.borderPrimary}`}>
                <thead className={`${uiColors.bgSecondary}`}>
                    <tr>
                         {/* --- NEW CHECKBOX HEADER --- */}
                        <th scope="col" className="p-4">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={allVisibleSelected}
                                onChange={onSelectAll}
                            />
                        </th>
                        {/* Table Headers */}
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Agent Name
                        </th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Caller Name
                        </th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Number
                        </th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Start Time
                        </th>
                         <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Duration
                        </th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Status
                        </th>
                        {/* <th className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Recording
                        </th> */}
                        <th scope="col" className={`relative px-4 py-3 `}>
                            <span className="sr-only">Details</span>
                        </th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                    {calls.map((call) => (
                        <motion.tr
                            key={call.id} // Unique key for each row
                            variants={itemVariants}
                            className={`${uiColors.hoverBgSubtle}`}
                        >
                            {/* --- NEW CHECKBOX CELL --- */}
                            <td className="p-4">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={selectedCallIds.includes(call.id)}
                                    onChange={() => onSelectCall(call.id)}
                                />
                            </td>
                            {/* Table Data */}
                            <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${uiColors.textPrimary}`}>
                                {/* FIX: Prioritize name from the call object, fallback to prop */}
                                {call.agent?.name || agentName || 'N/A'}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {/* Note: Your console shows customerName is inside rawCallData */}
                                {call.customerName || call.rawCallData?.customerName || 'Unknown'}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {call.phoneNumber || 'N/A'} {/* Use phoneNumber from DB */}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {/* Format start time */}
                                {call.startTime ? new Date(call.startTime).toLocaleString() : 'N/A'}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {/* Use duration from DB (can be number or string), format if needed */}
                                 {typeof call.duration === 'number' ? formatDuration(call.duration) : call.duration || 'N/A'}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm`}>
                                <div className="flex items-center space-x-2">
                                     <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                         call.status === 'Completed' ? `${uiColors.statusBadgeSuccessBg} ${uiColors.statusBadgeSuccessText}` :
                                         call.status === 'Failed' ? `${uiColors.statusBadgeDangerBg} ${uiColors.statusBadgeDangerText}` :
                                         call.status ? `${uiColors.statusBadgeInfoBg} ${uiColors.statusBadgeInfoText}` : ''
                                     }`}>
                                         {call.status}
                                     </span>
                                     {/* --- NEW EXPORTED BADGE --- */}
                                     {call.isExported && (
                                         <span title="Exported to Google Sheets" className="inline-flex items-center p-1 text-xs font-semibold leading-5 rounded-full bg-green-100 text-green-800">
                                            <FiCheck className="w-3 h-3"/>
                                         </span>
                                     )}
                                </div>
                            </td>
                            {/* <td className={`flex justify-center p-4 whitespace-nowrap text-right text-sm font-medium`}>
                                
                                 <button
                                     onClick={()=>handlePlayRecording(call)}
                                     className={`flex justify-center text-cyan-600 hover:text-cyan-800 dark:text-purple-400 dark:hover:text-purple-300 focus:outline-none focus:underline`}
                                 >
                                    <FiPlayCircle className='w-4 h-4'/> 
                                 </button>
                            </td> */}
                             <td className={`px-4 py-4 whitespace-nowrap text-right text-sm font-medium`}>
                                 {/* Details Button */}
                                 <button
                                     onClick={() => onViewDetails(call)} // Call handler with call data
                                     // Adjusted button styling assuming accentPrimary is a color name in uiColors
                                     className={`text-cyan-600 hover:text-cyan-800 dark:text-purple-400 dark:hover:text-purple-300 focus:outline-none focus:underline`}
                                 >
                                     Details
                                 </button>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    );
}

export default CallTable;
