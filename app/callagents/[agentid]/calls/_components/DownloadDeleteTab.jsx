// voice-agents-CallAgents/[agentid]/calls/_components/DownloadDeleteTab.jsx
"use client";

import React, { useState } from 'react';
import { FiDownload, FiTrash2, FiCheck, FiAlertTriangle, FiLoader } from 'react-icons/fi'; // Icons

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants';

// Helper function to simulate file download (Keep as is)
const simulateDownload = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the object URL
};

// Receive callData, onDeleteCall handler, and isDeleting state
function DownloadDeleteTab({ callData, onDeleteCall, isDeleting }) {

    const [isDownloadingTranscript, setIsDownloadingTranscript] = useState(false);
    const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);

    const isDeleteButtonDisabled = isDeleting || isDownloadingTranscript || isDownloadingAudio || !callData;
    const isDownloadButtonDisabled = isDeleting || isDownloadingTranscript || isDownloadingAudio || !callData;


    const handleDownloadTranscript = async () => {
        if (!callData || !callData.transcript || callData.transcript.length === 0) {
            alert("No transcript available to download.");
            return;
        }
        setIsDownloadingTranscript(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // FIX: Updated to use the correct Vapi transcript format (`role`, `message`, `time`).
        const transcriptText = (callData.transcript || []).map(entry =>
            `[${entry.time.toFixed(2)}s] ${(entry.role || '').toUpperCase()}: ${entry.message || ''}`
        ).join('\n');

        simulateDownload(`call_${callData.id}_transcript.txt`, transcriptText, 'text/plain');
        setIsDownloadingTranscript(false);
    };

    const handleDownloadAudio = async () => {
         // FIX: Use `recordingUrl` instead of `audioUrl`.
        if (!callData || !callData.recordingUrl) {
             alert("No audio recording available to download.");
             return;
         }
         setIsDownloadingAudio(true);
         await new Promise(resolve => setTimeout(resolve, 1000));
         alert(`Simulating download of audio from: ${callData.recordingUrl}`);
         // Example of a real download link: window.open(callData.recordingUrl, '_blank');
         setIsDownloadingAudio(false);
    };

    const handleDeleteCall = () => {
        if (confirm(`Are you sure you want to delete call ${callData.id}? This action cannot be undone.`)) {
            onDeleteCall(callData.id);
        }
    };


    return (
        <div className="space-y-6">

            {/* Download Section */}
             <div className={`p-4 rounded-md ${uiColors.bgPrimary} border ${uiColors.borderPrimary} space-y-3`}>
                 <h4 className={`text-base font-semibold ${uiColors.textPrimary}`}>Download Call Data</h4>
                 <p className={`text-sm ${uiColors.textSecondary}`}>
                     You can download the transcript and audio recording of this call.
                 </p>
                 <div className="flex flex-wrap gap-4">
                     <button
                         onClick={handleDownloadTranscript}
                         disabled={isDownloadButtonDisabled || !callData?.transcript || callData.transcript.length === 0}
                         className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                         {isDownloadingTranscript ? (
                              <FiLoader className="mr-2 w-4 h-4 animate-spin" />
                         ) : (
                             <FiDownload className="mr-2 w-4 h-4" />
                         )}
                         Download Transcript
                     </button>
                     <button
                         onClick={handleDownloadAudio}
                          // FIX: Check `recordingUrl` for disabled state.
                          disabled={isDownloadButtonDisabled || !callData?.recordingUrl}
                          className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                         {isDownloadingAudio ? (
                              <FiLoader className="mr-2 w-4 h-4 animate-spin" />
                         ) : (
                             <FiDownload className="mr-2 w-4 h-4" />
                         )}
                         Download Audio
                     </button>
                 </div>
            </div>

            {/* Delete Section */}
             <div className={`p-4 rounded-md border ${uiColors.alertDangerBorder} ${uiColors.alertDangerBg} space-y-3`}>
                 <div className="flex items-center">
                      <FiAlertTriangle className={`w-5 h-5 mr-3 flex-shrink-0 ${uiColors.alertDangerText}`} />
                      <div>
                         <h4 className={`text-base font-semibold ${uiColors.alertDangerText}`}>Delete Call History</h4>
                          <p className={`text-sm ${uiColors.textSecondary}`}>
                             Deleting this call history will permanently erase the transcript and recording.
                         </p>
                      </div>
                 </div>
                 <button
                     onClick={handleDeleteCall}
                     disabled={isDeleteButtonDisabled}
                      className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.alertDangerButtonBg} ${uiColors.alertDangerButtonText} ${uiColors.alertDangerButtonHoverBg} disabled:opacity-50 disabled:cursor-not-allowed`}
                 >
                     {isDeleting ? (
                         <FiLoader className="mr-2 w-4 h-4 animate-spin" />
                     ) : (
                          <FiTrash2 className="mr-2 w-4 h-4" />
                     )}
                     Delete Call
                 </button>
            </div>

        </div>
    );
}

export default DownloadDeleteTab;