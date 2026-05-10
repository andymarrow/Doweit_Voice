"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Permanent quiz-result page. The trainee can re-open this any time by
// clicking a past attempt in MySessions — the saved attempt row contains the
// questions and answers, so we just re-render the breakdown.
export default function TraineeQuizResultPage() {
  const { interviewid, attemptid } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/trainee/quiz/attempt/${attemptid}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!active) return;
        if (!res.ok) throw new Error(json.error || "Failed to load");
        setData(json.data);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [attemptid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading quiz result…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-3">
          <h2 className="text-white font-black text-lg">
            Couldn&apos;t load quiz result
          </h2>
          <p className="text-gray-400 text-xs">{error || "Not found."}</p>
          <button
            onClick={() => router.push("/trainee?section=sessions")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black"
          >
            Back to my interviews
          </button>
        </div>
      </div>
    );
  }

  const questions = Array.isArray(data.questions) ? data.questions : [];
  const answers = Array.isArray(data.answers) ? data.answers : [];
  const score = data.total
    ? Math.round(((data.score || 0) / data.total) * 100)
    : 0;
  const grade =
    score >= 85
      ? { label: "Excellent!", color: "text-blue-400" }
      : score >= 70
      ? { label: "Good Job!", color: "text-purple-400" }
      : { label: "Keep Going!", color: "text-gray-400" };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <button
          onClick={() => router.push("/trainee?section=sessions")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-bold"
        >
          <ArrowLeft size={13} /> Back to my interviews
        </button>

        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-900">
            <Trophy size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-lg">
              {data.title || "Quiz"}
            </h1>
            <p className={cn("text-3xl font-black mt-1", grade.color)}>
              {score}%
            </p>
            <p className="text-white text-sm font-black mt-0.5">
              {grade.label}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {data.score || 0} / {data.total || 0} correct ·{" "}
              {data.createdAt
                ? new Date(data.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
              Breakdown
            </p>
          </div>
          <div className="divide-y divide-gray-800">
            {questions.map((q, i) => {
              const ans = answers[i];
              const correct = ans?.correct;
              const selectedIdx = ans?.selectedIdx;
              return (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      correct
                        ? "bg-blue-900 text-blue-400"
                        : "bg-gray-800 text-gray-600",
                    )}
                  >
                    {correct ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-300 font-medium leading-snug">
                      {q.question}
                    </p>
                    <p className="text-[10px] text-blue-400 mt-1">
                      ✓ {q.options?.[q.answer]}
                    </p>
                    {selectedIdx != null && selectedIdx !== q.answer && (
                      <p className="text-[10px] text-red-400 mt-0.5">
                        ✗ Your answer: {q.options?.[selectedIdx]}
                      </p>
                    )}
                    {selectedIdx == null && (
                      <p className="text-[10px] text-yellow-400 mt-0.5">
                        Skipped / timed out
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/trainee?section=sessions")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-black flex items-center justify-center gap-1.5 border border-gray-700"
          >
            <ArrowLeft size={13} /> My interviews
          </button>
          <button
            onClick={() =>
              router.push(`/trainee/interview/${interviewid}/quiz`)
            }
            className="py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black hover:from-purple-700 hover:to-blue-700 flex items-center justify-center gap-1.5 shadow-lg"
          >
            <RefreshCw size={13} /> Retake quiz
          </button>
        </div>
      </div>
    </div>
  );
}
