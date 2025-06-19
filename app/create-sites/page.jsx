import React from 'react';
import Hero from './_components/Hero';

function CreateSitesMainScreen() {
  return (
    // Wrap everything with CreateSitesLayout which provides the context


    <div className="p-5 bg-white dark:bg-black dark:text-white min-h-screen">
      <Hero />
    </div>

  );
}

export default CreateSitesMainScreen;
