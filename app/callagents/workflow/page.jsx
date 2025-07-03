
// Placeholder Simple Modals (for demo purposes)
// app/callagents/workflow/page.jsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiLoader, FiAlertTriangle, FiSave, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// *** Import React Flow ***
import { // CORRECT: All imports are named exports
    ReactFlow, // <-- Move ReactFlow inside the curly braces
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    addEdge,
    Controls,
    MiniMap,
    Background,
    Panel,
} from '@xyflow/react';

// And ensure you have the styles imported somewhere
import '@xyflow/react/dist/style.css';// <-- Added this!
// Remember to import the React Flow styles somewhere globally or in layout.jsx

// *** Import Custom Node Components ***
// Define path relative to this page component
import PromptNode from './_components/PromptNode';
import KnowledgeBaseNode from './_components/KnowledgeBaseNode';
import ActionNode from './_components/ActionNode';

// *** Import Existing Modals (Reused/Adapted) ***
// Path relative to this page component
// import SelectKnowledgeBaseModal from '../[agentid]/configure/_components/SelectKnowledgeBaseModal'; // Reuse Select KB modal
// Adapt/Create a simple modal for editing Prompt/Greeting (or reuse from Prompt page)
// Adapt/Create a modal for adding Actions (or reuse AddActionModal from agent actions page)


// *** FIX: Corrected Placeholder Simple Modals syntax ***
const EditPromptModal = ({ isOpen, onClose, initialData, onSave, isSaving }) => {
    // Return null if not open
    if (!isOpen) return null;
    // Otherwise, return placeholder modal JSX
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6">
                 <h3 className="text-lg font-semibold mb-4">Edit Prompt (Placeholder)</h3>
                 <p className="text-sm text-gray-600">This is a placeholder modal.</p>
                 <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-200 mr-2">Close</button>
                    {/* Example save button calling onSave prop */}
                    {/* <button onClick={() => onSave({...})} disabled={isSaving} className="px-4 py-2 text-sm rounded bg-blue-500 text-white">Save</button> */}
                 </div>
            </div>
        </div>
    );
};

const AddActionModal = ({ isOpen, onClose, agentId, timing, onAddActions, isSaving }) => {
    // Return null if not open
    if (!isOpen) return null;
     // Otherwise, return placeholder modal JSX
    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6">
                 <h3 className="text-lg font-semibold mb-4">Add Action ({timing}) (Placeholder)</h3>
                 <p className="text-sm text-gray-600">This is a placeholder modal.</p>
                 <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-200 mr-2">Close</button>
                    {/* Example add button calling onAddActions prop */}
                     {/* <button onClick={() => onAddActions([{ id: 99, name: 'Mock Action' }])} disabled={isSaving} className="px-4 py-2 text-sm rounded bg-green-500 text-white">Add Mock</button> */}
                 </div>
            </div>
        </div>
    );
};

// Import constants
import { uiColors } from '../_constants/uiConstants';
import { itemVariants, sectionVariants } from '../_constants/uiConstants';


// --- API Helper Functions (Define outside the component) ---
// These call the backend endpoints we've already created or defined.

const fetchUserAgents = async () => {
     console.log("[Workflow Page] Calling GET /api/callagents...");
    const response = await fetch('/api/callagents');
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch agents');
    }
    return response.json();
};

const fetchAgentConfig = async (agentId) => {
     console.log(`[Workflow Page] Calling GET /api/callagents/${agentId}/config...`);
    const response = await fetch(`/api/callagents/${agentId}/config`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch agent config');
    }
    return response.json();
};

const fetchAgentActions = async (agentId) => {
     console.log(`[Workflow Page] Calling GET /api/callagents/${agentId}/actions/workflow...`);
    const response = await fetch(`/api/callagents/${agentId}/actions/workflow`);
    console.log(`[Workflow Page] Calling GET /api/callagents/${agentId}/actions/workflow...`, response);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch agent actions');
    }
    return response.json();
};

const updateAgentConfig = async (agentId, updateData) => {
    console.log(`[Workflow Page] Calling PATCH /api/callagents/${agentId}/config...`, updateData);
    const response = await fetch(`/api/callagents/${agentId}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    });
     if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save config');
    }
    return response.json();
};

const addAgentActions = async (agentId, timing, actionIds) => {
    console.log(`[Workflow Page] Calling POST /api/callagents/${agentId}/actions/workflow...`, { timing, actionIds });
    const response = await fetch(`/api/callagents/${agentId}/actions/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timing, actionIds }),
    });
     if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add actions');
    }
    return response.json(); // Returns newly created agentAction details
};

const deleteAgentAction = async (agentId, agentActionId) => {
     console.log(`[Workflow Page] Calling DELETE /api/callagents/${agentId}/actions/workflow/${agentActionId}...`);
    const response = await fetch(`/api/callagents/${agentId}/actions/workflow/${agentActionId}`, {
        method: 'DELETE',
    });
     if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete action');
    }
    return response.json(); // Returns { success: true, deletedId: agentActionId }
};

const updateAgentAction = async (agentId, agentActionId, updateData) => {
     console.log(`[Workflow Page] Calling PATCH /api/callagents/${agentId}/actions/workflow/${agentActionId}...`, updateData);
    const response = await fetch(`/api/callagents/${agentId}/actions/workflow/${agentActionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    });
     if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update action order/timing');
    }
    return response.json(); // Returns updated agentAction instance
};


// Define custom node types mapping string keys to components
// *** Register your custom nodes here ***
const nodeTypes = {
    promptNode: PromptNode, // Map 'promptNode' type to PromptNode component
    knowledgeBaseNode: KnowledgeBaseNode, // Map 'knowledgeBaseNode' type to KnowledgeBaseNode component
    actionNode: ActionNode, // Map 'actionNode' type to ActionNode component
    // You might use 'input', 'output', 'default' from react-flow as well
};


export default function WorkflowPage() {
     const router = useRouter();

     // State for the list of agents in the selector
     const [availableAgents, setAvailableAgents] = useState([]);
     const [isLoadingAgents, setIsLoadingAgents] = useState(true);
     const [agentListError, setAgentListError] = useState(null);

     // State for the currently selected agent ID
     const [selectedAgentId, setSelectedAgentId] = useState(null);

     // State for the fetched configuration data for the selected agent
     // Use rawAgentConfig and rawAgentActions as the *source of truth* from the DB
     const [rawAgentConfig, setRawAgentConfig] = useState(null); // Basic config (prompt, greeting, kbId)
     const [rawAgentActions, setRawAgentActions] = useState({ before: [], during: [], after: [] }); // Agent action instances
     const [isLoadingConfig, setIsLoadingConfig] = useState(false); // Loading config for selected agent
     const [configError, setConfigError] = useState(null); // Error fetching config

     // State to track if changes have been made (complex) - Let's rely on explicit save for now
     // const [isWorkflowDirty, setIsWorkflowDirty] = useState(false);

     // State for overall saving process
     const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);
     const [saveError, setSaveError] = useState(null); // Error for saving

     // State for modals
     const [isEditPromptModalOpen, setIsEditPromptModalOpen] = useState(false);
     const [isSelectKbModalOpen, setIsSelectKbModalOpen] = useState(false);
     const [isAddActionModalOpen, setIsAddActionModalOpen] = useState(false);
     const [addActionTimingContext, setAddActionTimingContext] = useState(null); // Context for add action modal timing
     // const [isEditActionInstanceModalOpen, setIsEditActionInstanceModalOpen] = useState(false); // Optional edit modal
     // const [actionInstanceToEdit, setActionInstanceToEdit] = useState(null);


     // --- Fetch list of agents for the selector on page load ---
     useEffect(() => {
         const loadAgents = async () => {
             setIsLoadingAgents(true);
             setAgentListError(null);
             try {
                 const agents = await fetchUserAgents();
                 setAvailableAgents(agents);
                  // Auto-select the first agent if any exist
                 if (agents.length > 0) {
                     setSelectedAgentId(agents[0].id);
                 }
             } catch (err) {
                 console.error('[Workflow Page] Error loading agent list:', err);
                 setAgentListError(err.message);
             } finally {
                 setIsLoadingAgents(false);
             }
         };
         loadAgents();
     }, []); // Empty dependency array to run once on mount


     // --- Fetch configuration for the selected agent ---
     useEffect(() => {
         if (selectedAgentId === null) { // Handle null explicitly
              // No agent selected state
             setRawAgentConfig(null);
             setRawAgentActions({ before: [], during: [], after: [] });
             setIsLoadingConfig(false);
             setConfigError(null);
             return;
         }

         const loadAgentConfig = async () => {
             setIsLoadingConfig(true);
             setConfigError(null);
              // Clear previous config/actions while loading new one
             setRawAgentConfig(null);
             setRawAgentActions({ before: [], during: [], after: [] });

             try {
                 // Fetch basic config and actions in parallel
                 const [config, actions] = await Promise.all([
                     fetchAgentConfig(selectedAgentId),
                     fetchAgentActions(selectedAgentId)
                 ]);
                 setRawAgentConfig(config);
                 setRawAgentActions(actions);
                 console.log(`[Workflow Page] Loaded config for agent ${selectedAgentId}:`, { config, actions });

             } catch (err) {
                 console.error(`[Workflow Page] Error loading config for agent ${selectedAgentId}:`, err);
                 setConfigError(err.message);
                  // Clear config/actions on error
                 setRawAgentConfig(null);
                 setRawAgentActions({ before: [], during: [], after: [] });
             } finally {
                 setIsLoadingConfig(false);
             }
         };
         loadAgentConfig();
     }, [selectedAgentId]); // Re-fetch whenever selectedAgentId changes


     // --- Handlers for State Updates & API Calls (Wrapped in useCallback) ---

     // Handler to open Edit Prompt modal
     const handleOpenEditPromptModal = useCallback(() => {
         if (!selectedAgentId || isLoadingConfig || configError || isSavingWorkflow) return;
         setIsEditPromptModalOpen(true);
     }, [selectedAgentId, isLoadingConfig, configError, isSavingWorkflow, setIsEditPromptModalOpen]); // Dependencies

     const handleCloseEditPromptModal = useCallback(() => {
          // Optional: Check for unsaved changes in modal form before closing
          setIsEditPromptModalOpen(false);
     }, [setIsEditPromptModalOpen]);


     // Handler to open Select KB modal
     const handleOpenSelectKbModal = useCallback(() => {
          if (!selectedAgentId || isLoadingConfig || configError || isSavingWorkflow) return;
         setIsSelectKbModalOpen(true);
     }, [selectedAgentId, isLoadingConfig, configError, isSavingWorkflow, setIsSelectKbModalOpen]); // Dependencies

     const handleCloseSelectKbModal = useCallback(() => {
         setIsSelectKbModalOpen(false);
     }, [setIsSelectKbModalOpen]);


     // Handler to open Add Action modal
     const handleOpenAddActionModal = useCallback((timing) => { // Pass the timing context (e.g., 'before', 'during', 'after')
         if (!selectedAgentId || isLoadingConfig || configError || isSavingWorkflow) return;
         setAddActionTimingContext(timing); // Set the timing context
         setIsAddActionModalOpen(true);
     }, [selectedAgentId, isLoadingConfig, configError, isSavingWorkflow, setAddActionTimingContext, setIsAddActionModalOpen]); // Dependencies

      const handleCloseAddActionModal = useCallback(() => {
          setIsAddActionModalOpen(false);
          setAddActionTimingContext(null); // Clear context on close
      }, [setIsAddActionModalOpen, setAddActionTimingContext]);


     // Handler for updating basic agent info (Prompt, Greeting, KB Link)
     // This is typically called from a modal's save button
     const handleUpdateBasicInfo = useCallback(async (updatedFields) => {
         if (!selectedAgentId) {
              console.warn("[Workflow Page] Update Basic Info: No agent selected.");
              toast.error("Cannot save: No agent selected.");
              return;
         }

         setIsSavingWorkflow(true);
         setSaveError(null);

         try {
              // Call the existing PATCH /api/callagents/[agentid]/config endpoint
              const updatedAgent = await updateAgentConfig(selectedAgentId, updatedFields);

              // Update local RAW state with the response
              setRawAgentConfig(prevConfig => prevConfig ? { ...prevConfig, ...updatedFields } : null);

             toast.success('Basic info saved!');
             // Close relevant modal if update was successful
             setIsEditPromptModalOpen(false);
             setIsSelectKbModalOpen(false);

         } catch (err) {
             console.error('[Workflow Page] Error saving basic info:', err);
             setSaveError(`Save failed: ${err.message}`);
             toast.error(`Save failed: ${err.message}`);
         } finally {
             setIsSavingWorkflow(false);
         }
     }, [selectedAgentId, setIsSavingWorkflow, setSaveError, setRawAgentConfig, toast, setIsEditPromptModalOpen, setIsSelectKbModalOpen]); // Dependencies


     // Handler for adding action instances (from Add Action Modal)
     const handleAddActionInstances = useCallback(async (selectedGlobalActionObjects) => { // Receive selected GLOBAL action OBJECTS
         if (!selectedAgentId || !addActionTimingContext || selectedGlobalActionObjects.length === 0) {
             console.warn("[Workflow Page] Add Action Instances: Missing agent, timing context, or selected actions.");
             toast.error("Could not add actions: Missing necessary information.");
             return;
         }

         setIsSavingWorkflow(true);
         setSaveError(null);

         const actionIdsToAdd = selectedGlobalActionObjects.map(action => action.id); // Extract IDs from objects
         const timing = addActionTimingContext;

         try {
              // Call the existing POST /api/callagents/[agentid]/actions endpoint
              const newlyAddedAgentActions = await addAgentActions(selectedAgentId, timing, actionIdsToAdd);

              // Update local RAW actions state with the newly added actions
              setRawAgentActions(prevActions => {
                  const updatedActions = { ...prevActions };
                  const currentTabActions = updatedActions[timing] || [];
                  const updatedTabActions = [...currentTabActions, ...newlyAddedAgentActions];
                  // Re-sort the array by order if necessary for the canvas layout logic
                  updatedTabActions.sort((a, b) => (a.order || 0) - (b.order || 0));

                 return {
                     ...updatedActions, // Spread updatedActions which includes the new tab actions
                     [timing]: updatedTabActions
                 };
             });

             toast.success(`${newlyAddedAgentActions.length} action step(s) added successfully!`);
             setIsAddActionModalOpen(false); // Close modal

         } catch (err) {
             console.error('[Workflow Page] Error adding actions:', err);
             setSaveError(`Failed to add action steps: ${err.message}`);
             toast.error(`Failed to add action steps: ${err.message}`);
         } finally {
             setIsSavingWorkflow(false);
             setAddActionTimingContext(null); // Clear context
         }
     }, [selectedAgentId, addActionTimingContext, setIsSavingWorkflow, setSaveError, setRawAgentActions, toast, setIsAddActionModalOpen, setAddActionTimingContext]); // Dependencies


     // Handler for deleting an action instance (from Action Node or modal)
     const handleDeleteActionInstance = useCallback(async (agentActionId) => {
         if (!selectedAgentId || !agentActionId) {
             console.warn("[Workflow Page] Delete Action Instance: Missing agent or action instance ID.");
             toast.error("Could not delete action step: Missing necessary information.");
             return;
         }

         // Optional: Confirmation dialog here or within the node component
         if (!confirm('Are you sure you want to remove this action step?')) {
              return;
         }

         setIsSavingWorkflow(true); // Use saving state for delete too
         setSaveError(null);

         try {
              // Call the existing DELETE /api/callagents/[agentid]/actions/[agentactionid] endpoint
              const deleteResult = await deleteAgentAction(selectedAgentId, agentActionId);

              // Update local RAW actions state by filtering out the deleted item
              setRawAgentActions(prevActions => {
                  const updatedActions = { ...prevActions };
                  const timingKeys = ['before', 'during', 'after'];
                   for (const timingKey of timingKeys) {
                       const initialLength = updatedActions[timingKey].length;
                       updatedActions[timingKey] = updatedActions[timingKey].filter(action => action.agentActionId !== agentActionId);
                       if (updatedActions[timingKey].length < initialLength) break; // Found and removed
                   }
                  // Optional: Implement logic to re-index 'order' for the remaining actions in that timing group
                  // This might be complex and depend on how canvas handles order.
                  return updatedActions;
              });

             toast.success(`Action step removed successfully!`);

         } catch (err) {
             console.error('[Workflow Page] Error deleting action instance:', err);
             setSaveError(`Failed to remove action step: ${err.message}`);
             toast.error(`Failed to remove action step: ${err.message}`);
         } finally {
             setIsSavingWorkflow(false);
         }
     }, [selectedAgentId, setIsSavingWorkflow, setSaveError, setRawAgentActions, toast]); // Dependencies


     // Handler for updating action instance properties (timing, order) - triggered by drag/drop on canvas
     const handleUpdateActionInstance = useCallback(async (agentActionId, updateData) => {
          // updateData could be { timing: 'new_timing', order: new_order }
         if (!selectedAgentId || !agentActionId || !updateData || Object.keys(updateData).length === 0) {
             console.warn("[Workflow Page] Update Action Instance: Missing agent, action instance ID, or update data.");
              // toast.error("Could not update action step."); // Maybe too disruptive for drag
              return;
         }
          // Prevent update if currently saving anything else
         if (isSavingWorkflow) {
              console.log("[Workflow Page] Update Action Instance: Saving in progress, skipping update.");
             return;
         }

         // Optional: Indicate saving state specifically for this action node? Or rely on overall save?
         // setIsSavingWorkflow(true); // Or manage individual node saving state
         setSaveError(null); // Clear error

         try {
              // Call the NEW PATCH /api/callagents/[agentid]/actions/[agentactionid] endpoint
              const updatedInstance = await updateAgentAction(selectedAgentId, agentActionId, updateData);

              // Update local RAW actions state with the response
              setRawAgentActions(prevActions => {
                  const updatedActions = { ...prevActions };
                   let oldTiming = null; // Find the action's old timing and remove it
                   const timingKeys = ['before', 'during', 'after'];
                    for (const timingKey of timingKeys) {
                         updatedActions[timingKey] = updatedActions[timingKey].filter(action => {
                             if (action.agentActionId === agentActionId) {
                                  oldTiming = timingKey;
                                 return false; // Remove the old instance
                             }
                             return true;
                         });
                         // If timing was found and removed, no need to check other keys
                         if (oldTiming) break;
                    }

                    // Find the original action definition details to re-attach
                    // Need to find it *before* filtering it out in the block above!
                    const originalActionDetails = (prevActions[oldTiming] || []).find(action => action.agentActionId === agentActionId)?.action;


                   // Add the updated instance to the correct timing group
                   const targetTiming = updateData.timing || oldTiming; // Use new timing if provided, otherwise stay in old timing
                   if (targetTiming && updatedActions[targetTiming]) {
                        // Add the updated instance, including original action details needed by frontend
                        updatedActions[targetTiming] = [...updatedActions[targetTiming], {
                            ...updatedInstance, // timing, order from API response
                             action: originalActionDetails || null // Re-attach global action details
                        }];
                       // Sort the target array
                       updatedActions[targetTiming].sort((a, b) => (a.order || 0) - (b.order || 0));
                   } else {
                        // This case indicates invalid timing or original timing not found, should not happen
                        console.error(`[Workflow Page] Update Action Instance: Could not find target timing ${targetTiming} or original timing ${oldTiming} for instance ${agentActionId}.`);
                       // Revert state or handle error
                        // For now, just log and return current state
                        return prevActions;
                   }

                 // TODO: Implement client-side re-indexing of 'order' for affected timing group(s)
                 // This makes the local state consistent after drags/reorders without needing a full re-fetch.

                 return updatedActions;
             });

             // Optional: Show transient success feedback per drag or wait for explicit Save
             // toast.success('Action order/timing updated!');

         } catch (err) {
             console.error('[Workflow Page] Error updating action instance:', err);
             setSaveError(`Failed to update action step: ${err.message}`);
              // toast.error(`Failed to update action step: ${err.message}`); // Maybe too frequent for drag
         } finally {
             // setIsSavingWorkflow(false); // Only manage overall save state if clicking a Save button
         }
     }, [selectedAgentId, isSavingWorkflow, setSaveError, setRawAgentActions, rawAgentActions, toast]); // Dependencies


    // --- Determine state for rendering ---
    const showLoading = isLoadingAgents || isLoadingConfig;
    // *** FIX: Define showError here using the state variables ***
    const showError = agentListError || configError;
    const isAgentSelectedAndLoaded = selectedAgentId !== null && !showLoading && !showError && rawAgentConfig !== null && rawAgentActions !== null;


    // --- Memoized data for Canvas ---
    // This hook prepares the data (nodes, edges) for the canvas component
    // It should re-run whenever the raw data or relevant handlers/states change
     const { generatedNodes, generatedEdges } = useMemo(() => {
         console.log("[Workflow Page] Re-generating nodes and edges for canvas...");
         const nodes = [];
         const edges = [];

         const timingLaneX = {
             before: 400,
             during: 700, // Shift during/after to the right
             after: 1000,
         };
         // Starting Y position for each lane (could be same or different)
         const timingLaneStartY = {
             before: 50,
             during: 50,
             after: 50,
         };


         // Placeholder: Create a starting node (e.g., Call Start)
         nodes.push({
             id: 'start',
             type: 'input', // react-flow type
             data: { label: 'Call Start' },
             position: { x: 100, y: 50 }, // Placeholder position
             selectable: false, // Start/End nodes typically not selectable/draggable
             draggable: false,
         });

         let currentNodeY = 150; // Starting Y position for subsequent nodes

         // 1. Prompt/Greeting Node
         if (rawAgentConfig) {
             const promptNode = {
                 id: 'prompt',
                 // *** Use your custom node type ***
                 type: 'promptNode',
                  // Pass relevant data and handlers to a custom node component
                 data: {
                     label: 'Prompt & Greeting', // Main label for the node
                     config: { // Data for display/edit modal/node content
                         prompt: rawAgentConfig.prompt,
                         greetingMessage: rawAgentConfig.greetingMessage,
                     },
                      onEditClick: handleOpenEditPromptModal, // Handler to open modal (useCallback)
                 },
                 position: { x: 100, y: currentNodeY }, // Position below start
             };
             nodes.push(promptNode);
             edges.push({ id: 'e-start-prompt', source: 'start', target: 'prompt', type: 'smoothstep' }); // Edge from start
             currentNodeY += 150; // Increment Y for next section
         }

         // 2. Knowledge Base Node
          if (rawAgentConfig) { // Show KB node if linked OR if owner (to allow linking), or even just to show "No KB Linked"
              const kbNode = {
                 id: 'kb',
                  // *** Use your custom node type ***
                  type: 'knowledgeBaseNode',
                 data: {
                     label: 'Knowledge Base', // Main label
                     config: { // Data for display/edit modal/node content
                         knowledgeBaseId: rawAgentConfig.knowledgeBaseId,
                         isOwner: rawAgentConfig.isOwner, // Pass ownership for UI logic
                     },
                      onSelectClick: handleOpenSelectKbModal, // Handler to open modal (useCallback)
                 },
                  position: { x: 100, y: currentNodeY },
             };
             nodes.push(kbNode);
              // Edge from Prompt node if it exists, otherwise from Start
              const sourceId = nodes.some(n => n.id === 'prompt') ? 'prompt' : 'start';
               // Ensure source node exists before adding edge
               if (nodes.find(n => n.id === sourceId)) {
                  edges.push({ id: 'e-prompt-kb', source: sourceId, target: 'kb', type: 'smoothstep' });
               }
             currentNodeY += 150;
         }


         // 3. Action Nodes (Grouped by Timing)
         const timingGroups = ['before', 'during', 'after'];
         // Define columns/lanes for timing groups
         


         timingGroups.forEach(timing => {
             const actionsInTiming = rawAgentActions[timing] || [];
             let actionNodeY = timingLaneStartY[timing]; // Starting Y for actions in this group

              // Add nodes for each action instance in this timing group
              actionsInTiming
                  .sort((a, b) => (a.order || 0) - (b.order || 0)) // Ensure actions are sorted by order for layout
                  .forEach((actionInstance, index) => {
                 const actionNode = {
                      // Use the unique agentActionId for node ID
                     id: `action-${actionInstance.agentActionId}`,
                      // *** Use your custom node type ***
                     type: 'actionNode',
                     data: {
                         label: actionInstance.action?.name || 'Unnamed Action', // Main label
                         action: actionInstance, // Pass the full action instance data
                         // Pass handlers for instance actions (useCallback versions)
                         onDeleteClick: handleDeleteActionInstance,
                         // onEditClick: handleOpenEditActionInstanceModal, // Optional handler to edit instance details
                     },
                     // Use lane position and index for Y position
                     position: { x: timingLaneX[timing], y: actionNodeY + (index * 80) },
                      // Attach timing and order data directly to node for drag handling logic outside useMemo
                     timing: timing,
                     order: actionInstance.order,
                      // Make Action nodes draggable
                      draggable: true,
                 };
                 nodes.push(actionNode);
              });

              // Add an "Add Action" button node *within* each timing lane (Optional visual approach)
               // Or add a button to a Panel that triggers the modal with timing context
               // Let's add Panel buttons for simplicity initially, as done in the render JSX.
               // If you add Add Action nodes:
               /*
               if (rawAgentConfig?.isOwner) { // Only if owner can add
                    nodes.push({
                        id: `add-action-${timing}`,
                        type: 'default', // Or custom 'addActionNode'
                        data: {
                            label: `+ Add ${timing} Action`,
                            type: 'add-action-button', // Custom type
                            timing: timing,
                             onAddClick: handleOpenAddActionModal, // Handler (useCallback)
                        },
                        position: { x: timingLaneX[timing], y: actionNodeY + (actionsInTiming.length * 80) + 20 }, // Position below last action
                         draggable: false,
                    });
               }
               */
         });

         // *** Add Edges Between Sections/Lanes ***
         // Connect Prompt/KB to the start of the 'before' lane
         const promptKbSourceId = nodes.some(n => n.id === 'kb') ? 'kb' : (nodes.some(n => n.id === 'prompt') ? 'prompt' : null);
         const firstBeforeAction = nodes.find(n => n.timing === 'before' && n.order === 0);
         if (firstBeforeAction && promptKbSourceId && nodes.find(n => n.id === promptKbSourceId)) {
             edges.push({ id: `e-${promptKbSourceId}-before-start`, source: promptKbSourceId, target: firstBeforeAction.id, type: 'smoothstep' });
         } else if (firstBeforeAction && !promptKbSourceId) { // If no Prompt/KB, connect start to first before action
             edges.push({ id: `e-start-before-start`, source: 'start', target: firstBeforeAction.id, type: 'smoothstep' });
         }


         // Connect the last action of one lane to the first action of the next lane
         timingGroups.slice(0, -1).forEach((currentTiming, index) => {
              const nextTiming = timingGroups[index + 1];
              const lastActionInCurrentTiming = nodes.filter(n => n.timing === currentTiming).sort((a, b) => (b.order || 0) - (a.order || 0))[0];
              const firstActionInNextTiming = nodes.filter(n => n.timing === nextTiming).sort((a, b) => (a.order || 0) - (b.order || 0))[0];

             if (lastActionInCurrentTiming && firstActionInNextTiming) {
                 edges.push({ id: `e-${lastActionInCurrentTiming.id}-${firstActionInNextTiming.id}`, source: lastActionInCurrentTiming.id, target: firstActionInNextTiming.id, type: 'smoothstep' });
             }
         });


         // Placeholder: Add an ending node (e.g., Call End)
          // Position End node based on the maximum Y position of all nodes + some offset
          const maxY = nodes.reduce((max, n) => Math.max(max, n.position.y), 0);
         nodes.push({
             id: 'end',
             type: 'output', // react-flow type
             data: { label: 'Call End' },
             position: { x: 100, y: maxY + 150 }, // Position below everything
             selectable: false, // Start/End nodes typically not selectable/draggable
             draggable: false,
         });

          // Add edges from the last nodes of each lane/section to the End node
          // Find the last node in each primary flow path if no outgoing edge exists
          const potentialEndSources = nodes.filter(n =>
               n.id !== 'end' && // Not the end node itself
               !edges.some(e => e.source === n.id) // Has no outgoing edge
              // Consider only the last nodes of the main flow branches (Prompt/KB/last action in each lane)
              // This logic can get complex depending on desired graph structure
          );

          // Simple approach: Connect last node of 'after' lane, or 'during', or 'before', or KB, or Prompt to End
           const lastNodeInAfter = nodes.filter(n => n.timing === 'after').sort((a,b) => (b.order || 0) - (a.order || 0))[0];
           const lastNodeInDuring = nodes.filter(n => n.timing === 'during').sort((a,b) => (b.order || 0) - (a.order || 0))[0];
           const lastNodeInBefore = nodes.filter(n => n.timing === 'before').sort((a,b) => (b.order || 0) - (a.order || 0))[0];
           const kbNode = nodes.find(n => n.id === 'kb');
           const promptNode = nodes.find(n => n.id === 'prompt');
           const startNode = nodes.find(n => n.id === 'start'); // Should always connect to something else


           const mainFlowEndSources = [lastNodeInAfter, lastNodeInDuring, lastNodeInBefore, kbNode, promptNode].filter(n => n); // Remove nulls

           mainFlowEndSources.forEach(sourceNode => {
               // If this source node doesn't already have an edge going to the next main section or End
               const hasOutgoingMainEdge = edges.some(e => e.source === sourceNode.id && nodes.find(n => n.id === e.target)?.timing); // Edge to another action lane
                const hasEdgeToEnd = edges.some(e => e.source === sourceNode.id && e.target === 'end');

               if (!hasOutgoingMainEdge && !hasEdgeToEnd) {
                    edges.push({ id: `e-${sourceNode.id}-end`, source: sourceNode.id, target: 'end', type: 'smoothstep' });
               }
           });


         return { generatedNodes: nodes, generatedEdges: edges };

     }, [rawAgentConfig, rawAgentActions, isSavingWorkflow, handleOpenEditPromptModal, handleOpenSelectKbModal, handleDeleteActionInstance, handleOpenAddActionModal, handleUpdateActionInstance]);


    // --- React Flow State Management ---
    // Use the generated nodes/edges to initialize React Flow state
    // These states are what React Flow renders and updates directly on drag/interaction
     const [nodes, setNodes, onNodesChange] = useNodesState(generatedNodes);
     const [edges, setEdges, onEdgesChange] = useEdgesState(generatedEdges);

    // Sync the generated nodes/edges from useMemo to the React Flow state
    // This effect runs when generatedNodes/Edges change (i.e., when raw data changes)
     useEffect(() => {
         setNodes(generatedNodes);
         setEdges(generatedEdges);
     }, [generatedNodes, generatedEdges, setNodes, setEdges]); // Depend on generated data and state setters

     // Handler for when a new edge is connected (e.g., by dragging a handle)
     const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

     // *** Handler for when a node is dropped after dragging ***
     // This is where we translate canvas position back to timing/order and call the API
     const onNodeDragStop = useCallback((event, node) => {
         console.log('Node Drag Stop:', node);
         if (node.type !== 'actionNode' || !selectedAgentId || isSavingWorkflow) {
              console.log("Drag stopped on non-action node or while saving, skipping update.");
             return; // Only process draggable action nodes when not saving
         }

         // *** Implement logic to determine new timing and order based on node.position ***
         // This requires defining regions on the canvas for each timing lane (e.g., based on timingLaneX)
         // And determining the order based on vertical position within that lane.

         const timingLaneX = { before: 400, during: 700, after: 1000, };

         let newTiming = node.timing; // Assume timing doesn't change unless dropped into a different lane region
         let newOrder = node.order; // Assume order doesn't change unless calculated based on new position

         // Example Placeholder Logic: Determine timing based on X position
         const tolerance = 50; // Tolerance for dropping into a lane
         if (node.position.x > timingLaneX.before - tolerance && node.position.x < timingLaneX.during - tolerance) {
              newTiming = 'before';
         } else if (node.position.x > timingLaneX.during - tolerance && node.position.x < timingLaneX.after - tolerance) {
              newTiming = 'during';
         } else if (node.position.x > timingLaneX.after - tolerance) {
              newTiming = 'after';
         } else {
              // If dropped outside expected lanes, maybe revert or show error
              console.warn(`Action node ${node.id} dropped outside defined timing lanes. Reverting position or keeping old timing.`);
               // Optionally revert the node's position to its old spot visually using setNodes
               // setNodes((nds) => nds.map(n => n.id === node.id ? { ...n, position: node.position } : n));
               newTiming = node.timing; // Keep old timing
               // Don't call API if timing is unchanged and no order re-calculation is done yet
         }

         // *** Implement Logic to Calculate New Order within the new/old timing lane ***
         // This involves finding all other nodes in the targetTiming lane and inserting the dropped node
         // into the correct vertical position to determine its new order.

         let calculatedNewOrder = node.order; // Default to old order

         if (newTiming === node.timing) {
              // If timing didn't change, re-calculate order within the same lane
               const siblingNodes = nodes.filter(n => n.timing === newTiming && n.id !== node.id);
               // Sort siblings by their current Y position
               siblingNodes.sort((a, b) => a.position.y - b.position.y);
               // Find where the dropped node fits based on its new Y position
               calculatedNewOrder = siblingNodes.findIndex(sibling => sibling.position.y > node.position.y);
               if (calculatedNewOrder === -1) {
                   calculatedNewOrder = siblingNodes.length; // Place at the end
               }
          } else {
               // If timing changed, calculate order within the NEW lane
                const siblingNodes = nodes.filter(n => n.timing === newTiming && n.id !== node.id); // Filter by NEW timing
                siblingNodes.sort((a, b) => a.position.y - b.position.y);
                calculatedNewOrder = siblingNodes.findIndex(sibling => sibling.position.y > node.position.y);
                if (calculatedNewOrder === -1) {
                    calculatedNewOrder = siblingNodes.length; // Place at the end
                }
          }


         // *** Call the API only if timing or calculated order actually changed ***
         if (newTiming !== node.timing || calculatedNewOrder !== node.order) {
             console.log(`Node ${node.id}: Timing changed from ${node.timing} to ${newTiming}, Order changed from ${node.order} to ${calculatedNewOrder}`);

             // Call the API handler to update the instance
             handleUpdateActionInstance(node.data.action.agentActionId, {
                 timing: newTiming,
                 order: calculatedNewOrder,
             });

              // TODO: Client-side re-indexing of 'order' for all nodes in affected lanes
              // After a node is moved, all subsequent nodes in the source and target lanes
              // need their 'order' property adjusted (e.g., decrement in source, increment in target).
              // This keeps the local state consistent before the API response confirms.
              // This is complex and requires careful state management.

         } else {
              console.log(`Node ${node.id}: Position changed, but timing and order did not change based on calculation.`);
         }

     }, [selectedAgentId, isSavingWorkflow, nodes, handleUpdateActionInstance]); // Dependencies include nodes to recalculate order


    // Determine agent name for display
    const selectedAgentName = availableAgents.find(a => a.id === selectedAgentId)?.name || 'Select an Agent';

     // Determine if the canvas area should be interactive/clickable
     const isCanvasInteractive = isAgentSelectedAndLoaded && !isSavingWorkflow;


    // --- Render ---
    return (
        <div className="flex flex-col space-y-6 w-full h-full">

            {/* Header Area */}
             <motion.div
                 className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
                  variants={itemVariants} initial="hidden" animate="visible"
             >
                 <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Workflow</h1>

                 {/* Agent Selector */}
                 <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Agent:</span>
                       {isLoadingAgents ? (
                            <FiLoader className="animate-spin w-5 h-5 ${uiColors.textSecondary}" />
                       ) : agentListError ? (
                             <span className={`text-sm ${uiColors.textDanger}`}>Error loading agents</span>
                       ) : availableAgents.length === 0 ? (
                            <span className={`text-sm ${uiColors.textSecondary}`}>No agents found</span>
                       ) : (
                            <select
                                value={selectedAgentId || ''}
                                onChange={(e) => setSelectedAgentId(parseInt(e.target.value, 10))}
                                 className={`form-select block w-fit text-sm rounded-md p-2 ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                                 disabled={isLoadingConfig || isSavingWorkflow} // Disable selector while loading config or saving
                            >
                                 {/* Option for "Select Agent" if needed */}
                                 {/* {!selectedAgentId && <option value="">Select an Agent</option>} */}
                                {availableAgents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                ))}
                            </select>
                       )}
                 </div>

                 {/* Save Button (If explicit save is implemented) */}
                  {/*
                   {isAgentSelectedAndLoaded && isWorkflowDirty && ( // isWorkflowDirty needs implementation
                      <button
                          onClick={handleSaveWorkflow} // Implement a handler to save ALL dirty states
                          disabled={isSavingWorkflow}
                           className={`inline-flex items-center px-6 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                          {isSavingWorkflow ? <FiLoader className="mr-2" /> : <FiSave className="mr-2" />}
                          Save Workflow
                      </button>
                   )}
                  */}
             </motion.div>

            {showError && (
                 <motion.div variants={itemVariants} className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`} role="alert">
                    <FiAlertTriangle className="inline-block mr-2 w-5 h-5" /> {showError}
                 </motion.div>
            )}
             {saveError && ( // Display saving error
                 <motion.div variants={itemVariants} className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`} role="alert">
                    <FiAlertTriangle className="inline-block mr-2 w-5 h-5" /> {saveError}
                 </motion.div>
            )}


            {/* Workflow Canvas Area */}
              {/* flex-grow helps fill parent, but parent must have height */}
             {/* Add an explicit min-height or height if h-full isn't working */}
             <div className="flex-grow overflow-hidden h-full min-h-[500px]"> {/* Added min-h for safety */}
                 {showLoading ? (
                     <div className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textSecondary}`}> /* ...Loading message... */ <FiLoader className="animate-spin mx-auto w-8 h-8 mb-4" /> Loading Agent Workflow... </div>
                 ) : !selectedAgentId && !showError ? (
                     <div className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textSecondary}`}> /* ...Select Agent message... */ <FiCheck className="mx-auto w-8 h-8 mb-4" /> Select an agent above to view and edit its workflow. </div>
                 ) : isAgentSelectedAndLoaded ? (
                     // Render the React Flow Canvas directly here
                      <ReactFlowProvider> {/* Keep provider here */}
                           <ReactFlow
                               nodes={nodes} // Pass state from this component
                               edges={edges} // Pass state from this component
                               onNodesChange={onNodesChange} // Pass handler from this component
                               onEdgesChange={onEdgesChange} // Pass handler from this component
                               onConnect={onConnect} // Pass handler from this component
                               nodeTypes={nodeTypes} // Pass definition from this component
                               fitView // Automatically zoom to fit content
                               attributionPosition="bottom-left"
                               className={`${uiColors.bgSecondary} rounded-lg border ${uiColors.borderPrimary} ${isCanvasInteractive ? '' : 'pointer-events-none opacity-75'}`}
                               onNodeDragStop={onNodeDragStop} // Pass handler from this component
                               // Add other React Flow props as needed
                               nodesDraggable={!isSavingWorkflow}
                               nodesConnectable={!isSavingWorkflow && onConnect !== undefined} // Check if onConnect is defined/allowed
                               elementsSelectable={!isSavingWorkflow}
                               panOnDrag={!isSavingWorkflow}
                               zoomOnPinch={!isSavingWorkflow}
                               zoomOnScroll={!isSavingWorkflow}
                               panOnScroll={!isSavingWorkflow}
                           >
                                {/* Optional React Flow UI controls */}
                                <Controls />
                                <MiniMap />
                                <Background variant="dots" gap={12} size={1} />

                                 {/* *** Add Panels for UI elements like "Add Action" Buttons *** */}
                                   {rawAgentConfig?.isOwner && (
                                      <Panel position="top-right">
                                           <div className="flex flex-col space-y-2 p-2 bg-white rounded shadow-md">
                                                <span className="text-xs font-semibold text-gray-600">Add Action</span>
                                                <button onClick={() => handleOpenAddActionModal('before')} disabled={isSavingWorkflow} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">+ Before</button>
                                                <button onClick={() => handleOpenAddActionModal('during')} disabled={isSavingWorkflow} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">+ During</button>
                                                <button onClick={() => handleOpenAddActionModal('after')} disabled={isSavingWorkflow} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">+ After</button>
                                           </div>
                                      </Panel>
                                  )}
                           </ReactFlow>
                       </ReactFlowProvider>
                   ) : (
                     // Initial state before agent selection (or if error occurred)
                     <div className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textSecondary}`}> /* ...Select Agent message (redundant due to above) ... */ </div>
                  )}
             </div>


             {/* --- Render Modals --- */}

             {/* Edit Prompt Modal (Placeholder) - Replace with actual modal component */}
             {isEditPromptModalOpen && rawAgentConfig && ( // Use rawAgentConfig as source of truth for modal data
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                     <div className={`${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-md space-y-4`}>
                          <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Edit Prompt & Greeting</h3>
                          {/* Use rawAgentConfig for initial value, update a temporary state if needed for modal form */}
                          {/* For simplicity here, binding directly to rawAgentConfig copy. A real modal might have its own state and pass changes on save. */}
                          <textarea value={rawAgentConfig.prompt || ''} onChange={(e) => setRawAgentConfig({...rawAgentConfig, prompt: e.target.value})} className={`block w-full p-2 text-sm rounded ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary}`} placeholder="Prompt" rows="6" disabled={isSavingWorkflow}></textarea>
                          <textarea value={rawAgentConfig.greetingMessage || ''} onChange={(e) => setRawAgentConfig({...rawAgentConfig, greetingMessage: e.target.value})} className={`block w-full p-2 text-sm rounded ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary}`} placeholder="Greeting" rows="2" disabled={isSavingWorkflow}></textarea>
                          <div className="flex justify-end space-x-2">
                              <button onClick={handleCloseEditPromptModal} disabled={isSavingWorkflow} className={`px-4 py-2 text-sm rounded ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50`}>Cancel</button>
                               {/* Pass the potentially modified prompt/greeting to the save handler */}
                              <button onClick={() => handleUpdateBasicInfo({ prompt: rawAgentConfig.prompt, greetingMessage: rawAgentConfig.greetingMessage })} disabled={isSavingWorkflow} className={`px-4 py-2 text-sm rounded ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50`}>{isSavingWorkflow ? <FiLoader className="mr-2 w-4 h-4 animate-spin" /> : <FiSave className="mr-2 w-4 h-4" />} Save</button>
                          </div>
                     </div>
                 </div>
             )}


             {/* Select Knowledge Base Modal (Placeholder) - Reuse or adapt existing component */}
             {isSelectKbModalOpen && selectedAgentId && (
                  // *** Reuse the SelectKnowledgeBaseModal component ***
                  // Needs agentId prop, selectedKbId prop, onSelectKb handler, isSaving prop?
                  // onSelectKb receives selected KB object or null
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                       <div className={`${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-md`}>
                           <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4`}>
                               <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Select Knowledge Base (Placeholder)</h3>
                               <button onClick={handleCloseSelectKbModal} disabled={isSavingWorkflow} className={`p-1 rounded-md ${uiColors.hoverBgSubtle} disabled:opacity-50`} title="Close"><FiX className="w-5 h-5 text-gray-600" /></button>
                           </div>
                           <div className="text-center py-8 space-y-4">
                               <p className={`${uiColors.textSecondary}`}>Modal content to select KB goes here.</p>
                               <p className={`text-sm ${uiColors.textPlaceholder}`}>Currently linked KB ID: {rawAgentConfig?.knowledgeBaseId || 'None'}</p> {/* Use rawAgentConfig */}
                               {/* Example selection buttons - Call handleUpdateBasicInfo */}
                               <div className="mt-4 space-x-2">
                                   {/* These would be generated from fetched KB list */}
                                   <button onClick={() => { handleUpdateBasicInfo({ knowledgeBaseId: 1 }); handleCloseSelectKbModal(); }} disabled={isSavingWorkflow} className={`px-4 py-2 text-sm rounded ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50`}>Select KB 1 (Mock)</button>
                                   <button onClick={() => { handleUpdateBasicInfo({ knowledgeBaseId: 2 }); handleCloseSelectKbModal(); }} disabled={isSavingWorkflow} className={`px-4 py-2 text-sm rounded ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50`}>Select KB 2 (Mock)</button>
                                   <button onClick={() => { handleUpdateBasicInfo({ knowledgeBaseId: null }); handleCloseSelectKbModal(); }} disabled={isSavingWorkflow} className={`px-4 py-2 text-sm rounded ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50`}>Unlink KB</button>
                               </div>
                           </div>
                       </div>
                  </div>
             )}


             {/* Add Action Modal (Placeholder) - Reuse or adapt existing component */}
              {/* Needs agentId, timing, onAddActions, isSaving props */}
              {isAddActionModalOpen && selectedAgentId && addActionTimingContext && (
                  // *** Reuse the AddActionModal component ***
                  // Needs agentId, timing, onAddActions, isAdding props
                  // onAddActions receives selected GLOBAL action OBJECTS
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                      <div className={`${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-md`}>
                          <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4`}>
                              <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Add Action ({addActionTimingContext}) (Placeholder)</h3>
                              <button onClick={handleCloseAddActionModal} disabled={isSavingWorkflow} className={`p-1 rounded-md ${uiColors.hoverBgSubtle} disabled:opacity-50`} title="Close"><FiX className="w-5 h-5 text-gray-600" /></button>
                          </div>
                          <div className="text-center py-8 space-y-4">
                              <p className={`${uiColors.textSecondary}`}>Modal content to select actions goes here.</p>
                              <p className={`text-sm ${uiColors.textPlaceholder}`}>Agent ID: {selectedAgentId}, Timing: {addActionTimingContext}</p>
                               {/* Example selection button (simulate adding global action ID 6) */}
                               <div className="mt-4">
                                   {/* Call handleAddActionInstances with an array of mock global action objects */}
                                   <button onClick={() => handleAddActionInstances([{id: 6, name: 'Mock Action 6', type: 'Information Extractor', details: 'Open Question'}])} disabled={isSavingWorkflow} className={`px-4 py-2 text-sm rounded ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50`}>
                                       {isSavingWorkflow ? <FiLoader className="mr-2 w-4 h-4 animate-spin" /> : <FiPlusCircle className="mr-2 w-4 h-4" />} Add Mock Action 6
                                   </button>
                                    <p className="text-xs ${uiColors.textPlaceholder} mt-2">Simulates adding global action with ID 6.</p>
                               </div>
                          </div>
                      </div>
                  </div>
              )}


              {/* Edit Action Instance Modal (Optional Placeholder) */}
              {/* If visual drag/drop isn't enough to change order/timing */}
               {/*
               <EditActionInstanceModal
                  isOpen={isEditActionInstanceModalOpen}
                  onClose={handleCloseEditActionInstanceModal}
                  actionInstanceData={actionInstanceToEdit} // Pass the specific agentAction data
                  onSave={handleUpdateActionInstance} // Handler to save changes to instance
                  isSaving={isSavingWorkflow}
               />
               */}


        </div>
    );
}