// // characterai/chat/[characterid]/_components/Message.jsx
// "use client";

// import React, { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef for audio
// import Image from 'next/image';
// import { FiVolume2, FiVolumeX } from 'react-icons/fi'; // Icons for speaker/muting

// // Import constants - Adjusted path as necessary
// import { uiColors } from '@/app/characterai/_constants/uiConstants'; // Corrected path

// // Updated message structure expected from parent:
// // {
// //   id: string,
// //   text: string,
// //   sender: 'user' | 'character',
// //   audioUrl?: string | null, // Added audioUrl for character messages
// //   // other potential fields like timestamp
// // }

// // Receive props for avatars and potential audio playback control
// function Message({
//     message,
//     characterAvatarUrl, // Use URL from backend
//     characterName,
//     userAvatarUrl,    // Use URL from Clerk/backend
//     userName,
//     onSpeak,          // Function to call when 'Speak' is clicked
//     isSpeaking,       // Boolean indicating if this message is currently speaking
//     // Add other props if needed, e.g., timestamp
// }) {
//     const isUser = message.sender === 'user';
//     // Use URL props for avatars
//     const avatarUrl = isUser ? userAvatarUrl : characterAvatarUrl;
//     const name = isUser ? userName : characterName;

//     // Optional: State to manage local speaking status if not fully controlled by parent
//     // const [isMessageSpeaking, setIsMessageSpeaking] = useState(false);

//     // Handler for the Speak button click
//     const handleSpeakClick = () => {
//         // Call the parent's onSpeak handler, passing the message ID, text, and audio URL
//         if (onSpeak && message.audioUrl) {
//              onSpeak(message.id, message.text, message.audioUrl);
//         } else {
//             console.warn("No audioUrl available for this message or onSpeak handler is missing.");
//              // Optionally alert the user
//              // alert("Audio not available for this message.");
//         }
//     };


//     return (
//         <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
//             {!isUser && ( // Show character avatar on the left for their messages
//                  <div className="flex-shrink-0 mr-3">
//                      {/* Use avatarUrl and check if it's a string and not empty */}
//                      {typeof avatarUrl === 'string' && avatarUrl ? (
//                          <Image src={avatarUrl} alt={name || 'Character'} width={32} height={32} className="rounded-full object-cover" />
//                      ) : (
//                          // Placeholder if no character avatar or avatar is not a valid string
//                          <div className={`w-8 h-8 rounded-full ${uiColors.bgSecondary} flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400 border ${uiColors.borderPrimary}`}>{name?.charAt(0).toUpperCase() || '?'}</div>
//                      )}
//                  </div>
//             )}

//             <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
//                  {/* Sender Label (optional, but in image for character) */}
//                  {!isUser && (
//                      <div className="flex items-center mb-1">
//                           <span className={`text-sm font-semibold mr-1 ${uiColors.textPrimary}`}>{name}</span>
//                           {/* Optional: Add a small indicator if it's a character */}
//                            <span className={`px-1 py-0.5 text-[10px] rounded-full ${uiColors.accentBadgeBg} ${uiColors.textAccent}`}>AI</span> {/* Changed from c.ai to AI */}
//                      </div>
//                  )}
//                 {/* Message Bubble */}
//                 {/* Combine message text and optional speak button in the bubble */}
//                 <div className={`rounded-lg p-3 text-sm ${isUser ? `${uiColors.chatBubbleUserBg} ${uiColors.chatBubbleUserText}` : `${uiColors.chatBubbleAgentBg} ${uiColors.chatBubbleAgentText}`} shadow-sm`}>
//                     <div className="flex items-end"> {/* Flex container to align text and button */}
//                          <div className="flex-grow break-words"> {/* Allow text to wrap */}
//                               {message.text}
//                          </div>
//                          {/* Speak button for character messages that have audio */}
//                          {!isUser && message.audioUrl && (
//                               <button
//                                    onClick={handleSpeakClick}
//                                    className={`ml-2 flex-shrink-0 p-1 rounded-full transition-colors ${uiColors.hoverBgSubtle} ${isSpeaking ? uiColors.textAccent : uiColors.textSecondary}`}
//                                    title={isSpeaking ? 'Stop Speaking' : 'Speak'} // Adjust title based on speaking state
//                                    // Disabled logic might be needed if playback state is handled here
//                                >
//                                   {/* Change icon or color based on isSpeaking */}
//                                    {isSpeaking ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
//                                </button>
//                           )}
//                     </div>
//                 </div>
//             </div>

//             {isUser && ( // Show user avatar on the right for user messages
//                  <div className="flex-shrink-0 ml-2">
//                      {/* Use avatarUrl and check if it's a string and not empty */}
//                      {typeof avatarUrl === 'string' && avatarUrl ? (
//                           <Image src={avatarUrl} alt={name || 'User'} width={32} height={32} className="rounded-full object-cover" />
//                      ) : (
//                          // Placeholder if no user avatar or avatar is not a valid string
//                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${uiColors.accentPrimaryGradient}`}>{name?.charAt(0).toUpperCase() || '?'}</div>
//                      )}
//                  </div>
//             )}
//         </div>
//     );
// }

// export default Message;

// characterai/chat/[characterid]/_components/Message.jsx
"use client";

import React from 'react'; // Removed useEffect and useRef
import Image from 'next/image';
// Removed FiVolume2, FiVolumeX icons as Speak button is not needed for transcripts
// import { FiVolume2, FiVolumeX } from 'react-icons/fi';

// Import constants
import { uiColors } from '@/app/characterai/_constants/uiConstants';

// Message structure can now include transcripts from Vapi:
// { id: string, text: string, sender: 'user' | 'character' | 'system', timestamp: string, audioUrl?: string | null }
// audioUrl will be null for transcripts from the Vapi call.
// Added 'system' sender type for call start/end messages.


function Message({
    message,
    characterAvatarUrl,
    characterName,
    userAvatarUrl,
    userName,
    // onSpeak and isSpeaking are NOT used for Vapi real-time transcripts
    // but we keep them in props definition for compatibility if needed later
    // onSpeak,
    // isSpeaking,
}) {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system'; // Check for system messages

    // Determine avatar and name only if not a system message
    const avatarUrl = !isSystem ? (isUser ? userAvatarUrl : characterAvatarUrl) : null;
    const name = !isSystem ? (isUser ? userName : characterName) : null;


    // --- No Audio Playback Logic Here Anymore ---
    // The parent (page.jsx) manages the Vapi SDK which handles real-time audio playback


    // Render system messages differently
    if (isSystem) {
        return (
            <div className="flex justify-center mb-4">
                 <div className={`text-center text-sm italic ${uiColors.textSecondary}`}>
                     {message.text}
                 </div>
            </div>
        );
    }


    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            {!isUser && ( // Show character avatar on the left for their messages
                 <div className="flex-shrink-0 mr-3">
                     {/* Use avatarUrl and check if it's a string and not empty */}
                     {typeof avatarUrl === 'string' && avatarUrl ? (
                         <Image src={avatarUrl} alt={name || 'Character'} width={32} height={32} className="rounded-full object-cover" />
                     ) : (
                         // Placeholder if no character avatar or avatar is not a valid string
                         <div className={`w-8 h-8 rounded-full ${uiColors.bgSecondary} flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400 border ${uiColors.borderPrimary}`}>{name?.charAt(0).toUpperCase() || '?'}</div>
                     )}
                 </div>
            )}

            <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                 {/* Sender Label */}
                 {!isUser && (
                     <div className="flex items-center mb-1">
                          <span className={`text-sm font-semibold mr-1 ${uiColors.textPrimary}`}>{name}</span>
                           <span className={`px-1 py-0.5 text-[10px] rounded-full ${uiColors.accentBadgeBg} ${uiColors.textAccent}`}>AI</span>
                     </div>
                 )}
                {/* Message Bubble */}
                {/* Removed the inner flex container and Speak button */}
                <div className={`rounded-lg p-3 text-sm ${isUser ? `${uiColors.chatBubbleUserBg} ${uiColors.chatBubbleUserText}` : `${uiColors.chatBubbleAgentBg} ${uiColors.chatBubbleAgentText}`} shadow-sm break-words`}> {/* Added break-words */}
                     {message.text}
                </div>
            </div>

            {isUser && ( // Show user avatar on the right for user messages
                 <div className="flex-shrink-0 ml-2">
                     {/* Use avatarUrl and check if it's a string and not empty */}
                     {typeof avatarUrl === 'string' && avatarUrl ? (
                          <Image src={avatarUrl} alt={name || 'User'} width={32} height={32} className="rounded-full object-cover" />
                     ) : (
                         // Placeholder if no user avatar or avatar is not a valid string
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${uiColors.accentPrimaryGradient}`}>{name?.charAt(0).toUpperCase() || '?'}</div>
                     )}
                 </div>
            )}
        </div>
    );
}

export default Message;