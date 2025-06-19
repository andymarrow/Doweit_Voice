import React, { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiOutlineTrash } from 'react-icons/hi2';

export default function DropDownOption({ children, handleOnDelete }) {
    const [openModal, setOpenModal] = useState(false);

    const handleDeleteClick = async () => {
        setOpenModal(false); // Close modal before proceeding with delete
        await handleOnDelete(); // Call the delete handler
    };

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setOpenModal(true)} className="gap-3">
                        <HiOutlineTrash /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Custom Modal */}
            {openModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                        <h2 className="text-lg font-semibold">Are you absolutely sure?</h2>
                        <p className="mt-2 text-gray-600">
                            This action cannot be undone. This will permanently delete your course.
                        </p>
                        <div className="mt-4 flex justify-end">
                            <button 
                                className="mr-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" 
                                onClick={() => setOpenModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700" 
                                onClick={handleDeleteClick}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}