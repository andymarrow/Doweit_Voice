// /app/callagents/actions/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiSearch, FiRefreshCw, FiLoader } from 'react-icons/fi';

// Import components
import ActionCardList from './_components/ActionCardList';
import CreateActionModal from './_components/CreateActionModal';
import ViewActionModal from './_components/ViewActionModal';
import DeleteConfirmationModal from './_components/DeleteConfirmationModal';
import EditActionModal from './_components/EditActionModal';

// Import constants
import { uiColors } from '../_constants/uiConstants';
import { sectionVariants } from '../_constants/uiConstants';


export default function GlobalActionsPage() {
    const [allActions, setAllActions] = useState([]);
    const [isLoadingActions, setIsLoadingActions] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // State to hold the action currently being viewed, edited, or deleted
    const [selectedAction, setSelectedAction] = useState(null);
    const [error, setError] = useState(null); // State for API errors


    // --- Function to Fetch Actions ---
    const loadActions = async () => {
        setIsLoadingActions(true);
        setError(null); // Clear previous errors
        try {
            const response = await fetch('/api/actions'); // Call the GET /api/actions endpoint
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch actions.');
            }
            const fetchedActions = await response.json();
            setAllActions(fetchedActions);
            console.log("Fetched actions:", fetchedActions);
        } catch (err) {
            console.error('Error loading actions:', err);
            setError(err.message);
            setAllActions([]); // Clear list on error
        } finally {
             setIsLoadingActions(false);
        }
    };
    // --- End Fetch Function ---


    // Fetch actions on component mount
    useEffect(() => {
        loadActions();
    }, []);

    // Filter actions based on search term
    const filteredActions = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase(); // Correctly defined here
        return allActions.filter(action =>
            action.name?.toLowerCase().includes(lowerCaseSearch) ||
            action.displayName?.toLowerCase().includes(lowerCaseSearch) ||
            action.type?.toLowerCase().includes(lowerCaseSearch) ||
            action.source?.toLowerCase().includes(lowerCaseSearch) ||
            (action.description && action.description.toLowerCase().includes(lowerCaseSearch)) ||
            // Add filtering logic for config details
            (action.config?.type === 'Choice' && Array.isArray(action.config.options) && action.config.options.some(opt => opt.label?.toLowerCase().includes(lowerCaseSearch))) ||
            // CORRECTED TYPO HERE: Use lowerCaseSearch instead of lowerSearchTerm
            (action.config?.type === 'Boolean' && ((action.config.trueLabel?.toLowerCase().includes(lowerCaseSearch)) || (action.config.falseLabel?.toLowerCase().includes(lowerCaseSearch))))
        );
    }, [allActions, searchTerm]);

    // --- Handlers for Modals ---

    // Create Modal
    const openCreateModal = () => { setIsCreateModalOpen(true); setError(null); };
    const closeCreateModal = () => setIsCreateModalOpen(false);
     // Handler called from CreateActionModal after it successfully calls the API
     const handleActionCreated = (newAction) => {
         console.log("New action successfully created:", newAction);
         // Re-fetch the entire list to get the latest data including the new action
         loadActions();
         // closeCreateModal() is called by the modal itself upon success
     };


    // View Modal
    const handleViewAction = (action) => {
         setSelectedAction(action);
         setIsViewModalOpen(true);
         setError(null);
    };
    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setTimeout(() => setSelectedAction(null), 300);
    };

    // Edit Modal
    const handleEditAction = (action) => {
        setSelectedAction(action);
        setIsEditModalOpen(true);
        setError(null);
    };
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setTimeout(() => setSelectedAction(null), 300);
    };
     // Handler called from EditActionModal after it successfully calls the API
     const handleActionUpdated = (updatedAction) => {
         console.log("Action successfully updated:", updatedAction);
         // Re-fetch the entire list
         loadActions();
         // closeEditModal() is called by the modal itself upon success
     };


    // Delete Modal (Confirmation)
    const handleDeleteClick = (action) => {
         setSelectedAction(action);
         setIsDeleteModalOpen(true);
         setError(null);
    };
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTimeout(() => setSelectedAction(null), 300);
    };
    // Handler called from DeleteConfirmationModal when user confirms delete
    const handleConfirmDelete = async () => {
         if (!selectedAction) return;

         setIsLoadingActions(true); // Show loading on main page while deleting
         setError(null); // Clear errors

         try {
             // Call the DELETE /api/actions/:actionId endpoint
             const response = await fetch(`/api/actions/${selectedAction.id}`, {
                 method: 'DELETE',
             });

             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'Failed to delete action.');
             }

             console.log(`Action ${selectedAction.id} deleted successfully.`);
             // Re-fetch the entire list
             loadActions(); // loadActions will set isLoadingActions back to false

         } catch (err) {
             console.error(`Error deleting action ${selectedAction.id}:`, err);
             setError(err.message);
             setIsLoadingActions(false); // Stop loading on error
         } finally {
             // closeDeleteModal() is called by the modal itself upon confirmation or cancellation
         }
    };


    return (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="flex flex-col space-y-6 w-full h-full">

            {/* Page Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Available Actions</h1>
                {/* Create New Action Button */}
                <button
                    onClick={openCreateModal}
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} ${uiColors.ringAccentShade} focus:ring-1 outline-none`}
                     disabled={isLoadingActions} // Disable create while loading
                >
                    <FiPlusCircle className="mr-2 w-4 h-4" /> Create New Action
                </button>
            </div>

             {/* Error Message Display */}
             {error && (
                 <div className={`p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                     Error: {error}
                 </div>
             )}


            {/* Search & Refresh */}
            <motion.div className={`flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}>
                 {/* Search Input */}
                 <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary} flex-grow max-w-sm w-full sm:w-auto`}>
                     <FiSearch className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2 flex-shrink-0`} />
                     <input
                         type="text"
                         placeholder="Search actions..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none`}
                          disabled={isLoadingActions}
                     />
                 </div>
                 {/* Refresh Button */}
                 <button
                      onClick={loadActions}
                      disabled={isLoadingActions}
                      className={`p-2 rounded-md transition-colors ${uiColors.hoverBgSubtle} text-gray-600 dark:text-gray-300`}
                 >
                     <FiRefreshCw className={`w-5 h-5 ${isLoadingActions ? 'animate-spin' : ''}`} />
                 </button>
            </motion.div>


            {/* Render the Action Card List */}
            <div className="flex-grow overflow-y-auto pr-2 -mr-2 hide-scrollbar">
                {isLoadingActions ? (
                    <div className={`text-center py-20 ${uiColors.textSecondary}`}>
                        <FiLoader className="animate-spin mx-auto w-8 h-8 mb-4" /> Loading actions...
                    </div>
                ) : filteredActions.length === 0 && searchTerm === '' ? (
                    <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                        No actions have been created yet. Click "Create New Action" to add your first one.
                    </div>
                ) : filteredActions.length === 0 && searchTerm !== '' ? (
                    <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                        No actions match your search.
                    </div>
                ) : (
                    <ActionCardList
                        actions={filteredActions}
                        onView={handleViewAction}
                        onEdit={handleEditAction}
                        onDelete={handleDeleteClick}
                    />
                )}
            </div>


            {/* Render Modals */}
            {/* Create Modal */}
            <CreateActionModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                onCreateAction={handleActionCreated}
            />

            {/* View, Edit, Delete Modals (conditionally rendered based on selectedAction and isOpen state) */}
            {/* selectedAction check ensures modal gets data; isOpen check controls visibility */}

             {isViewModalOpen && selectedAction && (
                 <ViewActionModal
                     isOpen={isViewModalOpen}
                     onClose={closeViewModal}
                     action={selectedAction}
                 />
             )}

             {isEditModalOpen && selectedAction && (
                  <EditActionModal
                       isOpen={isEditModalOpen}
                       onClose={closeEditModal}
                       action={selectedAction}
                       onUpdateAction={handleActionUpdated}
                   />
             )}

             {isDeleteModalOpen && selectedAction && (
                  <DeleteConfirmationModal
                      isOpen={isDeleteModalOpen}
                      onClose={closeDeleteModal}
                      onConfirm={handleConfirmDelete}
                      actionName={selectedAction?.name || 'this action'}
                      // isDeleting is handled *within* DeleteConfirmationModal now,
                      // based on its own internal saving state for the API call.
                      // We removed the isDeletingAction state from this parent page
                      // as the modal handles its own loading state during the API call.
                      // If you re-added it to the parent page, you would pass it here.
                  />
             )}

        </motion.div>
    );
}