// app/not-found.js
import Link from 'next/link';
import { accentClasses, uiColors } from './callagents/_constants/uiConstants';

export default function NotFound() {
  return (
    <div className={`${uiColors.bgPage} ${uiColors.textPrimary} flex min-h-screen flex-col items-center justify-center p-4 text-center`}>
      <h1 className={`text-6xl font-extrabold ${uiColors.accentPrimary} mb-4`}>404</h1>
      <p className={`mb-8 text-2xl font-semibold ${uiColors.textSecondary}`}>
        Oops! We couldn't find that page.
      </p>

      <div className={`mb-8 max-w-2xl rounded-lg p-6 shadow-lg ${uiColors.bgPrimary} ${uiColors.borderPrimary} border`}>
        <h3 className={`mb-4 text-xl font-bold ${uiColors.textPrimary}`}>
          While you're here, explore what powers our amazing Voice Agents:
        </h3>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <li className={`${accentClasses.badgeBg} ${accentClasses.textAccent} rounded-full px-4 py-2 font-medium`}>
            <span className="font-bold">Convex:</span> Realtime Database
          </li>
          <li className={`${accentClasses.badgeBg} ${accentClasses.textAccent} rounded-full px-4 py-2 font-medium`}>
            <span className="font-bold">OpenAI:</span> Advanced AI Models
          </li>
          <li className={`${accentClasses.badgeBg} ${accentClasses.textAccent} rounded-full px-4 py-2 font-medium`}>
            <span className="font-bold">Better Auth:</span> Secure Authentication
          </li>
          <li className={`${accentClasses.badgeBg} ${accentClasses.textAccent} rounded-full px-4 py-2 font-medium`}>
            <span className="font-bold">Resend:</span> Email Delivery
          </li>
          <li className={`${accentClasses.badgeBg} ${accentClasses.textAccent} rounded-full px-4 py-2 font-medium`}>
            <span className="font-bold">Vapi:</span> Voice API
          </li>
        </ul>
      </div>

      {/* New Section for Call Agents & Vibe Apps video */}
      <div className={`mb-12 max-w-2xl rounded-lg p-6 shadow-lg ${uiColors.bgPrimary} ${uiColors.borderPrimary} border`}>
        <h3 className={`mb-4 text-xl font-bold ${uiColors.textPrimary}`}>
          Discover the power of our Call Agents!
        </h3>
        <p className={`${uiColors.textSecondary} mb-6`}>
          To learn how to use them best and unleash their full potential, check out our in-depth video on Vibe Apps.
        </p>
        <a
          href="https://vibeapps.dev/s/doweit-voice"
          target="_blank"
          rel="noopener noreferrer"
          className={`group inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-lg font-semibold text-white transition-all duration-300 ${accentClasses.buttonGradient}`}
        >
          Watch the Tutorial Video
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 transform transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        </a>
        <p className={`${uiColors.textSecondary} mt-4 text-sm italic`}>
          And while you're there, don't forget to <span className={`text-2xl ${uiColors.accentPrimary} font-extrabold`}>smash the like button and vote for us!</span> Your support helps us grow!
        </p>
      </div>

      <Link href="/voice-agents-dashboard" className={`group flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-lg font-semibold text-white transition-all duration-300 ${accentClasses.buttonGradient}`}>
          Go to Voice Agents Dashboard
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
      </Link>
      
      {/* Optional: Add a playful image here */}
      <div className="mt-12">
        {/*
          If you have a playful image for 404 pages (e.g., a cute animal, a broken robot),
          you can uncomment and use it here. Make sure the path is correct.
          For example: <img src="/cuteanimals/hamsterCute-removebg-preview.png" alt="404 Page Not Found" className="max-w-xs md:max-w-sm" />
        */}
      </div>
    </div>
  );
}