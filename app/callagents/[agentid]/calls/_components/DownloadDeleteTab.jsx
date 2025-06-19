// voice-agents-CallAgents/[agentid]/calls/_components/DownloadDeleteTab.jsx
"use client";

import React, { useState } from 'react'; // Need useState for loading state
import { FiDownload, FiTrash2, FiCheck, FiAlertTriangle, FiLoader } from 'react-icons/fi'; // Icons

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; 

// Helper function to simulate file download
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

function DownloadDeleteTab({ callData, onDeleteCall }) { // Receive callData and onDeleteCall handler

    const [isDeleting, setIsDeleting] = useState(false); // State for delete loading
    const [isDownloadingTranscript, setIsDownloadingTranscript] = useState(false); // State for download loading
    const [isDownloadingAudio, setIsDownloadingAudio] = useState(false); // State for download loading


    const handleDownloadTranscript = async () => {
        if (!callData || !callData.transcript || callData.transcript.length === 0) {
            alert("No transcript available to download.");
            return;
        }
        setIsDownloadingTranscript(true);
        // Simulate asynchronous operation
        await new Promise(resolve => setTimeout(resolve, 500));
        const transcriptText = callData.transcript.map(entry =>
            `${entry.timestamp ? `[${entry.timestamp}] ` : ''}${entry.type.toUpperCase()}: ${entry.text}`
        ).join('\n');
        simulateDownload(`call_${callData.id}_transcript.txt`, transcriptText, 'text/plain');
        setIsDownloadingTranscript(false);
    };

    const handleDownloadAudio = async () => {
        if (!callData || !callData.audioUrl) {
             alert("No audio recording available to download.");
             return;
         }
         setIsDownloadingAudio(true);
         // In a real app, you'd fetch the audio blob/file from the audioUrl
         // and then use simulateDownload (or a better download library)
         // For simulation, we'll just fake the download success
         await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate download time
         alert(`Simulating download of audio from: ${callData.audioUrl}`); // Placeholder
         // simulateDownload(`call_${callData.id}_audio.wav`, audioBlob, 'audio/wav'); // Use actual blob/type
         setIsDownloadingAudio(false);
    };

    const handleDeleteCall = async () => {
        if (confirm(`Are you sure you want to delete call ${callData.id}? This action cannot be undone.`)) {
            setIsDeleting(true);
            console.log(`Deleting call ${callData.id}`);
            // Simulate asynchronous operation
            await new Promise(resolve => setTimeout(resolve, 800));
            onDeleteCall(callData.id); // Call parent handler with call ID
            setIsDeleting(false); // State will reset as modal closes
            // Modal will be closed by parent after deletion is successful
        }
    };


    return (
        <div className="space-y-6"> {/* Container with vertical spacing */}

            {/* Download Section */}
             <div className={`p-4 rounded-md ${uiColors.bgPrimary} border ${uiColors.borderPrimary} space-y-3`}>
                 <h4 className={`text-base font-semibold ${uiColors.textPrimary}`}>Download Call Data</h4>
                 <p className={`text-sm ${uiColors.textSecondary}`}>
                     You can download the transcript and audio recording of this call.
                 </p>
                 <div className="flex flex-wrap gap-4">
                     <button
                         onClick={handleDownloadTranscript}
                         disabled={isDownloadingTranscript || isDownloadingAudio || isDeleting || !callData || !callData.transcript || callData.transcript.length === 0}
                         className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none
                                     ${isDownloadingTranscript || isDownloadingAudio || isDeleting || !callData || !callData.transcript || callData.transcript.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          disabled={isDownloadingTranscript || isDownloadingAudio || isDeleting || !callData || !callData.audioUrl}
                          className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none
                                      ${isDownloadingTranscript || isDownloadingAudio || isDeleting || !callData || !callData.audioUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                     disabled={isDeleting || isDownloadingTranscript || isDownloadingAudio || !callData} // Disable while deleting or if any other operation is in progress
                      className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.alertDangerButtonBg} ${uiColors.alertDangerButtonText} ${uiColors.alertDangerButtonHoverBg}
                                  ${isDeleting || isDownloadingTranscript || isDownloadingAudio || !callData ? 'opacity-50 cursor-not-allowed' : ''}`}
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