// voice-agents-CallAgents/[agentid]/calls/_components/TranscriptTab.jsx
"use client";

import React, { useRef, useEffect } from 'react';

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Ensure correct path

function TranscriptTab({ callData }) {

     // Access transcript and recordingUrl from callData
     const transcript = callData?.transcript;
     // FIX: Changed from `audioUrl` to `recordingUrl` to match the data saved from Vapi.
     const recordingUrl = callData?.recordingUrl;


    const audioRef = useRef(null);
    // You might need more sophisticated state (isPlaying, currentTime, duration)
    // and handlers (play, pause, seek) for a full audio player UI.


    // Optional: Effect to load audio when URL changes or component mounts
     useEffect(() => {
         // FIX: Check for `recordingUrl` to load the new audio source.
         if (audioRef.current && recordingUrl) {
             audioRef.current.load();
         }
     }, [recordingUrl]); // FIX: Dependency updated to `recordingUrl`.


    if (!transcript || transcript.length === 0) {
        return (
            <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                No transcript available for this call.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full"> {/* Container to stack transcript and player */}
            {/* Transcript Area */}
            <div className="flex-grow overflow-y-auto space-y-4 text-sm pr-2 -mr-2 hide-scrollbar"> {/* Scrollable area */}
                {/* Use callData.transcript array */}
                {transcript.map((entry, index) => (
                    // FIX: Changed logic from 'entry.type === agent' to 'entry.role === assistant' to match Vapi's roles.
                    <div key={index} className={`flex ${entry.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                         <div className={`max-w-[85%] p-3 rounded-lg ${
                             // FIX: Changed condition to use 'entry.role' which will be 'assistant' or 'user'.
                             entry.role === 'assistant'
                                 ? `${uiColors.chatBubbleAgentBg} ${uiColors.chatBubbleAgentText}`
                                 : `${uiColors.chatBubbleUserBg} ${uiColors.chatBubbleUserText}`
                         }`}>
                            {/* Optional: Timestamp */}
                             {/* <span className={`block text-xs ${uiColors.textPlaceholder} mb-1`}>
                                {entry.time} // You can display the time in seconds if you want.
                            </span> */}
                            {/* FIX: Changed from `entry.text` to `entry.message` to match the new transcript structure. */}
                            {entry.message}
                         </div>
                    </div>
                ))}
            </div>

            {/* Audio Player */}
             <div className={`flex-shrink-0 border-t ${uiColors.borderPrimary} pt-4 mt-4`}>
                 <h4 className={`text-sm font-semibold mb-2 ${uiColors.textPrimary}`}>Call Recording</h4>
                 {/* FIX: Check for and use `recordingUrl`. */}
                 {recordingUrl ? (
                     <audio ref={audioRef} controls src={recordingUrl} className="w-full">
                         Your browser does not support the audio element.
                     </audio>
                 ) : (
                      <div className={`${uiColors.textSecondary} text-sm`}>No audio recording available.</div>
                 )}
             </div>

        </div>
    );
}

export default TranscriptTab;