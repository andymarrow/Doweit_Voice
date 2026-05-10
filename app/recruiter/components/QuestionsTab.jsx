"use client";
import React from "react";
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export const QuestionsTab = ({
  questions,
  setQuestions,
  isSavingQuestions,
  handleSaveQuestions,
  showAddQuestion,
  setShowAddQuestion,
  editQuestionIdx,
  setEditQuestionIdx,
  questionText,
  setQuestionText,
}) => {
  const saveQuestion = () => {
    if (!questionText.trim()) return;
    const updated = [...questions];
    if (editQuestionIdx === "new") {
      updated.push(questionText.trim());
    } else {
      updated[editQuestionIdx] = questionText.trim();
    }
    setQuestions(updated);
    setEditQuestionIdx(null);
    setShowAddQuestion(false);
    setQuestionText("");
  };

  const deleteQuestion = (i) =>
    setQuestions(questions.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <HelpCircle size={12} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Interview Questions
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 ml-1">
              {questions.length}
            </span>
          </div>
          <button
            onClick={() => {
              setShowAddQuestion(true);
              setEditQuestionIdx("new");
              setQuestionText("");
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus size={11} /> Add
          </button>
        </div>

        {questions.length === 0 && !showAddQuestion ? (
          <div className="text-center py-12">
            <HelpCircle size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-xs text-gray-400">No questions added yet</p>
            <button
              onClick={() => {
                setShowAddQuestion(true);
                setEditQuestionIdx("new");
                setQuestionText("");
              }}
              className="mt-3 text-xs text-blue-600 hover:underline font-medium"
            >
              Add your first question
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {questions.map((q, i) => (
              <div
                key={i}
                className="px-4 py-3 hover:bg-blue-50/20 transition-colors"
              >
                {editQuestionIdx === i ? (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-gray-400 mt-2 w-6 flex-shrink-0">
                      {i + 1}.
                    </span>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-2 rounded-lg border border-blue-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={saveQuestion}
                        className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle2 size={11} />
                      </button>
                      <button
                        onClick={() => {
                          setEditQuestionIdx(null);
                          setQuestionText("");
                        }}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 group">
                    <span className="text-[10px] font-bold text-blue-400 mt-0.5 w-6 flex-shrink-0">
                      {i + 1}.
                    </span>
                    <p className="flex-1 text-xs text-gray-800 leading-relaxed">
                      {q}
                    </p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditQuestionIdx(i);
                          setQuestionText(q);
                        }}
                        className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                      >
                        <Edit size={11} />
                      </button>
                      <button
                        onClick={() => deleteQuestion(i)}
                        className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* inline add row */}
            {showAddQuestion && editQuestionIdx === "new" && (
              <div className="px-4 py-3 bg-blue-50/30 border-t border-blue-100">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-gray-400 mt-2 w-6 flex-shrink-0">
                    {questions.length + 1}.
                  </span>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Type your question…"
                    rows={2}
                    autoFocus
                    className="flex-1 px-3 py-2 rounded-lg border border-blue-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none bg-white"
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={saveQuestion}
                      className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <CheckCircle2 size={11} />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddQuestion(false);
                        setEditQuestionIdx(null);
                        setQuestionText("");
                      }}
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {questions.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 flex justify-end">
            <button
              onClick={handleSaveQuestions}
              disabled={isSavingQuestions}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSavingQuestions ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <CheckCircle2 size={11} />
              )}
              {isSavingQuestions ? "Saving…" : "Save Questions"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
