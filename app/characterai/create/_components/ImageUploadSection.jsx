// characterai/create/_components/ImageUploadSection.jsx
"use client";

import React, { useState, useRef, useEffect } from 'react'; // Import useEffect
import Image from 'next/image';
import { FiCamera, FiTrash2, FiUploadCloud } from 'react-icons/fi';

// Import constants - Adjusted path as necessary
import { uiColors } from '../../_constants/uiConstants'; // Corrected path

function ImageUploadSection({ onImageSelect, existingImageUrl }) { // Added prop for existing image
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Effect to set the initial preview if an existing image URL is provided
    useEffect(() => {
        if (existingImageUrl) {
             setPreviewUrl(existingImageUrl);
        } else {
             setPreviewUrl(null); // Clear preview if existing URL is removed or null
        }
    }, [existingImageUrl]); // Update effect when the existingImageUrl prop changes


    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                onImageSelect(file); // Pass the FILE object up to the parent
            };
            reader.readAsDataURL(file);
        }
         // Reset input value so the same file can be selected again after removal
        if (fileInputRef.current) {
             fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        onImageSelect(null); // Notify parent that image is removed (pass null File)
         // Reset input value
         if (fileInputRef.current) {
             fileInputRef.current.value = '';
         }
    };

    const triggerFileInput = () => {
         fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <label className={`block text-md font-medium ${uiColors.textSecondary}`}> {/* Adjusted font size */}
                Character Image
            </label>
             <p className={`text-sm ${uiColors.textPlaceholder}`}> {/* Adjusted font size */}
                An optional image for your character's avatar. Recommended aspect ratio 1:1.
            </p>

            <div className="flex items-center space-x-4">
               <div
                    className={`flex-shrink-0 w-24 h-24 rounded-lg flex items-center justify-center ${uiColors.bgSecondary} border ${uiColors.borderPrimary} overflow-hidden relative`} // Increased size
                >
                    {previewUrl ? (
                         <Image src={previewUrl} alt="Image Preview" fill style={{objectFit:"cover"}} />
                    ) : (
                        <FiCamera className={`w-10 h-10 ${uiColors.textPlaceholder}`} />
                    )}
                </div>

                 {/* Buttons */}
                 <div className="flex space-x-2">
                     {/* Hidden file input */}
                     <input
                         type="file"
                         ref={fileInputRef}
                         onChange={handleFileChange}
                         className="hidden"
                         accept="image/*" // Only accept image files
                     />
                     {/* Button to trigger file input */}
                      <button
                          onClick={triggerFileInput}
                          className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`} // Adjusted font size/padding
                      >
                          <FiUploadCloud className="mr-2 w-4 h-4" /> Upload
                      </button>
                     {/* Remove button (only if image exists) */}
                     {previewUrl && (
                          <button
                              onClick={handleRemoveImage}
                              className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textSecondary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`} // Adjusted font size/padding
                          >
                              <FiTrash2 className="mr-2 w-4 h-4" /> Remove
                          </button>
                     )}
                 </div>
            </div>
        </div>
    );
}

export default ImageUploadSection;