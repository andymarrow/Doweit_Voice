import React, { Suspense } from 'react';
import { FiLoader } from 'react-icons/fi';
import IntegrationsClientPage from './IntegrationsClientPage'; // Import the component you just renamed

// This tells Next.js to render this page dynamically at request time.
export const dynamic = 'force-dynamic';

// This is the new page component that wraps the old one in Suspense.
export default function IntegrationsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center w-full h-full">
        <FiLoader className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    }>
      <IntegrationsClientPage />
    </Suspense>
  );
}