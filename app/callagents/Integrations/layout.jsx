// app/callagents/Integrations/layout.jsx
import React from 'react';
import IntegrationsSidebar from './_components/IntegrationsSidebar'; // Import the updated component

export default function IntegrationsLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row h-full w-full">
        {/* The responsive sidebar/tab bar now lives in the layout */}
        <IntegrationsSidebar />

        {/* The main content area where the page.jsx will be rendered */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {children}
        </main>
    </div>
  );
}