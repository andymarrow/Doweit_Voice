// voice-agents-CallAgents/[agentid]/calls/_components/useAudioPlayer.js
"use client";

import { useState, useEffect, useRef } from 'react';

// Custom hook to manage audio player logic
export const useAudioPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    // Effect to attach event listeners to the audio element
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };

        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);

        // Cleanup
        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const play = () => {
        audioRef.current.play();
        setIsPlaying(true);
    };

    const pause = () => {
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const seek = (time) => {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const handleVolumeChange = (newVolume) => {
        audioRef.current.volume = newVolume;
        setVolume(newVolume);
        if (newVolume > 0) setIsMuted(false);
    };
    
    const toggleMute = () => {
        const audio = audioRef.current;
        audio.muted = !audio.muted;
        setIsMuted(audio.muted);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
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
    };
};