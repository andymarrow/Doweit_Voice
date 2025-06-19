// characterai/create/layout.jsx
import React from 'react';

export default function CharacteraiCreateLayout({ children }) {
  return (
    // Potentially add padding or a max-width container here if consistent across all pages within create
    // Kept the padding as is
    <div className="p-4 md:p-6 lg:p-8 w-full mx-auto max-w-screen-xl"> {/* Added max-width and mx-auto */}
        {children}
    </div>
  );
}