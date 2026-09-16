/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header, NavTab } from "./components/Header";
import { PinyinBopomofoTable } from "./components/PinyinBopomofoTable";
import { PronunciationPractice } from "./components/PronunciationPractice";
import { QuizMode } from "./components/QuizMode";
import { HistoryProgress } from "./components/HistoryProgress";
import { SoundGuideModal } from "./components/SoundGuideModal";
import { PhoneticItem, UserStats } from "./types";
import { ALL_PHONETICS } from "./data/phoneticsData";
import { getUserStats } from "./utils/storage";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("table");
  const [selectedPhonetic, setSelectedPhonetic] = useState<PhoneticItem>(ALL_PHONETICS[0]);
  const [modalItem, setModalItem] = useState<PhoneticItem | null>(null);
  const [stats, setStats] = useState<UserStats>(getUserStats());

  // Reload stats whenever storage updates
  const refreshStats = () => {
    setStats(getUserStats());
  };

  const handleSelectForPractice = (item: PhoneticItem) => {
    setSelectedPhonetic(item);
    setActiveTab("practice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectNextItem = () => {
    const currentIndex = ALL_PHONETICS.findIndex((i) => i.id === selectedPhonetic.id);
    const nextIndex = (currentIndex + 1) % ALL_PHONETICS.length;
    setSelectedPhonetic(ALL_PHONETICS[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
      {/* Navigation Header */}
      <Header activeTab={activeTab} onSelectTab={setActiveTab} stats={stats} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "table" && (
          <PinyinBopomofoTable
            onSelectForPractice={handleSelectForPractice}
            onOpenSoundGuide={(item) => setModalItem(item)}
          />
        )}

        {activeTab === "practice" && (
          <PronunciationPractice
            selectedItem={selectedPhonetic}
            onSelectNextItem={handleSelectNextItem}
            onOpenSoundGuide={(item) => setModalItem(item)}
            onRecordSaved={refreshStats}
          />
        )}

        {activeTab === "quiz" && (
          <QuizMode
            onPracticeItem={(item) => handleSelectForPractice(item)}
          />
        )}

        {activeTab === "history" && (
          <HistoryProgress
            stats={stats}
            onSelectForPractice={handleSelectForPractice}
            onDataCleared={refreshStats}
          />
        )}
      </main>

      {/* Sound Guide & Tongue Position Modal */}
      <SoundGuideModal
        item={modalItem}
        onClose={() => setModalItem(null)}
        onPracticeItem={(item) => handleSelectForPractice(item)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Học Phiên Âm Tiếng Trung &bull; Hanyu Pinyin &amp; Bopomofo (Chú Âm Phù Hiệu ㄅㄆㄇㄈ)
          </p>
          <p className="text-slate-400">
            Hỗ trợ luyện phát âm kiểm tra độ chuẩn xác bằng AI &bull; Lưu trữ tiến độ học mỗi ngày
          </p>
        </div>
      </footer>
    </div>
  );
}
