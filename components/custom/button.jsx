import React from 'react';

const Button = ({ children, className, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex justify-start items-center text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 rounded-md ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
