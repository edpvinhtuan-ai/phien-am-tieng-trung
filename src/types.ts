export type PhoneticType = "initial" | "final" | "tone" | "vocabulary";

export interface PhoneticItem {
  id: string;
  type: PhoneticType;
  pinyin: string;
  bopomofo: string;
  nameVi: string;
  ipa?: string;
  group: string;
  exampleWord: string; // Chữ Hán
  examplePinyin: string;
  exampleBopomofo: string;
  exampleMeaningVi: string;
  vietnameseGuide: string;
  mouthGuide: string;
  isAspirated?: boolean;
  toneLevel?: number; // 1, 2, 3, 4, 0 (nhẹ)
  toneMarkPinyin?: string; // "¯", "ˊ", "ˇ", "ˋ", "∅"
  toneMarkBopomofo?: string; // "∅", "ˊ", "ˇ", "ˋ", "˙"
  toneMarkNameVi?: string; // "Dấu ngang", "Dấu sắc", "Dấu hỏi (móc)", "Dấu huyền", "Thanh nhẹ (Không ghi dấu)"
  isUnmarkedPinyin?: boolean; // true khi Pinyin không ghi dấu (Thanh nhẹ)
  isUnmarkedBopomofo?: boolean; // true khi Chú âm không ghi dấu (Thanh 1)
  toneVowelsList?: string[]; // ["ā", "ō", "ē", "ī", "ū", "ǖ"]
  phoneticReadingText?: string; // Ký tự/Từ để phát âm âm đọc phiên âm chuẩn Phổ thông
  phoneticReadingPinyin?: string; // Phiên âm của âm đọc (ví dụ: b -> bō, p -> pō)
  phoneticReadingBopomofo?: string; // Chú âm của âm đọc
}

export interface AssessmentResult {
  score: number;
  initialScore: number;
  finalScore: number;
  toneScore: number;
  recognizedPinyin: string;
  recognizedTone?: string;
  accuracyLevel: "Xuất sắc" | "Rất tốt" | "Cần cải thiện";
  feedbackVi: string;
  tipsVi: string;
  mouthShapeAdvice: string;
  isAiEvaluated: boolean;
  note?: string;
}

export interface StudyLogItem {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  targetWord: string;
  pinyin: string;
  bopomofo: string;
  type: PhoneticType;
  score: number;
  accuracyLevel: string;
  feedbackVi: string;
  audioBlobUrl?: string;
}

export interface DailyStudySummary {
  date: string; // YYYY-MM-DD
  itemsPracticed: number;
  averageScore: number;
  highScore: number;
  details: StudyLogItem[];
}

export interface UserStats {
  totalSessions: number;
  totalPracticedCount: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  averageScore: number;
  masteredIds: string[]; // Score >= 85
}
