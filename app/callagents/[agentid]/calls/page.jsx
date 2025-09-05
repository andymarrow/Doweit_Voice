// voice-agents-CallAgents/[agentid]/calls/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
// Remove useParams
// import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiCheck, FiLoader } from 'react-icons/fi'; // Added FiLoader
import { toast } from 'react-hot-toast'; // Assuming toast is available

// Import context hook
import { useCallAgent } from '../_context/CallAgentContext';

// Import components
import CallTable from './_components/CallTable';
import CallDetailModal from './_components/CallDetailModal';

// Import constants - Adjust path if necessary
import { uiColors } from '../../_constants/uiConstants';
import { sectionVariants, itemVariants } from '../../_constants/uiConstants';

// Helper function to fetch calls data for an agent
const fetchAgentCalls = async (agentId) => {
    if (!agentId) return [];
    console.log(`[Calls Page] Fetching calls for agent ${agentId}...`);
    const response = await fetch(`/api/callagents/${agentId}/calls`); // Call the new API endpoint
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch calls');
    }
    const calls = await response.json();
     console.log("[Calls Page] Fetched calls:", calls);
     // API response is already the array of call objects with nested data
    return calls;
};

// Helper function to delete a call
const deleteCall = async (agentId, callId) => {
     if (!agentId || !callId) {
         console.warn("Attempted to delete call with missing IDs.");
         throw new Error("Missing agent or call ID for deletion.");
     }
     console.log(`[Calls Page] Calling DELETE API for /api/callagents/${agentId}/calls/${callId}`);
    const response = await fetch(`/api/callagents/${agentId}/calls/${callId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete call');
    }
    // API should return { success: true, deletedId: callId } or 204
    return response.json(); // Assuming JSON response
};


export default function CallsPage() {
    // Get agent data from context
    const agent = useCallAgent();
    const agentId = agent?.id; // Use agent ID from context

    const [allCalls, setAllCalls] = useState([]); // State for all calls fetched from API
    const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch
    const [fetchError, setFetchError] = useState(null); // State for fetch errors

    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // Default filter to 'all' initially? Or 'this-week'? Let's stick to 'all' so user sees data immediately.

    const [selectedCall, setSelectedCall] = useState(null); // Call object for the modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

     // *** NEW STATE FOR DELETING CALLS ***
     const [isDeletingCall, setIsDeletingCall] = useState(false); // To disable modal buttons during delete
     const [deleteError, setDeleteError] = useState(null); // State for delete errors


    // Fetch calls data on component mount or agentId change
    useEffect(() => {
        if (agentId) {
            const loadCalls = async () => {
                setIsLoading(true);
                setFetchError(null); // Clear previous fetch errors
                try {
                     // Fetch calls using the new API helper
                    const fetchedCalls = await fetchAgentCalls(agentId);
                    setAllCalls(fetchedCalls);
                } catch (err) {
                    console.error('[Calls Page] Error loading calls:', err);
                    setFetchError(err.message);
                    setAllCalls([]); // Clear calls on error
                } finally {
                    setIsLoading(false);
                }
            };

            loadCalls();
        } else {
             // Handle case where agentId is not yet available (shouldn't happen with layout)
             setIsLoading(true); // Keep loading
             setFetchError('Agent ID not available.'); // Or handle differently
        }
    }, [agentId]); // Dependency on agentId ensures refetch if agent changes

    // Filtering logic using useMemo
    const filteredCalls = useMemo(() => {
        let callsToFilter = allCalls;

        // Apply date filter
        const now = new Date();
        callsToFilter = callsToFilter.filter(call => {
            // Handle cases where startTime might be null or invalid
            if (!call.startTime) return false; // Skip calls without start time

            const callDate = new Date(call.startTime);
            // Check if date is valid before comparing
            if (isNaN(callDate.getTime())) return false;

            if (dateFilter === 'this-week') {
                 const sevenDaysAgo = new Date(now);
                 sevenDaysAgo.setDate(now.getDate() - 7);
                 return callDate >= sevenDaysAgo && callDate <= now;
            } else if (dateFilter === 'last-month') {
                  const thirtyDaysAgo = new Date(now);
                  thirtyDaysAgo.setDate(now.getDate() - 30);
                  return callDate >= thirtyDaysAgo && callDate <= now;
            } else if (dateFilter === 'last-year') {
                 const oneYearAgo = new Date(now);
                  oneYearAgo.setDate(now.getDate() - 365);
                  return callDate >= oneYearAgo && callDate <= now;
            }
             // 'all' filter returns all calls (handled by default)
            return true;
        });


        // Apply search term filter
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
             callsToFilter = callsToFilter.filter(call => {
                 // Safely access properties before checking includes
                 const agentName = call.agent ? call.agent.name : (agent?.name || ''); // Use agent name from fetched call if available, fallback to context agent name
                 const callerName = call.customerName || '';
                 const callerNumber = call.phoneNumber || ''; // Use phoneNumber from DB
                 const status = call.status || '';

                 // Check string fields
                 return (agentName.toLowerCase().includes(lowerSearchTerm) ||
                         callerName.toLowerCase().includes(lowerSearchTerm) ||
                         callerNumber.toLowerCase().includes(lowerSearchTerm) ||
                          status.toLowerCase().includes(lowerSearchTerm) ||
                         // Optional: Search in transcript text if desired (can be large)
                         call.transcript?.some(entry => (entry.message || '').toLowerCase().includes(lowerSearchTerm)) ||
                          // Optional: Search in action data values (can be large)
                         // call.callActionValues?.some(cav => (String(cav.value) || '').toLowerCase().includes(lowerSearchTerm))
                         false // Fallback if none match
                 );
             });
        }

        return callsToFilter;
    }, [allCalls, searchTerm, dateFilter, agent?.name]); // Depend on relevant state and context agent name


    // Handlers for the detail modal
    const handleViewDetails = (call) => {
        setSelectedCall(call); // Set the call to display (the full call object from state)
        setIsDetailModalOpen(true); // Open the modal
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        // Use a slight delay before clearing selectedCall to allow modal exit animation
        setTimeout(() => setSelectedCall(null), 300); // Match modal transition duration
         // Clear any errors when closing the modal
         setDeleteError(null);
    };

    // Handler for deleting a call (called from the modal)
    const handleDeleteCall = async (callIdToDelete) => {
        if (!agentId || !callIdToDelete) {
             console.warn("[Calls Page] Missing info to delete call.");
             toast.error("Could not delete call: Missing necessary information.");
             return;
         }

        // Confirmation is handled in the modal's DownloadDeleteTab, so no confirm here

        setDeleteError(null); // Clear previous delete error
        setIsDeletingCall(true); // Set deleting state

        try {
            console.log(`[Calls Page] Deleting call ${callIdToDelete} for agent ${agentId}`);
             // Call the API to delete the call
            const deleteResult = await deleteCall(agentId, callIdToDelete);

            // On successful deletion API response:
            // Update local state by removing the deleted item
            setAllCalls(prevCalls => prevCalls.filter(call => call.id !== callIdToDelete));

            toast.success(`Call ${callIdToDelete} removed successfully!`);
            console.log(`[Calls Page] Call ${callIdToDelete} removed from state.`);

             // Close the modal after successful deletion
            handleCloseModal();


        } catch (err) {
            console.error('[Calls Page] Error deleting call:', err);
            setDeleteError(err.message);
            toast.error(`Failed to delete call: ${err.message}`);
        } finally {
            setIsDeletingCall(false);
        }
    };


    return (
        <div className="flex flex-col space-y-6 w-full h-full">

            {/* Calls Page Title */}
            <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Calls</h1>

            {/* Filter Controls */}
            <motion.div
                 className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
                 variants={itemVariants} initial="hidden" animate="visible"
            >
                {/* Left: Search */}
                <div className="flex items-center space-x-2 w-full sm:w-auto sm:flex-grow max-w-sm">
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
                <div className="flex items-center space-x-2 flex-shrink-0">
                     <span className={`text-sm ${uiColors.textSecondary}`}>Filter by date:</span>
                     <select
                         value={dateFilter}
                         onChange={(e) => setDateFilter(e.target.value)}
                          className={`form-select block p-2 w-fit text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                     >
                         <option value="all">All time</option> {/* Added 'all' option */}
                         <option value="this-week">This week</option>
                         <option value="last-month">Last month</option>
                         <option value="last-year">Last year</option>
                     </select>
                </div>
            </motion.div>

            {fetchError && ( // Display fetch error message
                  <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                     Error loading calls: {fetchError}
                  </div>
             )}
             {deleteError && ( // Display delete error message
                  <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                     Error deleting call: {deleteError}
                  </div>
             )}


            {/* Call Table */}
             <div className="flex-grow overflow-y-auto">
                {/* FIX: Wait for isLoading to be false AND for agent.name to be available */}
                {isLoading || !agent?.name ? (
                    <div className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textSecondary}`}>
                         <FiLoader className="animate-spin mx-auto w-8 h-8 mb-4" /> 
                         {isLoading ? "Loading calls..." : "Loading agent details..."}
                    </div>
                ) : (
                     <CallTable calls={filteredCalls} onViewDetails={handleViewDetails} agentName={agent.name} agentId={agent.id}/>
                 )}
             </div>


            {/* Call Detail Modal */}
             <CallDetailModal
                 isOpen={isDetailModalOpen}
                 onClose={handleCloseModal}
                 callData={selectedCall}
                 onDeleteCall={handleDeleteCall}
                 isDeleting={isDeletingCall}
                 agentName={agent?.name}
                 agentId={agentId}
             />

        </div>
    );
}
