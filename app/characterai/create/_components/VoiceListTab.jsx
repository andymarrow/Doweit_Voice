// characterai/create/_components/VoiceListTab.jsx
"use client";

import React from 'react';

import VoiceItem from './VoiceItem';

// Added onPlayVoice and isPlayingMessageId props
function VoiceListTab({ voices, selectedVoiceId, onSelectVoice, onPlayVoice, currentlyPlayingVoiceId }) {
    return (
        <div className="space-y-3">
            {voices.map(voice => (
                <VoiceItem
                    key={voice.id}
                    voice={voice}
                    // isSelected checks against voice.id, but onSelectVoice gets the object
                    isSelected={selectedVoiceId === voice.id}
                    onSelectVoice={onSelectVoice} // Pass the handler (expects object)
                    onPlayVoice={onPlayVoice} // Pass the new handler
                    isPlaying={currentlyPlayingVoiceId === voice.id} // Check if this voice is playing
                />
            ))}
        </div>
    );
}

export default VoiceListTab;