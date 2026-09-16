import React, { useState, useMemo } from "react";
import {
  Calendar,
  Flame,
  Award,
  TrendingUp,
  Volume2,
  Mic,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DailyStudySummary, PhoneticItem, StudyLogItem, UserStats } from "../types";
import { getDailyProgressSummaries, getStudyHistory, clearAllHistory } from "../utils/storage";
import { ALL_PHONETICS } from "../data/phoneticsData";
import { playNativeAudio } from "../utils/audioHelper";

interface HistoryProgressProps {
  stats: UserStats;
  onSelectForPractice: (item: PhoneticItem) => void;
  onDataCleared: () => void;
}

export const HistoryProgress: React.FC<HistoryProgressProps> = ({
  stats,
  onSelectForPractice,
  onDataCleared,
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "needs_work" | "excellent">("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Read latest daily summaries and full history
  const dailySummaries = useMemo(() => getDailyProgressSummaries(), [stats]);
  const allLogs = useMemo(() => getStudyHistory(), [stats]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (filterMode === "excellent") {
      return allLogs.filter((l) => l.score >= 90);
    }
    if (filterMode === "needs_work") {
      return allLogs.filter((l) => l.score < 85);
    }
    return allLogs;
  }, [allLogs, filterMode]);

  // 7-day trend calculation
  const last7Days = useMemo(() => {
    const days: { dateStr: string; label: string; count: number; avgScore: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const label = i === 0 ? "Hôm nay" : i === 1 ? "Hôm qua" : dayNames[d.getDay()];

      const summary = dailySummaries.find((s) => s.date === dateStr);
      days.push({
        dateStr,
        label,
        count: summary ? summary.itemsPracticed : 0,
        avgScore: summary ? summary.averageScore : 0,
      });
    }
    return days;
  }, [dailySummaries]);

  const maxDailyCount = Math.max(5, ...last7Days.map((d) => d.count));

  const handlePracticeSound = (pinyin: string) => {
    const match = ALL_PHONETICS.find((item) => item.pinyin === pinyin || item.exampleWord === pinyin);
    if (match) {
      onSelectForPractice(match);
    } else {
      // Fallback
      onSelectForPractice(ALL_PHONETICS[0]);
    }
  };

  const handleConfirmClear = () => {
    clearAllHistory();
    setShowClearConfirm(false);
    onDataCleared();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner with Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {stats.currentStreak} <span className="text-xs font-semibold text-slate-500">ngày</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Chuỗi ngày học liên tục</p>
          </div>
        </div>

        {/* Total Practiced */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {stats.totalPracticedCount} <span className="text-xs font-semibold text-slate-500">lượt</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Tổng số âm đã luyện</p>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {stats.averageScore || 0} <span className="text-xs font-semibold text-slate-500">/100</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Điểm phát âm AI trung bình</p>
          </div>
        </div>

        {/* Mastered Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {stats.masteredIds?.length || 0} <span className="text-xs font-semibold text-slate-500">âm</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Âm đã đạt chuẩn (&ge;85đ)</p>
          </div>
        </div>
      </div>

      {/* 7-Day Activity Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Tiến Độ Học Tập 7 Ngày Gần Nhất
            </h3>
          </div>
          <span className="text-xs text-slate-500">Mục tiêu: Đều đặn mỗi ngày</span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-6 pb-2 items-end h-48 border-b border-slate-100">
          {last7Days.map((day) => {
            const heightPercent = Math.max(10, Math.round((day.count / maxDailyCount) * 100));
            const hasActivity = day.count > 0;

            return (
              <div key={day.dateStr} className="flex flex-col items-center h-full justify-end group">
                {/* Count tooltip */}
                <span className="text-[11px] font-bold text-slate-600 mb-1 opacity-80 group-hover:opacity-100">
                  {day.count > 0 ? `${day.count} bài` : "0"}
                </span>

                {/* Vertical Bar */}
                <div className="w-full max-w-[40px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-32 relative">
                  <div
                    className={`w-full transition-all duration-500 rounded-t-xl ${
                      hasActivity
                        ? day.avgScore >= 90
                          ? "bg-emerald-500 group-hover:bg-emerald-600"
                          : day.avgScore >= 80
                          ? "bg-red-600 group-hover:bg-red-700"
                          : "bg-amber-500 group-hover:bg-amber-600"
                        : "bg-slate-200"
                    }`}
                    style={{ height: hasActivity ? `${heightPercent}%` : "6px" }}
                  />
                </div>

                {/* Date Label */}
                <span className="text-xs font-medium text-slate-600 mt-2 truncate w-full text-center">
                  {day.label}
                </span>
                {day.avgScore > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {day.avgScore}đ
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History Log Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Nhật Ký Luyện Phát Âm Chi Tiết
            </h3>
            <p className="text-xs text-slate-500">
              Lưu lại nhận xét của AI, điểm số và âm thanh để xem lại sự tiến bộ.
            </p>
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                id="filter-all-logs"
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterMode === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Tất cả ({allLogs.length})
              </button>
              <button
                id="filter-needs-work"
                onClick={() => setFilterMode("needs_work")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterMode === "needs_work" ? "bg-white text-rose-700 shadow-xs" : "text-slate-600"
                }`}
              >
                Cần luyện thêm (&lt;85đ)
              </button>
              <button
                id="filter-excellent"
                onClick={() => setFilterMode("excellent")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterMode === "excellent" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600"
                }`}
              >
                Xuất sắc (&ge;90đ)
              </button>
            </div>

            {allLogs.length > 0 && (
              <button
                id="btn-clear-history"
                onClick={() => setShowClearConfirm(true)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Xóa toàn bộ lịch sử"
                aria-label="Xóa lịch sử"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Clear Confirmation */}
        {showClearConfirm && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 text-xs sm:text-sm text-rose-900">
            <span>Bạn có chắc chắn muốn xóa toàn bộ lịch sử luyện tập và tiến độ?</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 bg-white border border-rose-200 rounded-xl text-slate-700 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        )}

        {/* Log List */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-500 text-sm">Chưa có bản ghi nào phù hợp.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const dateObj = new Date(log.timestamp);
              const timeString = `${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

              return (
                <div
                  key={log.id}
                  id={`log-item-${log.id}`}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Score circle */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shrink-0 ${
                          log.score >= 90
                            ? "bg-emerald-500"
                            : log.score >= 80
                            ? "bg-blue-600"
                            : "bg-amber-500"
                        }`}
                      >
                        {log.score}
                      </div>

                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-slate-900">
                            {log.targetWord}
                          </span>
                          <span className="font-semibold text-red-600 text-sm font-mono">
                            {log.pinyin}
                          </span>
                          <span className="text-xs bg-amber-100 text-amber-900 font-mono px-2 py-0.5 rounded font-medium">
                            {log.bopomofo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {log.dateStr} lúc {timeString}
                          </span>
                          <span>&bull;</span>
                          <span className="font-medium text-slate-700">{log.accuracyLevel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => playNativeAudio(log.targetWord || log.pinyin)}
                        className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                        title="Nghe lại âm chuẩn"
                      >
                        <Volume2 className="w-4 h-4 text-red-600" />
                      </button>

                      <button
                        onClick={() => handlePracticeSound(log.pinyin)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Luyện lại</span>
                      </button>

                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                        title={isExpanded ? "Thu gọn" : "Xem nhận xét AI"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable AI Feedback */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-700 bg-white p-3 rounded-xl">
                      <strong className="block text-slate-900 mb-1">
                        💡 Lời khuyên của AI chuyên gia:
                      </strong>
                      <p className="leading-relaxed">{log.feedbackVi}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
