"use client";

import React, { useState } from 'react'; // Import useState
import { FiCpu, FiLoader } from 'react-icons/fi'; // Import icons
import { toast } from 'react-hot-toast'; // For user feedback

import { uiColors } from '@/app/callagents/_constants/uiConstants';

function TranscriptTab({ callData,agentId }) {
    const transcript = callData?.transcript;
    const recordingUrl = callData?.recordingUrl;
    
    // State to manage the analysis button
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Check if any action values already exist for this call
    const hasActionValues = callData?.callActionValues && callData.callActionValues.length > 0;
    // Check if the call has a transcript to analyze
    const hasTranscript = transcript && transcript.length > 0;

    const handleAnalyzeClick = async () => {
        setIsAnalyzing(true);
        toast.loading('Starting analysis...'); // Inform the user

        try {
           const response = await fetch(`/api/callagents/${agentId}/calls/${callData.id}/analyze`, {
                method: 'POST',
            });
            
            const result = await response.json();
            toast.dismiss(); // Dismiss the loading toast

            if (!response.ok) {
                throw new Error(result.error || 'Failed to start analysis.');
            }

            toast.success('Analysis initiated! Results will appear in the "Actions Data" tab shortly.');
            // You might want to pass a function from the parent to refresh the call data after a delay
            
        } catch (error) {
            toast.dismiss();
            toast.error(error.message);
            console.error("Analysis trigger failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };


    if (!hasTranscript) {
        return (
            <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                No transcript available for this call.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">

            {/* NEW: Analyze Button Section */}
            {!hasActionValues && hasTranscript && (
                <div className={`mb-4 p-3 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} flex items-center justify-between`}>
                    <p className={`text-sm ${uiColors.textSecondary}`}>Extract structured data from this transcript.</p>
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={isAnalyzing}
                        className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isAnalyzing ? (
                            <FiLoader className="mr-2 w-4 h-4 animate-spin" />
                        ) : (
                            <FiCpu className="mr-2 w-4 h-4" />
                        )}
                        Analyze Call
                    </button>
                </div>
            )}
            
            {/* Transcript Area */}
            <div className="flex-grow overflow-y-auto space-y-4 text-sm pr-2 -mr-2 hide-scrollbar">
                {transcript.map((entry, index) => (
                    <div key={index} className={`flex ${entry.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                         <div className={`max-w-[85%] p-3 rounded-lg ${
                             entry.role === 'assistant'
                                 ? `${uiColors.chatBubbleAgentBg} ${uiColors.chatBubbleAgentText}`
                                 : `${uiColors.chatBubbleUserBg} ${uiColors.chatBubbleUserText}`
                         }`}>
                            {entry.message}
                         </div>
                    </div>
                ))}
            </div>

            {/* Audio Player */}
             <div className={`flex-shrink-0 border-t ${uiColors.borderPrimary} pt-4 mt-4`}>
                 <h4 className={`text-sm font-semibold mb-2 ${uiColors.textPrimary}`}>Call Recording</h4>
                 {recordingUrl ? (
                     <audio controls src={recordingUrl} className="w-full">
                         Your browser does not support the audio element.
                     </audio>
                 ) : (
                      <div className={`${uiColors.textSecondary} text-sm`}>No audio recording available.</div>
                 )}
             </div>

        </div>
    );
}

export default TranscriptTab;