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

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'; // Import useCallback
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import {
    FiSettings, FiMoreHorizontal, FiPlusCircle, FiImage, FiSend,
    FiPhoneCall, FiPhoneMissed, FiAlertCircle, FiHeart, FiShare2, FiVolume2, FiVolumeX // Added Call/End icons
} from 'react-icons/fi';
// Import Vapi Web SDK
import Vapi from '@vapi-ai/web'; // <-- Import Vapi SDK

// Import components
import Message from './_components/Message';
import SimulatedCallModal from './_components/SimulatedCallModal'; // Keep if still needed for non-voice simulated calls

// Import constants
import { uiColors, sectionVariants, itemVariants } from '../../_constants/uiConstants';


// Initialize Vapi SDK outside the component to ensure it's a singleton
// Use the public key here
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

export default function SingleCharacterChatRoom() {
    const params = useParams();
    const characterId = params.characterid;

    const { user, isLoading: isUserLoading } = useUser();

    const [character, setCharacter] = useState(null);
    // Messages will now primarily be transcripts from the Vapi call
    // Initialize with an empty array to avoid issues with map
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState(''); // Keep for optional text input
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Vapi Call State
    const [isCallActive, setIsCallActive] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false); // Vapi indicates when AI is speaking

    const [isCallModalOpen, setIsCallModalOpen] = useState(false); // Keep for simulated call if separate

    const messagesEndRef = useRef(null);

    const currentUserId = useMemo(() => user?.id, [user]);

     // --- Handlers for Simulated Call Modal (ADD THESE BACK) ---
    const openCallModal = () => setIsCallModalOpen(true);
    const closeCallModal = () => setIsCallModalOpen(false); // <-- ADD THIS DEFINITION BACK

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!isUserLoading && user?.id && characterId) {
            const loadChatData = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // 1. Fetch character data (includes details for Vapi Assistant config)
                    const characterResponse = await fetch(`/api/characters/${characterId}`);
                    if (!characterResponse.ok) {
                         const errorBody = await characterResponse.text();
                        throw new Error(`Failed to fetch character: ${characterResponse.status} - ${errorBody}`);
                    }
                    const characterData = await characterResponse.json();
                    setCharacter(characterData);

                    // 2. Fetch chat history (Optional: display alongside call transcripts)
                    // This GET route is in app/api/chat/[characterId]/route.js
                    const messagesResponse = await fetch(`/api/chat/${characterId}?userId=${user.id}`);
                    if (!messagesResponse.ok) {
                         console.warn("Failed to fetch chat history:", messagesResponse.status);
                         setMessages([]); // Initialize with empty array on error
                    } else {
                        const messagesData = await messagesResponse.json();
                         // Add fetched history, perhaps distinguishing them visually from call transcripts
                         // Ensure messagesData.messages is an array, default to empty
                        setMessages(messagesData.messages || []);
                    }

                } catch (err) {
                    console.error("Failed to load chat data:", err);
                    setError(`Failed to load chat: ${err.message}`);
                    setCharacter(null);
                    setMessages([]); // Ensure messages is empty on error
                } finally {
                    setIsLoading(false);
                }
            };

            loadChatData();
        } else if (!isUserLoading && !user) {
             setIsLoading(false);
             setError("Please log in to chat.");
        } else if (!isUserLoading && user && !characterId) {
             setIsLoading(false);
             setError("Character ID is missing.");
        }

    }, [characterId, user?.id, isUserLoading]);


    // --- Vapi SDK Event Handling Effect ---
    useEffect(() => {
        // Attach Vapi event listeners
        const handleCallStart = () => {
            console.log('Vapi Call Started');
            setIsCallActive(true);
             setIsSpeaking(false); // Reset speaking state
             setMessages(prev => [...prev, { // Add a system message indicating call start
                 id: Date.now().toString() + '_start',
                 sender: 'system', // Use a 'system' sender type
                 text: `--- Call with ${character?.name || 'Character'} started ---`,
                 timestamp: new Date().toISOString(),
                 audioUrl: null // System messages have no audio
             }]);
             // Optionally clear previous text messages or separate UI
        };

        const handleCallEnd = () => {
            console.log('Vapi Call Ended');
            setIsCallActive(false);
             setIsSpeaking(false);
              setMessages(prev => [...prev, { // Add a system message indicating call end
                 id: Date.now().toString() + '_end',
                 sender: 'system',
                 text: `--- Call ended ---`,
                 timestamp: new Date().toISOString(),
                 audioUrl: null
             }]);
        };

         // Receive transcripts and audio status
        const handleMessage = (message) => {
            console.log('Vapi Message:', message);
             // message types can be 'transcript', 'function-call', 'speech-update', etc.
            if (message.type === 'transcript') {
                // Add transcript to messages. Vapi provides role ('user' or 'assistant').
                 // Note: These are REAL-TIME transcripts, might update as user/AI speaks.
                 // You might need logic to update existing messages instead of always adding new ones.
                 // For simplicity, let's just add them for now.
                 // Message structure: { type: 'transcript', role: 'user' | 'assistant', text: string, date: string }
                 const newMessage = {
                    id: message.date, // Use Vapi's date as ID (it's a timestamp string) - potentially unstable if multiple transcripts have same date quickly? Consider better unique ID.
                    text: message.text,
                    sender: message.role === 'assistant' ? 'character' : 'user', // Map Vapi role to your sender type
                    timestamp: message.date, // Use Vapi's timestamp
                     // Real-time transcripts don't typically have audioUrls like saved files
                    audioUrl: null,
                 };
                 setMessages(prevMessages => {
                      // Simple approach: add new transcript.
                      // More complex: Find last message from this sender, update its text if it's a partial transcript.
                      // For basic display, adding might suffice initially.
                      // Check if the *very last* message is from the same sender and is a transcript, potentially update it?
                      // This is tricky with Vapi's streaming. Adding new might be simpler for a start.
                      // Ensure we don't add duplicates based on Vapi's date timestamp
                      if (prevMessages.some(msg => msg.id === newMessage.id)) {
                          // If message with this ID already exists, skip adding it again
                          return prevMessages;
                      }
                      return [...prevMessages, newMessage];
                 });
            } else if (message.type === 'speech-update') {
                 // Vapi sends speech-update events when the assistant starts/stops speaking
                 // message structure: { type: 'speech-update', status: 'started' | 'stopped' }
                 if (message.status === 'started') {
                     setIsSpeaking(true);
                 } else if (message.status === 'stopped') {
                     setIsSpeaking(false);
                 }
             }
        };

         // Handle error events
         const handleError = (e) => {
             console.error('Vapi Error:', e);
             setError(`Call Error: ${e.message || 'An unknown error occurred'}`);
             setIsCallActive(false);
             setIsSpeaking(false);
         };

        // Register listeners
        vapi.on('call-start', handleCallStart);
        vapi.on('call-end', handleCallEnd);
        vapi.on('message', handleMessage);
        vapi.on('error', handleError);


        // Cleanup: Remove listeners when component unmounts
        return () => {
            vapi.removeListener('call-start', handleCallStart);
            vapi.removeListener('call-end', handleCallEnd);
            vapi.removeListener('message', handleMessage);
            vapi.removeListener('error', handleError);

             // Ensure call is stopped if component unmounts while active
             // No need to check isCallActive state here, vapi.stop() is safe to call
             // even if no call is active.
             // Checking isCallActive could lead to a stale closure issue if isCallActive
             // changes state *within* the effect's lifetime but before cleanup runs.
             console.log("Component unmounting, attempting to stop Vapi call if active.");
             vapi.stop();
        };
    }, [character?.name]); // Dependencies: character name might be used in system message.

    // Memoized handleEndCall because it's used in useEffect cleanup
    const handleEndCall = useCallback(() => {
        if (isCallActive) {
            console.log("Attempting to stop Vapi call.");
            vapi.stop();
            // The 'call-end' event listener will update isCallActive state
        }
    }, [isCallActive]); // Dependency: only recreate if isCallActive changes

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

         // Check for required character data for Vapi config
         if (!character.voiceProvider || !character.voiceId || !character.language) {
              setError("Character voice configuration is incomplete.");
              console.error("Missing character voiceProvider, voiceId, or language.");
              return;
         }


        console.log("Attempting to start Vapi call with character:", character);

        // Construct the Vapi Assistant configuration using fetched character data
        const assistantConfig = {
             // You can either use an existing assistantId if you created one per character
             // assistantId: character.vapiAssistantId, // If you save Vapi Assistant ID

             // OR define the assistant configuration dynamically here
             model: {
                 // ********** FIX APPLIED HERE **********
                 // Change provider from "gemini" to "google" as per Vapi's supported list
                 provider: "google",
                 model: "gemini-1.5-flash", // This model name is correct for the "google" provider
                 temperature: 0.7, // Adjust as needed
                 // Vapi allows providing initial messages/system prompts here
                 messages: [
                     {
                         role: "system",
                         content: `You are roleplaying as a character named ${character.name}. Your personality is: ${character.description}. ${character.tagline ? `Your tagline is: ${character.tagline}.` : ''} ${character.greeting ? `Start the conversation with "${character.greeting}" if you are the first speaker.` : ''} Your behavior traits include: ${character.behavior && Array.isArray(character.behavior) && character.behavior.length > 0 ? character.behavior.join(', ') : 'friendly'}. Speak naturally as if in a real voice call. Be concise. Maintain this persona and language: ${character.language}.`,
                     },
                     // Include recent history here if you want the AI to have context from text chat before the call
                     // This is complex: you'd need to fetch the last N messages and format them for Vapi's assistant.messages array
                 ],
                 // Add other model configs like functions/tools if needed
             },
             voice: {
                 provider: character.voiceProvider, // e.g., "vapi", "elevenlabs"
                 voiceId: character.voiceId,     // e.g., "Elliot", "Hana", "21m00Tcm4TlvDq8ikWAM"
                 // Add other voice configs like speed, etc.
             },
             language: character.language, // Specify the language
             // Add other Assistant parameters as needed (e.g., firstMessage, endCallMessage, etc.)
             // firstMessage: character.greeting, // Use the character's greeting as the first message
             // endCallMessage: "Goodbye!",
             // voicemailDetection: true, // Example
             // silenceTimeoutSeconds: 30, // Example
         };

        try {
            // Use vapi.start() from the web SDK
            vapi.start(assistantConfig); // Pass the dynamic configuration object

            // The 'call-start' event listener will update isCallActive state

        } catch (e) {
            console.error("Error starting Vapi call:", e);
            setError(`Failed to start call: ${e.message}`);
            setIsCallActive(false); // Ensure state is correct
        }
    };


    // --- Keep text message sending as an alternative/supplementary feature ---
    const handleSendMessage = async (e) => {
         e.preventDefault();
         const text = chatInput.trim();

         if (!text || !character || !currentUserId) {
             console.warn("Cannot send text message: missing input, character, or user.");
             return;
         }

         // Add user message to state immediately (optimistic update)
         const newUserMessage = {
             id: Date.now().toString(), // Use timestamp as temporary ID
             text: text,
             sender: 'user',
             timestamp: new Date().toISOString(),
         };
         setMessages(prevMessages => [...prevMessages, newUserMessage]);
         setChatInput('');

         // Scroll to bottom *after* state update
         setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);


         // Call your existing backend /api/chat/[characterId]/message route for text-only processing and DB save
         // The backend will still use Gemini for text, but it will log Vapi TTS failure and skip audio/firebase
         try {
             // Removed audioUrl from payload as it's not relevant for text-only send
              const response = await fetch(`/api/chat/${characterId}/message`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      userId: currentUserId,
                      text: text,
                      // Sending history might be complex depending on whether you mix text/call history
                      // For text-only, just sending recent text history might be enough.
                      // For mixed, you'd need to filter/format history correctly.
                      // Let's send a limited history for text context.
                      history: messages.filter(msg => msg.sender !== 'system').slice(-20), // Send recent non-system history for context
                  }),
              });

              if (!response.ok) {
                  // If backend processing fails, show error to user
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
                  return; // Stop here, don't add the backend's AI message if it returned error
              }

             // Assuming the API returns the AI's message details (text, but audioUrl will be null)
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

             // Add AI message to state (will have text, but audioUrl: null)
             setMessages(prevMessages => [...prevMessages, aiMessage]);


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
        if (messagesEndRef.current) {
            // Scroll into view smoothly when messages change, but only if user is near bottom
            // This prevents unwanted scrolling if the user is reading older messages
             const element = messagesEndRef.current;
             const parent = element.parentElement; // The container div
             if (parent) {
                const isScrolledToBottom = parent.scrollHeight - parent.clientHeight <= parent.scrollTop + 1; // Give a small buffer (+1)
                 // If scrolled to bottom, OR if there are very few messages (initial load)
                 if (isScrolledToBottom || messages.length <= 5) { // Auto-scroll for first few messages too
                      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
                  }
            } else {
                // Fallback if parent isn't found
                 messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages]);


    // --- Like and Share Handlers (Keep as is) ---
     const [isLiked, setIsLiked] = useState(false);
      // Assuming character object includes isLikedByCurrentUser boolean
     useEffect(() => {
         if (character) {
             // Use the boolean directly from the character data
             setIsLiked(character.isLikedByCurrentUser || false);
         } else {
             // Reset like state if character data is not available
             setIsLiked(false);
         }
     }, [character]); // Depend on character data

     const handleLikeToggle = async () => {
          if (!currentUserId || !character) {
             console.warn("Cannot toggle like: user not logged in or character not loaded.");
             return;
          }

          const newLikedStatus = !isLiked;
          setIsLiked(newLikedStatus); // Optimistic update

          try {
              // Call your API to update like status
              const response = await fetch(`/api/characters/${character.id}/like`, {
                   method: 'POST', // Or PUT/DELETE depending on your API design
                   headers: {
                       'Content-Type': 'application/json',
                   },
                   body: JSON.stringify({ userId: currentUserId, isLiked: newLikedStatus }),
              });

              if (!response.ok) {
                   const errorText = await response.text();
                   console.error("Failed to update like status:", response.status, errorText);
                   // Revert state if API call fails
                   setIsLiked(!newLikedStatus);
                   alert(`Failed to update like status: ${errorText}`); // User feedback
              } else {
                  console.log(`Like status updated to ${newLikedStatus} for character ${character.id}`);
                   // Optionally, fetch the updated character data to sync count etc.
                   // Or update character state manually if the API returns the new data
              }

          } catch (err) {
              console.error("Error toggling like:", err);
              // Revert state on network/unexpected errors
              setIsLiked(!newLikedStatus);
              alert(`Error updating like status: ${err.message}`); // User feedback
          }
     };

     const handleShareClick = async () => {
          if (!character) return;

          const shareUrl = `${window.location.origin}/characterai/chat/${character.id}`; // Construct the URL

          try {
               if (navigator.share) {
                   // Use Web Share API if available
                   await navigator.share({
                       title: `Chat with ${character.name} on CharacterAI`,
                       text: character.tagline || `Check out ${character.name}!`,
                       url: shareUrl,
                   });
                   console.log('Character shared successfully');
               } else {
                   // Fallback for browsers without Web Share API: copy to clipboard
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
          // This case should ideally be caught by the error state if fetching fails
          // But added as a safeguard.
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
                          disabled={!user} // Disable if not logged in
                     >
                         <FiHeart className={`w-5 h-5 ${isLiked ? uiColors.textAccent : uiColors.textSecondary}`} />
                     </button>
                     {/* Share Button */}
                      <button
                          onClick={handleShareClick}
                          className={`p-2 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                          title="Share Chat Link"
                           disabled={!character} // Disable if character not loaded
                      >
                         <FiShare2 className={`w-5 h-5 ${uiColors.textSecondary}`} />
                      </button>
                     {/* REAL-TIME CALL BUTTON */}
                       <button
                          onClick={isCallActive ? handleEndCall : handleStartCall} // Toggle Start/End Call
                          className={`p-2 rounded-md transition-colors ${uiColors.hoverBgSubtle} ${isCallActive ? uiColors.textDanger : uiColors.textSecondary}`}
                          title={isCallActive ? "End Call" : "Start Voice Call"}
                           disabled={!user || !character} // Disable if not logged in or character not loaded
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

            {/* Chat Messages Area (Displays Transcripts + History) */}
            <div className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 hide-scrollbar">
                <div className="flex flex-col justify-end min-h-full">
                     {/* Ensure messages is an array before mapping */}
                     {Array.isArray(messages) && messages.map(msg => (
                         <Message
                             key={msg.id}
                             message={msg}
                             characterAvatarUrl={character.avatarUrl}
                             characterName={character.name}
                             userAvatarUrl={user?.imageUrl || '/placeholder-user-avatar.jpg'}
                             userName={user?.username || 'User'}
                             // onSpeak/isSpeaking props are NOT needed for real-time transcripts
                             // as audio is handled by Vapi SDK directly
                              onSpeak={undefined} // Explicitly pass undefined
                              isSpeaking={false} // Explicitly pass false
                         />
                     ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Chat Input Area (for text messages - kept as optional) */}
            <div className={`flex-shrink-0 p-4 border-t ${uiColors.borderPrimary}`}>
                 <div className={`text-center text-xs ${uiColors.textSecondary} mb-3`}>
                     This is A.I. and not a real person. Treat everything it says as fiction <FiAlertCircle className="inline-block ml-1 w-3 h-3" />
                 </div>
                <form onSubmit={handleSendMessage} className={`flex items-center rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} p-2`}>
                    {/* Attachment/Image Buttons (Placeholders) */}
                    <button type="button" className={`p-2 rounded-md ${uiColors.hoverBgSubtle} mr-2`} title="Add Attachment">
                         <FiPlusCircle className={`w-5 h-5 ${uiColors.textSecondary}`} />
                    </button>
                     <button type="button" className={`p-2 rounded-md ${uiColors.hoverBgSubtle} mr-2`} title="Add Image">
                         <FiImage className={`w-5 h-5 ${uiColors.textSecondary}`} />
                    </button>
                    {/* Text Input */}
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className={`flex-grow p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`}
                        placeholder={`Type a message to ${character.name}...`} // Adjusted placeholder
                         disabled={isLoading || !user || !character || isCallActive} // Disable text input during a call
                    />
                    {/* Send Button */}
                    <button
                         type="submit"
                         disabled={!chatInput.trim() || isLoading || !user || !character || isCallActive} // Disable text send during a call
                         className={`p-2 rounded-md transition-colors ${(!chatInput.trim() || isLoading || !user || !character || isCallActive) ? 'opacity-50 cursor-not-allowed' : `${uiColors.accentPrimaryGradient} text-white hover:opacity-80`}`} // Adjusted hover style for gradient
                    >
                        <FiSend className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* Simulated Call Modal (Keep if needed for non-voice option) */}
             <SimulatedCallModal
                 isOpen={isCallModalOpen}
                 onClose={closeCallModal}
                 characterName={character?.name || 'Character'} // Provide default name
                 characterAvatarUrl={character?.avatarUrl} // Pass avatar URL
             />

        </div>
    );
}