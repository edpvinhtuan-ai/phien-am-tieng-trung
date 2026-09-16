import React, { useState, useMemo } from "react";
import { Volume2, Search, Info, Mic, Sparkles, Filter, CheckCircle2, Music2 } from "lucide-react";
import { PhoneticItem, PhoneticType } from "../types";
import { INITIALS_DATA, FINALS_DATA, TONES_DATA, VOCABULARY_PRACTICE_DATA } from "../data/phoneticsData";
import {
  playPhoneticAudio,
  playWordAudio,
  playToneAudio,
  PHONETIC_READING_MAP,
  getPhoneticReading,
  getSavedMandarinDialect,
} from "../utils/audioHelper";

interface PinyinBopomofoTableProps {
  onSelectForPractice: (item: PhoneticItem) => void;
  onOpenSoundGuide: (item: PhoneticItem) => void;
}

type DisplayStyle = "both" | "pinyin" | "bopomofo";

export const PinyinBopomofoTable: React.FC<PinyinBopomofoTableProps> = ({
  onSelectForPractice,
  onOpenSoundGuide,
}) => {
  const [activeTab, setActiveTab] = useState<PhoneticType>("initial");
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>("both");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [playingState, setPlayingState] = useState<{ id: string; mode: "phonetic" | "word"; slow: boolean } | null>(null);

  // Current dataset
  const currentList = useMemo(() => {
    switch (activeTab) {
      case "initial":
        return INITIALS_DATA;
      case "final":
        return FINALS_DATA;
      case "tone":
        return TONES_DATA;
      case "vocabulary":
        return VOCABULARY_PRACTICE_DATA;
      default:
        return INITIALS_DATA;
    }
  }, [activeTab]);

  // Available groups for filtering
  const groups = useMemo(() => {
    const set = new Set<string>();
    currentList.forEach((item) => set.add(item.group));
    return Array.from(set);
  }, [currentList]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return currentList.filter((item) => {
      const matchesGroup = selectedGroup === "all" || item.group === selectedGroup;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.pinyin.toLowerCase().includes(q) ||
        item.bopomofo.toLowerCase().includes(q) ||
        item.exampleWord.toLowerCase().includes(q) ||
        item.exampleMeaningVi.toLowerCase().includes(q) ||
        item.nameVi.toLowerCase().includes(q);
      return matchesGroup && matchesSearch;
    });
  }, [currentList, selectedGroup, searchQuery]);

  // Play phonetic sound (Âm đọc của phiên âm)
  const handlePlayPhonetic = async (item: PhoneticItem, slow = false) => {
    setPlayingState({ id: item.id, mode: "phonetic", slow });
    await playPhoneticAudio(item, slow);
    setPlayingState(null);
  };

  // Play example word (Chữ Hán ví dụ)
  const handlePlayWord = async (item: PhoneticItem, slow = false) => {
    setPlayingState({ id: item.id, mode: "word", slow });
    await playWordAudio(item, slow);
    setPlayingState(null);
  };

  const dialect = getSavedMandarinDialect();

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-end pr-8 pointer-events-none select-none text-9xl font-serif font-black">
          ㄅㄆ
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-semibold mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Phát âm chuẩn Tiếng Phổ Thông (Mandarin / 普通话)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Kho Ngữ Âm Tiếng Trung Chuẩn Bản Xứ
          </h2>
          <p className="mt-2 text-slate-200 text-sm sm:text-base leading-relaxed">
            Học song song chữ Latin (Pinyin) &amp; Chú âm Đài Loan (Bopomofo ㄅㄆㄇㄈ).
            Hỗ trợ <strong>phát âm âm đọc từ phiên âm</strong> lẫn <strong>chữ Hán ví dụ</strong> với giọng Tiếng Phổ Thông chuẩn (đã loại trừ tiếng Quảng Đông).
          </p>
        </div>
      </div>

      {/* Control Bar: Categories & View Mode */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            id="tab-initials"
            onClick={() => {
              setActiveTab("initial");
              setSelectedGroup("all");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "initial"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Thanh mẫu ({INITIALS_DATA.length})
          </button>
          <button
            id="tab-finals"
            onClick={() => {
              setActiveTab("final");
              setSelectedGroup("all");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "final"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Vận mẫu ({FINALS_DATA.length})
          </button>
          <button
            id="tab-tones"
            onClick={() => {
              setActiveTab("tone");
              setSelectedGroup("all");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "tone"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Thanh điệu ({TONES_DATA.length})
          </button>
          <button
            id="tab-vocab"
            onClick={() => {
              setActiveTab("vocabulary");
              setSelectedGroup("all");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "vocabulary"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Từ vựng mẫu ({VOCABULARY_PRACTICE_DATA.length})
          </button>
        </div>

        {/* Sub-filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-phonetic-input"
              type="text"
              placeholder="Tìm âm (vd: b, zh, ㄓ, ăn cơm, số tám...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Group Filter */}
            {groups.length > 1 && (
              <div className="relative shrink-0">
                <select
                  id="group-filter-select"
                  aria-label="Lọc theo nhóm âm"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="all">Tất cả nhóm</option>
                  {groups.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Display Mode toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 text-xs font-semibold">
              <button
                id="toggle-view-both"
                onClick={() => setDisplayStyle("both")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  displayStyle === "both" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Hiện cả Pinyin và Bopomofo"
              >
                Cả hai
              </button>
              <button
                id="toggle-view-pinyin"
                onClick={() => setDisplayStyle("pinyin")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  displayStyle === "pinyin" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Chỉ hiện Pinyin Latin"
              >
                Pinyin
              </button>
              <button
                id="toggle-view-bopomofo"
                onClick={() => setDisplayStyle("bopomofo")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  displayStyle === "bopomofo" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Chỉ hiện Bopomofo"
              >
                Chú âm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tone visual summary when Tone tab is selected */}
      {activeTab === "tone" && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 text-sm text-slate-800 space-y-5">
          <div>
            <div className="flex items-center gap-2 font-bold text-amber-900 mb-1.5">
              <Info className="w-4 h-4 text-amber-700" />
              <span className="text-base">Hệ thống 4 Dấu Thanh Điệu + Thanh Nhẹ trong Tiếng Trung Phổ Thông</span>
            </div>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
              Thanh điệu trong tiếng Trung là các <strong>dấu cao độ</strong> đặt trên nguyên âm chính, quyết định nghĩa của từ:
            </p>
          </div>

          {/* 5 Tone Cards with standalone tone mark symbols */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {TONES_DATA.map((toneItem) => {
              const isPlayingThisTone = playingState?.id === toneItem.id && playingState.mode === "phonetic";
              const isPlayingThisWord = playingState?.id === toneItem.id && playingState.mode === "word";
              return (
                <div
                  key={toneItem.id}
                  className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between text-left"
                >
                  <div>
                    {/* Tone Header & Name */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                        {toneItem.nameVi.split(":")[0]}
                      </span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                        {toneItem.toneLevel === 1
                          ? "5-5"
                          : toneItem.toneLevel === 2
                          ? "3-5"
                          : toneItem.toneLevel === 3
                          ? "2-1-4"
                          : toneItem.toneLevel === 4
                          ? "5-1"
                          : "Khinh"}
                      </span>
                    </div>

                    {/* Prominent Tone Mark Display */}
                    <div className="my-2 p-2.5 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-xl border border-amber-200/80 text-center">
                      <span className="text-[10px] text-amber-800 font-bold uppercase block tracking-wider mb-0.5">
                        Ký hiệu dấu thanh
                      </span>
                      {toneItem.isUnmarkedPinyin ? (
                        <div className="h-9 sm:h-10 flex items-center justify-center my-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-300 shadow-2xs text-xs font-bold text-amber-950">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Không ghi dấu (∅)
                          </span>
                        </div>
                      ) : (
                        <div className="h-9 sm:h-10 flex items-center justify-center text-3xl sm:text-4xl font-black text-red-600 font-mono leading-none my-1">
                          {toneItem.toneMarkPinyin || toneItem.pinyin}
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-800 block">
                        {toneItem.toneMarkNameVi || toneItem.nameVi}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-center gap-1.5">
                        <span>Chú âm:</span>
                        {toneItem.isUnmarkedBopomofo ? (
                          <span className="text-[10px] font-semibold text-slate-600 bg-white/90 px-2 py-0.5 rounded-full border border-amber-200">
                            Không ghi dấu
                          </span>
                        ) : (
                          <span className="font-bold text-red-600 font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200">
                            {toneItem.toneMarkBopomofo === "˙" ? "˙ (dấu chấm)" : (toneItem.toneMarkBopomofo || toneItem.bopomofo)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Example with word */}
                    <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-red-700">{toneItem.examplePinyin}</span>
                        <span className="text-lg font-serif text-slate-900">{toneItem.exampleWord}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {toneItem.exampleMeaningVi.split("(")[0]}
                      </span>
                    </div>

                    {/* Vowel list with this tone */}
                    {toneItem.toneVowelsList && (
                      <div className="mb-2">
                        <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                          Đánh trên 6 nguyên âm:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {toneItem.toneVowelsList.map((vowel) => (
                            <button
                              key={vowel}
                              onClick={() => playToneAudio(vowel, false)}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-200 hover:border-red-300 rounded font-mono text-xs font-bold transition-colors"
                              title={`Bấm nghe âm ${vowel}`}
                            >
                              {vowel}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                    <button
                      id={`btn-summary-tone-${toneItem.id}`}
                      onClick={() => handlePlayPhonetic(toneItem, false)}
                      disabled={isPlayingThisTone}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-xs"
                      title={`Nghe âm thanh điệu ${toneItem.pinyin}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{toneItem.pinyin}</span>
                    </button>
                    <button
                      id={`btn-summary-word-${toneItem.id}`}
                      onClick={() => handlePlayWord(toneItem, false)}
                      disabled={isPlayingThisWord}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                      title={`Nghe chữ ví dụ ${toneItem.exampleWord}`}
                    >
                      {toneItem.exampleWord}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tone Placement Rules Guide (Quy tắc đánh dấu thanh điệu Pinyin) */}
          <div className="bg-white rounded-xl p-4 border border-amber-200 text-xs sm:text-sm text-slate-700 space-y-2.5 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-amber-900">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
              Quy tắc vàng đặt dấu thanh điệu trong tiếng Trung (Hanyu Pinyin):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <strong className="text-red-700">1. Ưu tiên theo thứ tự a &gt; o &gt; e:</strong>
                <p className="mt-0.5 text-slate-600">
                  Nếu trong âm tiết có nguyên âm <strong>a</strong>, luôn đặt dấu trên <strong>a</strong> (VD: h<strong>ǎ</strong>o).
                  Nếu không có a, tìm <strong>o</strong> hoặc <strong>e</strong> (VD: g<strong>ǒ</strong>u, h<strong>ē</strong>i).
                </p>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <strong className="text-red-700">2. Cặp nguyên âm iu và ui:</strong>
                <p className="mt-0.5 text-slate-600">
                  Nguyên âm nào đứng sau thì đánh dấu trên âm đó:
                  trong <strong>iu</strong> đánh trên <strong>u</strong> (VD: li<strong>ú</strong>),
                  trong <strong>ui</strong> đánh trên <strong>i</strong> (VD: gu<strong>ì</strong>).
                </p>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <strong className="text-red-700">3. Bỏ dấu chấm của chữ i:</strong>
                <p className="mt-0.5 text-slate-600">
                  Khi đánh dấu thanh điệu lên chữ <strong>i</strong>, ta bỏ dấu chấm tròn trên đầu rồi đánh dấu thanh:
                  <strong>ī, í, ǐ, ì</strong> (không giữ dấu chấm).
                </p>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <strong className="text-red-700">4. Quy tắc với chữ ü:</strong>
                <p className="mt-0.5 text-slate-600">
                  Khi đi cùng <strong>j, q, x, y</strong> thì bỏ 2 chấm viết thành u nhưng vẫn đọc là ü (VD: j<strong>ū</strong>, q<strong>ǔ</strong>, x<strong>ù</strong>).
                  Khi đi với <strong>n, l</strong> giữ nguyên 2 chấm: n<strong>ǚ</strong>, l<strong>ǜ</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Phonetic Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">Không tìm thấy âm nào khớp với từ khóa "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGroup("all");
            }}
            className="mt-3 text-sm text-red-600 font-semibold hover:underline"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const readingInfo = getPhoneticReading(item.pinyin);

            const isPlayingPhonetic =
              playingState?.id === item.id && playingState.mode === "phonetic" && !playingState.slow;
            const isPlayingPhoneticSlow =
              playingState?.id === item.id && playingState.mode === "phonetic" && playingState.slow;
            const isPlayingWord =
              playingState?.id === item.id && playingState.mode === "word" && !playingState.slow;
            const isPlayingWordSlow =
              playingState?.id === item.id && playingState.mode === "word" && playingState.slow;

            return (
              <div
                key={item.id}
                id={`phonetic-card-${item.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full truncate">
                      {item.group}
                    </span>
                    {item.isAspirated && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Bật hơi 💨
                      </span>
                    )}
                  </div>

                  {/* Main Characters Display */}
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-baseline gap-2.5">
                      {displayStyle !== "bopomofo" && (
                        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                          {item.pinyin}
                        </span>
                      )}
                      {displayStyle !== "pinyin" && (
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-red-600 bg-red-50/80 px-2.5 py-0.5 rounded-lg border border-red-200/60">
                          {item.bopomofo}
                        </span>
                      )}
                    </div>

                    {item.type === "tone" && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dấu thanh</span>
                        {item.isUnmarkedPinyin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 mt-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Không dấu (∅)
                          </span>
                        ) : (
                          <span className="text-lg sm:text-xl font-black text-red-600 font-mono bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                            {item.toneMarkPinyin}
                          </span>
                        )}
                      </div>
                    )}

                    {item.ipa && (
                      <span className="text-xs font-mono text-slate-400 font-medium">
                        {item.ipa}
                      </span>
                    )}
                  </div>

                  {/* Phonetic Reading pronunciation badge */}
                  {item.type === "tone" ? (
                    <div className="mb-2 text-[11px] text-amber-900 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1.5 rounded-lg flex flex-col gap-1">
                      <div className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-1.5">
                          <Music2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Quy cách:</span>
                        </div>
                        {item.isUnmarkedPinyin ? (
                          <span className="text-xs font-bold text-amber-900 bg-white px-2 py-0.5 rounded-md border border-amber-300">
                            Pinyin: Không dấu • Chú âm: Dấu chấm (˙)
                          </span>
                        ) : item.isUnmarkedBopomofo ? (
                          <span className="text-xs font-bold text-amber-900">
                            Pinyin: <strong className="text-red-700 font-mono text-sm">¯</strong> • Chú âm: Không ghi dấu
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-red-700">
                            {item.toneMarkNameVi || item.nameVi}
                          </span>
                        )}
                      </div>
                      {item.toneVowelsList && (
                        <div className="flex items-center gap-1 mt-0.5 pt-1 border-t border-amber-200/50">
                          <span className="text-[10px] text-slate-500 font-medium shrink-0">6 nguyên âm:</span>
                          <div className="flex flex-wrap gap-1">
                            {item.toneVowelsList.map((v) => (
                              <button
                                key={v}
                                onClick={() => playToneAudio(v, false)}
                                className="px-1.5 py-0.2 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-amber-200 rounded font-mono text-[11px] font-bold"
                                title={`Nghe âm ${v}`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : readingInfo && (
                    <div className="mb-2 text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-lg inline-flex items-center gap-1.5">
                      <Music2 className="w-3 h-3 text-amber-600" />
                      <span>
                        Âm đọc: <strong>{readingInfo.readingPinyin}</strong> ({readingInfo.readingBopomofo}) &bull; {readingInfo.spellingVi}
                      </span>
                    </div>
                  )}

                  {/* Name and description */}
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {item.nameVi}
                  </p>

                  {/* SECTION 1: PHÁT ÂM TỪ PHIÊN ÂM (Phonetic Reading) */}
                  <div className="bg-red-50/60 rounded-xl p-2.5 border border-red-100 mb-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                        Phát âm từ phiên âm
                      </span>
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {item.type === "tone"
                          ? `${item.pinyin} • ${item.nameVi.split(":")[0]}`
                          : readingInfo && readingInfo.readingPinyin !== item.pinyin
                          ? `${item.pinyin} ➔ ${readingInfo.readingPinyin}`
                          : item.pinyin}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-play-phonetic-${item.id}`}
                        onClick={() => handlePlayPhonetic(item, false)}
                        disabled={isPlayingPhonetic}
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                          isPlayingPhonetic
                            ? "bg-red-600 text-white"
                            : "bg-white text-red-700 hover:bg-red-100 border border-red-200 shadow-xs"
                        }`}
                        title="Nghe phát âm phiên âm chuẩn Phổ thông"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe âm</span>
                      </button>
                      <button
                        id={`btn-play-phonetic-slow-${item.id}`}
                        onClick={() => handlePlayPhonetic(item, true)}
                        disabled={isPlayingPhoneticSlow}
                        className={`px-1.5 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                          isPlayingPhoneticSlow
                            ? "bg-red-600 text-white"
                            : "bg-white text-slate-500 hover:text-red-700 border border-red-200"
                        }`}
                        title="Nghe âm tốc độ chậm 0.7x"
                      >
                        0.7x
                      </button>
                    </div>
                  </div>

                  {/* SECTION 2: PHÁT ÂM CHỮ HÁN VÍ DỤ */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-serif font-bold text-slate-900">
                        {item.exampleWord}
                      </span>
                      <div className="leading-tight">
                        <div className="text-xs font-semibold text-slate-800">
                          {item.examplePinyin} <span className="font-mono text-slate-500 text-[10px]">({item.exampleBopomofo})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[110px]">
                          {item.exampleMeaningVi}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-play-word-${item.id}`}
                        onClick={() => handlePlayWord(item, false)}
                        disabled={isPlayingWord}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isPlayingWord
                            ? "bg-slate-800 text-white"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                        title="Nghe chữ Hán ví dụ (Tiếng Phổ Thông)"
                        aria-label={`Nghe chữ ${item.exampleWord}`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-play-word-slow-${item.id}`}
                        onClick={() => handlePlayWord(item, true)}
                        disabled={isPlayingWordSlow}
                        className={`px-1.5 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                          isPlayingWordSlow
                            ? "bg-slate-800 text-white"
                            : "bg-white text-slate-500 hover:text-slate-900 border border-slate-200"
                        }`}
                        title="Nghe chữ ví dụ chậm 0.7x"
                      >
                        0.7x
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    id={`btn-guide-${item.id}`}
                    onClick={() => onOpenSoundGuide(item)}
                    className="flex-1 py-1.5 px-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-center border border-slate-200"
                  >
                    Khẩu hình &amp; Mẹo
                  </button>
                  <button
                    id={`btn-practice-${item.id}`}
                    onClick={() => onSelectForPractice(item)}
                    className="flex-1 py-1.5 px-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Luyện AI</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
