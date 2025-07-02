// voice-agents-dashboard/CallAgentsMainPage.jsx
"use client";
import React, { useState, useEffect } from 'react';
import {
    FiRefreshCw,
    FiSearch,
    FiFilter,
    FiPlus,
    FiHelpCircle
} from 'react-icons/fi';
import AgentTable from './_components/AgentTable';
import CreateAgentModal from './_components/CreateAgentModal';
import CreateAgentFromScratchModal from './_components/CreateAgentFromScratchModal';

// Import shared constants
import {
    accentButtonClasses,
    uiAccentClasses
} from './_constants/uiConstants';


function CallAgentsMainPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateFromScratchModalOpen, setIsCreateFromScratchModalOpen] = useState(false);
    const [agentTypeToCreate, setAgentTypeToCreate] = useState(null);

    // State to hold the actual list of agents from the DB
    const [agents, setAgents] = useState([]);
    const [isLoadingAgents, setIsLoadingAgents] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');


    // --- loadAgents function now fetches from the API ---
    const loadAgents = async () => {
        setIsLoadingAgents(true);
        try {
            const response = await fetch('/api/callagents/create'); // Call the new GET API route
            if (!response.ok) {
                // Handle potential errors from the API
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch agents.');
            }
            const fetchedAgents = await response.json();
            setAgents(fetchedAgents);
        } catch (error) {
            console.error('Error loading agents:', error);
            // Optionally set an error state to display to the user
            // setErrorFetchingAgents(error.message);
            setAgents([]); // Clear agents on error
        } finally {
            setIsLoadingAgents(false);
        }
    };
    // --- End of loadAgents function ---


    // Fetch agents when the component mounts
    useEffect(() => {
        loadAgents();
    }, []); // Empty dependency array means this runs once on mount

    // Filter agents based on search term
     const filteredAgents = agents.filter(agent =>
         agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         agent.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (agent.phoneNumber && agent.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())) // Check phone number if it exists
     );

    // Handlers for the first Create Agent modal
    const handleCreateAgentClick = () => {
        setIsCreateModalOpen(true);
    };
    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    // Handler called from the first modal when "Start from Scratch" is selected
    const handleSelectScratchMethod = (selectedType) => {
         setAgentTypeToCreate(selectedType);
         setIsCreateFromScratchModalOpen(true);
         // First modal calls onClose() itself
    };

    // Handlers for the second Create From Scratch modal
    const handleCloseCreateFromScratchModal = () => {
        setIsCreateFromScratchModalOpen(false);
        setAgentTypeToCreate(null);
    };

    // Handler called from the second modal when an agent is successfully created
    const handleAgentCreated = (newAgent) => {
        console.log("New agent received in Main Page:", newAgent);
        // Add the new agent to the list immediately
         setAgents(prevAgents => [newAgent, ...prevAgents]); // Add new agent to top of list

        // Close the scratch modal (handled by modal, but clear state)
        handleCloseCreateFromScratchModal(); // Clear state associated with this modal

        // Optional: Re-fetch all agents after creating to ensure data is fully synced
        // This is safer but might be slower than adding the new agent to state.
        // loadAgents();
    };


    return (
        <div className={`relative flex flex-col h-full overflow-y-auto p-2 md:p-3 lg:p-4 hide-scrollbar ${uiAccentClasses.bgPage}`}>
            {/* Header Bar */}
            <div className={`flex flex-col md:flex-row items-center justify-between mb-6 p-2 rounded-lg ${uiAccentClasses.bgPrimary} shadow-sm ${uiAccentClasses.borderColor} border space-y-4 md:space-y-0`}>

                {/* Left side: Tabs & Refresh */}
                <div className="flex items-center space-x-4">
                    {/* Tabs */}
                    <div className={`flex rounded-md overflow-hidden border ${uiAccentClasses.borderColor}`}>
                        <button className={`px-4 py-2 text-sm font-medium transition-colors ${uiAccentClasses.activeTabBg} ${uiAccentClasses.activeTabText}`}>
                            Agents
                        </button>
                        <button className={`px-4 py-2 text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300`}>
                            Teams
                        </button>
                    </div>
                    {/* Refresh Button - Now correctly calls loadAgents */}
                     <button
                         className={`p-2 rounded-md transition-colors ${uiAccentClasses.hoverBgSubtle}`}
                         onClick={loadAgents} // <-- Correctly calls the loadAgents function
                         disabled={isLoadingAgents}
                     >
                         <FiRefreshCw className={`text-gray-600 dark:text-gray-300 ${isLoadingAgents ? 'animate-spin' : ''}`} />
                     </button>
                </div>

                {/* Right side: Search, Filter, Create */}
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                    {/* Search Input */}
                    <div className={`flex items-center border rounded-md px-3 py-1.5 ${uiAccentClasses.borderColor} ${uiAccentClasses.bgSecondary} w-full md:w-auto`}>
                        <FiSearch className="text-gray-400 mr-2 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search..."
                             value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`outline-none text-sm ${uiAccentClasses.textPrimary} placeholder-gray-400 dark:placeholder-gray-500 ${uiAccentClasses.bgSecondary} flex-grow min-w-0`}
                             disabled={isLoadingAgents}
                        />
                    </div>
                    {/* Filter Button */}
                    <button className={`p-2 rounded-md transition-colors ${uiAccentClasses.hoverBgSubtle} flex-shrink-0`}>
                        <FiFilter className="text-gray-600 dark:text-gray-300" />
                    </button>
                    {/* Create Agent Button */}
                    <button
                        className={`inline-flex items-center text-sm font-semibold px-4 py-2 rounded-md shadow ${accentButtonClasses} flex-shrink-0`}
                        onClick={handleCreateAgentClick}
                        disabled={isLoadingAgents || isCreateModalOpen || isCreateFromScratchModalOpen}
                    >
                        <FiPlus className="mr-2" />
                        Create Agent
                    </button>
                </div>
            </div>

            {/* Render the AgentTable component, pass data and loading state */}
             {isLoadingAgents ? (
                 <div className={`text-center py-20 ${uiAccentClasses.textSecondary}`}>Loading Agents...</div>
             ) : filteredAgents.length === 0 && searchTerm === '' ? (
                 <div className={`text-center py-10 ${uiAccentClasses.textSecondary}`}>
                      No agents found. Click "Create Agent" to add one.
                 </div>
             ) : filteredAgents.length === 0 && searchTerm !== '' ? (
                 <div className={`text-center py-10 ${uiAccentClasses.textSecondary}`}>
                      No agents match your search.
                 </div>
             ) : (
                 // Pass the filtered agents to the table
                 <AgentTable agents={filteredAgents} />
             )}


            {/* Render the first Create Agent Modal */}
            <CreateAgentModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSelectScratch={handleSelectScratchMethod}
            />

            {/* Render the second Create From Scratch Modal */}
             {isCreateFromScratchModalOpen && agentTypeToCreate && (
                 <CreateAgentFromScratchModal
                    isOpen={isCreateFromScratchModalOpen}
                    onClose={handleCloseCreateFromScratchModal}
                    agentType={agentTypeToCreate}
                    onAgentCreated={handleAgentCreated}
                 />
             )}

        </div>
    );
}
export default CallAgentsMainPage;