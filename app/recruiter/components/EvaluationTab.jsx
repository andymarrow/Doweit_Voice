"use client";
import React from "react";
import {
  Target,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const EvaluationTab = ({
  criteria,
  setCriteria,
  weightSum,
  isSavingCriteria,
  handleSaveCriteria,
  showAddCriteria,
  setShowAddCriteria,
  editCriteriaIdx,
  setEditCriteriaIdx,
  criteriaName,
  setCriteriaName,
  criteriaWeight,
  setCriteriaWeight,
}) => {
  const isValid = weightSum === 100;

  const openEdit = (i) => {
    setEditCriteriaIdx(i);
    setCriteriaName(criteria[i].name);
    setCriteriaWeight(criteria[i].weight);
  };

  const saveEdit = () => {
    if (!criteriaName.trim()) return;
    const updated = [...criteria];
    if (editCriteriaIdx === "new") {
      updated.push({
        name: criteriaName.trim(),
        weight: Number(criteriaWeight),
      });
    } else {
      updated[editCriteriaIdx] = {
        ...updated[editCriteriaIdx],
        name: criteriaName.trim(),
        weight: Number(criteriaWeight),
      };
    }
    setCriteria(updated);
    setEditCriteriaIdx(null);
    setShowAddCriteria(false);
    setCriteriaName("");
    setCriteriaWeight(10);
  };

  const deleteCriteria = (i) =>
    setCriteria(criteria.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* weight warning */}
      {!isValid && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50 border border-purple-200">
          <AlertCircle size={14} className="text-purple-600 flex-shrink-0" />
          <p className="text-xs text-purple-800 font-medium">
            Weights must sum to 100%. Current total:{" "}
            <span className="font-bold">{weightSum}%</span>
          </p>
        </div>
      )}

      {/* criteria table */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
              <Target size={12} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Evaluation Criteria
            </h3>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full ml-1",
                isValid
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700",
              )}
            >
              {weightSum}% / 100%
            </span>
          </div>
          <button
            onClick={() => {
              setShowAddCriteria(true);
              setEditCriteriaIdx("new");
              setCriteriaName("");
              setCriteriaWeight(10);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-bold hover:bg-purple-700 transition-colors"
          >
            <Plus size={11} /> Add
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Criteria Name
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Bar
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {criteria.map((c, i) => (
                <tr
                  key={i}
                  className="hover:bg-purple-50/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    {editCriteriaIdx === i ? (
                      <input
                        value={criteriaName}
                        onChange={(e) => setCriteriaName(e.target.value)}
                        className="w-full px-2 py-1 rounded border border-purple-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-800">
                        {c.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editCriteriaIdx === i ? (
                      <input
                        type="number"
                        value={criteriaWeight}
                        onChange={(e) =>
                          setCriteriaWeight(Number(e.target.value))
                        }
                        min={1}
                        max={100}
                        className="w-20 px-2 py-1 rounded border border-purple-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    ) : (
                      <span className="text-xs font-bold text-purple-700">
                        {c.weight}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 w-40">
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{ width: `${Math.min(100, c.weight)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editCriteriaIdx === i ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <CheckCircle2 size={11} />
                          </button>
                          <button
                            onClick={() => setEditCriteriaIdx(null)}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            <X size={11} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openEdit(i)}
                            className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                          >
                            <Edit size={11} />
                          </button>
                          <button
                            onClick={() => deleteCriteria(i)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add row inline */}
        {showAddCriteria && editCriteriaIdx === "new" && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
            <input
              value={criteriaName}
              onChange={(e) => setCriteriaName(e.target.value)}
              placeholder="Criteria name…"
              className="flex-1 px-3 py-1.5 rounded-lg border border-purple-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <input
              type="number"
              value={criteriaWeight}
              onChange={(e) => setCriteriaWeight(Number(e.target.value))}
              min={1}
              max={100}
              className="w-20 px-2 py-1.5 rounded-lg border border-purple-300 text-xs focus:outline-none"
            />
            <span className="text-xs text-gray-500">%</span>
            <button
              onClick={saveEdit}
              className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddCriteria(false);
                setEditCriteriaIdx(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200"
            >
              <X size={11} />
            </button>
          </div>
        )}

        <div className="px-4 py-3 border-t border-gray-50 flex justify-end">
          <button
            onClick={handleSaveCriteria}
            disabled={!isValid || isSavingCriteria}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSavingCriteria ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <CheckCircle2 size={11} />
            )}
            {isSavingCriteria ? "Saving…" : "Save Criteria"}
          </button>
        </div>
      </div>
    </div>
  );
};
