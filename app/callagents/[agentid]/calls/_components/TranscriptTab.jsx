// voice-agents-CallAgents/[agentid]/calls/_components/TranscriptTab.jsx
"use client";

import React, { useRef, useEffect } from 'react'; // Added useRef and useEffect for audio

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Ensure correct path

function TranscriptTab({ callData }) { // Receive full callData

     // Access transcript and audioUrl from callData
     const transcript = callData?.transcript;
     const audioUrl = callData?.audioUrl;


    // Basic audio player state and ref (Placeholder)
    const audioRef = useRef(null);
    // You might need more sophisticated state (isPlaying, currentTime, duration)
    // and handlers (play, pause, seek) for a full audio player UI.


    // Optional: Effect to load audio when URL changes or component mounts
     useEffect(() => {
         if (audioRef.current && audioUrl) {
             audioRef.current.load(); // Load the new audio source
         }
     }, [audioUrl]);


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
                    <div key={index} className={`flex ${entry.type === 'agent' ? 'justify-start' : 'justify-end'}`}>
                         <div className={`max-w-[85%] p-3 rounded-lg ${
                             entry.type === 'agent'
                                 ? `${uiColors.chatBubbleAgentBg} ${uiColors.chatBubbleAgentText}`
                                 : `${uiColors.chatBubbleUserBg} ${uiColors.chatBubbleUserText}`
                         }`}>
                            {/* Optional: Timestamp */}
                             {/* <span className={`block text-xs ${uiColors.textPlaceholder} mb-1`}>
                                {entry.timestamp}
                            </span> */}
                            {entry.text}
                         </div>
                    </div>
                ))}
            </div>

            {/* Audio Player (Placeholder) */}
             <div className={`flex-shrink-0 border-t ${uiColors.borderPrimary} pt-4 mt-4`}>
                 <h4 className={`text-sm font-semibold mb-2 ${uiColors.textPrimary}`}>Call Recording</h4>
                 {/* Use callData.audioUrl */}
                 {audioUrl ? (
                     <audio ref={audioRef} controls src={audioUrl} className="w-full">
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