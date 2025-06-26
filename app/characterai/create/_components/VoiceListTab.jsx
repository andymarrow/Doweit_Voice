// characterai/create/_components/VoiceListTab.jsx
"use client";

import React from 'react';

import VoiceItem from './VoiceItem';

// Removed VapiVoice type definition


function VoiceListTab({ voices, selectedVoiceId, onSelectVoice, onPlayVoice, currentlyPlayingVoiceId }) {
    return (
        <div className="space-y-3">
            {/* voices is expected to be an array of voice objects */}
            {voices.map((voice) => ( // Removed type assertion for voice
                <VoiceItem
                    key={voice.id} // Use the voice ID as the key
                    voice={voice} // Pass the full voice object
                    isSelected={selectedVoiceId === voice.id}
                    onSelectVoice={onSelectVoice}
                    onPlayVoice={onPlayVoice}
                    isPlaying={currentlyPlayingVoiceId === voice.id}
                />
            ))}
        </div>
    );
}

export default VoiceListTab;