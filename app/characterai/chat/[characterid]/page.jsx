// voice-agents-dashboard/chat/[characterid]/page.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FiSettings, FiMoreHorizontal, FiPlusCircle, FiImage, FiSend, FiPhoneCall, FiAlertCircle // Icons
} from 'react-icons/fi';

// Import components
import Message from './_components/Message';
import SimulatedCallModal from './_components/SimulatedCallModal';

// Import constants - Adjust path as necessary
import { uiColors } from '../../_constants/uiConstants';
import { sectionVariants, itemVariants } from '../../_constants/uiConstants';


// Placeholder function to simulate fetching character data
const fetchCharacterById = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const characters = {
        'elon-musk': {
            id: 'elon-musk',
            name: 'Homer Simpson',
            avatar: '/avatars/homer.jpg',
            description: 'Homer is the main protagonist of The Simpsons.',
            creator: '@AnonTheMous',
        },
         'emma-autotrust': {
             id: 'emma-autotrust',
             name: 'Emma from AutoTrust',
             avatar: '/voiceagents/1.jpg',
             description: 'AI Receptionist for AutoTrust Cars.',
             creator: '@Synthflow',
         },
         'rick-morty': { // Added for testing missing avatar
             id: 'rick-morty',
             name: 'No Avatar Char',
             avatar: null, // Simulate null avatar
             description: 'This character has no avatar.',
             creator: '@Test',
         },
    };
    return characters[id] || null;
};


export default function SingleCharacterChatRoom() {
    const params = useParams();
    const characterId = params.characterid;

    const [character, setCharacter] = useState(null);
    const [messages, setMessages] = useState([
        { id: 'msg-1', text: 'Hello, I am Homer Simpson.', sender: 'character' },
        { id: 'msg-2', text: 'hello', sender: 'user' },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isLoadingCharacter, setIsLoadingCharacter] = useState(true);

    const [isCallModalOpen, setIsCallModalOpen] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const loadCharacter = async () => {
            setIsLoadingCharacter(true);
            const charData = await fetchCharacterById(characterId);
            setCharacter(charData);
            setIsLoadingCharacter(false);
        };

        loadCharacter();
    }, [characterId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (chatInput.trim() && character) {
            const newUserMessage = { id: Date.now().toString(), text: chatInput, sender: 'user' };
            setMessages(prevMessages => [...prevMessages, newUserMessage]);
            setChatInput('');

            setTimeout(() => {
                const aiResponse = { id: Date.now().toString() + '_ai', text: `D'oh! You said "${newUserMessage.text}".`, sender: 'character' };
                setMessages(prevMessages => [...prevMessages, aiResponse]);
            }, 800);
        }
    };

    const openCallModal = () => setIsCallModalOpen(true);
    const closeCallModal = () => setIsCallModalOpen(false);


    if (isLoadingCharacter) {
         return <div className={`flex items-center justify-center h-full text-lg ${uiColors.textSecondary}`}>Loading character...</div>;
    }

     if (!character) {
         return (
              <div className={`flex flex-col items-center justify-center h-full text-lg ${uiColors.textDanger}`}>
                 <FiAlertCircle className="w-10 h-10 mb-4" />
                 Error: Character not found.
              </div>
         );
     }


    return (
        <div className="flex flex-col h-full">

            {/* Chat Room Header */}
            <div className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary} flex-shrink-0`}>
                 {/* Character Info */}
                 <div className="flex items-center">
                     {character.avatar ? (
                         <img src={character.avatar} alt={character.name} width={40} height={40} className="rounded-full mr-3" />
                     ) : (
                          <div className={`w-10 h-10 rounded-full ${uiColors.bgSecondary} flex items-center justify-center text-lg font-semibold mr-3`}>
                             {character.name?.charAt(0).toUpperCase()}
                          </div>
                     )}
                     <div>
                         <h2 className={`text-lg font-semibold ${uiColors.textPrimary} leading-tight`}>{character.name}</h2>
                         <p className={`text-xs ${uiColors.textSecondary}`}>By {character.creator}</p>
                     </div>
                 </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-4">
                     <button onClick={openCallModal} className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="Call Character">
                         <FiPhoneCall className={`w-5 h-5 ${uiColors.textSecondary}`} />
                     </button>
                     <button className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="Settings">
                         <FiSettings className={`w-5 h-5 ${uiColors.textSecondary}`} />
                     </button>
                     <button className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="More Options">
                         <FiMoreHorizontal className={`w-5 h-5 ${uiColors.textSecondary}`} />
                     </button>
                 </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-grow overflow-y-auto p-10 -m-4 hide-scrollbar">
                <div className="flex flex-col justify-end min-h-full">
                     {messages.map(msg => (
                         <Message
                             key={msg.id}
                             message={msg}
                             characterAvatar={character.avatar}
                             characterName={character.name}
                             userAvatar="/voiceagents/5.jpg" // Placeholder user avatar
                             userName="andymarrow" // Placeholder user name
                         />
                     ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Chat Input Area */}
            <div className={`flex-shrink-0 p-4 border-t ${uiColors.borderPrimary}`}>
                 {/* Disclaimer */}
                 <div className={`text-center text-xs ${uiColors.textSecondary} mb-3`}>
                     This is A.I. and not a real person. Treat everything it says as fiction <FiAlertCircle className="inline-block ml-1 w-3 h-3" />
                 </div>
                <form onSubmit={handleSendMessage} className={`flex items-center rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} p-2`}>
                    <button type="button" className={`p-2 rounded-md ${uiColors.hoverBgSubtle} mr-2`} title="Add Attachment">
                         <FiPlusCircle className={`w-5 h-5 ${uiColors.textSecondary}`} />
                    </button>
                     <button type="button" className={`p-2 rounded-md ${uiColors.hoverBgSubtle} mr-2`} title="Add Image">
                         <FiImage className={`w-5 h-5 ${uiColors.textSecondary}`} />
                    </button>
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className={`flex-grow p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`}
                        placeholder={`Message ${character.name}...`}
                    />
                    <button type="submit" disabled={!chatInput.trim()} className={`p-2 rounded-md transition-colors ${!chatInput.trim() ? 'opacity-50 cursor-not-allowed' : `${uiColors.accentPrimaryGradient} text-white ${uiColors.hoverBgSubtle}`}`}>
                        <FiSend className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* Render Simulated Call Modal */}
             <SimulatedCallModal
                 isOpen={isCallModalOpen}
                 onClose={closeCallModal}
                 characterName={character.name}
                 characterAvatar={character.avatar}
             />

        </div>
    );
}