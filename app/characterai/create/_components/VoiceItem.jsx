// characterai/create/_components/VoiceItem.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
import Image from 'next/image';
import { FiPlay, FiCheckCircle, FiPause } from 'react-icons/fi'; // Added FiPause

// Import constants - Adjusted path as necessary
import { uiColors } from '../../_constants/uiConstants'; // Corrected path

// Voice structure expected from backend API for /api/voices
// {
//   id: string, // Unique ID for the voice
//   name: string, // Display name
//   platformVoiceId: string, // The actual AI Studio voice ID (e.g., 'Zephyr')
//   description: string, // Detailed description
//   avatarUrl: string | null, // URL for an avatar if available
//   sampleAudioUrl: string | null, // URL for a pre-generated audio sample
//   // other properties like language, gender, etc.
// }

function VoiceItem({ voice, isSelected, onSelectVoice, onPlayVoice, isPlaying }) { // Added onPlayVoice and isPlaying props
    const audioRef = useRef(null); // Ref for the audio element

    // Handle play/pause logic for THIS voice item
    const handlePlayClick = (e) => {
        e.stopPropagation(); // Prevent item selection when clicking play
        if (isPlaying) {
             onPlayVoice(null); // Signal parent to stop playback if this voice is playing
        } else {
             // Signal parent to play this voice, passing the voice object/ID
             onPlayVoice(voice);
        }
    };


    return (
        // Use voice.id for selection
        <div
            className={`flex items-center ${uiColors.bgSecondary} rounded-md border ${uiColors.borderPrimary} p-3 cursor-pointer transition-colors group // Added group class for hover effects
                       ${isSelected ? `${uiColors.accentSubtleBg} border-${uiColors.accentPrimaryText}` : ''}`}
            onClick={() => onSelectVoice(voice)} // Pass the full voice OBJECT to parent on selection
        >
            {/* Left: Avatar and Play/Pause Button */}
            <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4 overflow-hidden">
                 {voice.avatarUrl ? ( // Use avatarUrl from voice data
                      <Image src={voice.avatarUrl} alt={`${voice.name} Avatar`} width={48} height={48} className="rounded-full object-cover" />
                 ) : (
                     // Fallback Placeholder
                      <div className={`w-full h-full rounded-full flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400`}>
                           {voice.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                 )}

                 {/* Play/Pause button overlay */}
                  {/* Only show play/pause if a sampleAudioUrl exists */}
                  {voice.sampleAudioUrl && (
                      <button
                           type="button" // Added type="button"
                           onClick={handlePlayClick}
                           className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full" // Increased opacity slightly on hover
                           title={isPlaying ? `Pause ${voice.name}` : `Listen to ${voice.name}`}
                       >
                           {/* Show Pause icon if currently playing, otherwise show Play */}
                            {isPlaying ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6" />}
                       </button>
                   )}
            </div>

            {/* Center: Voice Details */}
            <div className="flex-grow">
                <div className={`font-semibold text-md ${uiColors.textPrimary}`}>{voice.name}</div> {/* Adjusted font size */}
                 {voice.description && ( // Display description if available
                    <div className={`text-sm ${uiColors.textSecondary}`}> {/* Adjusted font size */}
                         {voice.description}
                    </div>
                 )}
                 {/* Optional: Add type/platform info here if needed from backend data */}
                 {/* {voice.language && voice.gender && (
                     <div className={`text-xs ${uiColors.textPlaceholder}`}>{voice.language} - {voice.gender}</div>
                 )} */}
            </div>

            {/* Right: Selection Indicator (e.g., Check) */}
             <div className="flex-shrink-0 ml-4">
                 {isSelected ? (
                      <FiCheckCircle className={`w-6 h-6 ${uiColors.accentPrimary}`} />
                 ) : (
                      <div className={`w-6 h-6 rounded-full border-2 ${uiColors.borderPrimary}`}></div>
                 )}
             </div>
        </div>
    );
}

export default VoiceItem;