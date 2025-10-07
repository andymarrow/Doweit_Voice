// voice-agents-CallAgents/[agentid]/actions/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiCheck, FiLoader, FiTrash2, FiEye } from 'react-icons/fi'; // Added FiEye icon
import { toast } from 'react-hot-toast'; // Assuming toast is available

import { useRouter } from "next/navigation";
// Import context hook
import { useCallAgent } from '../_context/CallAgentContext';

// Import components
import ActionTabs from './_components/ActionTabs';
import ActionList from './_components/ActionList';
import AddActionModal from './_components/AddActionModal';
// *** IMPORT THE VIEW MODAL COMPONENT ***
import ViewActionModal from '../../actions/_components/ViewActionModal';

// Import constants - Adjust path as necessary
import { uiColors } from '../../_constants/uiConstants';
import { sectionVariants, itemVariants } from '../../_constants/uiConstants';

// Helper function to fetch agent's configured actions
const fetchAgentActions = async (agentId) => {
    if (!agentId) return { before: [], during: [], after: [] };
    const response = await fetch(`/api/callagents/${agentId}/actions`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch agent actions');
    }
    return response.json(); // Returns grouped actions { before: [...], during: [...], after: [...] }
};

// Helper function to add actions to an agent
const addAgentActions = async (agentId, timing, actionIds) => {
     if (!agentId || !timing || !actionIds || actionIds.length === 0) {
         console.warn("Attempted to add actions with missing data.");
         return []; // Or throw an error
     }
    const response = await fetch(`/api/callagents/${agentId}/actions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timing, actionIds }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add agent actions');
    }
    return response.json(); // Returns the details of the newly added agent actions
};

// Helper function to delete an agent action instance
const deleteAgentAction = async (agentId, agentActionId) => {
     if (!agentId || !agentActionId) {
         console.warn("Attempted to delete action instance with missing IDs.");
         throw new Error("Missing agent or action instance ID for deletion.");
     }
     console.log(`[Actions Page] Calling DELETE API for /api/callagents/${agentId}/actions/${agentActionId}`);
    const response = await fetch(`/api/callagents/${agentId}/actions/${agentActionId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete action instance');
    }
    // API should ideally return { success: true, deletedId: agentActionId } or 204
    // We expect JSON here for easier processing, matching the backend correction
    return response.json();
};


export default function ActionsPage() {
    // Get agent data from context
    const agent = useCallAgent();
	const router = useRouter();
    const agentId = agent?.id; // Use agent ID from context

    // State for the active tab
    const [activeActionTab, setActiveActionTab] = useState('before'); // Default to 'before'

    // State for all configured agent actions, structured by tab key
    const [allAgentActions, setAllAgentActions] = useState({
        before: [],
        during: [],
        after: [],
    });

    // State for modal visibility
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // *** NEW STATE FOR VIEW MODAL ***
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [actionToView, setActionToView] = useState(null); // Holds the action data for the view modal


    // State for loading/saving/deleting
    const [isLoadingActions, setIsLoadingActions] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [isAddingActions, setIsAddingActions] = useState(false);
    const [addError, setAddError] = useState(null);

     const [isDeletingAction, setIsDeletingAction] = useState(false);
     const [deleteError, setDeleteError] = useState(null);


    // Effect to fetch initial actions data when agentId is available
    useEffect(() => {
        if (agentId) {
            const loadActions = async () => {
                setIsLoadingActions(true);
                setFetchError(null);
                try {
                    console.log(`[Actions Page] Fetching actions for agent ${agentId}...`);
                    const fetchedActions = await fetchAgentActions(agentId);
                    console.log("[Actions Page] Fetched actions:", fetchedActions);
                    setAllAgentActions(fetchedActions);
                } catch (err) {
                    console.error('[Actions Page] Error loading actions:', err);
                    setFetchError(err.message);
                     setAllAgentActions({ before: [], during: [], after: [] });
                } finally {
                    setIsLoadingActions(false);
                }
            };
            loadActions();
        } else {
             setIsLoadingActions(true);
             setFetchError('Agent ID not available.');
        }
    }, [agentId]); // Dependency on agentId


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
         // Clear any add errors when modal is closed
         setAddError(null);
    };

     // *** HANDLERS FOR VIEW MODAL ***
     const openViewModal = (action) => {
         setActionToView(action); // Set the action data to be viewed
         setIsViewModalOpen(true); // Open the modal
     };

     const closeViewModal = () => {
         setIsViewModalOpen(false); // Close the modal
         setActionToView(null); // Clear the action data when closed (good practice)
     };


    // Function to handle actions selected in the Add modal and add them
    const handleAddSelectedActions = async (selectedGlobalActions) => {
        setAddError(null);
        setIsAddingActions(true);

        const actionIdsToAdd = selectedGlobalActions.map(action => action.id);
        const timing = activeActionTab;

        try {
            console.log(`[Actions Page] Adding actions [${actionIdsToAdd.join(', ')}] to agent ${agentId} for timing "${timing}"`);
            const newlyAddedAgentActions = await addAgentActions(agentId, timing, actionIdsToAdd);

            setAllAgentActions(prevActions => {
                 const currentTabActions = prevActions[timing] || [];
                 const updatedTabActions = [...currentTabActions, ...newlyAddedAgentActions];
                 updatedTabActions.sort((a, b) => (a.order || 0) - (b.order || 0));

                return {
                    ...prevActions,
                    [timing]: updatedTabActions
                };
            });

			router.refresh();

            toast.success(`${newlyAddedAgentActions.length} action(s) added successfully!`);
            console.log("[Actions Page] Actions added:", newlyAddedAgentActions);

            closeAddModal(); // Close modal on success

        } catch (err) {
            console.error('[Actions Page] Error adding actions:', err);
            setAddError(err.message);
            toast.error(`Failed to add actions: ${err.message}`);
        } finally {
            setIsAddingActions(false);
        }
    };

     // Handler for deleting an action instance
     const handleDeleteAction = async (agentActionId, timing) => {
         if (!agentId || !agentActionId || !timing) {
              console.warn("[Actions Page] Missing info to delete action instance.");
             toast.error("Could not delete action: Missing necessary information.");
             return;
         }

         // Optional: Add a confirmation dialog here if not already in ActionList
          // if (!confirm('Are you sure you want to remove this action?')) {
          //      return;
          // }

         setDeleteError(null);
         setIsDeletingAction(true);

         try {
             console.log(`[Actions Page] Deleting action instance ${agentActionId} for agent ${agentId}, timing ${timing}`);
             const deleteResult = await deleteAgentAction(agentId, agentActionId);

             setAllAgentActions(prevActions => {
                 const currentTabActions = prevActions[timing] || [];
                 const updatedTabActions = currentTabActions.filter(action => action.agentActionId !== agentActionId);

                  return {
                     ...prevActions,
                     [timing]: updatedTabActions
                 };
             });

             toast.success(`Action removed successfully!`);
             console.log(`[Actions Page] Action instance ${agentActionId} removed from state.`);

         } catch (err) {
             console.error('[Actions Page] Error deleting action:', err);
             setDeleteError(err.message);
             toast.error(`Failed to remove action: ${err.message}`);
         } finally {
             setIsDeletingAction(false);
         }
     };


     // Use useMemo to calculate counts efficiently
     const actionCounts = useMemo(() => {
         return {
              before: allAgentActions.before.length,
              during: allAgentActions.during.length,
              after: allAgentActions.after.length,
         };
     }, [allAgentActions]); // Recalculate whenever allAgentActions state changes


    // Determine the content component based on the active tab
    // Pass the actions array, handlers, tabKey, and deleting state
     const currentTabContent = {
        before: <ActionList
                    title="Before the Call"
                    description="Actions that are set to run before the call"
                    actions={allAgentActions.before}
                    onAddActionClick={openAddModal}
                    onDeleteAction={handleDeleteAction}
                    onViewAction={openViewModal} // *** PASS VIEW HANDLER ***
                    tabKey="before"
                    isDeleting={isDeletingAction}
                />,
        during: <ActionList
                    title="During the Call"
                    description="Actions that are set to run during the call"
                    actions={allAgentActions.during}
                    onAddActionClick={openAddModal}
                    onDeleteAction={handleDeleteAction}
                    onViewAction={openViewModal} // *** PASS VIEW HANDLER ***
                    tabKey="during"
                    isDeleting={isDeletingAction}
                />,
        after: <ActionList
                   title="After the Call"
                   description="Actions that are set to run after the call"
                   actions={allAgentActions.after}
                   onAddActionClick={openAddModal}
                   onDeleteAction={handleDeleteAction}
                   onViewAction={openViewModal} // *** PASS VIEW HANDLER ***
                   tabKey="after"
                   isDeleting={isDeletingAction}
               />,
    }[activeActionTab];


    return (
        <div className="flex flex-col space-y-6 w-full h-full">

            {/* Actions Page Title */}
             <motion.h1
                 className={`text-2xl font-bold ${uiColors.textPrimary}`}
                 variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                  initial="hidden"
                 animate="visible"
             >
                 Actions
             </motion.h1>


             {fetchError && ( // Display fetch error message
                  <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                     Error loading actions: {fetchError}
                  </div>
             )}
              {addError && ( // Display add error message
                  <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                     Error adding actions: {addError}
                  </div>
             )}
              {deleteError && ( // Display delete error message
                  <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                     Error removing action: {deleteError}
                  </div>
             )}


            {/* Render the tabs */}
             <motion.div
                 variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                  initial="hidden"
                 animate="visible"
                 transition={{ delay: 0.1 }}
                 className="flex-shrink-0"
            >
                <ActionTabs
                    activeTab={activeActionTab}
                    onTabChange={handleTabChange}
                    counts={actionCounts} // Pass counts to tabs
                />
            </motion.div>


            {/* Render the content based on the active tab */}
             {isLoadingActions ? (
                 <div className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textSecondary}`}>
                      <FiLoader className="animate-spin mx-auto w-8 h-8 mb-4" /> Loading Actions...
                 </div>
             ) : (
                 <motion.div
                      className="flex-grow overflow-y-auto p-4 md:p-0" // Ensure content area scrolls, adjust padding
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                       initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.2 }}
                 >
                     {currentTabContent}
                 </motion.div>
             )}


            {/* Render the Add Action Modal */}
             <AddActionModal
                 isOpen={isAddModalOpen}
                 onClose={closeAddModal}
                 onAddActions={handleAddSelectedActions} // Pass the handler for selected actions
                 agentId={agentId} // Pass agentId to modal's fetch call
                 isAddingActions={isAddingActions} // Pass state to disable modal
             />

             {/* *** RENDER THE VIEW ACTION MODAL *** */}
             <ViewActionModal
                 isOpen={isViewModalOpen}
                 onClose={closeViewModal}
                 action={actionToView} // Pass the action data to the modal
             />


        </div>
    );
}
