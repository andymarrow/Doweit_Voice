import Link from 'next/link';
import React from 'react';

export default function Hero() {
  return (
    <section className="m-2 rounded-md bg-gray-900 text-white">
      <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
            Unveil the Stories Behind the Legends.
            <span className="sm:block"> Elevate Your Inspiration. </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl sm:text-xl/relaxed">
          Doweit is an AI-powered web application designed to streamline course creation. It enables users to generate complete courses, including optional YouTube video integrations for each chapter, making it easy to create engaging learning experiences. For coding-related courses, Doweit can also provide sample code snippets to enhance learning. The platform features a Public Library, allowing users to explore and draw inspiration from courses created by others, as well as a Customize Yours section, where users can manage and refine their own course content.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              className="block w-full rounded border border-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring active:bg-blue-500 sm:w-auto"
              href={'/dashboard'}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
