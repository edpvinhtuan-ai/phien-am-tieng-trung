import React, { useState, useEffect, useMemo } from "react";
import { Volume2, Check, X, RotateCcw, Award, Sparkles, ArrowRight, Mic, Music2 } from "lucide-react";
import { PhoneticItem } from "../types";
import { ALL_PHONETICS, INITIALS_DATA, FINALS_DATA, TONES_DATA } from "../data/phoneticsData";
import { playPhoneticAudio, playWordAudio, playNativeAudio, PHONETIC_READING_MAP } from "../utils/audioHelper";

interface QuizModeProps {
  onPracticeItem: (item: PhoneticItem) => void;
}

type QuizType = "pinyin_to_bopomofo" | "bopomofo_to_pinyin" | "listen_to_pinyin" | "tone_quiz";

interface Question {
  target: PhoneticItem;
  prompt: string;
  subPrompt?: string;
  options: PhoneticItem[];
  correctAnswerKey: string;
}

export const QuizMode: React.FC<QuizModeProps> = ({ onPracticeItem }) => {
  const [quizType, setQuizType] = useState<QuizType>("pinyin_to_bopomofo");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongItems, setWrongItems] = useState<PhoneticItem[]>([]);

  // Generate 8 randomized questions based on quizType
  const generateQuestions = (type: QuizType): Question[] => {
    let pool: PhoneticItem[] = [];
    if (type === "tone_quiz") {
      pool = [...TONES_DATA];
    } else {
      pool = [...INITIALS_DATA, ...FINALS_DATA];
    }

    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const count = Math.min(8, shuffledPool.length);
    const selectedTargets = shuffledPool.slice(0, count);

    return selectedTargets.map((target) => {
      // Pick 3 distractors from same or similar group
      const otherItems = pool.filter((p) => p.id !== target.id);
      const shuffledOthers = [...otherItems].sort(() => 0.5 - Math.random());
      const distractors = shuffledOthers.slice(0, 3);
      const options = [target, ...distractors].sort(() => 0.5 - Math.random());

      let prompt = "";
      let subPrompt = "";
      let correctAnswerKey = "";

      if (type === "pinyin_to_bopomofo") {
        prompt = `Ký hiệu Chú âm (Bopomofo) của âm "${target.pinyin}" là gì?`;
        subPrompt = target.nameVi;
        correctAnswerKey = target.bopomofo;
      } else if (type === "bopomofo_to_pinyin") {
        prompt = `Chữ Latin (Pinyin) tương ứng với ký hiệu Chú âm "${target.bopomofo}" là gì?`;
        subPrompt = target.nameVi;
        correctAnswerKey = target.pinyin;
      } else if (type === "listen_to_pinyin") {
        prompt = "Bấm nghe âm thanh và chọn phiên âm chính xác:";
        subPrompt = "Nghe kỹ độ bật hơi và vị trí lưỡi";
        correctAnswerKey = target.pinyin;
      } else {
        prompt = `Thanh điệu của âm "${target.pinyin}" là thanh mấy?`;
        subPrompt = target.nameVi;
        correctAnswerKey = target.pinyin;
      }

      return {
        target,
        prompt,
        subPrompt,
        options,
        correctAnswerKey,
      };
    });
  };

  const startNewQuiz = (type: QuizType) => {
    setQuizType(type);
    const newQuestions = generateQuestions(type);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsFinished(false);
    setWrongItems([]);

    if (type === "listen_to_pinyin" && newQuestions.length > 0) {
      setTimeout(() => {
        playPhoneticAudio(newQuestions[0].target);
      }, 300);
    }
  };

  useEffect(() => {
    startNewQuiz(quizType);
  }, [quizType]);

  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (item: PhoneticItem) => {
    if (isAnswered || !currentQ) return;

    setSelectedOptionId(item.id);
    setIsAnswered(true);

    const isCorrect = item.id === currentQ.target.id;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setWrongItems((prev) => [...prev, currentQ.target]);
    }

    // Play phonetic sound to reinforce learning
    playPhoneticAudio(currentQ.target);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setSelectedOptionId(null);
      setIsAnswered(false);

      if (quizType === "listen_to_pinyin") {
        setTimeout(() => {
          playPhoneticAudio(questions[nextIdx].target);
        }, 200);
      }
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Mode selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-center gap-2">
        <button
          id="quiz-mode-pinyin-bopomofo"
          onClick={() => startNewQuiz("pinyin_to_bopomofo")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            quizType === "pinyin_to_bopomofo"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Pinyin &rarr; Bopomofo
        </button>
        <button
          id="quiz-mode-bopomofo-pinyin"
          onClick={() => startNewQuiz("bopomofo_to_pinyin")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            quizType === "bopomofo_to_pinyin"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Bopomofo &rarr; Pinyin
        </button>
        <button
          id="quiz-mode-listening"
          onClick={() => startNewQuiz("listen_to_pinyin")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            quizType === "listen_to_pinyin"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          🎧 Nghe &amp; Đoán Âm
        </button>
        <button
          id="quiz-mode-tones"
          onClick={() => startNewQuiz("tone_quiz")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            quizType === "tone_quiz"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Phân Biệt Thanh Điệu
        </button>
      </div>

      {/* Quiz Card */}
      {!isFinished && currentQ ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Progress header */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-100 pb-3">
            <span>
              Câu hỏi {currentQuestionIndex + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-1.5">
              <span>Điểm số:</span>
              <span className="text-sm font-bold text-red-600">
                {score} / {questions.length}
              </span>
            </div>
          </div>

          {/* Question Presentation */}
          <div className="text-center py-4 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {currentQ.prompt}
            </h3>
            {currentQ.subPrompt && (
              <p className="text-xs text-slate-500">{currentQ.subPrompt}</p>
            )}

            {/* If listening mode, prominent play audio button */}
            {quizType === "listen_to_pinyin" && (
              <div className="py-3 flex items-center justify-center gap-2">
                <button
                  id="btn-quiz-audio"
                  onClick={() => playPhoneticAudio(currentQ.target)}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm inline-flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span>Nghe âm phiên âm</span>
                </button>
                <button
                  id="btn-quiz-audio-word"
                  onClick={() => playWordAudio(currentQ.target)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-sm inline-flex items-center gap-1.5 transition-colors border border-slate-200"
                  title="Nghe chữ Hán ví dụ tương ứng"
                >
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span>Nghe chữ ví dụ</span>
                </button>
              </div>
            )}

            {/* Target symbol display */}
            {quizType !== "listen_to_pinyin" && (
              <div className="py-2 inline-block">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 bg-slate-50 border border-slate-200 px-6 py-2 rounded-2xl shadow-xs">
                  {quizType === "bopomofo_to_pinyin" ? currentQ.target.bopomofo : currentQ.target.pinyin}
                </span>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQ.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = option.id === currentQ.target.id;

              let btnStyle = "bg-white hover:bg-slate-50 border-slate-200 text-slate-800";
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500 border-emerald-600 text-white font-bold shadow-xs";
                } else if (isSelected) {
                  btnStyle = "bg-rose-500 border-rose-600 text-white font-bold";
                } else {
                  btnStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={option.id}
                  id={`option-${option.id}`}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-mono">
                      {quizType === "pinyin_to_bopomofo"
                        ? option.bopomofo
                        : option.pinyin}
                    </span>
                    <span className="text-xs opacity-80">
                      ({option.exampleWord} - {option.exampleMeaningVi})
                    </span>
                  </div>

                  {isAnswered && isCorrect && <Check className="w-5 h-5 text-white" />}
                  {isAnswered && isSelected && !isCorrect && <X className="w-5 h-5 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Explanation after answer */}
          {isAnswered && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Đáp án đúng: {currentQ.target.pinyin} &harr; {currentQ.target.bopomofo}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {currentQ.target.vietnameseGuide}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => playPhoneticAudio(currentQ.target)}
                    className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-red-50 text-red-600 shadow-xs"
                    title="Nghe âm phiên âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => playWordAudio(currentQ.target)}
                    className="px-2 py-1.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium"
                    title="Nghe chữ Hán ví dụ"
                  >
                    Chữ
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="btn-quiz-next"
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <span>
                    {currentQuestionIndex + 1 === questions.length
                      ? "Xem tổng kết"
                      : "Câu tiếp theo"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : isFinished ? (
        /* Quiz Summary Screen */
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">Hoàn Thành Bài Kiểm Tra!</h3>
            <p className="text-sm text-slate-500 mt-1">
              Bạn đã hoàn thành chế độ trắc nghiệm phản xạ phiên âm.
            </p>
          </div>

          <div className="inline-flex items-baseline gap-1 text-5xl font-black text-red-600 my-2">
            <span>{score}</span>
            <span className="text-2xl font-bold text-slate-400">/{questions.length}</span>
          </div>

          {/* Encouragement text */}
          <p className="text-sm font-semibold text-slate-700">
            {score >= 7
              ? "🎉 Xuất sắc! Phản xạ đối chiếu Pinyin và Bopomofo của bạn rất chuẩn xác."
              : score >= 5
              ? "👍 Rất tốt! Bạn đã nắm được phần lớn âm, tiếp tục rèn luyện thêm nhé."
              : "💪 Hãy xem lại các âm bên dưới và luyện tập phát âm với AI để tiến bộ nhanh hơn!"}
          </p>

          {/* Missed questions practice list */}
          {wrongItems.length > 0 && (
            <div className="text-left bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 sm:p-5">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">
                Các âm cần củng cố lại:
              </h4>
              <div className="space-y-2">
                {wrongItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-rose-200"
                  >
                    <div>
                      <strong className="text-slate-900 font-mono text-sm">{item.pinyin}</strong>
                      <span className="mx-2 text-rose-700 font-mono font-bold">{item.bopomofo}</span>
                      <span className="text-xs text-slate-500">({item.nameVi})</span>
                    </div>
                    <button
                      onClick={() => onPracticeItem(item)}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <Mic className="w-3 h-3" />
                      <span>Luyện AI</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              id="btn-quiz-retry"
              onClick={() => startNewQuiz(quizType)}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm bài kiểm tra khác</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
