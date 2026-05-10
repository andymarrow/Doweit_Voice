"use client";
import React from "react";
import {
  ExternalLink,
  Briefcase,
  Copy,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { fmtDate } from "./utils";

export const ConfigurationTab = ({ interview }) => {
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const magicLink =
    interview?.magicLink ||
    (interview?.id ? `${appUrl}/candidate/${interview.id}` : null);

  const copyLink = (link) => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success("Copied!");
    }
  };

  const fields = [
    { label: "Title", value: interview?.title || "—" },
    { label: "Department", value: interview?.department || "—" },
    { label: "Location", value: interview?.location || "—" },
    { label: "Employment Type", value: interview?.employmentType || "—" },
    { label: "Experience", value: interview?.requiredExperience || "—" },
    { label: "Language", value: interview?.language || "—" },
    { label: "Voice Provider", value: interview?.voiceProvider || "Vapi" },
    { label: "Tone", value: interview?.tone || "—" },
    { label: "Duration", value: `${interview?.duration || 30} min` },
    { label: "Questions", value: interview?.questionCount || "—" },
    { label: "Access Type", value: interview?.accessType || "—" },
    {
      label: "Price",
      value: interview?.price != null ? `$${interview.price}` : "Free",
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Position info */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
                <Briefcase size={12} className="text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                Position Details
              </h3>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((f, i) => (
              <div
                key={i}
                className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"
              >
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {f.label}
                </p>
                <p className="text-xs font-semibold text-gray-800">
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: links + anti-cheat + prompt */}
        <div className="space-y-4">
          {/* Magic link */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                  <ExternalLink size={12} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Interview Links
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Interview Link
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 overflow-hidden">
                    <p className="text-[11px] font-mono text-blue-800 truncate">
                      {magicLink || "No link available"}
                    </p>
                  </div>
                  <button
                    onClick={() => copyLink(magicLink)}
                    disabled={!magicLink}
                    className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Start Date",
                    value: fmtDate(interview?.startDate),
                  },
                  { label: "End Date", value: fmtDate(interview?.endDate) },
                  {
                    label: "Reg. Start",
                    value: fmtDate(interview?.registrationStartDate),
                  },
                  {
                    label: "Reg. End",
                    value: fmtDate(interview?.registrationEndDate),
                  },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"
                  >
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      {f.label}
                    </p>
                    <p className="text-xs font-semibold text-gray-800">
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Anti-cheat */}
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield size={12} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Anti-Cheat Protection
                </p>
                <p className="text-[10px] text-gray-400">
                  Monitors tab switching & focus
                </p>
              </div>
            </div>
            <div
              className={cn(
                "relative w-10 h-5 rounded-full transition-colors",
                interview?.antiCheatEnabled ? "bg-purple-600" : "bg-gray-300",
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                  interview?.antiCheatEnabled ? "right-0.5" : "left-0.5",
                )}
              />
            </div>
          </div>

          {/* System prompt */}
          {interview?.systemPrompt && (
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
                    <Zap size={12} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    System Prompt
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="h-36 overflow-y-auto rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <pre className="text-[11px] text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {interview.systemPrompt}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
