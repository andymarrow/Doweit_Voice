// voice-agents-CallAgents/[agentid]/_components/CallConfig.jsx
"use client";

import React, { useState } from 'react';

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants';  // Ensure correct import path

function CallConfig({ agentId }) {
    // Placeholder states for form fields
    const [noiseCancellation, setNoiseCancellation] = useState('standard'); // 'standard', 'advanced'
    const [maxIdleDuration, setMaxIdleDuration] = useState(15); // seconds
    const [speakerBoost, setSpeakerBoost] = useState(0); // 0-1 slider value? Assuming numerical
    const [idleReminders, setIdleReminders] = useState(true); // Toggle state
    const [idleReminderDelay, setIdleReminderDelay] = useState(4); // seconds
    const [backgroundNoise, setBackgroundNoise] = useState('none'); // 'none', 'environment', etc.
    const [backgroundNoiseVolume, setBackgroundNoiseVolume] = useState(0.0); // 0.0 to 1.0
    const [pauseBeforeSpeaking, setPauseBeforeSpeaking] = useState(0); // seconds
    const [ringDuration, setRingDuration] = useState(0); // seconds
    const [limitCallDuration, setLimitCallDuration] = useState(false); // Toggle state
    const [callDurationLimit, setCallDurationLimit] = useState(20); // minutes
    const [enableRecordings, setEnableRecordings] = useState(true); // Toggle state
    const [enableTranscripts, setEnableTranscripts] = useState(true); // Toggle state


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
                     id="noiseCancellation" // Has ID
                     value={noiseCancellation}
                     onChange={(e) => setNoiseCancellation(e.target.value)}
                     className={`form-select block w-fit text-lg rounded-md p-2 ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 >
                     <option value="standard">Standard</option>
                     <option value="advanced">Advanced</option>
                 </select>
            </div>

            {/* Max. Idle Duration */}
             <div>
                 <label htmlFor="maxIdleDuration" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Max. Idle Duration ({maxIdleDuration}s)
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     The agent will disconnect after this period.
                 </p>
                  <input
                     type="number"
                     id="maxIdleDuration" // Has ID
                     min="0"
                     value={maxIdleDuration}
                     onChange={(e) => setMaxIdleDuration(parseInt(e.target.value, 10) || 0)}
                     className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

             {/* Speaker Boost */}
              <div>
                  {/* Label with 'for' attribute */}
                  <label htmlFor="speakerBoost" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                      Speaker Boost ({speakerBoost.toFixed(1)})
                  </label>
                  <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                      Amplifies the voice's likeness to the original speaker, which can slightly slow down the response time.
                  </p>
                  {/* Range input with matching 'id' attribute */}
                   <input
                      type="range"
                      id="speakerBoost" // Added ID
                      min="0"
                      max="1"
                      step="0.1"
                      value={speakerBoost}
                      onChange={(e) => setSpeakerBoost(parseFloat(e.target.value))}
                      className={`w-full sm:max-w-md h-2 rounded-lg appearance-none cursor-pointer ${uiColors.rangeTrack} ${uiColors.rangeThumb}`}
                  />
              </div>

            {/* Idle Reminders Toggle and Delay */}
             <div className="flex items-start justify-between w-full sm:max-w-md">
                 <div className="flex-grow">
                     {/* Label targets the button's ID */}
                     <label htmlFor="idleRemindersToggle" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                          Idle Reminders
                     </label>
                     <p className={`text-md ${uiColors.textPlaceholder}`}>
                          AI Agent reminds user after the set idle time.
                     </p>
                 </div>
                 {/* Button acting as toggle, has ID */}
                  <button
                       id="idleRemindersToggle" // Has ID
                      onClick={() => setIdleReminders(!idleReminders)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                  ${idleReminders ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`} // Fixed string interpolation
                  >
                      <span className={`sr-only`}>Enable idle reminders</span>
                       <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                      ${idleReminders ? 'translate-x-5' : 'translate-x-0'}`}
                      ></span>
                  </button>
            </div>
             {idleReminders && (
                 <div className="w-full sm:max-w-md">
                      {/* Label with 'for' attribute */}
                      <label htmlFor="idleReminderDelay" className={`block text-lg font-medium mb-1 ${uiColors.textSecondary}`}>
                          Delay
                     </label>
                     {/* Input with matching 'id' attribute */}
                     <input
                          type="number"
                          id="idleReminderDelay" // Added ID
                          min="0"
                          value={idleReminderDelay}
                          onChange={(e) => setIdleReminderDelay(parseInt(e.target.value, 10) || 0)}
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
                      {/* Type Select has ID */}
                     <select
                          id="backgroundNoise" // Has ID
                          value={backgroundNoise}
                          onChange={(e) => setBackgroundNoise(e.target.value)}
                          className={`form-select block w-fit text-lg rounded-md p-2 ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                      >
                         <option value="none">None</option>
                         <option value="environment">Environment</option>
                     </select>
                     {/* Volume Slider (conditional) */}
                     {backgroundNoise !== 'none' && (
                          <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0 sm:w-40">
                              {/* Label for the slider */}
                              <label htmlFor="backgroundNoiseVolume" className={`text-lg ${uiColors.textSecondary}`}>Volume:</label> {/* Added Label for Volume */}
                              {/* Range input with matching ID */}
                              <input
                                  type="range"
                                  id="backgroundNoiseVolume" // Added ID
                                   min="0"
                                   max="1"
                                   step="0.01"
                                   value={backgroundNoiseVolume}
                                   onChange={(e) => setBackgroundNoiseVolume(parseFloat(e.target.value))}
                                  className={`flex-grow h-2 rounded-lg appearance-none cursor-pointer ${uiColors.rangeTrack} ${uiColors.rangeThumb}`}
                              />
                               <span className={`text-lg ${uiColors.textSecondary}`}>{backgroundNoiseVolume.toFixed(1)}</span>
                          </div>
                     )}
                 </div>
            </div>

            {/* Pause Before Speaking */}
             <div>
                 <label htmlFor="pauseBeforeSpeaking" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Pause Before Speaking ({pauseBeforeSpeaking}s)
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     The duration before the agent starts speaking at the beginning of the call.
                 </p>
                  <input
                     type="number"
                     id="pauseBeforeSpeaking" // Has ID
                     min="0"
                     value={pauseBeforeSpeaking}
                     onChange={(e) => setPauseBeforeSpeaking(parseInt(e.target.value, 10) || 0)}
                     className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

            {/* Ring Duration */}
             <div>
                 <label htmlFor="ringDuration" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Ring Duration ({ringDuration}s)
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Ringing time before the assistant answers the call
                 </p>
                  <input
                     type="number"
                     id="ringDuration" // Has ID
                     min="0"
                     value={ringDuration}
                     onChange={(e) => setRingDuration(parseInt(e.target.value, 10) || 0)}
                     className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

            {/* Limit Call Duration Toggle and Limit */}
             <div className="flex items-start justify-between w-full sm:max-w-md">
                 <div className="flex-grow">
                     {/* Label targets the button's ID */}
                     <label htmlFor="limitCallDurationToggle" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                          Limit Call Duration
                     </label>
                     <p className={`text-md ${uiColors.textPlaceholder}`}>
                          Sets a maximum duration for calls.
                     </p>
                 </div>
                 {/* Button acting as toggle, has ID */}
                  <button
                       id="limitCallDurationToggle" // Has ID
                      onClick={() => setLimitCallDuration(!limitCallDuration)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                  ${limitCallDuration ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`} // Fixed string interpolation
                  >
                      <span className={`sr-only`}>Limit call duration</span>
                       <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                      ${limitCallDuration ? 'translate-x-5' : 'translate-x-0'}`}
                      ></span>
                  </button>
            </div>
             {limitCallDuration && (
                 <div className="w-full sm:max-w-md">
                      {/* Label with 'for' attribute */}
                      <label htmlFor="callDurationLimit" className={`block text-lg font-medium mb-1 ${uiColors.textSecondary}`}>
                          Duration (min)
                     </label>
                     {/* Input with matching 'id' attribute */}
                     <input
                          type="number"
                          id="callDurationLimit" // Added ID
                          min="1"
                          value={callDurationLimit}
                          onChange={(e) => setCallDurationLimit(parseInt(e.target.value, 10) || 0)}
                          className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                      />
                 </div>
             )}

            {/* Enable Recordings Toggle */}
             <div className="flex items-start justify-between w-full sm:max-w-md">
                 <div className="flex-grow">
                     {/* Label targets the button's ID */}
                     <label htmlFor="enableRecordingsToggle" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                          Enable Recordings
                     </label>
                     <p className={`text-xs ${uiColors.textPlaceholder}`}>
                          Toggle to record calls for playback and easy review in the logs.
                     </p>
                 </div>
                 {/* Button acting as toggle, has ID */}
                  <button
                       id="enableRecordingsToggle" // Has ID
                      onClick={() => setEnableRecordings(!enableRecordings)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                  ${enableRecordings ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`} // Fixed string interpolation
                  >
                      <span className={`sr-only`}>Enable recordings</span>
                       <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                      ${enableRecordings ? 'translate-x-5' : 'translate-x-0'}`}
                      ></span>
                  </button>
            </div>

            {/* Enable Transcripts Toggle */}
             <div className="flex items-start justify-between w-full sm:max-w-md">
                 <div className="flex-grow">
                     {/* Label targets the button's ID */}
                     <label htmlFor="enableTranscriptsToggle" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                          Enable Transcripts
                     </label>
                     <p className={`text-md ${uiColors.textPlaceholder}`}>
                          Toggle to save the timeline of your calls.
                     </p>
                 </div>
                 {/* Button acting as toggle, has ID */}
                  <button
                       id="enableTranscriptsToggle" // Has ID
                      onClick={() => setEnableTranscripts(!enableTranscripts)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                  ${enableTranscripts ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`} // Fixed string interpolation
                  >
                      <span className={`sr-only`}>Enable transcripts</span>
                       <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                      ${enableTranscripts ? 'translate-x-5' : 'translate-x-0'}`}
                      ></span>
                  </button>
            </div>


        </div>
    );
}

export default CallConfig;