// voice-agents-dashboard/chat/[characterid]/_components/Message.jsx
"use client";

import React from 'react';
import Image from 'next/image';

// Import constants - Adjust path as necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants';

function Message({ message, characterAvatar, characterName, userAvatar, userName }) {
    const isUser = message.sender === 'user';
    const avatar = isUser ? userAvatar : characterAvatar;
    const name = isUser ? userName : characterName;

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            {!isUser && ( // Show character avatar on the left for their messages
                 <div className="flex-shrink-0 mr-3">
                     {/* Strengthen the conditional check for avatar */}
                     {typeof avatar === 'string' && avatar ? (
                         <img src={avatar} alt={name} width={32} height={32} className="rounded-full" />
                     ) : (
                         // Placeholder if no character avatar or avatar is not a valid string
                         <div className={`w-8 h-8 rounded-full ${uiColors.bgSecondary} flex items-center justify-center text-xs font-semibold`}>{name?.charAt(0).toUpperCase()}</div>
                     )}
                 </div>
            )}

            <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                 {/* Sender Label (optional, but in image for character) */}
                 {!isUser && (
                     <div className="flex items-center mb-1">
                          <span className={`text-sm font-semibold mr-1 ${uiColors.textPrimary}`}>{name}</span>
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${uiColors.accentBadgeBg} ${uiColors.textAccent}`}>c.ai</span>
                     </div>
                 )}
                {/* Message Bubble */}
                <div className={`rounded-lg p-3 text-sm ${isUser ? `${uiColors.chatBubbleUserBg} ${uiColors.chatBubbleUserText}` : `${uiColors.chatBubbleAgentBg} ${uiColors.chatBubbleAgentText}`} shadow-sm`}>
                    {message.text}
                </div>
            </div>

            {isUser && ( // Show user avatar on the right for user messages
                 <div className="flex-shrink-0 ml-2">
                     {/* Strengthen the conditional check for avatar */}
                     {typeof avatar === 'string' && avatar ? (
                          <img src={avatar} alt={name} width={32} height={32} className="rounded-full" />
                     ) : (
                         // Placeholder if no user avatar or avatar is not a valid string
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${uiColors.accentPrimaryGradient}`}>{name?.charAt(0).toUpperCase()}</div>
                     )}
                 </div>
            )}
        </div>
    );
}

export default Message;