import React from 'react';
import Header from './_components/header';
import { ThemeProvider } from 'next-themes';


export default function VoiceAgentsLayout({ children }) {
  return (
    <div>
      <ThemeProvider attribute="class" defaultTheme="dark">

        <Header />
        <div className=""> {/* Add padding-top equal to header height to prevent content overlap */}
          {children}
        </div>
      </ThemeProvider>
    </div>
  );
}

