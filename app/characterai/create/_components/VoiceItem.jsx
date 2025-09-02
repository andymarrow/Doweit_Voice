// characterai/create/_components/VoiceItem.jsx
"use client";

import React from "react"; // Removed useState, useEffect, useRef
import Image from "next/image";
import { FiPlay, FiCheckCircle, FiPause } from "react-icons/fi";
import { uiColors } from "../../_constants/uiConstants";

function VoiceItem({
	voice,
	isSelected,
	onSelectVoice,
	onPlayVoice,
	isPlaying,
}) {
	// Handle play/pause logic for THIS voice item - delegates to parent
	const handlePlayClick = (e) => {
		// Removed type
		e.stopPropagation();
		if (isPlaying) {
			onPlayVoice(null);
		} else {
			onPlayVoice(voice);
		}
	};

	return (
		<div
			className={`flex items-center ${uiColors.bgSecondary} rounded-md border ${uiColors.borderPrimary} p-3 cursor-pointer transition-colors group
                       ${isSelected ? `${uiColors.accentSubtleBg} border-${uiColors.accentPrimaryText}` : ""}`}
			onClick={() => onSelectVoice(voice)}
		>
			{/* Left: Avatar and Play/Pause Button */}
			<div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4 overflow-hidden">
				{voice.avatarUrl ? ( // Use avatarUrl from voice data (optional)
					<Image
						src={voice.avatarUrl}
						alt={`${voice.name} Avatar`}
						width={48}
						height={48}
						className="rounded-full object-cover"
					/>
				) : (
					<div
						className={`w-full h-full rounded-full flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400`}
					>
						{voice.name?.charAt(0).toUpperCase() || "?"}
					</div>
				)}

				{/* Play/Pause button overlay */}
				{/* Only show play/pause if a sampleAudioUrl exists */}
				{voice.sampleAudioUrl && (
					<button
						type="button"
						onClick={handlePlayClick}
						className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
						title={
							isPlaying ? `Pause ${voice.name}` : `Listen to ${voice.name}`
						}
					>
						{isPlaying ? (
							<FiPause className="w-6 h-6" />
						) : (
							<FiPlay className="w-6 h-6" />
						)}
					</button>
				)}
			</div>

			{/* Center: Voice Details */}
			<div className="flex-grow">
				<div className={`font-semibold text-md ${uiColors.textPrimary}`}>
					{voice.name}
				</div>
				{voice.description && ( // Display description if available
					<div className={`text-sm ${uiColors.textSecondary}`}>
						{voice.description}
					</div>
				)}
				{/* Optional: Add provider, language info here if needed from backend data */}
				{/* {voice.provider && voice.language && (
                     <div className={`text-xs ${uiColors.textPlaceholder}`}>Provider: {voice.provider} · Language: {voice.language}</div>
                 )} */}
			</div>

			{/* Right: Selection Indicator (e.g., Check) */}
			<div className="flex-shrink-0 ml-4">
				{isSelected ? (
					<FiCheckCircle className={`w-6 h-6 ${uiColors.accentPrimary}`} />
				) : (
					<div
						className={`w-6 h-6 rounded-full border-2 ${uiColors.borderPrimary}`}
					></div>
				)}
			</div>
		</div>
	);
}

export default VoiceItem;

