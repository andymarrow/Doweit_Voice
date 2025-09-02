// characterai/create/_components/VoiceModal.jsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiX, FiSearch } from "react-icons/fi";
import VoiceModalTabs from "./VoiceModalTabs";
import VoiceListTab from "./VoiceListTab";
import { uiColors } from "../../_constants/uiConstants";

function VoiceModal({ isOpen, onClose, onVoiceSelect }) {
	// --- State for UI control ---
	// THESE HOOKS MUST COME FIRST AND BE UNCONDITIONAL
	const [activeTab, setActiveTab] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	// State to hold the selected voice OBJECT (will be a VapiVoice object)
	const [selectedVoice, setSelectedVoice] = useState(null);
	// State to hold all fetched voices (array of VapiVoice objects)
	const [allVoices, setAllVoices] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// State for audio playback within the modal
	const [currentlyPlayingVoiceId, setCurrentlyPlayingVoiceId] = useState(null);

	// --- Refs ---
	// THESE HOOKS MUST COME FIRST AND BE UNCONDITIONAL
	const audioPlayerRef = useRef(null);
	const modalRef = useRef(null); // Ref for modal content div

	// --- Effects ---
	// THESE HOOKS MUST COME AFTER STATES/REFS AND BE UNCONDITIONAL

	// Data Fetching Effect - Runs when isOpen changes
	useEffect(() => {
		if (isOpen) {
			// Conditional logic is inside the effect callback
			const fetchVoices = async () => {
				setIsLoading(true);
				setError(null);
				try {
					const response = await fetch("/api/voices");
					if (!response.ok) {
						const errorBody = await response.text();
						throw new Error(
							`Failed to fetch voices: ${response.status} - ${errorBody}`,
						);
					}
					const data = await response.json();
					if (Array.isArray(data)) {
						setAllVoices(data);
					} else {
						throw new Error("Invalid data format received from /api/voices");
					}
				} catch (err) {
					console.error("Failed to fetch voices:", err);
					setError(
						`Failed to load voices: ${err instanceof Error ? err.message : String(err)}`,
					);
					setAllVoices([]);
				} finally {
					setIsLoading(false);
				}
			};

			fetchVoices();

			// Reset modal state when it opens
			setActiveTab("all");
			setSearchTerm("");
			setSelectedVoice(null);
			setCurrentlyPlayingVoiceId(null);
			// Don't need to reset audio player here, the audio effect handles it
		} else {
			// When modal closes, stop any playing audio
			// This happens regardless of whether the effect runs on mount or subsequent updates
			// because the audio player ref exists.
			if (audioPlayerRef.current) {
				audioPlayerRef.current.pause();
				setCurrentlyPlayingVoiceId(null);
			}
		}
	}, [isOpen]); // Dependency Array: effect runs when isOpen changes

	// Audio Playback Effect - Initializes audio player once
	useEffect(() => {
		const player = new Audio();

		const handleEnded = () => setCurrentlyPlayingVoiceId(null);
		const handleError = (e) => {
			console.error("Voice preview playback error:", e);
			setCurrentlyPlayingVoiceId(null);
		};

		player.addEventListener("ended", handleEnded);
		player.addEventListener("error", handleError);

		audioPlayerRef.current = player;

		// Cleanup function - runs when the component unmounts
		return () => {
			if (audioPlayerRef.current) {
				audioPlayerRef.current.pause();
				audioPlayerRef.current.removeEventListener("ended", handleEnded);
				audioPlayerRef.current.removeEventListener("error", handleError);
				audioPlayerRef.current = null; // Good practice to nullify refs on cleanup
			}
		};
	}, []); // Empty Dependency Array: effect runs only on mount and cleanup on unmount

	// Effect to handle clicks outside the modal - Runs when isOpen changes
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target) &&
				isOpen
			) {
				// Check if the click was actually the background div itself
				// to avoid issues if the modal content is smaller than the click target
				const isBackgroundClick =
					event.target.classList.contains("bg-opacity-50"); // Assuming your background div has this class
				if (isBackgroundClick) {
					onClose();
				}
			}
		};

		// Add or remove listener based on isOpen
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			// Ensure listener is removed when modal closes
			document.removeEventListener("mousedown", handleClickOutside);
		}

		// Cleanup function - runs before the effect re-runs or component unmounts
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]); // Dependency Array: effect runs when isOpen or onClose changes

	// --- Memoized Values ---
	// THESE HOOKS MUST COME AFTER STATES/REFS/EFFECTS AND BE UNCONDITIONAL

	// Memoized list of voices based on active tab (always 'all' for now)
	// This will recalculate whenever allVoices or activeTab changes
	const voicesByTab = useMemo(() => {
		// Your original logic here, simplified as per your code
		return allVoices;
		/*
        if (activeTab === 'all') {
             return allVoices;
         }
        return allVoices.filter(voice => voice.type?.toLowerCase() === activeTab);
        */
	}, [allVoices, activeTab]);

	// Filter voices based on search term
	// This will recalculate whenever voicesByTab or searchTerm changes
	const filteredVoices = useMemo(() => {
		if (!searchTerm) {
			return voicesByTab;
		}
		const lowerSearchTerm = searchTerm.toLowerCase();
		return voicesByTab.filter(
			(voice) =>
				voice.name.toLowerCase().includes(lowerSearchTerm) ||
				voice.description?.toLowerCase().includes(lowerSearchTerm) ||
				voice.provider?.toLowerCase().includes(lowerSearchTerm) ||
				voice.language?.toLowerCase().includes(lowerSearchTerm),
		);
	}, [voicesByTab, searchTerm]);

	// Dynamically generate tabs (simplified)
	// This will recalculate whenever allVoices changes (though currently it's fixed)
	const dynamicTabs = useMemo(() => {
		return [{ name: "All", key: "all" }];
	}, [allVoices]); // Depend on allVoices just in case you add provider-specific tabs later

	// --- Selection Handlers ---
	// These are regular functions, no need to move them.

	// Function to handle playing a specific voice sample
	const handlePlayVoice = (voiceToPlay) => {
		const player = audioPlayerRef.current; // Access the ref inside the handler

		// If voiceToPlay is null, it means stop current playback
		if (voiceToPlay === null) {
			if (player && currentlyPlayingVoiceId !== null) {
				player.pause();
				player.currentTime = 0;
				setCurrentlyPlayingVoiceId(null);
			}
			return;
		}

		if (!player || !voiceToPlay?.sampleAudioUrl) {
			console.warn(
				"Cannot play voice: player not initialized or no sample URL.",
				voiceToPlay,
			);
			setCurrentlyPlayingVoiceId(null);
			return;
		}

		// If this voice is already playing, pause it
		if (currentlyPlayingVoiceId === voiceToPlay.id) {
			player.pause();
			player.currentTime = 0;
			setCurrentlyPlayingVoiceId(null);
		} else {
			// If another voice is playing, stop it first
			if (currentlyPlayingVoiceId !== null) {
				player.pause();
				player.currentTime = 0;
			}

			// Start playing the new voice sample
			player.src = voiceToPlay.sampleAudioUrl;
			player
				.play()
				.then(() => {
					console.log(`Playing voice sample: ${voiceToPlay.name}`);
					setCurrentlyPlayingVoiceId(voiceToPlay.id);
				})
				.catch((err) => {
					console.error("Error starting voice playback:", err);
					setCurrentlyPlayingVoiceId(null);
					alert("Could not play voice sample.");
				});
		}
	};

	// Handle selecting a voice from the list (passes the full object)
	const handleVoiceSelectionInList = (voice) => {
		setSelectedVoice(voice);
		// Optionally stop playback when a voice is selected
		if (currentlyPlayingVoiceId !== null) {
			audioPlayerRef.current?.pause();
			setCurrentlyPlayingVoiceId(null);
		}
	};

	// Handle the "Select Voice" button click
	const handleConfirmSelect = () => {
		if (selectedVoice) {
			onVoiceSelect(selectedVoice);
			onClose();
			// Optionally stop playback when modal closes
			if (audioPlayerRef.current) {
				audioPlayerRef.current.pause();
				setCurrentlyPlayingVoiceId(null);
			}
		}
	};

	// --- Conditional Render (Now comes AFTER all hook calls) ---
	if (!isOpen) {
		// When the modal is closed, ensure playback is stopped if it wasn't already
		if (audioPlayerRef.current) {
			audioPlayerRef.current.pause();
			// setCurrentlyPlayingVoiceId(null); // This state update isn't strictly necessary here as component is not rendering the modal content anyway
		}
		return null;
	}

	return (
		// Added an outer div to capture clicks outside the modal content
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
			onClick={onClose}
		>
			<div
				ref={modalRef} // Attach ref here
				className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col`}
				onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing modal
			>
				{/* Header */}
				<div
					className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4 flex-shrink-0`}
				>
					<h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>
						Choose a Voice
					</h3>
					<button
						onClick={onClose}
						className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`}
						title="Close"
					>
						<FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
					</button>
				</div>

				{/* Tabs */}
				<VoiceModalTabs
					activeTab={activeTab}
					onTabChange={setActiveTab}
					tabs={dynamicTabs} // Pass dynamicTabs
				/>

				{/* Search Input */}
				<div
					className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary} my-4 flex-shrink-0`}
				>
					<FiSearch
						className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`}
					/>
					<input
						type="text"
						placeholder={`Search voices...`}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`}
					/>
				</div>

				{/* Voice List Content */}
				<div className="flex-grow overflow-y-auto pr-2 -mr-2 hide-scrollbar">
					{isLoading ? (
						<div className={`text-center py-10 ${uiColors.textSecondary}`}>
							Loading voices...
						</div>
					) : error ? (
						<div className={`text-center py-10 text-red-500`}>{error}</div>
					) : filteredVoices.length === 0 ? (
						<div className={`text-center py-10 ${uiColors.textSecondary}`}>
							No voices found matching your search or in this category.
						</div>
					) : (
						<VoiceListTab
							voices={filteredVoices} // Use filtered voices
							selectedVoiceId={selectedVoice?.id || null}
							onSelectVoice={handleVoiceSelectionInList}
							onPlayVoice={handlePlayVoice}
							currentlyPlayingVoiceId={currentlyPlayingVoiceId}
						/>
					)}
				</div>

				{/* Footer */}
				<div
					className={`flex justify-end border-t ${uiColors.borderPrimary} pt-3 mt-4 flex-shrink-0`}
				>
					<button
						onClick={handleConfirmSelect}
						disabled={!selectedVoice}
						className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} ${!selectedVoice ? "opacity-50 cursor-not-allowed" : ""}`}
					>
						Select Voice
					</button>
				</div>
			</div>
		</div>
	);
}

export default VoiceModal;

