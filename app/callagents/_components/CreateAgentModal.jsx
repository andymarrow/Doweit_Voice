// voice-agents-dashboard/_components/CreateAgentModal.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { FiX, FiPhoneIncoming, FiPhoneOutgoing, FiEdit, FiLayout } from 'react-icons/fi';
import { accentButtonClasses, uiAccentClasses } from '../_constants/uiConstants';
import SelectionCard from './SelectionCard';
// useRouter is only needed if navigating *from* this modal.
// Since we're changing the flow for 'scratch', we might remove it.
// For 'template', we might still navigate or handle it differently.
// Let's keep it for potential future template navigation.
import { useRouter } from 'next/navigation';

// Data for the two stages
const agentTypes = [
    { id: 'inbound', title: 'Inbound Voice Assistant', description: 'Handle incoming calls, answer questions, route calls, etc.', icon: FiPhoneIncoming },
    { id: 'outbound', title: 'Outbound Call Assistant', description: 'Make calls for sales, surveys, notifications, and more.', icon: FiPhoneOutgoing },
];

const creationMethods = [
    { id: 'scratch', title: 'Start from Scratch', description: 'Build your agent configuration step by step.', icon: FiEdit },
    { id: 'template', title: 'Use Doweit Templates', description: 'Choose from pre-built templates for common use cases.', icon: FiLayout },
];

// Add a new prop: onSelectScratch - this is a function the parent provides
function CreateAgentModal({ isOpen, onClose, onSelectScratch }) {
    const router = useRouter(); // Keep router for potential template navigation
    const [currentStage, setCurrentStage] = useState('type'); // 'type' or 'method'
    const [selectedAgentType, setSelectedAgentType] = useState(null); // 'inbound' or 'outbound'
    const [selectedCreationMethod, setSelectedCreationMethod] = useState(null); // 'scratch' or 'template'

    // Reset state when the modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStage('type');
            setSelectedAgentType(null);
            setSelectedCreationMethod(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTypeSelect = (typeId) => {
        setSelectedAgentType(typeId);
        setCurrentStage('method');
        setSelectedCreationMethod(null); // Reset selected method
    };

    const handleMethodSelect = (methodId) => {
        setSelectedCreationMethod(methodId);
    };

    const handleUseButtonClick = () => {
        if (!selectedAgentType || !selectedCreationMethod) {
            // Should be disabled by button state, but good fallback
            return;
        }

        if (selectedCreationMethod === 'scratch') {
            // If "Start from Scratch" is chosen, close THIS modal
            onClose();
            // Call the parent handler, passing the selected type
            if (onSelectScratch) {
                onSelectScratch(selectedAgentType);
            }
        } else if (selectedCreationMethod === 'template') {
            // If "Use Template" is chosen, navigate (or open a template selection modal)
             // Currently, this navigates, which is fine for now.
             const targetUrl = `/callagents/create?type=${selectedAgentType}&method=${selectedCreationMethod}`;
             router.push(targetUrl); // Navigate using Next.js router
             onClose(); // Close this modal before navigating
        }
    };

    const currentCards = currentStage === 'type' ? agentTypes : creationMethods;
    const modalTitle = currentStage === 'type' ? 'Choose Agent Type' : `Choose Creation Method for ${selectedAgentType ? selectedAgentType.charAt(0).toUpperCase() + selectedAgentType.slice(1) + ' Assistant' : 'Agent'}`;
    const isUseButtonDisabled = currentStage === 'method' && selectedCreationMethod === null;

    return (
        // Backdrop
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Modal Container */}
            <div className={`${uiAccentClasses.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-2xl relative`}>

                {/* Close Button */}
                <button
                    className={`absolute top-4 right-4 p-2 rounded-md transition-colors ${uiAccentClasses.hoverBgSubtle}`}
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <FiX className={uiAccentClasses.textSecondary} size={20} />
                </button>

                {/* Modal Header */}
                <h2 className={`text-2xl font-bold mb-6 ${uiAccentClasses.textPrimary}`}>
                    {modalTitle}
                </h2>

                {/* Cards Grid */}
                <div className={`grid grid-cols-1 md:grid-cols-${currentCards.length === 2 ? '2' : currentCards.length} gap-4 mb-6`}>
                    {currentCards.map((card) => (
                        <SelectionCard
                            key={card.id}
                            id={card.id}
                            title={card.title}
                            description={card.description}
                            icon={card.icon}
                            onClick={currentStage === 'type' ? handleTypeSelect : handleMethodSelect}
                            isSelected={currentStage === 'type'
                                ? selectedAgentType === card.id && currentStage === 'type'
                                : selectedCreationMethod === card.id
                            }
                        />
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                    {currentStage === 'method' && (
                        <button
                            className={`px-4 py-2 rounded-md font-semibold transition-colors ${uiAccentClasses.hoverBgSubtle} ${uiAccentClasses.textSecondary}`}
                            onClick={() => setCurrentStage('type')}
                        >
                            Back
                        </button>
                    )}
                    {currentStage === 'method' && (
                        <button
                            className={`px-6 py-2 rounded-md font-semibold text-white transition-opacity ${accentButtonClasses} ${isUseButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleUseButtonClick}
                            disabled={isUseButtonDisabled}
                        >
                            Use This Method
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

export default CreateAgentModal;