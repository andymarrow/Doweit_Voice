// voice-agents-CallAgents/[agentid]/actions/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiCheck } from 'react-icons/fi'; // Example icons

// Import components
import ActionTabs from './_components/ActionTabs';
import ActionList from './_components/ActionList';
import AddActionModal from './_components/AddActionModal';

// Import constants - Adjust path as necessary
import { uiColors } from '../../_constants/uiConstants';
import { sectionVariants, itemVariants } from '../../_constants/uiConstants';


export default function ActionsPage() {
    const params = useParams();
    const agentId = params.agentid;

    // State for the active tab
    const [activeActionTab, setActiveActionTab] = useState('before'); // Default to 'before'

    // State for all actions, structured by tab key
    // Use placeholder data that matches the image initially
    const [allActions, setAllActions] = useState({
        before: [],
        during: [],
        after: [
            { id: 'ie-firstname', type: 'Information Extractor', name: 'first_name', details: 'Open Question' },
            { id: 'ie-lastname', type: 'Information Extractor', name: 'last_name', details: 'Open Question' },
            { id: 'ie-phone', type: 'Information Extractor', name: 'preferred_phone_number', details: 'Open Question' },
            { id: 'ie-specialrequests', type: 'Information Extractor', name: 'special_requests', details: 'Open Question' },
            { id: 'ie-pickupdelivery', type: 'Information Extractor', name: 'pickup or delivery', details: 'Single Choice' },
            { id: 'ie-orderquantity', type: 'Information Extractor', name: 'capture order items and quantity', details: 'Open Question' },
            { id: 'ie-sidesdrinks', type: 'Information Extractor', name: 'sides or drinks', details: 'Open Question' },
            { id: 'ie-allergies', type: 'Information Extractor', name: 'have allergies or special requests', details: 'Open Question' },
            { id: 'ie-address', type: 'Information Extractor', name: 'users address', details: 'Open Question' },
        ],
    });

    // State for modal visibility
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // State for loading initial actions data (optional)
    const [isLoadingActions, setIsLoadingActions] = useState(false);

    // Simulate fetching initial actions data (replace with API call)
    useEffect(() => {
        const fetchActions = async () => {
            setIsLoadingActions(true);
             // --- Simulate API Call ---
            await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
            // If fetching from API, update setAllActions here:
            // setAllActions(fetchedActionsData);
            setIsLoadingActions(false);
             // --- End Simulate API Call ---
        };
        // fetchActions(); // Call fetch function if actually fetching data
         // Note: With placeholder data, the state is initialized directly, no fetch needed.
         // If you add fetching, add [agentId] to dependency array.
    }, []);


    // Function to handle tab changes
    const handleTabChange = (tabKey) => {
        setActiveActionTab(tabKey);
    };

    // Function to open the Add Action modal
    const openAddModal = () => {
        setIsAddModalOpen(true);
    };

    // Function to close the Add Action modal
    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    // Function to handle actions selected in the modal and add them to the current tab
    const handleAddSelectedActions = (selectedActions) => {
        setAllActions(prevActions => {
            const currentTabActions = prevActions[activeActionTab] || [];
            // Filter out actions already present in the current tab to avoid duplicates by ID
            const newActions = selectedActions.filter(selected =>
                 !currentTabActions.some(existing => existing.id === selected.id)
            );
             return {
                 ...prevActions,
                 [activeActionTab]: [...currentTabActions, ...newActions] // Add new actions
             };
        });
    };

     // Use useMemo to calculate counts efficiently
     const actionCounts = useMemo(() => {
         return {
              before: allActions.before.length,
              during: allActions.during.length,
              after: allActions.after.length,
         };
     }, [allActions]); // Recalculate whenever allActions state changes


    // Determine the content component based on the active tab
    // We can use a single ActionList component and pass different props
     const currentTabContent = {
        before: <ActionList
                    title="Before the Call"
                    description="Actions that are set to run before the call"
                    actions={allActions.before}
                    onAddActionClick={openAddModal}
                    tabKey="before"
                />,
        during: <ActionList
                    title="During the Call"
                    description="Actions that are set to run during the call"
                    actions={allActions.during}
                    onAddActionClick={openAddModal}
                    tabKey="during"
                />,
        after: <ActionList
                   title="After the Call"
                   description="Actions that are set to run after the call"
                   actions={allActions.after}
                   onAddActionClick={openAddModal}
                   tabKey="after"
               />,
    }[activeActionTab];


    return (
        <div className="flex flex-col space-y-6 w-full h-full">

            {/* Important Alert Banner (Keep if needed) */}
            {/* <motion.div ... ></motion.div> */}

            {/* Actions Page Title */}
            <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Actions</h1>

            {/* Render the tabs */}
            <ActionTabs
                activeTab={activeActionTab}
                onTabChange={handleTabChange}
                counts={actionCounts} // Pass counts to tabs
            />

            {/* Render the content based on the active tab */}
             {isLoadingActions ? (
                 <div className={`text-center py-20 ${uiColors.textSecondary}`}>Loading Actions...</div>
             ) : (
                 <div className="flex-grow overflow-y-auto"> {/* Ensure content area scrolls */}
                     {currentTabContent}
                 </div>
             )}


            {/* Render the Add Action Modal */}
             <AddActionModal
                 isOpen={isAddModalOpen}
                 onClose={closeAddModal}
                 onAddActions={handleAddSelectedActions} // Pass the handler for selected actions
                 // Pass agentId if the modal itself needs it to fetch available actions
                 // agentId={agentId}
             />

        </div>
    );
}