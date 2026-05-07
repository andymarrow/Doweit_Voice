"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiHelpCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { uiColors } from '../../_constants/uiConstants';

// Generate a stable client-side id for a fresh entry row.
const newEntryId = () => `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Slide-in panel for creating OR editing a phone book.
//   - When `book` is null, this creates a new one via POST /api/phonebooks
//   - When `book` is provided, this edits via PATCH /api/phonebooks/<publicId>
// Calls `onSaved` after a successful save so the parent can refresh.
export default function CreatePhoneBookPanel({ isOpen, onClose, onSaved, book }) {
    const isEdit = Boolean(book);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [entries, setEntries] = useState([{ id: newEntryId(), number: '', condition: '' }]);
    const [isSaving, setIsSaving] = useState(false);

    // Reset whenever the panel opens with a different (or no) book.
    useEffect(() => {
        if (!isOpen) return;
        if (book) {
            setName(book.name || '');
            setDescription(book.description || '');
            const incoming = Array.isArray(book.entries) ? book.entries : [];
            setEntries(
                incoming.length > 0
                    ? incoming.map((e) => ({
                          id: e.id || newEntryId(),
                          number: e.number || '',
                          condition: e.condition || '',
                      }))
                    : [{ id: newEntryId(), number: '', condition: '' }],
            );
        } else {
            setName('');
            setDescription('');
            setEntries([{ id: newEntryId(), number: '', condition: '' }]);
        }
    }, [isOpen, book]);

    const handleAddEntry = () => {
        setEntries((prev) => [...prev, { id: newEntryId(), number: '', condition: '' }]);
    };
    const handleRemoveEntry = (id) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
    };
    const handleChangeEntry = (id, field, value) => {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    };

    const handleSave = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error('Phone book name is required.');
            return;
        }
        const cleanedEntries = entries
            .map((e) => ({
                id: e.id,
                number: (e.number || '').trim(),
                condition: (e.condition || '').trim(),
            }))
            .filter((e) => e.number);

        setIsSaving(true);
        try {
            const url = isEdit ? `/api/phonebooks/${book.publicId}` : '/api/phonebooks';
            const method = isEdit ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: trimmedName,
                    description: description.trim() || null,
                    entries: cleanedEntries,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Save failed (${res.status})`);
            }
            toast.success(isEdit ? 'Phone book updated.' : 'Phone book created.');
            onSaved?.();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const panelVariants = {
        hidden: { x: '100%', opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
        exit: { x: '100%', opacity: 0, transition: { ease: 'easeIn', duration: 0.2 } },
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <AnimatePresence>
                <motion.div
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="relative w-full max-w-2xl h-full flex shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`w-full h-full flex flex-col ${uiColors.bgPrimary} border-l ${uiColors.borderPrimary}`}>
                        {/* Header */}
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${uiColors.borderPrimary}`}>
                            <h2 className={`text-xl font-bold ${uiColors.textPrimary}`}>
                                {isEdit ? 'Edit Phone Book' : 'New Phone Book'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isSaving}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg border ${uiColors.borderPrimary} ${uiColors.textPrimary} hover:${uiColors.bgSecondary} transition-colors disabled:opacity-50`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !name.trim()}
                                    className="inline-flex items-center px-6 py-2 text-sm font-semibold rounded-lg text-white bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving && <FiLoader className="mr-2 w-4 h-4 animate-spin" />}
                                    {isEdit ? 'Save changes' : 'Create'}
                                </button>
                            </div>
                        </div>

                        {/* Form body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${uiColors.textSecondary}`}>Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Tech Support, Sales Outbound"
                                    className={`w-full px-4 py-2.5 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary}`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${uiColors.textSecondary}`}>
                                    Description <span className={`${uiColors.textPlaceholder} font-normal`}>(optional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What is this phone book for?"
                                    className={`w-full px-4 py-2.5 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary} resize-y`}
                                />
                            </div>

                            <div>
                                <div className="flex gap-4 mb-2">
                                    <label className={`flex-1 text-sm font-medium ${uiColors.textSecondary}`}>Phone Numbers</label>
                                    <label className={`flex-[1.5] flex items-center gap-1.5 text-sm font-medium ${uiColors.textSecondary}`}>
                                        Transfer Condition
                                        <FiHelpCircle
                                            className="w-3.5 h-3.5 text-gray-400 cursor-pointer"
                                            title="The agent transfers the live call to this number when the condition is met."
                                        />
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    {entries.map((entry) => (
                                        <div key={entry.id} className="flex items-center gap-3">
                                            <div className={`flex-1 flex items-center border rounded-lg ${uiColors.borderPrimary} focus-within:ring-2 focus-within:${uiColors.ringAccentShade} transition-all bg-transparent`}>
                                                <input
                                                    type="text"
                                                    value={entry.number}
                                                    onChange={(e) => handleChangeEntry(entry.id, 'number', e.target.value)}
                                                    placeholder="+15551234567"
                                                    className={`w-full px-3 py-2 text-sm outline-none bg-transparent ${uiColors.textPrimary}`}
                                                />
                                            </div>
                                            <div className="flex-[1.5]">
                                                <input
                                                    type="text"
                                                    value={entry.condition}
                                                    onChange={(e) => handleChangeEntry(entry.id, 'condition', e.target.value)}
                                                    placeholder="e.g. When the user asks for support"
                                                    className={`w-full px-3 py-2 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm ${uiColors.textPrimary}`}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveEntry(entry.id)}
                                                disabled={entries.length === 1}
                                                title={entries.length === 1 ? 'Keep at least one row' : 'Remove'}
                                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <FiX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleAddEntry}
                                    className={`mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border ${uiColors.borderPrimary} ${uiColors.textPrimary} hover:${uiColors.bgSecondary} transition-colors`}
                                >
                                    <FiPlus className="w-4 h-4" /> Add row
                                </button>
                                <p className={`text-xs ${uiColors.textPlaceholder} mt-2`}>
                                    Rows with empty phone numbers are skipped automatically.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
