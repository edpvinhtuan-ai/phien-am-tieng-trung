import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Volume2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  VolumeX,
  Music2,
  Globe,
} from "lucide-react";
import { AssessmentResult, PhoneticItem } from "../types";
import { ALL_PHONETICS } from "../data/phoneticsData";
import {
  AudioRecorderManager,
  playPhoneticAudio,
  playWordAudio,
  playToneAudio,
  PHONETIC_READING_MAP,
  getPhoneticReading,
  getSavedMandarinDialect,
} from "../utils/audioHelper";
import { saveStudyRecord } from "../utils/storage";

interface PronunciationPracticeProps {
  selectedItem: PhoneticItem;
  onSelectNextItem: () => void;
  onOpenSoundGuide: (item: PhoneticItem) => void;
  onRecordSaved: () => void;
}

export const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({
  selectedItem,
  onSelectNextItem,
  onOpenSoundGuide,
  onRecordSaved,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playingState, setPlayingState] = useState<"phonetic" | "word" | null>(null);
  const [practiceTarget, setPracticeTarget] = useState<"phonetic" | "word">("phonetic");

  const recorderRef = useRef<AudioRecorderManager | null>(null);
  const timerRef = useRef<number | null>(null);

  const pinyinKey = selectedItem.pinyin.toLowerCase().trim();
  const readingInfo = getPhoneticReading(selectedItem.pinyin);

  // Reset state when target changes
  useEffect(() => {
    setUserAudioUrl(null);
    setAssessment(null);
    setErrorMessage(null);
    if (isRecording) {
      handleStopRecording();
    }
  }, [selectedItem.id]);

  // Clean up recorder and timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      setAssessment(null);
      setUserAudioUrl(null);

      recorderRef.current = new AudioRecorderManager();
      await recorderRef.current.startRecording((level) => {
        setVolumeLevel(level);
      });

      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 6) {
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setErrorMessage(
        "Không thể truy cập Microphone. Vui lòng cho phép quyền truy cập Micro trên trình duyệt để ghi âm luyện phát âm."
      );
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current || !isRecording) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setVolumeLevel(0);
    setIsAnalyzing(true);

    try {
      const { blob, base64, mimeType } = await recorderRef.current.stopRecording();
      const audioUrl = URL.createObjectURL(blob);
      setUserAudioUrl(audioUrl);

      // Determine target info based on practice target
      const targetWord =
        practiceTarget === "phonetic"
          ? readingInfo?.phoneticText || selectedItem.pinyin
          : selectedItem.exampleWord;

      const readingPinyin = readingInfo?.readingPinyin || selectedItem.pinyin;

      // Send to backend Gemini API
      const response = await fetch("/api/assess-pronunciation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetWord,
          pinyin: selectedItem.pinyin,
          bopomofo: selectedItem.bopomofo,
          readingPinyin,
          practiceMode: practiceTarget,
          audioBase64: base64,
          mimeType: mimeType,
          description: selectedItem.nameVi,
        }),
      });

      if (!response.ok) {
        throw new Error(`Máy chủ trả về lỗi: ${response.statusText}`);
      }

      const result: AssessmentResult = await response.json();
      setAssessment(result);

      // Save to local storage log
      saveStudyRecord({
        targetWord,
        pinyin: selectedItem.pinyin,
        bopomofo: selectedItem.bopomofo,
        type: selectedItem.type,
        score: result.score,
        accuracyLevel: result.accuracyLevel,
        feedbackVi: result.feedbackVi,
      });

      onRecordSaved();
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setErrorMessage(
        "Lỗi khi gửi phân tích âm thanh: " + (err.message || "Vui lòng thử ghi âm lại.")
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlayPhonetic = async (slow = false) => {
    setPlayingState("phonetic");
    await playPhoneticAudio(selectedItem, slow);
    setPlayingState(null);
  };

  const handlePlayWord = async (slow = false) => {
    setPlayingState("word");
    await playWordAudio(selectedItem, slow);
    setPlayingState(null);
  };

  const dialect = getSavedMandarinDialect();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Target Phonetic Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-red-100/60 to-transparent rounded-bl-full pointer-events-none" />

        {/* Top Info row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200/80 px-3 py-1 rounded-full">
              {selectedItem.group}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {selectedItem.type === "initial"
                ? "Thanh mẫu (Initials)"
                : selectedItem.type === "final"
                ? "Vận mẫu (Finals)"
                : selectedItem.type === "tone"
                ? "Thanh điệu (Tones)"
                : "Từ vựng giao tiếp"}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>Tiếng Phổ Thông chuẩn</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="guide-btn-top"
              onClick={() => onOpenSoundGuide(selectedItem)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors border border-slate-200"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Khẩu hình &amp; Mẹo</span>
            </button>
            <button
              id="btn-next-target"
              onClick={onSelectNextItem}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
            >
              <span>Âm tiếp theo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Big visual showcase */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main symbols & pronunciation text */}
          <div className="md:col-span-6 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-baseline gap-3 my-2">
              <span className="text-5xl sm:text-6xl font-black text-red-600 tracking-tight">
                {selectedItem.pinyin}
              </span>
              <span className="text-3xl sm:text-4xl font-bold font-mono text-amber-900 bg-amber-100/80 px-3 py-1 rounded-xl border border-amber-200">
                {selectedItem.bopomofo}
              </span>
              {selectedItem.type === "tone" && (
                <div className="ml-auto sm:ml-0 bg-amber-50/90 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-2xs">
                  <span className="text-xs text-amber-900 font-bold">Dấu:</span>
                  {selectedItem.isUnmarkedPinyin ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 bg-white px-2.5 py-0.5 rounded-full border border-amber-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Không ghi dấu (∅)
                    </span>
                  ) : (
                    <span className="text-2xl font-black font-mono text-red-600 leading-none">{selectedItem.toneMarkPinyin}</span>
                  )}
                </div>
              )}
            </div>

            {selectedItem.type === "tone" && selectedItem.toneVowelsList && (
              <div className="flex items-center gap-1.5 my-1.5 p-2 bg-amber-50/70 border border-amber-200 rounded-xl w-full">
                <span className="text-xs text-amber-900 font-bold shrink-0">Dấu trên 6 nguyên âm:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.toneVowelsList.map((v) => (
                    <button
                      key={v}
                      onClick={() => playToneAudio(v, false)}
                      className="px-2 py-0.5 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-amber-300 rounded font-mono text-xs font-bold transition-colors"
                      title={`Bấm nghe âm ${v}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {readingInfo && (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl my-1">
                <Music2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {selectedItem.type === "tone" ? (
                    <>
                      Âm thanh điệu chuẩn: <strong>{selectedItem.pinyin}</strong> ({selectedItem.bopomofo}) &bull; {readingInfo.spellingVi}
                    </>
                  ) : (
                    <>
                      Âm đọc quy chuẩn: <strong>{readingInfo.readingPinyin}</strong> ({readingInfo.readingBopomofo}) &bull; {readingInfo.spellingVi}
                    </>
                  )}
                </span>
              </div>
            )}

            <p className="text-sm text-slate-600 font-medium mt-1">
              {selectedItem.nameVi}
            </p>

            {/* Target Practice Selector */}
            <div className="mt-3 pt-3 border-t border-slate-100 w-full">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Mục tiêu bạn muốn AI chấm điểm:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  id="target-mode-phonetic"
                  onClick={() => setPracticeTarget("phonetic")}
                  className={`py-2 px-3 rounded-xl font-semibold border transition-all text-left ${
                    practiceTarget === "phonetic"
                      ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-[10px] text-slate-500">
                    {selectedItem.type === "tone" ? "Âm thanh điệu" : "Âm phiên âm"}
                  </span>
                  <span className="font-bold">
                    {selectedItem.type === "tone"
                      ? `${selectedItem.pinyin} (${selectedItem.nameVi.split(":")[0]})`
                      : readingInfo?.readingPinyin || selectedItem.pinyin}
                  </span>
                </button>
                <button
                  id="target-mode-word"
                  onClick={() => setPracticeTarget("word")}
                  className={`py-2 px-3 rounded-xl font-semibold border transition-all text-left ${
                    practiceTarget === "word"
                      ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-[10px] text-slate-500">Chữ Hán ví dụ</span>
                  <span className="font-bold">{selectedItem.exampleWord} ({selectedItem.examplePinyin})</span>
                </button>
              </div>
            </div>
          </div>

          {/* DUAL AUDIO PLAYBACK: PHONETIC SOUND & WORD SOUND */}
          <div className="md:col-span-6 space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-red-600" />
                <span>Nghe phát âm chuẩn Tiếng Phổ Thông:</span>
              </span>
            </div>

            {/* AUDIO BUTTON 1: PHÁT ÂM TỪ PHIÊN ÂM */}
            <div className="bg-white p-3 rounded-xl border border-red-200 shadow-xs flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                  1. Âm đọc của phiên âm
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {selectedItem.type === "tone"
                    ? `${selectedItem.pinyin} • ${selectedItem.nameVi.split(":")[0]}`
                    : readingInfo && readingInfo.readingPinyin !== selectedItem.pinyin
                    ? `${selectedItem.pinyin} ➔ ${readingInfo.readingPinyin}`
                    : selectedItem.pinyin}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-play-phonetic-audio"
                  onClick={() => handlePlayPhonetic(false)}
                  disabled={playingState === "phonetic"}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe âm</span>
                </button>
                <button
                  id="btn-play-phonetic-slow"
                  onClick={() => handlePlayPhonetic(true)}
                  disabled={playingState === "phonetic"}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors"
                  title="Nghe chậm 0.7x"
                >
                  0.7x
                </button>
              </div>
            </div>

            {/* AUDIO BUTTON 2: PHÁT ÂM CHỮ HÁN VÍ DỤ */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  2. Chữ Hán ví dụ
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {selectedItem.exampleWord} ({selectedItem.examplePinyin} &bull; {selectedItem.exampleMeaningVi})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-play-word-audio"
                  onClick={() => handlePlayWord(false)}
                  disabled={playingState === "word"}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe chữ</span>
                </button>
                <button
                  id="btn-play-word-slow"
                  onClick={() => handlePlayWord(true)}
                  disabled={playingState === "word"}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors"
                  title="Nghe chậm 0.7x"
                >
                  0.7x
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              💡 <strong>Mẹo khẩu hình:</strong> {selectedItem.vietnameseGuide}
            </p>
          </div>
        </div>
      </div>

      {/* Recording Studio & AI Analysis Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Phòng Thu &amp; Chấm Điểm AI Tiếng Phổ Thông</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Đọc rõ ràng âm mục tiêu{" "}
              <strong className="text-slate-900">
                {practiceTarget === "phonetic"
                  ? readingInfo?.readingPinyin || selectedItem.pinyin
                  : selectedItem.exampleWord}
              </strong>{" "}
              để Gemini phân tích khẩu hình, thanh điệu và phụ âm.
            </p>
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Thông báo ghi âm</p>
              <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Live Audio Meter & Record Button */}
        <div className="flex flex-col items-center justify-center py-6 space-y-5">
          {/* Waveform volume ring */}
          <div className="relative">
            {isRecording && (
              <div
                className="absolute inset-0 rounded-full bg-red-500/20 animate-ping pointer-events-none"
                style={{
                  transform: `scale(${1 + (volumeLevel / 100) * 0.8})`,
                  transition: "transform 0.1s ease-out",
                }}
              />
            )}

            <button
              id="btn-toggle-recording"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isAnalyzing}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-md active:scale-95 ${
                isRecording
                  ? "bg-red-600 text-white shadow-red-500/40 ring-4 ring-red-200 animate-pulse"
                  : isAnalyzing
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 hover:shadow-lg"
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-8 h-8 fill-white" />
                  <span className="text-[11px] font-bold mt-1">Dừng ({recordingSeconds}s)</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8" />
                  <span className="text-[11px] font-bold mt-1">Ghi âm</span>
                </>
              )}
            </button>
          </div>

          {/* Recording live feedback hint */}
          <div className="text-center">
            {isRecording ? (
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  Đang thu âm... Hãy phát âm to rõ! ({recordingSeconds}/6s)
                </span>
                {/* Volume bar */}
                <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden mx-auto border border-slate-200">
                  <div
                    className="h-full bg-red-600 transition-all duration-75"
                    style={{ width: `${Math.min(100, volumeLevel * 1.4)}%` }}
                  />
                </div>
              </div>
            ) : isAnalyzing ? (
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span>AI đang phân tích khẩu hình và ngữ điệu Tiếng Phổ Thông...</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Nhấn nút tròn để bắt đầu thu âm phát âm của bạn (tối đa 6 giây).
              </p>
            )}
          </div>

          {/* Playback user audio */}
          {userAudioUrl && !isRecording && (
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Giọng thu âm của bạn:</span>
              <audio controls src={userAudioUrl} className="h-8 max-w-[220px]" />
            </div>
          )}
        </div>

        {/* AI ASSESSMENT RESULTS */}
        {assessment && (
          <div
            id="assessment-result-card"
            className="border-t border-slate-200 pt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {/* Overall Score Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                    Kết Quả Đánh Giá AI
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      assessment.score >= 90
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : assessment.score >= 80
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {assessment.accuracyLevel}
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-bold mt-1">
                  Độ Chuẩn Xác: {assessment.score}/100
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  AI nhận diện được bạn phát âm:{" "}
                  <strong className="text-amber-300 font-mono text-sm">
                    {assessment.recognizedPinyin || selectedItem.pinyin}
                  </strong>{" "}
                  ({assessment.recognizedTone})
                </p>
              </div>

              {/* Retry button */}
              <button
                id="btn-retry-assessment"
                onClick={handleStartRecording}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/20 transition-colors shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ghi âm lại</span>
              </button>
            </div>

            {/* Sub-scores breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Initial / Consonant Score */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Thanh mẫu (Phụ âm đầu)</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {assessment.initialScore}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </span>
                  <span className="text-xs text-slate-600 font-mono">
                    {selectedItem.pinyin.charAt(0)} / {selectedItem.bopomofo.charAt(0)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full"
                    style={{ width: `${assessment.initialScore}%` }}
                  />
                </div>
              </div>

              {/* Final / Vowel Score */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Vận mẫu (Nguyên âm)</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {assessment.finalScore}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </span>
                  <span className="text-xs text-slate-600">Độ tròn môi</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${assessment.finalScore}%` }}
                  />
                </div>
              </div>

              {/* Tone Score */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Thanh điệu (Cao độ)</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {assessment.toneScore}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </span>
                  <span className="text-xs text-slate-600">5 Mức chuẩn</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${assessment.toneScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Feedback & Mouth shape advice */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Nhận Xét Chi Tiết
                  </h5>
                  <p className="text-sm text-slate-800 mt-1 leading-relaxed">
                    {assessment.feedbackVi}
                  </p>
                </div>
              </div>

              {assessment.tipsVi && (
                <div className="pl-8 pt-2 border-t border-amber-200/60">
                  <span className="text-xs font-bold text-amber-900">🎯 Mẹo luyện tập: </span>
                  <span className="text-xs text-slate-700">{assessment.tipsVi}</span>
                </div>
              )}

              {assessment.mouthShapeAdvice && (
                <div className="pl-8 pt-1">
                  <span className="text-xs font-bold text-amber-900">👄 Khẩu hình: </span>
                  <span className="text-xs text-slate-700">{assessment.mouthShapeAdvice}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
