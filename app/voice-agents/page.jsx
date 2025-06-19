import React from 'react';
import Hero from './_components/hero';
import Exploreagents from './_components/exploreagents';

// Import other sections like Services, Pricing, etc.

function VoiceAgentsMain() {
  return (
    <> {/* Use a fragment if adding multiple sections */}

      <Hero />
   
      <Exploreagents />

      {/* Add other sections below */}
      {/* <section id="services">...</section> */}
      {/* <section id="pricing">...</section> */}
      {/* etc. */}
    </>
  );
}

export default VoiceAgentsMain;