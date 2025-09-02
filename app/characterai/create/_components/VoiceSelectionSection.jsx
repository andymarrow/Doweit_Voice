// characterai/create/_components/VoiceSelectionSection.jsx
"use client";

import React, { useState, useEffect } from "react"; // Import useEffect, useRef
import Image from "next/image";
import { FiPlay, FiPause } from "react-icons/fi"; // Import Pause icon
import { uiColors } from "../../_constants/uiConstants"; // Corrected path

// Expects the selectedVoice object from the modal
function VoiceSelectionSection({ selectedVoice, onChooseVoiceClick }) {
	// State for audio playback of the selected voice preview
	const [previewAudioPlayer, setPreviewAudioPlayer] = useState(null);
	const [isPlayingPreview, setIsPlayingPreview] = useState(false);

	// Effect to manage the dedicated preview audio player instance
	useEffect(() => {
		const player = new Audio();

		const handleEnded = () => setIsPlayingPreview(false);
		const handleError = (e) => {
			console.error("Selected voice preview playback error:", e);
			setIsPlayingPreview(false);
			// Optionally alert user
		};

		player.addEventListener("ended", handleEnded);
		player.addEventListener("error", handleError);

		setPreviewAudioPlayer(player);

		return () => {
			if (player) {
				player.pause();
				player.removeEventListener("ended", handleEnded);
				player.removeEventListener("error", handleError);
			}
		};
	}, []); // Runs once on mount

	// Effect to stop playback if the selected voice changes or is cleared
	useEffect(() => {
		if (previewAudioPlayer) {
			previewAudioPlayer.pause();
			setIsPlayingPreview(false);
			// Optional: Reset source if the voice object changes to prevent playing the old sample
			// previewAudioPlayer.src = '';
		}
	}, [selectedVoice, previewAudioPlayer]); // Stop if selectedVoice changes

	// Handle play/pause for the selected voice preview
	const handlePlayPreview = () => {
		if (!previewAudioPlayer || !selectedVoice?.sampleAudioUrl) {
			console.warn(
				"Cannot play preview: player not initialized or no sample URL.",
				selectedVoice,
			);
			setIsPlayingPreview(false);
			return;
		}

		if (isPlayingPreview) {
			previewAudioPlayer.pause();
			previewAudioPlayer.currentTime = 0; // Rewind
		} else {
			// If src is different or not set, set it and play
			if (previewAudioPlayer.src !== selectedVoice.sampleAudioUrl) {
				previewAudioPlayer.src = selectedVoice.sampleAudioUrl;
			}
			previewAudioPlayer
				.play()
				.then(() => {
					console.log(`Playing selected voice sample: ${selectedVoice.name}`);
					setIsPlayingPreview(true);
				})
				.catch((err) => {
					console.error("Error starting selected voice playback:", err);
					setIsPlayingPreview(false);
					alert("Could not play selected voice sample.");
				});
		}
	};

	return (
		<div className="space-y-2">
			<label className={`block text-md font-medium ${uiColors.textSecondary}`}>
				{" "}
				{/* Adjusted font size */}
				Choose a Voice
			</label>
			<p className={`text-sm ${uiColors.textPlaceholder}`}>
				{" "}
				{/* Adjusted font size */}
				Select the voice for your character.
			</p>

			{/* Display Selected Voice or Placeholder */}
			<div
				className={`p-3 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} flex items-center space-x-4 w-full sm:max-w-md`}
			>
				{selectedVoice ? (
					<>
						{/* Voice Avatar */}
						<div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
							{/* Use actual voice avatar URL if available */}
							{selectedVoice.avatarUrl ? (
								<Image
									src={selectedVoice.avatarUrl}
									alt={`${selectedVoice.name} Avatar`}
									width={40}
									height={40}
									className="rounded-full object-cover"
								/>
							) : (
								// Fallback
								<div
									className={`w-full h-full rounded-full flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400`}
								>
									{selectedVoice.name?.charAt(0).toUpperCase() || "?"}
								</div>
							)}
						</div>
						{/* Voice Details */}
						<div className="flex-grow">
							<div className={`font-semibold text-md ${uiColors.textPrimary}`}>
								{selectedVoice.name}
							</div>{" "}
							{/* Adjusted font size */}
							{selectedVoice.description && ( // Display description if available
								<div className={`text-sm ${uiColors.textSecondary}`}>
									{" "}
									{/* Adjusted font size */}
									{selectedVoice.description}
								</div>
							)}
						</div>
						{/* Play Button */}
						{selectedVoice.sampleAudioUrl && ( // Only show button if sample exists
							<button
								type="button" // Added type="button"
								onClick={handlePlayPreview}
								className={`flex-shrink-0 p-1 rounded-full transition-colors ${uiColors.hoverBgSubtle} ${isPlayingPreview ? uiColors.textAccent : uiColors.textSecondary}`}
								title={isPlayingPreview ? "Pause Preview" : "Listen to Preview"}
							>
								{/* Show Pause icon if playing, else Play */}
								{isPlayingPreview ? (
									<FiPause className="w-5 h-5" />
								) : (
									<FiPlay className="w-5 h-5" />
								)}
							</button>
						)}
					</>
				) : (
					<span className={`${uiColors.textPlaceholder} text-md font-medium`}>
						No voice selected
					</span>
				)}
			</div>

			{/* Choose Voice Button */}
			<button
				type="button" // Added type="button"
				onClick={onChooseVoiceClick}
				className={`inline-flex items-center px-4 py-2 text-md font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none`} // Adjusted font size/padding
			>
				Choose a Voice
			</button>
		</div>
	);
}

export default VoiceSelectionSection;

