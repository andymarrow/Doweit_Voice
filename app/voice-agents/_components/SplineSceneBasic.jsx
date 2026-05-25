"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import Link from 'next/link';

export function SplineSceneBasic() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className={`w-full h-[500px] mt-5 relative overflow-hidden rounded-xl transition-colors duration-300 ${isDark ? "bg-gray-950" : "bg-purple-50"}`}>
      {/* Spotlight tint — softer in light mode */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill={isDark ? "#ee46bd" : "#875bf9"}
      />

      {/* Glow blobs */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/20 blur-3xl rounded-full pointer-events-none z-[1]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-secondary/10 blur-3xl rounded-full pointer-events-none z-[1]" />

      <div className="flex h-full">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6 w-fit border backdrop-blur-md transition-colors duration-300 ${
            isDark
              ? "bg-white/10 border-white/20 text-white/90"
              : "bg-primary/10 border-primary/20 text-primary"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? "bg-secondary" : "bg-secondary"}`} />
            Meet Your AI Workforce
          </div>

          <h1 className={`text-4xl md:text-5xl font-bold leading-tight mb-4 transition-colors duration-300 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Talk to Doweit,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              your voice-first
            </span>{" "}
            AI agent.
          </h1>

          <p className={`text-lg my-8 leading-relaxed max-w-md transition-colors duration-300 ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}>
            From your everyday customer support, to planning for your future with
            automated sales, Doweit Voice helps you get more from your conversations.
          </p>

          <Link
            href="/voice-agents-dashboard"
            className="px-8 py-4 bg-primary hover:opacity-90 text-white font-medium rounded-full transition-opacity text-center w-fit"
          >
            Get Started Now
          </Link>
        </div>

        {/* Right — 3D robot */}
        <div className="flex-1 relative">
          <div className={`absolute inset-0 z-0 transition-colors duration-300 ${isDark ? "bg-gray-950" : "bg-purple-50"}`} />
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full relative z-10"
          />

          {/* Doweit badge over the robot torso */}
          <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[11px] font-extrabold uppercase tracking-[0.25em] shadow-[0_0_20px_rgba(135,91,249,0.6)] border border-white/30 backdrop-blur-sm">
              Doweit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
