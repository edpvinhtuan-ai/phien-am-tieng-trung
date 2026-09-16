import React, { useState, useEffect } from "react";
import { BookOpen, Mic, BrainCircuit, Calendar, Flame, Award, Volume2, Globe } from "lucide-react";
import { UserStats } from "../types";
import { MandarinDialect, getSavedMandarinDialect, setSavedMandarinDialect } from "../utils/audioHelper";

export type NavTab = "table" | "practice" | "quiz" | "history";

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  stats: UserStats;
  onDialectChange?: (dialect: MandarinDialect) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, stats, onDialectChange }) => {
  const [dialect, setDialect] = useState<MandarinDialect>(getSavedMandarinDialect());

  const handleDialectChange = (newDialect: MandarinDialect) => {
    setDialect(newDialect);
    setSavedMandarinDialect(newDialect);
    if (onDialectChange) {
      onDialectChange(newDialect);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white shadow-sm font-serif font-black text-xl select-none tracking-tight">
              ㄅP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Học Phiên Âm Tiếng Trung
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80">
                  Pinyin &amp; Bopomofo
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Bính âm Latin &bull; Chú âm ㄅㄆㄇㄈ &bull; Luyện giọng AI &bull; Theo dõi tiến độ
              </p>
            </div>
          </div>

          {/* Controls & Quick Stats Badges */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 shrink-0">
            {/* Mandarin Voice Switcher */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80 text-xs">
              <span className="px-2 font-semibold text-slate-600 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Giọng phát âm:</span>
              </span>
              <button
                id="voice-dialect-cn"
                onClick={() => handleDialectChange("zh-CN")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  dialect === "zh-CN"
                    ? "bg-white text-red-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Chuẩn Tiếng Phổ Thông (Đại Lục / Bắc Kinh) - Loại bỏ tiếng Quảng Đông"
              >
                Phổ thông (zh-CN)
              </button>
              <button
                id="voice-dialect-tw"
                onClick={() => handleDialectChange("zh-TW")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  dialect === "zh-TW"
                    ? "bg-white text-red-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Chuẩn Tiếng Phổ Thông (Đài Loan / Quốc ngữ)"
              >
                Quốc ngữ (zh-TW)
              </button>
            </div>

            {/* Streak */}
            <div
              id="header-streak-badge"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 shadow-xs"
              title="Chuỗi ngày luyện tập liên tiếp"
            >
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
              <span>
                {stats.currentStreak} <span className="font-normal text-amber-700 hidden sm:inline">ngày</span>
              </span>
            </div>

            {/* Average Score */}
            <div
              id="header-score-badge"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 shadow-xs"
              title="Điểm phát âm AI trung bình"
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>
                {stats.averageScore || 0} <span className="font-normal text-emerald-700">điểm</span>
              </span>
            </div>

            {/* Total practiced */}
            <div
              id="header-practiced-badge"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <span>Đã luyện: <strong>{stats.totalPracticedCount}</strong> lượt</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-100 pt-2 pb-2.5 overflow-x-auto no-scrollbar">
          <button
            id="nav-tab-table"
            onClick={() => onSelectTab("table")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "table"
                ? "bg-red-600 text-white shadow-xs shadow-red-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bảng Ngữ Âm (Pinyin &amp; Chú âm)</span>
          </button>

          <button
            id="nav-tab-practice"
            onClick={() => onSelectTab("practice")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "practice"
                ? "bg-red-600 text-white shadow-xs shadow-red-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Luyện Phát Âm Với AI</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950">
              AI
            </span>
          </button>

          <button
            id="nav-tab-quiz"
            onClick={() => onSelectTab("quiz")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "quiz"
                ? "bg-red-600 text-white shadow-xs shadow-red-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Trắc Nghiệm Phản Xạ</span>
          </button>

          <button
            id="nav-tab-history"
            onClick={() => onSelectTab("history")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "history"
                ? "bg-red-600 text-white shadow-xs shadow-red-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch Sử &amp; Tiến Độ Học</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
