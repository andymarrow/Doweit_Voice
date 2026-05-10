"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, RefreshCw, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { QuizPlayer } from '../../../modules/QuizEngine';

// Per-interview quiz page. Pulls the parent interview to derive the title +
// expected count, generates a quiz from the same prompt+questions used for
// the spoken interview, then hands off to QuizPlayer. On finish, the player
// POSTs the attempt with interviewId so it shows up in the user's history.
export default function TraineeInterviewQuizPage() {
  const { interviewid } = useParams();
  const router = useRouter();

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the interview first so we know the title + question count to
      // request, and so we can fail fast if the interview doesn't exist.
      const ivRes = await fetch(`/api/trainee/interview/${interviewid}`, { cache: 'no-store' });
      const ivJson = await ivRes.json();
      if (!ivRes.ok) throw new Error(ivJson.error || 'Interview not found');
      setInterview(ivJson.data);

      const genRes = await fetch('/api/trainee/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: interviewid,
          count: ivJson.data?.questionCount || 10,
        }),
      });
      const genJson = await genRes.json();
      if (!genRes.ok) throw new Error(genJson.error || 'Quiz generation failed');
      const qs = (genJson.questions || []).filter(
        (q) => Array.isArray(q.options) && q.options.length >= 2
      );
      if (qs.length === 0) throw new Error('No quiz questions returned');
      setQuestions(qs);
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Generating quiz from your interview…
      </div>
    );
  }

  if (error || !questions) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-900/40 flex items-center justify-center text-purple-300">
            <BookOpen size={20} />
          </div>
          <h2 className="text-white font-black text-lg">Couldn&apos;t prepare quiz</h2>
          <p className="text-gray-400 text-xs">{error || 'Unknown error.'}</p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => router.push('/trainee?section=sessions')}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-black hover:bg-white/20 flex items-center gap-1.5"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <button
              onClick={load}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black flex items-center gap-1.5"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuizPlayer
      title={interview?.title || 'Quiz'}
      interviewId={interviewid}
      questions={questions}
      onExit={() => router.push('/trainee?section=sessions')}
      onSubmitted={(savedAttemptId) => {
        if (savedAttemptId) {
          router.push(`/trainee/interview/${interviewid}/quiz/result/${savedAttemptId}`);
        } else {
          router.push('/trainee?section=sessions');
        }
      }}
    />
  );
}
