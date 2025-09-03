//app/callagents/Integrations/layout.jsx
import React from 'react';
import IntegrationsSidebar from './_components/IntegrationsSidebar';
import { uiColors } from '../_constants/uiConstants';

// This layout creates the main structure for the integrations section,
// featuring a sidebar for navigation and a main content area.
export default function IntegrationsLayout({ children }) {
    return (
        <div className={`flex w-full h-full ${uiColors.bgPage}`}>
            <IntegrationsSidebar />
            <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}