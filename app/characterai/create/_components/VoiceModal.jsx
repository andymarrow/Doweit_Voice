// characterai/create/_components/VoiceModal.jsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react'; // Import useMemo
import { FiX, FiSearch } from 'react-icons/fi';

import VoiceModalTabs from './VoiceModalTabs';
import VoiceListTab from './VoiceListTab';

// Import constants - Adjusted path as necessary
import { uiColors } from '../../_constants/uiConstants'; // Corrected path

// Removed simulated data

function VoiceModal({ isOpen, onClose, onVoiceSelect }) {
    const [activeTab, setActiveTab] = useState('all'); // Changed default tab to 'all' or a new 'AI Studio' tab
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(null); // State to hold the selected voice OBJECT
    const [allVoices, setAllVoices] = useState([]); // State to hold all fetched voices
    const [isLoading, setIsLoading] = useState(true); // Loading state for voices
    const [error, setError] = useState(null); // Error state for fetching voices

    // State for audio playback within the modal
    const [audioPlayer, setAudioPlayer] = useState(null); // Audio element instance
    const [currentlyPlayingVoiceId, setCurrentlyPlayingVoiceId] = useState(null);

    const modalRef = useRef(null);

    // --- Data Fetching Effect ---

    // Effect to fetch voices from the backend when the modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchVoices = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // Call backend API endpoint to get the list of available voices
                     const response = await fetch('/api/voices'); // Example endpoint
                    if (!response.ok) {
                        throw new Error(`Failed to fetch voices: ${response.status}`);
                    }
                    const data = await response.json();
                    // Assuming data.voices is an array of voice objects { id, name, platformVoiceId, description, avatarUrl, sampleAudioUrl, type (e.g., 'AI Studio', 'Custom'), etc. }
                    setAllVoices(data.voices || []);

                } catch (err) {
                    console.error("Failed to fetch voices:", err);
                    setError("Failed to load voices.");
                    setAllVoices([]); // Clear voices on error
                } finally {
                    setIsLoading(false);
                }
            };

            fetchVoices();

            // Reset modal state when it opens
            setActiveTab('all'); // Or 'ai-studio' if you add that tab
            setSearchTerm('');
            setSelectedVoice(null); // Clear previous selection
            setCurrentlyPlayingVoiceId(null); // Stop any playing audio
            if(audioPlayer) { // Ensure player exists before pausing
                 audioPlayer.pause();
                 audioPlayer.currentTime = 0;
            }

        } else {
            // When modal closes, stop any playing audio
            if (audioPlayer) {
                audioPlayer.pause();
                setCurrentlyPlayingVoiceId(null);
            }
        }

    }, [isOpen, audioPlayer]); // Depend on isOpen to trigger fetch, and audioPlayer for cleanup


    // --- Audio Playback Effect ---

    // Effect to manage the Audio player instance for previews
    useEffect(() => {
        // Create a single Audio player instance when the component mounts
        const player = new Audio();

        // Set up event listeners for the player
        const handleEnded = () => setCurrentlyPlayingVoiceId(null);
        const handleError = (e) => {
            console.error("Voice preview playback error:", e);
            setCurrentlyPlayingVoiceId(null); // Stop indicating playing on error
            // Optionally display an error message
        };

        player.addEventListener('ended', handleEnded);
        player.addEventListener('error', handleError);

        setAudioPlayer(player); // Store the player instance

        // Cleanup: stop playback and remove listeners when component unmounts
        return () => {
             if (player) {
                 player.pause(); // Stop playback
                 player.removeEventListener('ended', handleEnded);
                 player.removeEventListener('error', handleError);
             }
        };
    }, []); // Empty dependency array ensures this runs only once on mount


    // Function to handle playing a specific voice sample
    const handlePlayVoice = (voiceToPlay) => {
         if (!audioPlayer || !voiceToPlay?.sampleAudioUrl) {
             console.warn("Cannot play voice: player not initialized or no sample URL.", voiceToPlay);
             setCurrentlyPlayingVoiceId(null); // Ensure playing state is off
             return;
         }

         // If this voice is already playing, pause it
         if (currentlyPlayingVoiceId === voiceToPlay.id) {
             audioPlayer.pause();
             audioPlayer.currentTime = 0; // Rewind
             setCurrentlyPlayingVoiceId(null);
         } else {
             // If another voice is playing, stop it first
             if (currentlyPlayingVoiceId !== null) {
                 audioPlayer.pause();
                 audioPlayer.currentTime = 0;
             }

             // Start playing the new voice sample
             audioPlayer.src = voiceToPlay.sampleAudioUrl;
             audioPlayer.play()
                .then(() => {
                    console.log(`Playing voice sample: ${voiceToPlay.name}`);
                    setCurrentlyPlayingVoiceId(voiceToPlay.id); // Indicate this voice is playing
                })
                .catch(err => {
                    console.error("Error starting voice playback:", err);
                    setCurrentlyPlayingVoiceId(null); // Clear playing state on error
                    // Optionally alert the user
                    alert("Could not play voice sample.");
                });
         }
    };


    // --- Filtering and Tab Logic ---

    // Memoized list of voices based on active tab (or display all)
    const voicesByTab = useMemo(() => {
        if (activeTab === 'all') { // Example: Add an 'All' tab
             return allVoices;
         }
         // Filter by 'type' assuming voice objects have a 'type' field
        return allVoices.filter(voice => voice.type?.toLowerCase() === activeTab);
    }, [allVoices, activeTab]); // Recalculate when voices or active tab changes


    // Filter voices based on search term and current tab
    const filteredVoices = useMemo(() => {
        if (!searchTerm) {
            return voicesByTab;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return voicesByTab.filter(voice =>
            voice.name.toLowerCase().includes(lowerSearchTerm) ||
            voice.type?.toLowerCase().includes(lowerSearchTerm) ||
             voice.description?.toLowerCase().includes(lowerSearchTerm) // Search description
            // Add other fields to search if needed
        );
    }, [voicesByTab, searchTerm]); // Recalculate when tab voices or search term changes


    // --- Selection Handlers ---

    // Handle selecting a voice from the list (passes the full object)
    const handleVoiceSelectionInList = (voice) => {
        setSelectedVoice(voice); // Store the full voice object
        // You might pause audio here too if selecting stops the preview
         if (currentlyPlayingVoiceId !== null && currentlyPlayingVoiceId !== voice.id) {
             audioPlayer?.pause();
             setCurrentlyPlayingVoiceId(null);
         }
    };

    // Handle the "Select Voice" button click
    const handleConfirmSelect = () => {
        if (selectedVoice) {
            onVoiceSelect(selectedVoice); // Pass the selected voice OBJECT to parent
            onClose(); // Close the modal
        }
    };


    // Handle clicks outside the modal to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
                 onClose();
             }
         };
         if (isOpen) {
             document.addEventListener("mousedown", handleClickOutside);
         }
         return () => {
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose]); // Depend on isOpen and onClose


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div
                ref={modalRef}
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4 flex-shrink-0`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Choose a Voice</h3>
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                 {/* Pass the list of unique voice types from fetched data to the tabs */}
                <VoiceModalTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    // Dynamically generate tabs based on unique voice types + an 'All' tab
                    tabs={[{ name: 'All', key: 'all' }, ...Array.from(new Set(allVoices.map(v => v.type))).filter(Boolean).map(type => ({ name: type, key: type.toLowerCase() }))]}
                />

                {/* Search Input */}
                <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary} my-4 flex-shrink-0`}>
                     <FiSearch className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`} />
                     <input
                         type="text"
                         placeholder={`Search voices...`} // Generic placeholder
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`} // Added border-none
                     />
                </div>

                {/* Voice List Content */}
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 hide-scrollbar">
                     {isLoading ? (
                         <div className={`text-center py-10 ${uiColors.textSecondary}`}>Loading voices...</div>
                     ) : error ? (
                          <div className={`text-center py-10 text-red-500`}>{error}</div>
                     ) : filteredVoices.length === 0 ? (
                          <div className={`text-center py-10 ${uiColors.textSecondary}`}>No voices found matching your search or in this category.</div>
                     ) : (
                         <VoiceListTab
                             voices={filteredVoices}
                             // Pass the ID of the selected voice for highlighting
                             selectedVoiceId={selectedVoice?.id || null}
                             onSelectVoice={handleVoiceSelectionInList} // Pass handler that stores object
                             onPlayVoice={handlePlayVoice} // Pass handler for playing audio
                             currentlyPlayingVoiceId={currentlyPlayingVoiceId} // Pass currently playing ID
                         />
                     )}
                </div>

                {/* Footer */}
                <div className={`flex justify-end border-t ${uiColors.borderPrimary} pt-3 mt-4 flex-shrink-0`}>
                    <button
                         onClick={handleConfirmSelect}
                         disabled={!selectedVoice} // Disable if no voice OBJECT is selected
                         className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} ${!selectedVoice ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                        Select Voice
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VoiceModal;