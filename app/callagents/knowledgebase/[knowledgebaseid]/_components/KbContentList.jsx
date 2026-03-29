// app/callagents/knowledgebase/[knowledgebaseid]/_components/KbContentList.jsx
"use client";

import React, { useState } from 'react';
import { FiFileText, FiLink, FiFile, FiAlertCircle, FiTrash2, FiLoader, FiChevronDown, FiChevronUp } from 'react-icons/fi';

import { uiColors } from '../../../_constants/uiConstants';

const getContentIcon = (item) => {
    if (!item || !item.type) return null;
    switch (item.type) {
        case 'text':
            return <FiFileText className={`w-4 h-4 ${uiColors.textSecondary}`} />;
        case 'url':
            return <FiLink className={`w-4 h-4 ${uiColors.textSecondary}`} />;
        case 'file':
            return <FiFile className={`w-4 h-4 ${uiColors.textSecondary}`} />;
        case 'unknown':
            return <FiAlertCircle className={`w-4 h-4 text-orange-500`} />;
        default:
            return null;
    }
};

function ContentItem({ item, isOwner, onDelete, isDeleting, isExpanded, onToggleExpand }) {
    const text = item?.value !== undefined && item.value !== null ? String(item.value) : '';
    const filename = item.metadata?.filename ? ` (from ${item.metadata.filename})` : '';
    const truncated = text.length > 300;
    const displayText = !isExpanded && truncated ? `${text.substring(0, 300)}…` : text;

    return (
        <div className={`p-4 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary} flex items-start space-x-3`}>
            <div className="flex-shrink-0 mt-1">
                {getContentIcon(item)}
            </div>
            <div className="flex-grow min-w-0">
                <div className={`text-xs font-medium ${uiColors.textSecondary} uppercase mb-1 flex items-center gap-2`}>
                    <span>{item.type || 'unknown'}</span>
                    {item.status && item.status !== 'ready' && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            item.status === 'processing' ? `${uiColors.statusBadgeWarningBg} ${uiColors.statusBadgeWarningText}` :
                            item.status === 'failed' ? `${uiColors.statusBadgeDangerBg} ${uiColors.statusBadgeDangerText}` :
                            `${uiColors.statusBadgeInfoBg} ${uiColors.statusBadgeInfoText}`
                        }`}>
                            {item.status}
                            {item.status === 'processing' && <FiLoader className="inline-block ml-1 w-3 h-3 animate-spin" />}
                        </span>
                    )}
                </div>
                <div className={`text-sm ${uiColors.textPrimary} whitespace-pre-wrap break-words`}>
                    {item.type === 'url' ? (
                        <a href={text} target="_blank" rel="noopener noreferrer" className="underline">
                            {item.metadata?.title || text}
                        </a>
                    ) : (
                        <>
                            {displayText}
                            {filename && <span className={`${uiColors.textPlaceholder} text-xs ml-1`}>{filename}</span>}
                        </>
                    )}
                </div>
                {truncated && item.type !== 'url' && (
                    <button
                        onClick={onToggleExpand}
                        className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${uiColors.accentPrimary} hover:underline`}
                    >
                        {isExpanded ? <><FiChevronUp className="w-3 h-3" /> Show less</> : <><FiChevronDown className="w-3 h-3" /> Show full</>}
                    </button>
                )}
                {item.addedAt && (
                    <div className={`text-xs ${uiColors.textPlaceholder} mt-1`}>
                        Added: {new Date(item.addedAt).toLocaleString()}
                    </div>
                )}
            </div>
            {isOwner && (
                <div className="flex-shrink-0">
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        title="Delete this entry"
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded disabled:opacity-50"
                    >
                        {isDeleting ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
                    </button>
                </div>
            )}
        </div>
    );
}

function KbContentList({ content, isOwner, onDeleteItem, deletingItemId }) {
    const [expandedIds, setExpandedIds] = useState(new Set());

    if (!content || content.length === 0) {
        return (
            <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                No content added to this knowledge base yet. Use the section below to add some.
            </div>
        );
    }

    const toggle = (id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <div className="space-y-4">
            {content.map((item, index) => {
                const key = item.id || `item-${index}`;
                return (
                    <ContentItem
                        key={key}
                        item={item}
                        isOwner={isOwner}
                        isExpanded={expandedIds.has(key)}
                        onToggleExpand={() => toggle(key)}
                        isDeleting={deletingItemId === key}
                        onDelete={() => onDeleteItem?.(item, index)}
                    />
                );
            })}
        </div>
    );
}

export default KbContentList;
