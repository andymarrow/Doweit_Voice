// characterai/chat/[characterid]/_components/SimulatedCallModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiX, FiPhoneOff, FiPhoneCall, FiVolume2, FiMicOff, FiMic } from 'react-icons/fi';

// Import constants - Adjusted path as necessary
import { uiColors } from '@/app/characterai/_constants/uiConstants'; // Corrected path

// Expect characterAvatarUrl instead of just characterAvatar
function SimulatedCallModal({ isOpen, onClose, characterName, characterAvatarUrl }) { // Changed prop name
    const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'ongoing', 'ended'
    const [callDuration, setCallDuration] = useState(0); // seconds
    const [isMuted, setIsMuted] = useState(false); // State for muting

    const intervalRef = useRef(null);
    const modalRef = useRef(null);

    // Timer effect
    useEffect(() => {
        if (isOpen && callStatus === 'ongoing') {
            intervalRef.current = setInterval(() => {
                setCallDuration(prevDuration => prevDuration + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isOpen, callStatus]);

    // Effect to handle call flow simulation
    useEffect(() => {
        if (isOpen) {
            setCallStatus('connecting');
            setCallDuration(0);
            setIsMuted(false);

            const connectTimeout = setTimeout(() => {
                setCallStatus('ongoing');
            }, 2000);

            return () => clearTimeout(connectTimeout);
        } else {
             // When modal closes, set status to ended immediately for cleanup/closing effect
             setCallStatus('ended');
             // No need for a timeout to call onClose, parent handles isOpen state
        }
    }, [isOpen]);

     // Handle clicks outside the modal to close it only when call has ended
     useEffect(() => {
         const handleClickOutside = (event) => {
             if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && callStatus === 'ended') {
                 onClose();
             }
         };
         // Add listener only when the modal is open
         if (isOpen) {
             document.addEventListener("mousedown", handleClickOutside);
         }
         // Cleanup: remove listener when modal closes or component unmounts
         return () => {
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose, callStatus]); // Depend on isOpen, onClose, and callStatus

    // Format duration into MM:SS
    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${paddedMinutes}:${paddedSeconds}`;
    };

    // Handle ending the call
    const handleEndCall = () => {
        setCallStatus('ended');
        // The modal will close automatically via the useEffect watching isOpen
        // No need for the timeout here.
    };

    // Prevent closing if call is ongoing when clicking backdrop
    const handleBackdropClick = (e) => {
        if (callStatus !== 'ended') {
            e.stopPropagation(); // Prevent the click from reaching the modal's own stopPropagation handler
        } else {
             // Only allow closing on backdrop click if status is 'ended'
            onClose();
        }
    }

    // Do not render if not open
    if (!isOpen) return null;

    return (
        // Add onClick to the backdrop div
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4" onClick={handleBackdropClick}>
            {/* Add onClick={(e) => e.stopPropagation()} to the modal content div */}
            <div
                ref={modalRef}
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-8 text-center flex flex-col items-center`}
                onClick={(e) => e.stopPropagation()} // Prevent click from closing modal when clicking inside
            >
                {/* Close Button (only when ended) */}
                {callStatus === 'ended' && (
                     <button onClick={onClose} className={`absolute top-4 right-4 p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                )}

                {/* Character Info */}
                <div className="mb-6">
                     {/* Use characterAvatarUrl and check if it's a string and not empty */}
                     {typeof characterAvatarUrl === 'string' && characterAvatarUrl ? (
                         <Image src={characterAvatarUrl} alt={characterName || 'Character'} width={80} height={80} className="rounded-full mx-auto mb-4 object-cover" />
                     ) : (
                         // Placeholder if no character avatar or avatar is not a valid string
                         <div className={`w-20 h-20 rounded-full ${uiColors.bgSecondary} flex items-center justify-center text-3xl font-semibold mx-auto mb-4 text-gray-500 dark:text-gray-400 border ${uiColors.borderPrimary}`}>
                              {characterName?.charAt(0).toUpperCase() || '?'}
                         </div>
                     )}
                     <h3 className={`text-xl font-semibold ${uiColors.textPrimary}`}>{characterName}</h3>
                </div>

                {/* Call Status and Timer */}
                <div className="mb-8">
                    {callStatus === 'connecting' && (
                         <div className={`text-sm font-medium ${uiColors.textSecondary} flex items-center justify-center`}>
                             <span className="animate-pulse mr-2">Connecting...</span>
                         </div>
                    )}
                    {callStatus === 'ongoing' && (
                         <div className={`text-sm font-medium ${uiColors.textSecondary} flex items-center justify-center`}>
                             Ongoing Call ({formatDuration(callDuration)})
                         </div>
                    )}
                     {callStatus === 'ended' && (
                          <div className={`text-sm font-medium ${uiColors.textSecondary} flex items-center justify-center`}>
                              Call Ended ({formatDuration(callDuration)})
                          </div>
                     )}
                    {/* Optional: Add a simple audio visualization placeholder when ongoing */}
                    {/* Added animation-wave class definition - ensure this is in your globals.css */}
                    {/*
                    @keyframes wave {
                        0%, 100% { transform: scaleY(0.5); }
                        50% { transform: scaleY(1); }
                    }
                    .animate-wave {
                        animation: wave 1.5s ease-in-out infinite;
                    }
                     */}
                    {callStatus === 'ongoing' && (
                         <div className="mt-4 h-8 flex items-center justify-center space-x-1">
                             {Array(5).fill(0).map((_, i) => (
                                  <div key={i} className={`w-1 rounded-full ${uiColors.accentPrimaryGradient} animate-wave`} style={{ height: `${(i + 1) * 10 + 20}%`, animationDelay: `${i * 0.1}s` }}></div>
                             ))}
                         </div>
                    )}
                </div>

                {/* Call Controls */}
                 {/* Hide controls if call is not ongoing */}
                 <div className={`flex items-center justify-center space-x-6 ${callStatus !== 'ongoing' ? 'opacity-0 pointer-events-none' : ''} transition-opacity duration-300`}> {/* Added transition */}
                     {/* Mute Toggle */}
                     <button
                          onClick={() => setIsMuted(!isMuted)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-md
                                     ${isMuted ? `${uiColors.alertWarningBg} ${uiColors.alertWarningText}` : `${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}
                                     `}
                          title={isMuted ? 'Unmute' : 'Mute'}
                     >
                          {isMuted ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
                     </button>

                     {/* End Call Button */}
                     <button
                          onClick={handleEndCall}
                          className={`w-16 h-16 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md`}
                          title="End Call"
                     >
                         <FiPhoneOff className="w-8 h-8" />
                     </button>

                      {/* Speaker Button (Placeholder) */}
                      <button
                           className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}
                           title="Speaker"
                       >
                           <FiVolume2 className="w-6 h-6" />
                       </button>
                 </div>

            </div>
        </div>
    );
}

export default SimulatedCallModal;