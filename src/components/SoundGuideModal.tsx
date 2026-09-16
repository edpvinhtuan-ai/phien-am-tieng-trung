import React, { useState } from "react";
import { X, Volume2, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Music2, Globe } from "lucide-react";
import { PhoneticItem } from "../types";
import { playPhoneticAudio, playWordAudio, playToneAudio, PHONETIC_READING_MAP, getPhoneticReading } from "../utils/audioHelper";

interface SoundGuideModalProps {
  item: PhoneticItem | null;
  onClose: () => void;
  onPracticeItem?: (item: PhoneticItem) => void;
}

export const SoundGuideModal: React.FC<SoundGuideModalProps> = ({ item, onClose, onPracticeItem }) => {
  const [playingState, setPlayingState] = useState<"phonetic" | "word" | null>(null);

  if (!item) return null;

  const readingInfo = getPhoneticReading(item.pinyin);

  const handlePlayPhonetic = async (slow = false) => {
    setPlayingState("phonetic");
    await playPhoneticAudio(item, slow);
    setPlayingState(null);
  };

  const handlePlayWord = async (slow = false) => {
    setPlayingState("word");
    await playWordAudio(item, slow);
    setPlayingState(null);
  };

  return (
    <div
      id="sound-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="sound-guide-modal-content"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-rose-800 to-amber-800 text-white p-6 relative">
          <button
            id="close-sound-guide-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors text-white"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>{item.group}</span>
            <span>&bull;</span>
            <span>
              {item.type === "initial"
                ? "Thanh mẫu"
                : item.type === "final"
                ? "Vận mẫu"
                : item.type === "tone"
                ? "Thanh điệu"
                : "Từ vựng"}
            </span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <Globe className="w-3 h-3" />
              Tiếng Phổ Thông
            </span>
          </div>

          <div className="flex items-baseline gap-4">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">{item.pinyin}</h2>
            <span className="text-3xl sm:text-4xl font-bold bg-amber-400/25 px-3 py-0.5 rounded-xl border border-amber-300/40 text-amber-100 font-mono">
              {item.bopomofo}
            </span>
            {item.type === "tone" && (
              <div className="ml-auto flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-xs">
                <span className="text-xs text-amber-200 font-medium">Dấu:</span>
                {item.isUnmarkedPinyin ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-100 bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                    Không ghi dấu (∅)
                  </span>
                ) : (
                  <span className="text-2xl font-black font-mono text-white leading-none">{item.toneMarkPinyin}</span>
                )}
              </div>
            )}
            {item.ipa && (
              <span className="text-sm font-mono text-amber-200/90">{item.ipa}</span>
            )}
          </div>
          <p className="text-amber-100 text-sm mt-1">
            {item.toneMarkNameVi ? `${item.nameVi} • ${item.toneMarkNameVi}` : item.nameVi}
          </p>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Audio Section: Phonetic reading and Word */}
          <div className="space-y-2.5">
            {/* Audio 1: Phát âm từ phiên âm */}
            <div className="flex items-center justify-between p-3.5 bg-red-50/80 rounded-2xl border border-red-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                  Phát âm từ phiên âm (Tiếng Phổ Thông)
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {item.type === "tone" ? (
                    <span>
                      Âm thanh điệu: <strong className="text-red-700 text-base">{item.pinyin}</strong> ({item.bopomofo})
                    </span>
                  ) : readingInfo && readingInfo.readingPinyin !== item.pinyin ? (
                    <span>
                      {item.pinyin} ➔ <strong className="text-red-700">{readingInfo.readingPinyin}</strong> ({readingInfo.readingBopomofo})
                    </span>
                  ) : (
                    <span>{item.pinyin}</span>
                  )}
                </div>
                {readingInfo && (
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    Gần giống tiếng Việt: {readingInfo.spellingVi}
                  </span>
                )}
                {item.type === "tone" && item.toneVowelsList && (
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-red-200/60">
                    <span className="text-[11px] font-semibold text-red-900">Dấu trên 6 nguyên âm:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.toneVowelsList.map((v) => (
                        <button
                          key={v}
                          onClick={() => playToneAudio(v, false)}
                          className="px-2 py-0.5 bg-white hover:bg-red-100 text-slate-900 hover:text-red-700 border border-red-200 rounded font-mono text-xs font-bold shadow-2xs"
                          title={`Nghe âm ${v}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id={`play-phonetic-modal-${item.id}`}
                  onClick={() => handlePlayPhonetic(false)}
                  disabled={playingState === "phonetic"}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe âm</span>
                </button>
                <button
                  id={`play-phonetic-slow-modal-${item.id}`}
                  onClick={() => handlePlayPhonetic(true)}
                  disabled={playingState === "phonetic"}
                  className="px-2 py-2 bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-[11px] font-bold transition-colors border border-red-200"
                  title="Nghe chậm 0.7x"
                >
                  0.7x
                </button>
              </div>
            </div>

            {/* Audio 2: Chữ Hán ví dụ */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-serif font-bold text-slate-900">{item.exampleWord}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{item.examplePinyin}</span>
                    <span className="text-xs bg-slate-200 text-slate-800 font-mono px-2 py-0.5 rounded font-medium">
                      {item.exampleBopomofo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{item.exampleMeaningVi}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id={`play-word-modal-${item.id}`}
                  onClick={() => handlePlayWord(false)}
                  disabled={playingState === "word"}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe chữ</span>
                </button>
                <button
                  id={`play-word-slow-modal-${item.id}`}
                  onClick={() => handlePlayWord(true)}
                  disabled={playingState === "word"}
                  className="px-2 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold transition-colors border border-slate-200"
                  title="Nghe chữ chậm 0.7x"
                >
                  0.7x
                </button>
              </div>
            </div>
          </div>

          {/* Vietnamese Pronunciation Guide */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Mẹo phát âm theo tiếng Việt</span>
            </div>
            <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 leading-relaxed">
              {item.vietnameseGuide}
            </p>
          </div>

          {/* Mouth and Tongue Guide */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Vị trí đặt lưỡi &amp; Khẩu hình môi</span>
            </div>
            <p className="text-sm text-slate-700 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/70 leading-relaxed">
              {item.mouthGuide}
            </p>
          </div>

          {/* Common Mistakes */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Lỗi người Việt hay mắc phải</span>
            </div>
            <p className="text-sm text-rose-900 bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/70 leading-relaxed">
              {item.commonMistakesVi}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            id="modal-close-btn-footer"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Đóng lại
          </button>

          {onPracticeItem && (
            <button
              id={`modal-practice-btn-${item.id}`}
              onClick={() => {
                onClose();
                onPracticeItem(item);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <span>Vào luyện phát âm với AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
