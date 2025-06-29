// // characterai/chat/[characterid]/page.jsx
// "use client";

// import React, { useState, useEffect, useRef, useMemo } from 'react'; // Import useMemo
// import { useParams } from 'next/navigation';
// import { motion } from 'framer-motion';
// import { useUser } from '@clerk/nextjs'; // Import Clerk's useUser hook
// import {
//     FiSettings, FiMoreHorizontal, FiPlusCircle, FiImage, FiSend,
//     FiPhoneCall, FiAlertCircle, FiHeart, FiShare2 // Added Like & Share icons
// } from 'react-icons/fi';

// // Import components
// import Message from './_components/Message';
// import SimulatedCallModal from './_components/SimulatedCallModal';

// // Import constants - Adjusted path as necessary
// import { uiColors } from '../../_constants/uiConstants'; // Corrected path
// import { sectionVariants, itemVariants } from '../../_constants/uiConstants'; // Keep animation variants

// // Placeholder functions removed, we will fetch from backend

// export default function SingleCharacterChatRoom() {
//     const params = useParams();
//     const characterId = params.characterid;

//     const { user, isLoading: isUserLoading } = useUser(); // Get user info from Clerk

//     const [character, setCharacter] = useState(null);
//     const [messages, setMessages] = useState([]); // Start with empty messages
//     const [chatInput, setChatInput] = useState('');
//     const [isLoading, setIsLoading] = useState(true); // Overall loading state
//     const [error, setError] = useState(null); // Error state

//     const [isCallModalOpen, setIsCallModalOpen] = useState(false);

//     // State for audio playback
//     const [audioPlayer, setAudioPlayer] = useState(null); // Audio element instance
//     const [currentlyPlayingMessageId, setCurrentlyPlayingMessageId] = useState(null);

//     const messagesEndRef = useRef(null); // Ref to auto-scroll chat

//     // Memoize current user ID for efficient checks
//     const currentUserId = useMemo(() => user?.id, [user]);

//     const openCallModal = () => setIsCallModalOpen(true);
//     const closeCallModal = () => setIsCallModalOpen(false);

//     // --- Data Fetching Effects ---

//     // Effect to fetch character and messages on component mount or characterId/user changes
//     useEffect(() => {
//         // Ensure user is loaded and we have a characterId before fetching
//         if (!isUserLoading && user?.id && characterId) {
//             const loadChatData = async () => {
//                 setIsLoading(true);
//                 setError(null);
//                 try {
//                     // 1. Fetch character data
//                     const characterResponse = await fetch(`/api/characters/${characterId}`);
//                     if (!characterResponse.ok) {
//                         throw new Error(`Failed to fetch character: ${characterResponse.status}`);
//                     }
//                     console.log("this is the character response", characterResponse);
//                     const characterData = await characterResponse.json();
//                     setCharacter(characterData);

//                     // 2. Fetch chat history for this user and character
//                     // Assumes backend endpoint handles fetching history based on user and character IDs
//                     const messagesResponse = await fetch(`/api/chat/${characterId}?userId=${user.id}`); // Pass userId if needed by backend auth isn't enough
//                     if (!messagesResponse.ok) {
//                          // Don't throw if no messages, just log a warning
//                          console.warn("Failed to fetch chat history:", messagesResponse.status);
//                          setMessages([]); // Start with empty history
//                     } else {
//                         const messagesData = await messagesResponse.json();
//                         // Assuming messagesData is an array of message objects
//                         setMessages(messagesData.messages || []);
//                     }

//                 } catch (err) {
//                     console.error("Failed to load chat data:", err);
//                     setError("Failed to load chat.");
//                     setCharacter(null);
//                     setMessages([]);
//                 } finally {
//                     setIsLoading(false);
//                 }
//             };

//             loadChatData();
//         } else if (!isUserLoading && !user) {
//             // Handle case where user is not logged in (if chat requires login)
//              // You might redirect them or show a message
//              setIsLoading(false);
//              setError("Please log in to chat."); // Example
//         }

//     }, [characterId, user?.id, isUserLoading]); // Depend on characterId and user ID/loading state


//     // --- Audio Playback Effect ---

//     // Effect to manage the Audio player instance
//     useEffect(() => {
//         // Create a single Audio player instance when the component mounts
//         const player = new Audio();

//         // Set up event listeners for the player
//         const handleEnded = () => setCurrentlyPlayingMessageId(null);
//         const handleError = (e) => {
//             console.error("Audio playback error:", e);
//             setCurrentlyPlayingMessageId(null); // Stop indicating playing on error
//             // Optionally display an error message to the user
//         };

//         player.addEventListener('ended', handleEnded);
//         player.addEventListener('error', handleError);

//         setAudioPlayer(player); // Store the player instance

//         // Cleanup: stop playback and remove listeners when component unmounts
//         return () => {
//              if (player) {
//                  player.pause(); // Stop playback
//                  player.removeEventListener('ended', handleEnded);
//                  player.removeEventListener('error', handleError);
//              }
//         };
//     }, []); // Empty dependency array ensures this runs only once on mount


//     // Function to handle playing a specific message's audio
//     const handleSpeakMessage = (messageId, messageText, audioUrl) => {
//          if (!audioPlayer) {
//              console.error("Audio player not initialized.");
//              return;
//          }

//          // If this message is already playing, stop it
//          if (currentlyPlayingMessageId === messageId) {
//              audioPlayer.pause();
//              audioPlayer.currentTime = 0; // Rewind
//              setCurrentlyPlayingMessageId(null);
//          } else {
//              // If another message is playing, stop it first
//              if (currentlyPlayingMessageId !== null) {
//                  audioPlayer.pause();
//                  audioPlayer.currentTime = 0;
//              }

//              // Start playing the new message's audio
//              audioPlayer.src = audioUrl;
//              audioPlayer.play()
//                 .then(() => {
//                     console.log(`Playing audio for message: ${messageId}`);
//                     setCurrentlyPlayingMessageId(messageId); // Indicate this message is playing
//                 })
//                 .catch(err => {
//                     console.error("Error starting audio playback:", err);
//                     setCurrentlyPlayingMessageId(null); // Clear playing state on error
//                     // Optionally alert the user
//                     alert("Could not play audio.");
//                 });
//          }
//     };


//     // --- Message Sending Handler ---

//     const handleSendMessage = async (e) => {
//         e.preventDefault();
//         const text = chatInput.trim();

//         // Ensure user, character, and input are valid
//         if (!text || !character || !currentUserId) {
//             console.warn("Cannot send message: missing input, character, or user.");
//             return;
//         }

//         // Add user message to state immediately (optimistic update)
//         const newUserMessage = {
//             id: Date.now().toString(), // Use timestamp as temporary ID
//             text: text,
//             sender: 'user',
//             timestamp: new Date().toISOString(), // Add timestamp
//         };
//         setMessages(prevMessages => [...prevMessages, newUserMessage]);
//         setChatInput(''); // Clear input field

//         // Optionally scroll to bottom immediately after adding user message
//         setTimeout(() => {
//              if (messagesEndRef.current) {
//                  messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//              }
//          }, 50); // Short delay to allow DOM update


//         // Send message to backend API
//         try {
//             console.log("am hereee")
//             const response = await fetch(`/api/chat/${characterId}/message`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     // Add authorization header if your API requires it (e.g., with Clerk session token)
//                     // 'Authorization': `Bearer ${await user.getSessionId()}` // Example for Clerk
//                 },
//                  body: JSON.stringify({
//                      userId: currentUserId, // Send user ID
//                      text: text,           // Send user message text
//                      // You might need to send recent message history here too for context
//                      history: messages.slice(-30), // Send last 30 messages as context
//                  }),
//             });

//             if (!response.ok) {
//                 throw new Error(`Failed to send message to AI: ${response.status}`);
//             }

//             // Assuming the API returns the AI's message details
//             // Expected response body: { aiMessage: { id: string, text: string, audioUrl: string | null, timestamp: string } }
//             const responseData = await response.json();
//             const aiMessage = responseData.aiMessage;

//             if (!aiMessage) {
//                  console.warn("API response did not contain an aiMessage.");
//                  // Handle case where AI failed to respond
//                   const errorAiMessage = {
//                       id: Date.now().toString() + '_error',
//                       text: "Sorry, I couldn't generate a response right now.",
//                       sender: 'character',
//                       timestamp: new Date().toISOString(),
//                       audioUrl: null // No audio for error
//                    };
//                  setMessages(prevMessages => [...prevMessages, errorAiMessage]);
//                  return;
//             }

//             // Add AI message to state
//             setMessages(prevMessages => [...prevMessages, aiMessage]);

//             // Play AI message audio if available
//             if (aiMessage.audioUrl && audioPlayer) {
//                 handleSpeakMessage(aiMessage.id, aiMessage.text, aiMessage.audioUrl);
//                  // Or directly:
//                  // audioPlayer.src = aiMessage.audioUrl;
//                  // audioPlayer.play().then(() => setCurrentlyPlayingMessageId(aiMessage.id)).catch(console.error);
//             }


//         } catch (err) {
//             console.error("Error sending message or receiving AI response:", err);
//             // Handle error: Show a message to the user, potentially revert optimistic update
//             const errorAiMessage = {
//                 id: Date.now().toString() + '_error',
//                 text: "Sorry, something went wrong. Please try again.",
//                 sender: 'character',
//                 timestamp: new Date().toISOString(),
//                 audioUrl: null // No audio for error
//              };
//             setMessages(prevMessages => [...prevMessages, errorAiMessage]);
//              // Re-enable input or show retry option
//         }
//     };

//      // --- Scroll to Bottom Effect ---
//     useEffect(() => {
//         // Scroll to bottom whenever messages change
//         if (messagesEndRef.current) {
//             messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//         }
//     }, [messages]);


//     // --- Like and Share Handlers (Similar to CharacterCard) ---

//      // State to track if current user liked this specific character
//      // This should ideally come from the initial character fetch
//      const [isLiked, setIsLiked] = useState(false);

//      // Effect to update isLiked state when character data is fetched
//      useEffect(() => {
//          if (character && currentUserId) {
//              // Assuming the character data fetched includes whether the current user liked it
//              // Example: backend adds a field like `isLikedByCurrentUser`
//              setIsLiked(character.isLikedByCurrentUser || false); // Default to false
//          } else {
//              setIsLiked(false); // Reset if character/user not loaded
//          }
//      }, [character, currentUserId]);


//      const handleLikeToggle = async () => {
//          if (!currentUserId || !character?.id) {
//              console.warn("Cannot like: user or character not loaded.");
//              return;
//          }

//          const charId = character.id;
//          const isCurrentlyLiked = isLiked;

//          // Optimistic update
//          setIsLiked(!isCurrentlyLiked);
//          // You might also optimistically update a local 'likes' count state if you display it here

//          try {
//              // Call backend API to toggle like
//              const response = await fetch(`/api/characters/${charId}/like`, {
//                  method: 'POST',
//                  headers: { 'Content-Type': 'application/json' },
//                  body: JSON.stringify({
//                      userId: currentUserId, // Send user ID
//                      isLiking: !isCurrentlyLiked // Send desired action (true for like, false for unlike)
//                  }),
//              });

//              if (!response.ok) {
//                  // If API call fails, revert the optimistic update
//                  setIsLiked(isCurrentlyLiked);
//                  throw new Error(`Failed to toggle like status: ${response.status}`);
//              }

//              // Optional: Fetch updated character data or handle response if API returns new count/status
//              // const updatedCharacter = await response.json();
//              // setCharacter(updatedCharacter); // Update the character state with fresh data

//              console.log(`Like status toggled for ${charId}`);

//          } catch (err) {
//              console.error("Failed to toggle like:", err);
//              // Revert optimistic update if fetch failed
//              setIsLiked(isCurrentlyLiked);
//              alert("Failed to update like status."); // Inform user
//          }
//      };

//      const handleShareClick = () => {
//           if (!character?.id) {
//               console.warn("Cannot share: character not loaded.");
//               return;
//           }
//           const shareUrl = `${window.location.origin}/characterai/chat/${character.id}`;
//           navigator.clipboard.writeText(shareUrl).then(() => {
//               alert(`Chat link copied to clipboard!`);
//           }).catch(err => {
//               console.error('Failed to copy link:', err);
//               alert('Could not copy link.');
//           });
//      };


//     // --- Render Logic ---

//     if (isLoading || isUserLoading) {
//          return <div className={`flex items-center justify-center h-full text-lg ${uiColors.textSecondary}`}>Loading chat...</div>;
//     }

//      if (error) {
//          return (
//               <div className={`flex flex-col items-center justify-center h-full text-lg ${uiColors.textDanger}`}>
//                  <FiAlertCircle className="w-10 h-10 mb-4" />
//                  {error} {/* Display the specific error message */}
//               </div>
//          );
//      }

//      // If character is null after loading and no error, it means characterId was invalid
//      if (!character) {
//           return (
//                <div className={`flex flex-col items-center justify-center h-full text-lg ${uiColors.textDanger}`}>
//                   <FiAlertCircle className="w-10 h-10 mb-4" />
//                   Character not found.
//                </div>
//           );
//      }


//     return (
//         <div className="flex flex-col h-full">

//             {/* Chat Room Header */}
//             <div className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary} flex-shrink-0`}>
//                  {/* Character Info */}
//                  <div className="flex items-center">
//                      {/* Use character.avatarUrl from the fetched character data */}
//                      {character.avatarUrl ? (
//                          <img src={character.avatarUrl} alt={character.name} width={40} height={40} className="rounded-full mr-3 object-cover" />
//                      ) : (
//                           // Fallback div
//                           <div className={`w-10 h-10 rounded-full ${uiColors.bgSecondary} flex items-center justify-center text-lg font-semibold mr-3 text-gray-500 dark:text-gray-400 border ${uiColors.borderPrimary}`}>
//                              {character.name?.charAt(0).toUpperCase() || '?'}
//                           </div>
//                      )}
//                      <div>
//                          <h2 className={`text-lg font-semibold ${uiColors.textPrimary} leading-tight`}>{character.name}</h2>
//                          {/* Display creator's name from fetched character data */}
//                           {character.creatorName && (
//                                <p className={`text-xs ${uiColors.textSecondary}`}>By {character.creatorName}</p>
//                           )}
//                      </div>
//                  </div>

//                 {/* Header Actions */}
//                 <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing for smaller screens */}
//                      {/* Like Button */}
//                      <button
//                          onClick={handleLikeToggle}
//                           className={`p-2 rounded-md transition-colors ${uiColors.hoverBgSubtle} ${isLiked ? uiColors.textAccent : uiColors.textSecondary}`}
//                          title={isLiked ? "Unlike Character" : "Like Character"}
//                      >
//                          <FiHeart className={`w-5 h-5 ${isLiked ? uiColors.textAccent : uiColors.textSecondary}`} />
//                      </button>
//                      {/* Share Button */}
//                       <button
//                           onClick={handleShareClick}
//                           className={`p-2 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
//                           title="Share Chat Link"
//                       >
//                          <FiShare2 className={`w-5 h-5 ${uiColors.textSecondary}`} />
//                       </button>
//                       {/* Call Button - Opens Simulated Call Modal */}
//                      <button onClick={openCallModal} className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="Call Character (Simulated)">
//                          <FiPhoneCall className={`w-5 h-5 ${uiColors.textSecondary}`} />
//                      </button>
//                       {/* Settings Button (Placeholder) */}
//                      <button className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="Settings">
//                          <FiSettings className={`w-5 h-5 ${uiColors.textSecondary}`} />
//                      </button>
//                       {/* More Options Button (Placeholder) */}
//                      <button className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="More Options">
//                          <FiMoreHorizontal className={`w-5 h-5 ${uiColors.textSecondary}`} />
//                      </button>
//                  </div>
//             </div>

//             {/* Chat Messages Area */}
//             {/* Adjusted padding/margin to potentially fill space better */}
//             <div className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 hide-scrollbar"> {/* Used padding and no negative margin here */}
//                 {/* Added a flex-grow div to push content to the bottom */}
//                 <div className="flex flex-col justify-end min-h-full">
//                      {messages.map(msg => (
//                          <Message
//                              key={msg.id}
//                              message={msg}
//                              // Pass character and user avatar URLs and names
//                              characterAvatarUrl={character.avatarUrl}
//                              characterName={character.name}
//                              userAvatarUrl={user?.imageUrl || '/placeholder-user-avatar.jpg'} // Use Clerk user image, fallback
//                              userName={user?.username || 'User'} // Use Clerk username, fallback
//                              // Pass audio playback control props for character messages
//                              onSpeak={handleSpeakMessage}
//                              isSpeaking={currentlyPlayingMessageId === msg.id}
//                          />
//                      ))}
//                     <div ref={messagesEndRef} /> {/* Empty div for scrolling */}
//                 </div>
//             </div>

//             {/* Chat Input Area */}
//             <div className={`flex-shrink-0 p-4 border-t ${uiColors.borderPrimary}`}>
//                  {/* Disclaimer */}
//                  <div className={`text-center text-xs ${uiColors.textSecondary} mb-3`}>
//                      This is A.I. and not a real person. Treat everything it says as fiction <FiAlertCircle className="inline-block ml-1 w-3 h-3" />
//                  </div>
//                 <form onSubmit={handleSendMessage} className={`flex items-center rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} p-2`}>
//                     {/* Attachment Button (Placeholder) */}
//                     <button type="button" className={`p-2 rounded-md ${uiColors.hoverBgSubtle} mr-2`} title="Add Attachment">
//                          <FiPlusCircle className={`w-5 h-5 ${uiColors.textSecondary}`} />
//                     </button>
//                      {/* Image Button (Placeholder) */}
//                      <button type="button" className={`p-2 rounded-md ${uiColors.hoverBgSubtle} mr-2`} title="Add Image">
//                          <FiImage className={`w-5 h-5 ${uiColors.textSecondary}`} />
//                     </button>
//                     {/* Text Input */}
//                     <input
//                         type="text"
//                         value={chatInput}
//                         onChange={(e) => setChatInput(e.target.value)}
//                         className={`flex-grow p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`}
//                         placeholder={`Message ${character.name}...`}
//                         disabled={isLoading || !user || !character} // Disable input while loading or if no user/character
//                     />
//                     {/* Send Button - Disabled if input is empty or loading */}
//                     <button
//                          type="submit"
//                          disabled={!chatInput.trim() || isLoading || !user || !character}
//                          className={`p-2 rounded-md transition-colors ${(!chatInput.trim() || isLoading || !user || !character) ? 'opacity-50 cursor-not-allowed' : `${uiColors.accentPrimaryGradient} text-white ${uiColors.hoverBgSubtle}`}`}
//                     >
//                         <FiSend className="w-5 h-5" />
//                     </button>
//                 </form>
//             </div>

//             {/* Render Simulated Call Modal */}
//              <SimulatedCallModal
//                  isOpen={isCallModalOpen}
//                  onClose={closeCallModal}
//                  characterName={character.name}
//                  characterAvatarUrl={character.avatarUrl} // Pass URL
//              />

//         </div>
//     );
// }

// characterai/chat/[characterid]/page.jsx
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import {
    FiSettings, FiMoreHorizontal, FiPlusCircle, FiImage, FiSend,
    FiPhoneCall, FiPhoneMissed, FiAlertCircle, FiHeart, FiShare2, FiVolume2, FiVolumeX
} from 'react-icons/fi';
import Vapi from '@vapi-ai/web';

// Import components
import Message from './_components/Message';
import SimulatedCallModal from './_components/SimulatedCallModal';

// Import constants
import { uiColors, sectionVariants, itemVariants } from '../../_constants/uiConstants';


// Initialize Vapi SDK outside the component to ensure it's a singleton
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

// Define linger duration for partial transcripts in milliseconds
const PARTIAL_TRANSCRIPT_LINGER_DURATION = 8000; // 4 seconds

export default function SingleCharacterChatRoom() {
    const params = useParams();
    const characterId = params.characterid;

    const { user, isLoading: isUserLoading } = useUser();

    const [character, setCharacter] = useState(null);
    // Messages will store historical text messages AND final call transcripts
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Vapi Call State
    const [isCallActive, setIsCallActive] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false); // Vapi indicates when AI is speaking

    // State for real-time partial transcripts during a call
    const [partialTranscripts, setPartialTranscripts] = useState({ user: '', character: '' });
    // Ref to hold timers for clearing partial transcripts after a delay
    const partialTranscriptTimers = useRef({});


    const [isCallModalOpen, setIsCallModalOpen] = useState(false); // Keep for simulated call if separate

    const messagesEndRef = useRef(null); // Ref for scrolling to the bottom of main messages
    const partialTranscriptAreaRef = useRef(null); // Ref for scrolling to partial transcript area


    const currentUserId = useMemo(() => user?.id, [user]);

    // Helper function to clear partial transcript timers
    const clearPartialTranscriptTimer = useCallback((senderRole) => {
        if (partialTranscriptTimers.current[senderRole]) {
            clearTimeout(partialTranscriptTimers.current[senderRole]);
            delete partialTranscriptTimers.current[senderRole];
        }
    }, []); // useCallback to memoize

     // Helper function to clear all partial transcript timers
    const clearAllPartialTranscriptTimers = useCallback(() => {
        clearPartialTranscriptTimer('user');
        clearPartialTranscriptTimer('character');
    }, [clearPartialTranscriptTimer]); // Dependency on clearPartialTranscriptTimer


    const openCallModal = () => setIsCallModalOpen(true);
    const closeCallModal = () => setIsCallModalOpen(false);

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!isUserLoading && user?.id && characterId) {
            const loadChatData = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // 1. Fetch character data
                    const characterResponse = await fetch(`/api/characters/${characterId}`);
                    if (!characterResponse.ok) {
                         const errorBody = await characterResponse.text();
                        throw new Error(`Failed to fetch character: ${characterResponse.status} - ${errorBody}`);
                    }
                    const characterData = await characterResponse.json();
                    setCharacter(characterData);

                    // 2. Fetch chat history (Includes previous text chats)
                    // Only fetch if user is logged in
                    if (user?.id) {
                        const messagesResponse = await fetch(`/api/chat/${characterId}?userId=${user.id}`);
                        if (!messagesResponse.ok) {
                             console.warn("Failed to fetch chat history:", messagesResponse.status);
                             setMessages([]);
                        } else {
                            const messagesData = await messagesResponse.json();
                             // Ensure messagesData.messages is an array, default to empty
                            setMessages(messagesData.messages || []);
                        }
                    } else {
                         setMessages([]); // No user, no history
                    }


                } catch (err) {
                    console.error("Failed to load chat data:", err);
                    setError(`Failed to load chat: ${err.message}`);
                    setCharacter(null);
                    setMessages([]);
                } finally {
                    setIsLoading(false);
                }
            };

            loadChatData();
        } else if (!isUserLoading && !user) {
             setIsLoading(false);
             setError("Please log in to chat.");
             setMessages([]); // Clear messages if user logs out
        } else if (!isUserLoading && user && !characterId) {
             setIsLoading(false);
             setError("Character ID is missing.");
             setMessages([]); // Clear messages if characterId is missing
        }

    }, [characterId, user?.id, isUserLoading]); // Added user?.id dependency

// Function to save call history to the database
    const saveCallHistory = useCallback(async () => {
         // Check if there are any messages to save (excluding system messages)
         const messagesToSave = messages.filter(msg => msg.sender !== 'system');

         if (!currentUserId || !characterId || messagesToSave.length === 0) {
             console.warn("Skipping call history save: missing user, character, or no non-system messages to save.");
             return;
         }

         console.log("Attempting to save call history...", messagesToSave);

         try {
             // Call the new backend API route
             const response = await fetch(`/api/chat/${characterId}/save-call`, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                 },
                 // Send the CURRENT state of the messages array
                 // The backend will filter system messages
                 body: JSON.stringify({
                     // userId: currentUserId, // Backend gets userId securely from auth()
                     messages: messages, // Send the whole list including system msgs for backend to filter
                 }),
             });

             if (!response.ok) {
                 const errorBody = await response.text(); // Read error response body
                 console.error("Failed to save call history:", response.status, errorBody);
                 // Optionally show a user notification about save failure
             } else {
                 console.log("Call history saved successfully.");
                 // Optionally show a user notification about successful save
             }
         } catch (error) {
             console.error("Error saving call history:", error);
             // Optionally show a user notification
         }
    }, [messages, currentUserId, characterId]); // Dependencies: messages state, currentUserId, characterId

    // --- Vapi SDK Event Handling Effect ---
    useEffect(() => {
        // Destructure clearPartialTranscriptTimer and clearAllPartialTranscriptTimers from props or closure
        // They are memoized, so safe to include as dependencies.
        const handleCallStart = () => {
            console.log('Vapi Call Started');
            setIsCallActive(true);
            setIsSpeaking(false); // Reset speaking state
            setPartialTranscripts({ user: '', character: '' }); // Clear partial transcripts display
            clearAllPartialTranscriptTimers(); // Clear any lingering timers
             setMessages(prev => [...prev, { // Add a system message indicating call start
                 id: Date.now().toString() + '_start', // Use unique ID for system message
                 sender: 'system',
                 text: `--- Call with ${character?.name || 'Character'} started ---`,
                 timestamp: new Date().toISOString(),
                 audioUrl: null
             }]);
             // Scroll to bottom when call starts
             setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        };

        const handleCallEnd = () => {
            console.log('Vapi Call Ended');
            setIsCallActive(false);
            setIsSpeaking(false);
            setPartialTranscripts({ user: '', character: '' }); // Clear any remaining partial transcripts display
            clearAllPartialTranscriptTimers(); // Clear any lingering timers
              setMessages(prev => [...prev, { // Add a system message indicating call end
                 id: Date.now().toString() + '_end', // Use unique ID for system message
                 sender: 'system',
                 text: `--- Call ended ---`,
                 timestamp: new Date().toISOString(),
                 audioUrl: null
             }]);
            // Scroll to bottom when call ends
             setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        };

         // Receive transcripts and audio status
        const handleMessage = (message) => {
            console.log('Vapi Message:', message);

            if (message.type === 'transcript') {
                 const senderRole = message.role === 'assistant' ? 'character' : 'user';

                 if (message.transcriptType === 'partial') {
                      // Update the partial transcript state for the corresponding sender
                      setPartialTranscripts(prev => ({
                          ...prev,
                          [senderRole]: message.transcript,
                      }));
                       // Clear any existing timer for this sender when a new partial arrives
                      clearPartialTranscriptTimer(senderRole);

                      // Optional: Scroll to the partial transcript area if it's appearing/updating
                       if (partialTranscriptAreaRef.current) {
                           partialTranscriptAreaRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
                       }


                 } else if (message.transcriptType === 'final') {
                     // This is the final completed message for a turn
                      const finalMessage = {
                         // Use a combined ID: Vapi timestamp string + sender role
                         // This makes the ID unique for each final message from a specific speaker
                         id: `${message.date}_${senderRole}`,
                         text: message.transcript,
                         sender: senderRole,
                         timestamp: message.date, // Use Vapi's timestamp for ordering if needed
                         audioUrl: null, // Call transcripts don't have separate audio files in this model
                      };

                      // Add the final message to the main messages list
                      setMessages(prevMessages => {
                           // Check if a message with this UNIQUE ID already exists.
                           if (prevMessages.some(msg => msg.id === finalMessage.id)) {
                                console.warn("Attempted to add duplicate final message ID:", finalMessage.id, "Message text:", finalMessage.text);
                                return prevMessages; // Don't add if already exists
                           }
                           console.log("Adding NEW final message to main chat:", finalMessage);
                           // Add the new message to the end of the list
                           return [...prevMessages, finalMessage];
                      });

                      // Set a timer to clear the partial transcript after a delay
                      // Clear any existing timer first
                       clearPartialTranscriptTimer(senderRole);
                       // Set the new timer
                       partialTranscriptTimers.current[senderRole] = setTimeout(() => {
                           setPartialTranscripts(prev => ({
                               ...prev,
                               [senderRole]: '', // Clear the partial transcript for this sender
                           }));
                           console.log(`Cleared partial transcript display for ${senderRole} after delay.`);
                           delete partialTranscriptTimers.current[senderRole]; // Clean up the timer reference
                       }, PARTIAL_TRANSCRIPT_LINGER_DURATION);

                       // Scroll to bottom after a final message is added to the main list
                      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                 }

            } else if (message.type === 'speech-update') {
                 if (message.role === 'assistant') {
                     if (message.status === 'started') {
                         setIsSpeaking(true);
                         console.log('AI Speaking Started');
                          // When AI starts speaking, clear the user's partial transcript immediately
                          // as their turn is likely over. Don'casts partial will be cleared by timer after final transcript.
                          setPartialTranscripts(prev => ({ ...prev, user: '' }));
                          clearPartialTranscriptTimer('user');
                     } else if (message.status === 'stopped') {
                         setIsSpeaking(false);
                         console.log('AI Speaking Stopped');
                          // AI partial will be cleared by timer after final transcript is received
                          // (or on call end/error/unmount).
                     }
                 }
             }
             // Handle other Vapi message types if necessary (e.g., 'function-call')
        };

         const handleError = (e) => {
             console.error('Vapi Error:', e);
             setError(`Call Error: ${e.message || 'An unknown error occurred'}`);
             setIsCallActive(false);
             setIsSpeaking(false);
             setPartialTranscripts({ user: '', character: '' }); // Clear partial transcripts on error
             clearAllPartialTranscriptTimers(); // Clear any lingering timers on error
         };

        // Register listeners
        vapi.on('call-start', handleCallStart);
        vapi.on('call-end', handleCallEnd);
        vapi.on('message', handleMessage); // <-- Use the updated handleMessage here
        vapi.on('error', handleError);


        // Cleanup: Remove listeners and stop call
        return () => {
            console.log("Component unmounting, removing Vapi listeners and stopping call.");
            vapi.removeListener('call-start', handleCallStart);
            vapi.removeListener('call-end', handleCallEnd);
            vapi.removeListener('message', handleMessage);
            vapi.removeListener('error', handleError);

            clearAllPartialTranscriptTimers(); // Clear timers on unmount

            // Attempt to stop the call if it's active upon unmount
             vapi.stop(); // Safe to call even if not active
        };
    }, [character?.name, clearPartialTranscriptTimer, clearAllPartialTranscriptTimers]); // Dependencies include memoized helpers


    // Memoized handleEndCall
    const handleEndCall = useCallback(() => {
        if (isCallActive) {
            console.log("Attempting to stop Vapi call.");
            vapi.stop();
            // 'call-end' event listener will handle state updates and timer clearing
        }
    }, [isCallActive]);

    // --- Call Control Handlers ---
    const handleStartCall = () => {
        if (!character || !currentUserId || isCallActive) {
             console.warn("Cannot start call: Character not loaded, user not logged in, or call already active.");
             return;
        }
         if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
             setError("Vapi Public Key is not set. Cannot start call.");
             console.error("NEXT_PUBLIC_VAPI_PUBLIC_KEY environment variable is not set.");
             return;
         }
         if (!character.voiceProvider || !character.voiceId || !character.language) {
              setError("Character voice configuration is incomplete.");
              console.error("Missing character voiceProvider, voiceId, or language in character data.");
              return;
         }

        console.log("Attempting to start Vapi call with character:", character);

        const assistantConfig = {
             model: {
                 provider: "google",
                 model: "gemini-1.5-flash",
                 temperature: 0.7,
                 messages: [
                     {
                         role: "system",
                         content: `You are roleplaying as a character named ${character.name}. Your personality is: ${character.description}. ${character.tagline ? `Your tagline is: ${character.tagline}.` : ''} ${character.greeting ? `Start the conversation with "${character.greeting}" if you are the first speaker.` : ''} Your behavior traits include: ${character.behavior && Array.isArray(character.behavior) && character.behavior.length > 0 ? character.behavior.join(', ') : 'friendly'}. Speak naturally as if in a real voice call. Be concise. Maintain this persona and language: ${character.language}.`,
                     },
                     // Include recent FINAL messages (text or call transcripts) as context for Vapi
                      // Filter out system messages and map sender to Vapi role
                      ...(messages.filter(msg => msg.sender !== 'system').slice(-10).map(msg => ({
                          role: msg.sender === 'user' ? 'user' : 'assistant',
                           content: msg.text,
                     })) || []),
                 ],
             },
             voice: {
                 provider: character.voiceProvider,
                 voiceId: character.voiceId,
             },
             language: character.language,
             // firstMessage: character.greeting, // Can optionally set a specific first message via config
         };

        try {
            vapi.start(assistantConfig);
            // States updated by 'call-start' event
        } catch (e) {
            console.error("Error starting Vapi call:", e);
            setError(`Failed to start call: ${e.message}`);
            setIsCallActive(false);
        }
    };


    // --- Keep text message sending as an alternative/supplementary feature ---
    const handleSendMessage = async (e) => {
         e.preventDefault();
         const text = chatInput.trim();

         if (!text || !character || !currentUserId || isCallActive) { // Added isCallActive check
             console.warn("Cannot send text message: missing input, character, user, or call is active.");
             return;
         }

         const newUserMessage = {
             id: Date.now().toString(), // Use timestamp as temporary ID for text messages
             text: text,
             sender: 'user',
             timestamp: new Date().toISOString(),
             audioUrl: null, // Text messages don't have associated Vapi audio URLs usually
         };
         setMessages(prevMessages => [...prevMessages, newUserMessage]);
         setChatInput('');
         // Scroll immediately after sending
         setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);


         try {
              const response = await fetch(`/api/chat/${characterId}/message`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      userId: currentUserId,
                      text: text,
                       // Send recent non-system messages (text or final call transcripts) as context
                      history: messages.filter(msg => msg.sender !== 'system').slice(-20),
                  }),
              });

              if (!response.ok) {
                  const errorText = await response.text();
                  console.error("Backend text message processing failed:", response.status, errorText);
                  const errorAiMessage = {
                       id: Date.now().toString() + '_error',
                       text: `Sorry, I couldn't process that text message. Error: ${errorText.substring(0, 100)}...`,
                       sender: 'character',
                       timestamp: new Date().toISOString(),
                       audioUrl: null
                   };
                  setMessages(prevMessages => [...prevMessages, errorAiMessage]);
                  return;
              }

             const responseData = await response.json();
             const aiMessage = responseData.aiMessage;

             if (!aiMessage || !aiMessage.text) {
                  console.warn("Backend text message processing returned empty or invalid aiMessage.");
                  const errorAiMessage = {
                       id: Date.now().toString() + '_warn',
                       text: "Hmm, I didn't get a response.",
                       sender: 'character',
                       timestamp: new Date().toISOString(),
                       audioUrl: null
                    };
                   setMessages(prevMessages => [...prevMessages, errorAiMessage]);
                   return;
             }

             // Add AI message to state (will have text, but audioUrl: null from backend)
             // Ensure it has an audioUrl field, even if null, for consistent Message component prop
             setMessages(prevMessages => [...prevMessages, { ...aiMessage, audioUrl: aiMessage.audioUrl || null }]);
             // Scroll after receiving AI response
             setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);


         } catch (err) {
             console.error("Error sending text message or receiving AI response:", err);
             const errorAiMessage = {
                 id: Date.now().toString() + '_catch_error',
                 text: `Sorry, something went wrong processing your text message: ${err.message.substring(0, 100)}...`,
                 sender: 'character',
                 timestamp: new Date().toISOString(),
                 audioUrl: null
              };
             setMessages(prevMessages => [...prevMessages, errorAiMessage]);
         }
    };


     // --- Scroll to Bottom Effect ---
    useEffect(() => {
        // This effect should trigger any time 'messages' state changes.
        // We only want to auto-scroll if the *latest* message added is relevant (not a partial)
        // AND the user is already near the bottom of the chat.

        if (messagesEndRef.current) {
             const element = messagesEndRef.current;
             const parent = element.parentElement; // This is the div with overflow-y-auto
             if (parent) {
                // Check if the user is near the bottom of the scroll container
                // scrollHeight: total height of content
                // clientHeight: height of the visible part of the container
                // scrollTop: how far the user has scrolled from the top
                const isScrolledToBottom = parent.scrollHeight - parent.clientHeight <= parent.scrollTop + 50; // 50px buffer

                // Check if the messages array was updated with a new message
                // (This effect runs whenever 'messages' changes, including partial updates if they were in 'messages', but they aren't now)
                // If the latest message is a system message or a final transcript/text message,
                // AND the user was already at the bottom, then scroll.
                 const isLastMessageAddedToMainList = messages.length > 0 && (
                    messages[messages.length - 1].sender === 'system' ||
                    messages[messages.length - 1].audioUrl === null // Assuming call transcripts and text replies have audioUrl: null
                 );

                 // Auto-scroll conditions:
                 // 1. Very few messages (likely initial load)
                 // 2. User is already near the bottom AND the latest message added is for the main list (system/final/text)
                 if (messages.length <= 5 || (isScrolledToBottom && isLastMessageAddedToMainList)) {
                      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                 // Note: Partial transcripts in the top box do NOT trigger this scroll effect
                 // because they update a *different* state (`partialTranscripts`), not `messages`.

            } else {
                 // Fallback if parent element logic fails (shouldn't happen with correct DOM structure)
                 messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages]); // Scroll effect depends only on the main messages list state


    // --- Like and Share Handlers (Keep as is) ---
    const [isLiked, setIsLiked] = useState(false);
     useEffect(() => {
         if (character) {
             setIsLiked(character.isLikedByCurrentUser || false);
         } else {
             setIsLiked(false);
         }
     }, [character]);

     const handleLikeToggle = async () => {
          if (!currentUserId || !character) {
             console.warn("Cannot toggle like: user not logged in or character not loaded.");
             return;
          }
          const newLikedStatus = !isLiked;
          setIsLiked(newLikedStatus);
          try {
              const response = await fetch(`/api/characters/${character.id}/like`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ userId: currentUserId, isLiked: newLikedStatus }),
              });
              if (!response.ok) {
                   const errorText = await response.text();
                   console.error("Failed to update like status:", response.status, errorText);
                   setIsLiked(!newLikedStatus); // Revert state
                   alert(`Failed to update like status: ${errorText}`);
              } else {
                  console.log(`Like status updated to ${newLikedStatus} for character ${character.id}`);
              }
          } catch (err) {
              console.error("Error toggling like:", err);
              setIsLiked(!newLikedStatus); // Revert state
              alert(`Error updating like status: ${err.message}`);
          }
     };

     const handleShareClick = async () => {
          if (!character) return;
          const shareUrl = `${window.location.origin}/characterai/chat/${character.id}`;
          try {
               if (navigator.share) {
                   await navigator.share({
                       title: `Chat with ${character.name} on CharacterAI`,
                       text: character.tagline || `Check out ${character.name}!`,
                       url: shareUrl,
                   });
                   console.log('Character shared successfully');
               } else {
                   navigator.clipboard.writeText(shareUrl).then(() => {
                       alert('Chat link copied to clipboard!');
                       console.log('Chat link copied:', shareUrl);
                   }).catch(err => {
                       console.error('Failed to copy chat link:', err);
                       alert('Failed to copy chat link.');
                   });
               }
          } catch (err) {
               console.error('Error sharing character:', err);
               alert(`Could not share link: ${err.message}`);
          }
     };


    // --- Render Logic ---

    if (isLoading || isUserLoading) {
         return <div className={`flex items-center justify-center h-full text-lg ${uiColors.textSecondary}`}>Loading chat...</div>;
    }

     if (error) {
         return (
              <div className={`flex flex-col items-center justify-center h-full text-lg ${uiColors.textDanger} p-4`}>
                 <FiAlertCircle className="w-10 h-10 mb-4" />
                 {error}
              </div>
         );
     }

     if (!character) {
          return (
               <div className={`flex flex-col items-center justify-center h-full text-lg ${uiColors.textDanger} p-4`}>
                  <FiAlertCircle className="w-10 h-10 mb-4" />
                  Character not found or could not be loaded.
               </div>
          );
     }


   return (
        <div className="flex flex-col h-full">

            {/* Chat Room Header */}
            <div className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary} flex-shrink-0`}>
                 <div className="flex items-center">
                     {character.avatarUrl ? (
                         <img src={character.avatarUrl} alt={character.name} width={40} height={40} className="rounded-full mr-3 object-cover" />
                     ) : (
                          <div className={`w-10 h-10 rounded-full ${uiColors.bgSecondary} flex items-center justify-center text-lg font-semibold mr-3 text-gray-500 dark:text-gray-400 border ${uiColors.borderPrimary}`}>
                             {character.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                     )}
                     <div>
                         <h2 className={`text-lg font-semibold ${uiColors.textPrimary} leading-tight`}>{character.name}</h2>
                          {character.creatorName && (
                               <p className={`text-xs ${uiColors.textSecondary}`}>By {character.creatorName}</p>
                          )}
                     </div>
                 </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                     {/* Like Button */}
                     <button
                         onClick={handleLikeToggle}
                          className={`p-2 rounded-md transition-colors ${uiColors.hoverBgSubtle} ${isLiked ? uiColors.textAccent : uiColors.textSecondary}`}
                         title={isLiked ? "Unlike Character" : "Like Character"}
                          disabled={!user}
                     >
                         <FiHeart className={`w-5 h-5 ${isLiked ? uiColors.textAccent : uiColors.textSecondary}`} />
                     </button>
                     {/* Share Button */}
                      <button
                          onClick={handleShareClick}
                          className={`p-2 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                          title="Share Chat Link"
                           disabled={!character}
                      >
                         <FiShare2 className={`w-5 h-5 ${uiColors.textSecondary}`} />
                      </button>
                     {/* REAL-TIME CALL BUTTON */}
                       <button
                          onClick={isCallActive ? handleEndCall : handleStartCall}
                          className={`p-2 rounded-md transition-colors ${isCallActive ? uiColors.textDanger : uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}
                          title={isCallActive ? "End Call" : "Start Voice Call"}
                           disabled={!user || !character}
                      >
                         {isCallActive ? (
                             <FiPhoneMissed className="w-5 h-5" />
                         ) : (
                             <FiPhoneCall className="w-5 h-5" />
                         )}
                      </button>
                     {/* Vapi Speaking Indicator */}
                     {isCallActive && (
                          <div className={`flex items-center text-xs font-semibold ${isSpeaking ? uiColors.textAccent : uiColors.textSecondary}`}>
                             <span className={`inline-block w-2 h-2 mr-1 rounded-full ${isSpeaking ? uiColors.accentPrimaryGradient : uiColors.bgSecondary}`}></span>
                             {isSpeaking ? 'Speaking...' : 'Listening...'}
                          </div>
                      )}

                      {/* Settings Button (Placeholder) */}
                     <button className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="Settings" disabled={!user || !character}>
                         <FiSettings className={`w-5 h-5 ${uiColors.textSecondary}`} />
                     </button>
                      {/* More Options Button (Placeholder) */}
                     <button className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="More Options" disabled={!user || !character}>
                         <FiMoreHorizontal className={`w-5 h-5 ${uiColors.textSecondary}`} />
                     </button>
                 </div>
            </div>

             {/* Live Partial Transcript Area */}
            {(isCallActive && (partialTranscripts.user || partialTranscripts.character)) && (
                <div ref={partialTranscriptAreaRef} className={`flex-shrink-0 px-4 sm:px-6 lg:px-8 py-3 border-b ${uiColors.borderPrimary} ${uiColors.bgSecondary} text-sm italic ${uiColors.textSecondary}`}>
                    {/* Conditionally render user partial */}
                    {partialTranscripts.user && (
                        <p className="text-right">{user?.username || 'You'}: {partialTranscripts.user}</p>
                    )}
                    {/* Conditionally render character partial */}
                    {partialTranscripts.character && (
                        <p className="text-left">{character?.name || 'Character'}: {partialTranscripts.character}</p>
                    )}
                </div>
            )}


            {/* Chat Messages Area (Displays Historical Text + Final Call Transcripts) */}
            <div className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 hide-scrollbar">
                <div className="flex flex-col justify-end min-h-full">
                     {/* Ensure messages is an array before mapping */}
                     {Array.isArray(messages) && messages.map(msg => (
                         // Message component uses msg.sender to determine alignment and avatar
                         // It correctly ignores audioUrl if null and only renders text.
                         <Message
                             key={msg.id}
                             message={msg} // Pass the whole message object { id, text, sender, timestamp, audioUrl }
                             characterAvatarUrl={character.avatarUrl}
                             characterName={character.name}
                             userAvatarUrl={user?.imageUrl || '/placeholder-user-avatar.jpg'}
                             userName={user?.username || 'User'}
                         />
                     ))}
                    <div ref={messagesEndRef} /> {/* Scroll target for final messages */}
                </div>
            </div>

            {/* Chat Input Area (for text messages) */}
            <div className={`flex-shrink-0 p-4 border-t ${uiColors.borderPrimary}`}>
                 <div className={`text-center text-xs ${uiColors.textSecondary} mb-3`}>
                     This is A.I. and not a real person. Treat everything it says as fiction <FiAlertCircle className="inline-block ml-1 w-3 h-3" />
                 </div>
                <form onSubmit={handleSendMessage} className={`flex items-center rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} p-2`}>
                    {/* Attachment/Image Buttons (Placeholders) */}
                    <button type="button" className={`p-2 rounded-md ${uiColors.hoverBgSubtle} mr-2`} title="Add Attachment" disabled={isLoading || !user || !character || isCallActive}>
                         <FiPlusCircle className={`w-5 h-5 ${uiColors.textSecondary}`} />
                    </button>
                     <button type="button" className={`p-2 rounded-md ${uiColors.hoverBgSubtle} mr-2`} title="Add Image" disabled={isLoading || !user || !character || isCallActive}>
                         <FiImage className={`w-5 h-5 ${uiColors.textSecondary}`} />
                    </button>
                    {/* Text Input */}
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className={`flex-grow p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`}
                        placeholder={isCallActive ? 'Voice call active...' : `Type a message to ${character.name}...`}
                         disabled={isLoading || !user || !character || isCallActive}
                    />
                    {/* Send Button */}
                    <button
                         type="submit"
                         disabled={!chatInput.trim() || isLoading || !user || !character || isCallActive}
                         className={`p-2 rounded-md transition-colors ${(!chatInput.trim() || isLoading || !user || !character || isCallActive) ? 'opacity-50 cursor-not-allowed' : `${uiColors.accentPrimaryGradient} text-white hover:opacity-80`}`}
                    >
                        <FiSend className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* Simulated Call Modal (Keep if needed) */}
             <SimulatedCallModal
                 isOpen={isCallModalOpen}
                 onClose={closeCallModal}
                 characterName={character?.name || 'Character'}
                 characterAvatarUrl={character?.avatarUrl}
             />

        </div>
    );
}
