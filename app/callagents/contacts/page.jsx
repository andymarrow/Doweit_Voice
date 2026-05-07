"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiDatabase, FiPlus, FiLoader, FiTrash2, FiEdit3, FiPhone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { uiColors, sectionVariants } from '../_constants/uiConstants';

import CreatePhoneBookPanel from './_components/CreatePhoneBookPanel';
import CreateMemoryGroupModal from './_components/CreateMemoryGroupModal';

export default function ContactsPage() {
    const [activeTab, setActiveTab] = useState('phonebooks');

    const [isCreatePhoneBookOpen, setIsCreatePhoneBookOpen] = useState(false);
    const [isCreateMemoryGroupOpen, setIsCreateMemoryGroupOpen] = useState(false);

    const [phoneBooks, setPhoneBooks] = useState([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);
    const [editingBook, setEditingBook] = useState(null);
    const [deletingBookId, setDeletingBookId] = useState(null);

    const reload = useCallback(async () => {
        setIsLoadingBooks(true);
        try {
            const res = await fetch('/api/phonebooks');
            if (!res.ok) throw new Error((await res.json()).error || 'Failed to load phone books');
            const data = await res.json();
            setPhoneBooks(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoadingBooks(false);
        }
    }, []);

    useEffect(() => { reload(); }, [reload]);

    const handleDeleteBook = async (book) => {
        if (!confirm(`Delete "${book.name}"? This cannot be undone.`)) return;
        setDeletingBookId(book.publicId);
        try {
            const res = await fetch(`/api/phonebooks/${book.publicId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
            toast.success('Phone book deleted.');
            setPhoneBooks((prev) => prev.filter((b) => b.publicId !== book.publicId));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setDeletingBookId(null);
        }
    };

    const counts = {
        memoryGroups: 0,
        phoneBooks: phoneBooks.length,
    };

    const closePanel = () => {
        setIsCreatePhoneBookOpen(false);
        setEditingBook(null);
    };

    const handlePanelSaved = () => {
        closePanel();
        reload();
    };

    return (
        <motion.div
            className="flex flex-col md:flex-row h-full w-full bg-transparent gap-6"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Inner sidebar */}
            <div className="w-full md:w-64 flex-shrink-0 flex flex-col h-full">
                <h2 className={`text-xl font-bold mb-4 px-2 ${uiColors.textPrimary}`}>Contacts</h2>
                <nav className="flex flex-col space-y-1">
                    <button
                        onClick={() => setActiveTab('memory')}
                        className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'memory'
                                ? `${uiColors.accentSubtleBg} ${uiColors.accentPrimary}`
                                : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                        }`}
                    >
                        <span>Memory Groups</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full bg-white dark:bg-gray-800 border ${uiColors.borderPrimary}`}>
                            {counts.memoryGroups}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('phonebooks')}
                        className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'phonebooks'
                                ? `${uiColors.accentSubtleBg} ${uiColors.accentPrimary}`
                                : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                        }`}
                    >
                        <span>Phone Books</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full bg-white dark:bg-gray-800 border ${uiColors.borderPrimary}`}>
                            {counts.phoneBooks}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Main area */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border ${uiColors.borderPrimary} shadow-sm overflow-hidden`}>
                {activeTab === 'phonebooks' ? (
                    <PhoneBooksTab
                        isLoading={isLoadingBooks}
                        books={phoneBooks}
                        onCreate={() => { setEditingBook(null); setIsCreatePhoneBookOpen(true); }}
                        onEdit={(book) => { setEditingBook(book); setIsCreatePhoneBookOpen(true); }}
                        onDelete={handleDeleteBook}
                        deletingBookId={deletingBookId}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <motion.div
                            key="empty-memory"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center text-center max-w-sm"
                        >
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border-2 ${uiColors.borderPrimary} ${uiColors.bgSecondary} shadow-sm`}>
                                <FiDatabase className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${uiColors.textPrimary}`}>Memory Groups</h3>
                            <p className={`text-sm mb-8 leading-relaxed ${uiColors.textSecondary}`}>
                                Memory groups let agents share context across calls. Coming soon.
                            </p>
                            <button
                                onClick={() => setIsCreateMemoryGroupOpen(true)}
                                className="flex items-center px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <FiPlus className="mr-1.5 w-4 h-4" /> Create Memory Group
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isCreatePhoneBookOpen && (
                    <CreatePhoneBookPanel
                        isOpen={isCreatePhoneBookOpen}
                        onClose={closePanel}
                        onSaved={handlePanelSaved}
                        book={editingBook}
                    />
                )}
                {isCreateMemoryGroupOpen && (
                    <CreateMemoryGroupModal
                        isOpen={isCreateMemoryGroupOpen}
                        onClose={() => setIsCreateMemoryGroupOpen(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function PhoneBooksTab({ isLoading, books, onCreate, onEdit, onDelete, deletingBookId }) {
    if (isLoading) {
        return (
            <div className={`flex-1 flex items-center justify-center ${uiColors.textSecondary}`}>
                <FiLoader className="animate-spin w-6 h-6 mr-2" /> Loading phone books…
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    key="empty-phonebooks"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center text-center max-w-sm"
                >
                    <div className="mb-6 text-gray-300 dark:text-gray-600 relative">
                        <FiBook className="w-16 h-16 absolute -top-2 -left-2 opacity-50" />
                        <FiBook className="w-16 h-16 relative z-10 bg-white dark:bg-gray-900 rounded-lg" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${uiColors.textPrimary}`}>Phone Books</h3>
                    <p className={`text-sm mb-8 leading-relaxed ${uiColors.textSecondary}`}>
                        Create your first phone book to power smart, rule-based call transfers.
                    </p>
                    <button
                        onClick={onCreate}
                        className="flex items-center px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <FiPlus className="mr-1.5 w-4 h-4" /> Create Phone Book
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`flex items-center justify-between px-6 py-4 border-b ${uiColors.borderPrimary}`}>
                <div>
                    <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>Phone Books</h3>
                    <p className={`text-xs ${uiColors.textSecondary}`}>
                        {books.length} {books.length === 1 ? 'book' : 'books'} · transfer routing rules
                    </p>
                </div>
                <button
                    onClick={onCreate}
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 shadow-sm"
                >
                    <FiPlus className="mr-1.5 w-4 h-4" /> New phone book
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {books.map((book) => (
                        <PhoneBookCard
                            key={book.publicId}
                            book={book}
                            onEdit={() => onEdit(book)}
                            onDelete={() => onDelete(book)}
                            isDeleting={deletingBookId === book.publicId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PhoneBookCard({ book, onEdit, onDelete, isDeleting }) {
    const entryCount = Array.isArray(book.entries) ? book.entries.length : 0;
    return (
        <div className={`rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} p-5 flex flex-col gap-3`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className={`font-semibold ${uiColors.textPrimary} truncate`}>{book.name}</div>
                    {book.description && (
                        <p className={`text-xs ${uiColors.textSecondary} mt-0.5 line-clamp-2`}>{book.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={onEdit}
                        title="Edit"
                        className={`p-1.5 rounded-md ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}
                    >
                        <FiEdit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        title="Delete"
                        className="p-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                        {isDeleting ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            <div className={`flex items-center gap-2 text-xs ${uiColors.textSecondary}`}>
                <FiPhone className="w-3.5 h-3.5" />
                <span>{entryCount} {entryCount === 1 ? 'transfer rule' : 'transfer rules'}</span>
            </div>
            {entryCount > 0 && (
                <ul className="space-y-1">
                    {book.entries.slice(0, 3).map((e) => (
                        <li key={e.id} className={`text-xs ${uiColors.textPlaceholder} flex items-center gap-2 truncate`}>
                            <span className={`font-mono ${uiColors.textPrimary}`}>{e.number}</span>
                            {e.condition && <span className="truncate">→ {e.condition}</span>}
                        </li>
                    ))}
                    {entryCount > 3 && (
                        <li className={`text-xs ${uiColors.textPlaceholder}`}>+{entryCount - 3} more</li>
                    )}
                </ul>
            )}
        </div>
    );
}
