"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiInfo } from 'react-icons/fi';
import { uiColors } from '../../_constants/uiConstants';
import { toast } from 'react-hot-toast';

export default function CreateAddressModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        customerName: '',
        country: '',
        state: '',
        city: '',
        zipCode: '',
        addressLine1: '',
        addressLine2: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.customerName || !formData.country || !formData.city) {
            toast.error("Please fill in all required fields.");
            return;
        }

        console.log("Submitting address:", formData);
        toast.success("Address created successfully!");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`relative w-full max-w-[480px] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl ${uiColors.bgPrimary} border ${uiColors.borderPrimary}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${uiColors.borderPrimary} shrink-0`}>
                    <h2 className={`text-lg font-bold ${uiColors.textPrimary}`}>Create Address</h2>
                    <button 
                        onClick={onClose} 
                        className={`p-1.5 rounded-lg transition-colors ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar space-y-5">
                    
                    <p className={`text-sm ${uiColors.textSecondary}`}>
                        This address can be assigned to any phone number that requires an address.
                    </p>

                    <form id="create-address-form" onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Customer or Business Name */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${uiColors.textSecondary}`}>Customer or business name</label>
                            <input 
                                type="text" 
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                placeholder="Customer or business name"
                                className={`w-full px-3 py-2.5 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary}`}
                            />
                        </div>

                        {/* Country & State Row */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className={`block text-sm font-medium mb-1.5 ${uiColors.textSecondary}`}>Country</label>
                                <select 
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2.5 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary}`}
                                >
                                    <option value="" disabled hidden>Select Country</option>
                                    <option value="US">United States</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="CA">Canada</option>
                                    <option value="ET">Ethiopia</option>
                                    {/* Add more as needed */}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${uiColors.textSecondary}`}>
                                    State <FiInfo className="w-3.5 h-3.5 cursor-pointer text-gray-400 hover:text-gray-600" title="State, Province, or Region" />
                                </label>
                                <input 
                                    type="text" 
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Enter State"
                                    className={`w-full px-3 py-2.5 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary}`}
                                />
                            </div>
                        </div>

                        {/* City & Zip Code Row */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className={`block text-sm font-medium mb-1.5 ${uiColors.textSecondary}`}>City</label>
                                <input 
                                    type="text" 
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter City"
                                    className={`w-full px-3 py-2.5 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary}`}
                                />
                            </div>
                            <div className="flex-1">
                                <label className={`block text-sm font-medium mb-1.5 ${uiColors.textSecondary}`}>Zip code</label>
                                <input 
                                    type="text" 
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    placeholder="Enter Zip code"
                                    className={`w-full px-3 py-2.5 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary}`}
                                />
                            </div>
                        </div>

                        {/* Address Line 1 */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${uiColors.textSecondary}`}>Address Line 1</label>
                            <input 
                                type="text" 
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                placeholder="Line 1 (exactly as mentioned in documents)"
                                className={`w-full px-3 py-2.5 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary}`}
                            />
                        </div>

                        {/* Address Line 2 */}
                        <div>
                            <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${uiColors.textSecondary}`}>
                                Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input 
                                type="text" 
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleChange}
                                placeholder=""
                                className={`w-full px-3 py-2.5 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary}`}
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${uiColors.borderPrimary} shrink-0 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl`}>
                    <button 
                        type="button"
                        onClick={onClose}
                        className={`px-5 py-2.5 text-sm font-semibold rounded-lg border ${uiColors.borderPrimary} ${uiColors.textPrimary} hover:${uiColors.bgSecondary} transition-colors`}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        form="create-address-form"
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg text-white ${uiColors.accentPrimaryGradient} shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        Create
                    </button>
                </div>
            </motion.div>
        </div>
    );
}