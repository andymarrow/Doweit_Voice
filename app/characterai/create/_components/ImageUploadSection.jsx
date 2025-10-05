// characterai/create/_components/ImageUploadSection.jsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiCamera, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { uiColors } from '../../_constants/uiConstants';

function ImageUploadSection({ onImageSelect, existingImageUrl }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (existingImageUrl) {
            setPreviewUrl(existingImageUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [existingImageUrl]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                onImageSelect(file);
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        onImageSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <label className={`block text-md font-medium ${uiColors.textSecondary}`}>
                Character Image
            </label>
            <p className={`text-sm ${uiColors.textPlaceholder}`}>
                An optional image for your character's avatar. Recommended aspect ratio 1:1.
            </p>
            <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-24 h-24 rounded-lg flex items-center justify-center ${uiColors.bgSecondary} border ${uiColors.borderPrimary} overflow-hidden relative`}>
                    {previewUrl ? (
                        <Image src={previewUrl} alt="Image Preview" fill style={{ objectFit: "cover" }} />
                    ) : (
                        <FiCamera className={`w-10 h-10 ${uiColors.textPlaceholder}`} />
                    )}
                </div>
                <div className="flex space-x-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    {/* Button to trigger file input */}
                    <button
                        type="button" // <--- FIX #1 APPLIED HERE
                        onClick={triggerFileInput}
                        className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`}
                    >
                        <FiUploadCloud className="mr-2 w-4 h-4" /> Upload
                    </button>
                    {/* Remove button (only if image exists) */}
                    {previewUrl && (
                        <button
                            type="button" // <--- FIX #2 APPLIED HERE
                            onClick={handleRemoveImage}
                            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textSecondary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`}
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