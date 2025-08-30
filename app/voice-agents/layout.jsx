import React from 'react';
import Header from './_components/header';


export default function VoiceAgentsLayout({ children }) {
  return (
    <div>
    
        <Header />
        <div className=""> {/* Add padding-top equal to header height to prevent content overlap */}
          {children}
        </div>

    </div>
  );
}

