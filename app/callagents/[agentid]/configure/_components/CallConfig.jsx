"use client";

import React from 'react'; // No need for useState here anymore

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants';  // Correct import path

// Receive config data (specifically the callConfig part) and the change handler
function CallConfig({ config, onConfigChange }) {

     // Use the callConfig object from the parent's config prop
     const callConfig = config?.callConfig || {}; // Use empty object if callConfig is null/undefined

    // Helper to update a nested field within callConfig
    const handleCallConfigChange = (field, value) => {
        // Call the parent handler with the updated callConfig object
        onConfigChange('callConfig', {
            ...callConfig,
            [field]: value
        });
    };

    // Guard clause: If config or callConfig is not yet loaded, render nothing or a loader
     if (!config) {
         return null;
     }


    return (
        <div className="space-y-8">

            {/* Noise Cancellation */}
             <div>
                 <label htmlFor="noiseCancellation" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Noise Cancellation
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Removes background noise—like chatter in a café or keyboard typing—to make the user's voice clearer and easier to understand.
                 </p>
                 <select
                     id="noiseCancellation"
                      // Use value from callConfig, handle potential undefined/null
                     value={callConfig.noiseCancellation || ''}
                     onChange={(e) => handleCallConfigChange('noiseCancellation', e.target.value)} // Update callConfig
                     className={`form-select block w-fit text-lg rounded-md p-2 ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 >
                     {/* Add options */}
                     <option value="">Select Option</option> {/* Add a default empty option */}
                     <option value="standard">Standard</option>
                     <option value="advanced">Advanced</option>
                 </select>
            </div>

            {/* Max. Idle Duration */}
             <div>
                 {/* Use value from callConfig in label, default to 0 if not set */}
                 <label htmlFor="maxIdleDuration" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Max. Idle Duration ({callConfig.maxIdleDuration !== undefined ? callConfig.maxIdleDuration : 0}s)
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     The agent will disconnect after this period.
                 </p>
                  <input
                     type="number"
                     id="maxIdleDuration"
                     min="0"
                      // Use value from callConfig, default to 0 if not set, handle parsing
                     value={callConfig.maxIdleDuration !== undefined ? callConfig.maxIdleDuration : 0}
                     onChange={(e) => handleCallConfigChange('maxIdleDuration', parseInt(e.target.value, 10) || 0)} // Update callConfig, ensure integer
                     className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

             {/* Speaker Boost */}
              <div>
                  {/* Use value from callConfig in label, default to 0 if not set */}
                  <label htmlFor="speakerBoost" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                      Speaker Boost ({callConfig.speakerBoost !== undefined ? callConfig.speakerBoost.toFixed(1) : 'N/A'})
                  </label>
                  <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                      Amplifies the voice's likeness to the original speaker, which can slightly slow down the response time.
                  </p>
                   <input
                      type="range"
                      id="speakerBoost"
                      min="0"
                      max="1"
                      step="0.1"
                       // Use value from callConfig, default to 0 if not set
                      value={callConfig.speakerBoost !== undefined ? callConfig.speakerBoost : 0}
                      onChange={(e) => handleCallConfigChange('speakerBoost', parseFloat(e.target.value))} // Update callConfig, ensure float
                      className={`w-full sm:max-w-md h-2 rounded-lg appearance-none cursor-pointer ${uiColors.rangeTrack} ${uiColors.rangeThumb}`}
                  />
              </div>

            {/* Idle Reminders Toggle and Delay */}
             <div className="flex items-start justify-between w-full sm:max-w-md">
                 <div className="flex-grow">
                     <label htmlFor="idleRemindersToggle" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                          Idle Reminders
                     </label>
                     <p className={`text-md ${uiColors.textPlaceholder}`}>
                          AI Agent reminds user after the set idle time.
                     </p>
                 </div>
                  <button
                       id="idleRemindersToggle"
                       // Use value from callConfig (boolean), pass toggled boolean to handler
                      onClick={() => handleCallConfigChange('idleReminders', !callConfig.idleReminders)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                  ${callConfig.idleReminders ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`}
                  >
                      <span className={`sr-only`}>Enable idle reminders</span>
                       <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                      ${callConfig.idleReminders ? 'translate-x-5' : 'translate-x-0'}`}
                      ></span>
                  </button>
            </div>
             {/* Conditionally render delay input based on the toggle state */}
             {callConfig.idleReminders && (
                 <div className="w-full sm:max-w-md">
                      {/* Use value from callConfig in label, default to 0 if not set */}
                      <label htmlFor="idleReminderDelay" className={`block text-lg font-medium mb-1 ${uiColors.textSecondary}`}>
                          Delay ({callConfig.idleReminderDelay !== undefined ? callConfig.idleReminderDelay : 0}s)
                     </label>
                     <input
                          type="number"
                          id="idleReminderDelay"
                          min="0"
                           // Use value from callConfig, default to 0 if not set, handle parsing
                          value={callConfig.idleReminderDelay !== undefined ? callConfig.idleReminderDelay : 0}
                          onChange={(e) => handleCallConfigChange('idleReminderDelay', parseInt(e.target.value, 10) || 0)} // Update callConfig, ensure integer
                          className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                      />
                 </div>
             )}


            {/* Background Noise */}
             <div>
                 <label htmlFor="backgroundNoise" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Background Noise
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     Adds background noise to simulate a real environment during calls
                 </p>
                 <div className="flex items-center space-x-4">
                      <select
                          id="backgroundNoise"
                           // Use value from callConfig
                          value={callConfig.backgroundNoise || ''}
                          onChange={(e) => handleCallConfigChange('backgroundNoise', e.target.value)} // Update callConfig
                          className={`form-select block w-fit text-lg rounded-md p-2 ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                      >
                         {/* Add options */}
                          <option value="">Select Noise</option> {/* Add a default empty option */}
                         <option value="none">None</option>
                         <option value="environment">Environment</option>
                          {/* Add other noise options */}
                     </select>
                     {/* Volume Slider (conditional) */}
                     {callConfig.backgroundNoise !== 'none' && callConfig.backgroundNoise !== '' && (
                          <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0 sm:w-40">
                              <label htmlFor="backgroundNoiseVolume" className={`text-lg ${uiColors.textSecondary}`}>Volume:</label>
                              <input
                                  type="range"
                                  id="backgroundNoiseVolume"
                                   min="0"
                                   max="1"
                                   step="0.01"
                                   // Use value from callConfig, default to 0 if not set
                                  value={callConfig.backgroundNoiseVolume !== undefined ? callConfig.backgroundNoiseVolume : 0}
                                  onChange={(e) => handleCallConfigChange('backgroundNoiseVolume', parseFloat(e.target.value))} // Update callConfig, ensure float
                                  className={`flex-grow h-2 rounded-lg appearance-none cursor-pointer ${uiColors.rangeTrack} ${uiColors.rangeThumb}`}
                              />
                               {/* Use value from callConfig in display */}
                               <span className={`text-lg ${uiColors.textSecondary}`}>{callConfig.backgroundNoiseVolume !== undefined ? callConfig.backgroundNoiseVolume.toFixed(1) : 'N/A'}</span>
                          </div>
                     )}
                 </div>
            </div>

            {/* Pause Before Speaking */}
             <div>
                 {/* Use value from callConfig in label, default to 0 if not set */}
                 <label htmlFor="pauseBeforeSpeaking" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Pause Before Speaking ({callConfig.pauseBeforeSpeaking !== undefined ? callConfig.pauseBeforeSpeaking : 0}s)
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     The duration before the agent starts speaking at the beginning of the call.
                 </p>
                  <input
                     type="number"
                     id="pauseBeforeSpeaking"
                     min="0"
                      // Use value from callConfig, default to 0 if not set, handle parsing
                     value={callConfig.pauseBeforeSpeaking !== undefined ? callConfig.pauseBeforeSpeaking : 0}
                     onChange={(e) => handleCallConfigChange('pauseBeforeSpeaking', parseInt(e.target.value, 10) || 0)} // Update callConfig, ensure integer
                     className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

            {/* Ring Duration */}
             <div>
                 {/* Use value from callConfig in label, default to 0 if not set */}
                 <label htmlFor="ringDuration" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Ring Duration ({callConfig.ringDuration !== undefined ? callConfig.ringDuration : 0}s)
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Ringing time before the assistant answers the call
                 </p>
                  <input
                     type="number"
                     id="ringDuration"
                     min="0"
                      // Use value from callConfig, default to 0 if not set, handle parsing
                     value={callConfig.ringDuration !== undefined ? callConfig.ringDuration : 0}
                     onChange={(e) => handleCallConfigChange('ringDuration', parseInt(e.target.value, 10) || 0)} // Update callConfig, ensure integer
                     className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

            {/* Limit Call Duration Toggle and Limit */}
             <div className="flex items-start justify-between w-full sm:max-w-md">
                 <div className="flex-grow">
                     <label htmlFor="limitCallDurationToggle" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                          Limit Call Duration
                     </label>
                     <p className={`text-md ${uiColors.textPlaceholder}`}>
                          Sets a maximum duration for calls.
                     </p>
                 </div>
                  <button
                       id="limitCallDurationToggle"
                       // Use value from callConfig (boolean), pass toggled boolean to handler
                      onClick={() => handleCallConfigChange('limitCallDuration', !callConfig.limitCallDuration)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                  ${callConfig.limitCallDuration ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`}
                  >
                      <span className={`sr-only`}>Limit call duration</span>
                       <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                      ${callConfig.limitCallDuration ? 'translate-x-5' : 'translate-x-0'}`}
                      ></span>
                  </button>
            </div>
             {/* Conditionally render limit input based on the toggle state */}
             {callConfig.limitCallDuration && (
                 <div className="w-full sm:max-w-md">
                      {/* Use value from callConfig in label, default to 0 if not set */}
                      <label htmlFor="callDurationLimit" className={`block text-lg font-medium mb-1 ${uiColors.textSecondary}`}>
                          Duration (min)
                     </label>
                     <input
                          type="number"
                          id="callDurationLimit"
                          min="1" // Duration should be at least 1 minute if enabled
                           // Use value from callConfig, default to 20 (or other sensible default) if not set, handle parsing
                          value={callConfig.callDurationLimit !== undefined ? callConfig.callDurationLimit : 20}
                          onChange={(e) => handleCallConfigChange('callDurationLimit', parseInt(e.target.value, 10) || 0)} // Update callConfig, ensure integer
                          className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                      />
                 </div>
             )}

            {/* Enable Recordings Toggle */}
             <div className="flex items-start justify-between w-full sm:max-w-md">
                 <div className="flex-grow">
                     <label htmlFor="enableRecordingsToggle" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                          Enable Recordings
                     </label>
                     <p className={`text-xs ${uiColors.textPlaceholder}`}>
                          Toggle to record calls for playback and easy review in the logs.
                     </p>
                 </div>
                  <button
                       id="enableRecordingsToggle"
                       // Use value from callConfig (boolean), pass toggled boolean to handler
                      onClick={() => handleCallConfigChange('enableRecordings', !callConfig.enableRecordings)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                  ${callConfig.enableRecordings ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`}
                  >
                      <span className={`sr-only`}>Enable recordings</span>
                       <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                      ${callConfig.enableRecordings ? 'translate-x-5' : 'translate-x-0'}`}
                      ></span>
                  </button>
            </div>

            {/* Enable Transcripts Toggle */}
             <div className="flex items-start justify-between w-full sm:max-w-md">
                 <div className="flex-grow">
                     <label htmlFor="enableTranscriptsToggle" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                          Enable Transcripts
                     </label>
                     <p className={`text-md ${uiColors.textPlaceholder}`}>
                          Toggle to save the timeline of your calls.
                     </p>
                 </div>
                  <button
                       id="enableTranscriptsToggle"
                        // Use value from callConfig (boolean), pass toggled boolean to handler
                      onClick={() => handleCallConfigChange('enableTranscripts', !callConfig.enableTranscripts)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                  ${callConfig.enableTranscripts ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`}
                  >
                      <span className={`sr-only`}>Enable transcripts</span>
                       <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                      ${callConfig.enableTranscripts ? 'translate-x-5' : 'translate-x-0'}`}
                      ></span>
                  </button>
            </div>

        </div>
    );
}

export default CallConfig;