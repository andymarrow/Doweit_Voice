// voice-agents-CallAgents/[agentid]/calls/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiCheck } from 'react-icons/fi'; // Icons

// Import components
import CallTable from './_components/CallTable';
import CallDetailModal from './_components/CallDetailModal';

// Import constants - Adjust path if necessary
import { uiColors } from '../../_constants/uiConstants'; 
import { sectionVariants, itemVariants } from '../../_constants/uiConstants';


// Simulate fetching mock data (replace with API call)
const fetchMockCalls = async (agentId) => {
    console.log(`Fetching mock calls for agent ${agentId}...`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    // Generate some mock data
    const mockData = [
        {
            id: 'call-1',
            agentName: 'Emma',
            callerName: 'Alice',
            callerNumber: '+14155551234',
            startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            duration: '3m 15s',
            status: 'Completed',
            transcript: [
                { type: 'agent', text: "Hello, this is Emma...", timestamp: "00:00" },
                { type: 'caller', text: "Hi Emma, I'd like to...", timestamp: "00:05" },
                { type: 'agent', text: "Okay, I understand...", timestamp: "00:10" },
                // ... more transcript entries
            ],
            actionsData: { "first_name": "Alice", "pickup or delivery": "Delivery", "order_total": "$45.75" },
            audioUrl: '/mock-audio/call-1.wav', // Placeholder audio URL
        },
        {
            id: 'call-2',
            agentName: 'Emma',
            callerName: 'Bob',
            callerNumber: '+12125555678',
            startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            duration: '1m 02s',
            status: 'Completed',
             transcript: [
                { type: 'agent', text: "Hi Bob...", timestamp: "00:00" },
                { type: 'caller', text: "Hello...", timestamp: "00:03" },
            ],
            actionsData: { "caller_name": "Bob", "query": "Check order status" },
            audioUrl: null, // No audio for this one
        },
         {
            id: 'call-3',
            agentName: 'Emma',
            callerName: 'Unknown',
            callerNumber: '+13105559999',
            startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            duration: '0m 20s',
            status: 'Failed',
             transcript: [{ type: 'agent', text: "Attempting connection...", timestamp: "00:00" }],
            actionsData: {},
            audioUrl: null,
        },
          {
            id: 'call-4',
            agentName: 'Emma',
            callerName: 'Charlie',
            callerNumber: '+17185551122',
            startTime: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago (last month)
            duration: '5m 50s',
            status: 'Completed',
             transcript: [], // No transcript example
            actionsData: { "product_interest": "Widget Pro" },
            audioUrl: '/mock-audio/call-4.mp3',
        },
         {
            id: 'call-5',
            agentName: 'Emma',
            callerName: 'David',
            callerNumber: '+16175553344',
            startTime: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), // 400 days ago (last year)
            duration: '2m 10s',
            status: 'Completed',
             transcript: [],
            actionsData: {},
            audioUrl: null,
        },
         {
            id: 'call-6',
            agentName: 'Emma',
            callerName: 'Eve',
            callerNumber: '+14155557788',
            startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (this week/last week boundary)
            duration: '0m 45s',
            status: 'Busy',
             transcript: [],
            actionsData: {},
            audioUrl: null,
        },
    ];

    return mockData.filter(call => call.agentName === 'Emma'); // Filter mock data by agent name
};

export default function CallsPage() {
    const params = useParams();
    const agentId = params.agentid; // Use agentId to fetch data for this specific agent

    const [allCalls, setAllCalls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('this-week'); // Default filter

    const [selectedCall, setSelectedCall] = useState(null); // Call object for the modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


    // Fetch calls data on component mount or agentId change
    useEffect(() => {
        const loadCalls = async () => {
            setIsLoading(true);
            // In a real app, use agentId to fetch relevant calls
            const fetchedCalls = await fetchMockCalls(agentId); // Use agentId in fetch call
            setAllCalls(fetchedCalls);
            setIsLoading(false);
        };

        loadCalls();
    }, [agentId]); // Dependency on agentId ensures refetch if agent changes

    // Filtering logic using useMemo for performance
    const filteredCalls = useMemo(() => {
        let callsToFilter = allCalls;

        // Apply date filter
        const now = new Date();
        callsToFilter = callsToFilter.filter(call => {
            const callDate = new Date(call.startTime);
            if (dateFilter === 'this-week') {
                // Simple check: within the last 7 days (adjust for calendar week start if needed)
                 const sevenDaysAgo = new Date(now);
                 sevenDaysAgo.setDate(now.getDate() - 7);
                 return callDate >= sevenDaysAgo && callDate <= now;
            } else if (dateFilter === 'last-month') {
                 // Simple check: within the last 30 days
                  const thirtyDaysAgo = new Date(now);
                  thirtyDaysAgo.setDate(now.getDate() - 30);
                  return callDate >= thirtyDaysAgo && callDate <= now;
            } else if (dateFilter === 'last-year') {
                 // Simple check: within the last 365 days
                 const oneYearAgo = new Date(now);
                  oneYearAgo.setDate(now.getDate() - 365);
                  return callDate >= oneYearAgo && callDate <= now;
            }
             // 'all' filter returns all calls
            return true;
        });


        // Apply search term filter
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            callsToFilter = callsToFilter.filter(call =>
                call.agentName.toLowerCase().includes(lowerSearchTerm) ||
                call.callerName.toLowerCase().includes(lowerSearchTerm) ||
                call.callerNumber.toLowerCase().includes(lowerSearchTerm) ||
                 call.status.toLowerCase().includes(lowerSearchTerm)
                // Add other searchable fields if needed
            );
        }

        return callsToFilter;
    }, [allCalls, searchTerm, dateFilter]); // Recompute if allCalls, searchTerm, or dateFilter changes


    // Handlers for the detail modal
    const handleViewDetails = (call) => {
        setSelectedCall(call); // Set the call to display
        setIsDetailModalOpen(true); // Open the modal
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        // Use a slight delay before clearing selectedCall to allow modal exit animation
        setTimeout(() => setSelectedCall(null), 300); // Match modal transition duration
    };

    // Handler for deleting a call (called from the modal)
    const handleDeleteCall = (callIdToDelete) => {
        // In a real app, send a delete request to your API here
        console.log(`Attempting to delete call ID: ${callIdToDelete}`);
        // --- Simulate API Delete ---
        // Assuming success, update the local state to remove the call
         setAllCalls(prevCalls => prevCalls.filter(call => call.id !== callIdToDelete));
         // --- End Simulate API Delete ---
        handleCloseModal(); // Close modal after deletion
        // Optional: show a success message
    };


    return (
        <div className="flex flex-col space-y-6 w-full h-full"> {/* Container takes full width/height */}

             {/* Important Alert Banner (Keep if needed) */}
             {/* Assuming this was made responsive in a previous step */}
             {/* <motion.div ... ></motion.div> */}


            {/* Calls Page Title */}
            <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Calls</h1>

            {/* Filter Controls */}
            <motion.div
                 className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
                 variants={itemVariants} initial="hidden" animate="visible"
            >
                {/* Left: Search */}
                <div className="flex items-center space-x-2 w-full sm:w-auto sm:flex-grow max-w-sm"> {/* Adjusted width/flex-grow */}
                     <FiSearch className={`w-5 h-5 ${uiColors.textSecondary}`} />
                     <input
                         type="text"
                         placeholder="Search calls..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                          className={`block w-full p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                     />
                </div>

                {/* Right: Date Filter */}
                <div className="flex items-center space-x-2 flex-shrink-0"> {/* Prevent shrinking */}
                     <span className={`text-sm ${uiColors.textSecondary}`}>Filter by date:</span>
                     <select
                         value={dateFilter}
                         onChange={(e) => setDateFilter(e.target.value)}
                          className={`form-select block p-2 w-fit text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                     >
                         <option value="this-week">This week</option>
                         <option value="last-month">Last month</option>
                         <option value="last-year">Last year</option>
                         <option value="all">All time</option>
                     </select>
                </div>
            </motion.div>


            {/* Call Table */}
             <div className="flex-grow overflow-y-auto"> {/* Container to allow table area to scroll */}
                {isLoading ? (
                    <div className={`text-center py-20 ${uiColors.textSecondary}`}>Loading calls...</div>
                ) : (
                     <CallTable calls={filteredCalls} onViewDetails={handleViewDetails} />
                 )}
             </div>


            {/* Call Detail Modal */}
             <CallDetailModal
                 isOpen={isDetailModalOpen}
                 onClose={handleCloseModal}
                 callData={selectedCall} // Pass the selected call data
                 onDeleteCall={handleDeleteCall} // Pass delete handler down
             />

        </div>
    );
}