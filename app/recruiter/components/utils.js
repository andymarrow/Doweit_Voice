// app/recruiter/components/utils.js
// Shared formatting + scoring helpers used by every InterviewDetail tab.

export const calcScore = (candidate, resultsMap) => {
  const raw = resultsMap[candidate?.publicId]?.result ?? candidate?.result;
  if (!raw) return 0;
  const arr =
    typeof raw === "string"
      ? (() => {
          try {
            return JSON.parse(raw);
          } catch {
            return [];
          }
        })()
      : raw;
  if (Array.isArray(arr))
    return Math.round(
      arr.reduce((s, c) => s + (typeof c.score === "number" ? c.score : 0), 0),
    );
  if (typeof arr?.score === "number") return arr.score;
  return 0;
};

export const getReason = (candidate, resultsMap) => {
  const r =
    resultsMap[candidate?.publicId]?.reasonResult ?? candidate?.reasonResult;
  return typeof r === "string" ? r : r ? String(r) : "Not evaluated";
};

export const scoreColor = (s) =>
  s >= 70 ? "text-blue-600" : s >= 40 ? "text-purple-600" : "text-gray-500";

export const scoreBg = (s) =>
  s >= 70
    ? "bg-blue-50 border-blue-200"
    : s >= 40
      ? "bg-purple-50 border-purple-200"
      : "bg-gray-50 border-gray-200";

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";
