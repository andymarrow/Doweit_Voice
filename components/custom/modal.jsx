import React from 'react';
import { HiX } from 'react-icons/hi';

const Modal = ({ show, onClose, title, description }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-red-600">{title}</h2>
        <p className="mt-2 text-gray-700">{description}</p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200"
          >
            Close
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500"
        >
          <HiX size={24} />
        </button>
      </div>
    </div>
  );
};

export default Modal;
