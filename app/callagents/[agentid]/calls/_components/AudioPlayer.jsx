// voice-agents-CallAgents/[agentid]/calls/_components/AudioPlayer.jsx
"use client";

import React from 'react';
import { useAudioPlayer } from './useAudioPlayer';
import { FiPlay, FiPause, FiVolume2, FiVolume1, FiVolumeX } from 'react-icons/fi';
import { uiColors } from '../../../_constants/uiConstants';

function AudioPlayer({ src }) {
    const {
        audioRef,
        isPlaying,
        duration,
        currentTime,
        volume,
        isMuted,
        togglePlayPause,
        seek,
        handleVolumeChange,
        toggleMute,
        formatTime
    } = useAudioPlayer();

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    const VolumeIcon = isMuted || volume === 0 ? FiVolumeX : volume < 0.5 ? FiVolume1 : FiVolume2;

    return (
        <div className={`p-3 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} flex items-center space-x-4`}>
            {/* Audio element is hidden but controlled by our UI */}
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                onClick={togglePlayPause}
                className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 text-white transition-transform duration-200 ${uiColors.accentPrimaryGradient} hover:scale-105 active:scale-95`}
            >
                {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} className="ml-0.5" />}
            </button>

            {/* Timestamps and Progress Bar */}
            <div className="flex-grow flex items-center space-x-3">
                <span className={`text-xs font-mono w-12 text-center ${uiColors.textSecondary}`}>
                    {formatTime(currentTime)}
                </span>
                <div className="relative w-full h-1.5 bg-gray-600/50 rounded-full group cursor-pointer" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const width = rect.width;
                    const newTime = (clickX / width) * duration;
                    seek(newTime);
                }}>
                    <div className="absolute h-full bg-gray-400 rounded-full" style={{ width: `${progress}%` }}></div>
                    <div
                        className="absolute h-3 w-3 -mt-1 bg-white rounded-full shadow-md transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `${progress}%` }}
                    ></div>
                </div>
                <span className={`text-xs font-mono w-12 text-center ${uiColors.textSecondary}`}>
                    {formatTime(duration)}
                </span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 group">
                <button onClick={toggleMute} className={`${uiColors.textSecondary} hover:text-white`}>
                    <VolumeIcon size={20} />
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-0 group-hover:w-20 transition-all duration-300 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                />
            </div>
        </div>
    );
}

export default AudioPlayer;