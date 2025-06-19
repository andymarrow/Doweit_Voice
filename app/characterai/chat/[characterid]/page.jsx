// characterai/chat/[characterid]/page.jsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react'; // Import useMemo
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs'; // Import Clerk's useUser hook
import {
    FiSettings, FiMoreHorizontal, FiPlusCircle, FiImage, FiSend,
    FiPhoneCall, FiAlertCircle, FiHeart, FiShare2 // Added Like & Share icons
} from 'react-icons/fi';

// Import components
import Message from './_components/Message';
import SimulatedCallModal from './_components/SimulatedCallModal';

// Import constants - Adjusted path as necessary
import { uiColors } from '../../_constants/uiConstants'; // Corrected path
import { sectionVariants, itemVariants } from '../../_constants/uiConstants'; // Keep animation variants

// Placeholder functions removed, we will fetch from backend

export default function SingleCharacterChatRoom() {
    const params = useParams();
    const characterId = params.characterid;

    const { user, isLoading: isUserLoading } = useUser(); // Get user info from Clerk

    const [character, setCharacter] = useState(null);
    const [messages, setMessages] = useState([]); // Start with empty messages
    const [chatInput, setChatInput] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Overall loading state
    const [error, setError] = useState(null); // Error state

    const [isCallModalOpen, setIsCallModalOpen] = useState(false);

    // State for audio playback
    const [audioPlayer, setAudioPlayer] = useState(null); // Audio element instance
    const [currentlyPlayingMessageId, setCurrentlyPlayingMessageId] = useState(null);

    const messagesEndRef = useRef(null); // Ref to auto-scroll chat

    // Memoize current user ID for efficient checks
    const currentUserId = useMemo(() => user?.id, [user]);

    const openCallModal = () => setIsCallModalOpen(true);
    const closeCallModal = () => setIsCallModalOpen(false);

    // --- Data Fetching Effects ---

    // Effect to fetch character and messages on component mount or characterId/user changes
    useEffect(() => {
        // Ensure user is loaded and we have a characterId before fetching
        if (!isUserLoading && user?.id && characterId) {
            const loadChatData = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // 1. Fetch character data
                    const characterResponse = await fetch(`/api/characters/${characterId}`);
                    if (!characterResponse.ok) {
                        throw new Error(`Failed to fetch character: ${characterResponse.status}`);
                    }
                    const characterData = await characterResponse.json();
                    setCharacter(characterData);

                    // 2. Fetch chat history for this user and character
                    // Assumes backend endpoint handles fetching history based on user and character IDs
                    const messagesResponse = await fetch(`/api/chat/${characterId}?userId=${user.id}`); // Pass userId if needed by backend auth isn't enough
                    if (!messagesResponse.ok) {
                         // Don't throw if no messages, just log a warning
                         console.warn("Failed to fetch chat history:", messagesResponse.status);
                         setMessages([]); // Start with empty history
                    } else {
                        const messagesData = await messagesResponse.json();
                        // Assuming messagesData is an array of message objects
                        setMessages(messagesData.messages || []);
                    }

                } catch (err) {
                    console.error("Failed to load chat data:", err);
                    setError("Failed to load chat.");
                    setCharacter(null);
                    setMessages([]);
                } finally {
                    setIsLoading(false);
                }
            };

            loadChatData();
        } else if (!isUserLoading && !user) {
            // Handle case where user is not logged in (if chat requires login)
             // You might redirect them or show a message
             setIsLoading(false);
             setError("Please log in to chat."); // Example
        }

    }, [characterId, user?.id, isUserLoading]); // Depend on characterId and user ID/loading state


    // --- Audio Playback Effect ---

    // Effect to manage the Audio player instance
    useEffect(() => {
        // Create a single Audio player instance when the component mounts
        const player = new Audio();

        // Set up event listeners for the player
        const handleEnded = () => setCurrentlyPlayingMessageId(null);
        const handleError = (e) => {
            console.error("Audio playback error:", e);
            setCurrentlyPlayingMessageId(null); // Stop indicating playing on error
            // Optionally display an error message to the user
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


    // Function to handle playing a specific message's audio
    const handleSpeakMessage = (messageId, messageText, audioUrl) => {
         if (!audioPlayer) {
             console.error("Audio player not initialized.");
             return;
         }

         // If this message is already playing, stop it
         if (currentlyPlayingMessageId === messageId) {
             audioPlayer.pause();
             audioPlayer.currentTime = 0; // Rewind
             setCurrentlyPlayingMessageId(null);
         } else {
             // If another message is playing, stop it first
             if (currentlyPlayingMessageId !== null) {
                 audioPlayer.pause();
                 audioPlayer.currentTime = 0;
             }

             // Start playing the new message's audio
             audioPlayer.src = audioUrl;
             audioPlayer.play()
                .then(() => {
                    console.log(`Playing audio for message: ${messageId}`);
                    setCurrentlyPlayingMessageId(messageId); // Indicate this message is playing
                })
                .catch(err => {
                    console.error("Error starting audio playback:", err);
                    setCurrentlyPlayingMessageId(null); // Clear playing state on error
                    // Optionally alert the user
                    alert("Could not play audio.");
                });
         }
    };


    // --- Message Sending Handler ---

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = chatInput.trim();

        // Ensure user, character, and input are valid
        if (!text || !character || !currentUserId) {
            console.warn("Cannot send message: missing input, character, or user.");
            return;
        }

        // Add user message to state immediately (optimistic update)
        const newUserMessage = {
            id: Date.now().toString(), // Use timestamp as temporary ID
            text: text,
            sender: 'user',
            timestamp: new Date().toISOString(), // Add timestamp
        };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setChatInput(''); // Clear input field

        // Optionally scroll to bottom immediately after adding user message
        setTimeout(() => {
             if (messagesEndRef.current) {
                 messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
             }
         }, 50); // Short delay to allow DOM update


        // Send message to backend API
        try {
            const response = await fetch(`/api/chat/${characterId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if your API requires it (e.g., with Clerk session token)
                    // 'Authorization': `Bearer ${await user.getSessionId()}` // Example for Clerk
                },
                 body: JSON.stringify({
                     userId: currentUserId, // Send user ID
                     text: text,           // Send user message text
                     // You might need to send recent message history here too for context
                     // history: messages.slice(-30), // Send last 30 messages as context
                 }),
            });

            if (!response.ok) {
                throw new Error(`Failed to send message to AI: ${response.status}`);
            }

            // Assuming the API returns the AI's message details
            // Expected response body: { aiMessage: { id: string, text: string, audioUrl: string | null, timestamp: string } }
            const responseData = await response.json();
            const aiMessage = responseData.aiMessage;

            if (!aiMessage) {
                 console.warn("API response did not contain an aiMessage.");
                 // Handle case where AI failed to respond
                  const errorAiMessage = {
                      id: Date.now().toString() + '_error',
                      text: "Sorry, I couldn't generate a response right now.",
                      sender: 'character',
                      timestamp: new Date().toISOString(),
                      audioUrl: null // No audio for error
                   };
                 setMessages(prevMessages => [...prevMessages, errorAiMessage]);
                 return;
            }

            // Add AI message to state
            setMessages(prevMessages => [...prevMessages, aiMessage]);

            // Play AI message audio if available
            if (aiMessage.audioUrl && audioPlayer) {
                handleSpeakMessage(aiMessage.id, aiMessage.text, aiMessage.audioUrl);
                 // Or directly:
                 // audioPlayer.src = aiMessage.audioUrl;
                 // audioPlayer.play().then(() => setCurrentlyPlayingMessageId(aiMessage.id)).catch(console.error);
            }


        } catch (err) {
            console.error("Error sending message or receiving AI response:", err);
            // Handle error: Show a message to the user, potentially revert optimistic update
            const errorAiMessage = {
                id: Date.now().toString() + '_error',
                text: "Sorry, something went wrong. Please try again.",
                sender: 'character',
                timestamp: new Date().toISOString(),
                audioUrl: null // No audio for error
             };
            setMessages(prevMessages => [...prevMessages, errorAiMessage]);
             // Re-enable input or show retry option
        }
    };

     // --- Scroll to Bottom Effect ---
    useEffect(() => {
        // Scroll to bottom whenever messages change
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);


    // --- Like and Share Handlers (Similar to CharacterCard) ---

     // State to track if current user liked this specific character
     // This should ideally come from the initial character fetch
     const [isLiked, setIsLiked] = useState(false);

     // Effect to update isLiked state when character data is fetched
     useEffect(() => {
         if (character && currentUserId) {
             // Assuming the character data fetched includes whether the current user liked it
             // Example: backend adds a field like `isLikedByCurrentUser`
             setIsLiked(character.isLikedByCurrentUser || false); // Default to false
         } else {
             setIsLiked(false); // Reset if character/user not loaded
         }
     }, [character, currentUserId]);


     const handleLikeToggle = async () => {
         if (!currentUserId || !character?.id) {
             console.warn("Cannot like: user or character not loaded.");
             return;
         }

         const charId = character.id;
         const isCurrentlyLiked = isLiked;

         // Optimistic update
         setIsLiked(!isCurrentlyLiked);
         // You might also optimistically update a local 'likes' count state if you display it here

         try {
             // Call backend API to toggle like
             const response = await fetch(`/api/characters/${charId}/like`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     userId: currentUserId, // Send user ID
                     isLiking: !isCurrentlyLiked // Send desired action (true for like, false for unlike)
                 }),
             });

             if (!response.ok) {
                 // If API call fails, revert the optimistic update
                 setIsLiked(isCurrentlyLiked);
                 throw new Error(`Failed to toggle like status: ${response.status}`);
             }

             // Optional: Fetch updated character data or handle response if API returns new count/status
             // const updatedCharacter = await response.json();
             // setCharacter(updatedCharacter); // Update the character state with fresh data

             console.log(`Like status toggled for ${charId}`);

         } catch (err) {
             console.error("Failed to toggle like:", err);
             // Revert optimistic update if fetch failed
             setIsLiked(isCurrentlyLiked);
             alert("Failed to update like status."); // Inform user
         }
     };

     const handleShareClick = () => {
          if (!character?.id) {
              console.warn("Cannot share: character not loaded.");
              return;
          }
          const shareUrl = `${window.location.origin}/characterai/chat/${character.id}`;
          navigator.clipboard.writeText(shareUrl).then(() => {
              alert(`Chat link copied to clipboard!`);
          }).catch(err => {
              console.error('Failed to copy link:', err);
              alert('Could not copy link.');
          });
     };


    // --- Render Logic ---

    if (isLoading || isUserLoading) {
         return <div className={`flex items-center justify-center h-full text-lg ${uiColors.textSecondary}`}>Loading chat...</div>;
    }

     if (error) {
         return (
              <div className={`flex flex-col items-center justify-center h-full text-lg ${uiColors.textDanger}`}>
                 <FiAlertCircle className="w-10 h-10 mb-4" />
                 {error} {/* Display the specific error message */}
              </div>
         );
     }

     // If character is null after loading and no error, it means characterId was invalid
     if (!character) {
          return (
               <div className={`flex flex-col items-center justify-center h-full text-lg ${uiColors.textDanger}`}>
                  <FiAlertCircle className="w-10 h-10 mb-4" />
                  Character not found.
               </div>
          );
     }


    return (
        <div className="flex flex-col h-full">

            {/* Chat Room Header */}
            <div className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary} flex-shrink-0`}>
                 {/* Character Info */}
                 <div className="flex items-center">
                     {/* Use character.avatarUrl from the fetched character data */}
                     {character.avatarUrl ? (
                         <img src={character.avatarUrl} alt={character.name} width={40} height={40} className="rounded-full mr-3 object-cover" />
                     ) : (
                          // Fallback div
                          <div className={`w-10 h-10 rounded-full ${uiColors.bgSecondary} flex items-center justify-center text-lg font-semibold mr-3 text-gray-500 dark:text-gray-400 border ${uiColors.borderPrimary}`}>
                             {character.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                     )}
                     <div>
                         <h2 className={`text-lg font-semibold ${uiColors.textPrimary} leading-tight`}>{character.name}</h2>
                         {/* Display creator's name from fetched character data */}
                          {character.creatorName && (
                               <p className={`text-xs ${uiColors.textSecondary}`}>By {character.creatorName}</p>
                          )}
                     </div>
                 </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing for smaller screens */}
                     {/* Like Button */}
                     <button
                         onClick={handleLikeToggle}
                          className={`p-2 rounded-md transition-colors ${uiColors.hoverBgSubtle} ${isLiked ? uiColors.textAccent : uiColors.textSecondary}`}
                         title={isLiked ? "Unlike Character" : "Like Character"}
                     >
                         <FiHeart className={`w-5 h-5 ${isLiked ? uiColors.textAccent : uiColors.textSecondary}`} />
                     </button>
                     {/* Share Button */}
                      <button
                          onClick={handleShareClick}
                          className={`p-2 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                          title="Share Chat Link"
                      >
                         <FiShare2 className={`w-5 h-5 ${uiColors.textSecondary}`} />
                      </button>
                      {/* Call Button - Opens Simulated Call Modal */}
                     <button onClick={openCallModal} className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="Call Character (Simulated)">
                         <FiPhoneCall className={`w-5 h-5 ${uiColors.textSecondary}`} />
                     </button>
                      {/* Settings Button (Placeholder) */}
                     <button className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="Settings">
                         <FiSettings className={`w-5 h-5 ${uiColors.textSecondary}`} />
                     </button>
                      {/* More Options Button (Placeholder) */}
                     <button className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="More Options">
                         <FiMoreHorizontal className={`w-5 h-5 ${uiColors.textSecondary}`} />
                     </button>
                 </div>
            </div>

            {/* Chat Messages Area */}
            {/* Adjusted padding/margin to potentially fill space better */}
            <div className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 hide-scrollbar"> {/* Used padding and no negative margin here */}
                {/* Added a flex-grow div to push content to the bottom */}
                <div className="flex flex-col justify-end min-h-full">
                     {messages.map(msg => (
                         <Message
                             key={msg.id}
                             message={msg}
                             // Pass character and user avatar URLs and names
                             characterAvatarUrl={character.avatarUrl}
                             characterName={character.name}
                             userAvatarUrl={user?.imageUrl || '/placeholder-user-avatar.jpg'} // Use Clerk user image, fallback
                             userName={user?.username || 'User'} // Use Clerk username, fallback
                             // Pass audio playback control props for character messages
                             onSpeak={handleSpeakMessage}
                             isSpeaking={currentlyPlayingMessageId === msg.id}
                         />
                     ))}
                    <div ref={messagesEndRef} /> {/* Empty div for scrolling */}
                </div>
            </div>

            {/* Chat Input Area */}
            <div className={`flex-shrink-0 p-4 border-t ${uiColors.borderPrimary}`}>
                 {/* Disclaimer */}
                 <div className={`text-center text-xs ${uiColors.textSecondary} mb-3`}>
                     This is A.I. and not a real person. Treat everything it says as fiction <FiAlertCircle className="inline-block ml-1 w-3 h-3" />
                 </div>
                <form onSubmit={handleSendMessage} className={`flex items-center rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} p-2`}>
                    {/* Attachment Button (Placeholder) */}
                    <button type="button" className={`p-2 rounded-md ${uiColors.hoverBgSubtle} mr-2`} title="Add Attachment">
                         <FiPlusCircle className={`w-5 h-5 ${uiColors.textSecondary}`} />
                    </button>
                     {/* Image Button (Placeholder) */}
                     <button type="button" className={`p-2 rounded-md ${uiColors.hoverBgSubtle} mr-2`} title="Add Image">
                         <FiImage className={`w-5 h-5 ${uiColors.textSecondary}`} />
                    </button>
                    {/* Text Input */}
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className={`flex-grow p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`}
                        placeholder={`Message ${character.name}...`}
                        disabled={isLoading || !user || !character} // Disable input while loading or if no user/character
                    />
                    {/* Send Button - Disabled if input is empty or loading */}
                    <button
                         type="submit"
                         disabled={!chatInput.trim() || isLoading || !user || !character}
                         className={`p-2 rounded-md transition-colors ${(!chatInput.trim() || isLoading || !user || !character) ? 'opacity-50 cursor-not-allowed' : `${uiColors.accentPrimaryGradient} text-white ${uiColors.hoverBgSubtle}`}`}
                    >
                        <FiSend className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* Render Simulated Call Modal */}
             <SimulatedCallModal
                 isOpen={isCallModalOpen}
                 onClose={closeCallModal}
                 characterName={character.name}
                 characterAvatarUrl={character.avatarUrl} // Pass URL
             />

        </div>
    );
}