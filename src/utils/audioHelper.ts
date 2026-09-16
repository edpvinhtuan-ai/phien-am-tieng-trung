/**
 * Audio helper for Mandarin Chinese pronunciation playback (TTS) and recording.
 * STRICTLY uses Standard Mandarin (Tiếng Phổ Thông / 普通话 / 國語) - NO Cantonese (Tiếng Quảng Đông).
 */

import { PhoneticItem } from "../types";
import { TONE_AUDIO_BASE64 } from "../data/toneAudioData";

export type MandarinDialect = "zh-CN" | "zh-TW";

const STORAGE_KEY_DIALECT = "pinyin_mandarin_dialect_v1";

/**
 * Get saved Mandarin dialect preference (Default: zh-CN / Phổ thông Bắc Kinh)
 */
export function getSavedMandarinDialect(): MandarinDialect {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DIALECT);
    if (saved === "zh-TW" || saved === "zh-CN") return saved;
  } catch (e) {
    // Ignore
  }
  return "zh-CN";
}

/**
 * Save Mandarin dialect preference
 */
export function setSavedMandarinDialect(dialect: MandarinDialect): void {
  try {
    localStorage.setItem(STORAGE_KEY_DIALECT, dialect);
  } catch (e) {
    // Ignore
  }
}

/**
 * Official Mandarin phonetic readings for Initials, Finals, and Tones.
 * (Hệ thống âm đọc xưng hô thanh mẫu, vận mẫu tiếng Phổ thông tiêu chuẩn)
 */
export const PHONETIC_READING_MAP: Record<
  string,
  {
    phoneticText: string; // Chữ Hán mang âm đọc phiên âm chuẩn
    readingPinyin: string; // Phiên âm Pinyin của âm đọc
    readingBopomofo: string; // Chú âm của âm đọc
    spellingVi: string; // Phiên âm tương đương tiếng Việt
  }
> = {
  // === THANH MẪU (INITIALS) ===
  // Âm hai môi & môi răng: b, p, m, f (đọc ghép với -o / ô)
  b: { phoneticText: "玻", readingPinyin: "bō", readingBopomofo: "ㄅㄛ", spellingVi: "bô (không bật hơi)" },
  p: { phoneticText: "坡", readingPinyin: "pō", readingBopomofo: "ㄆㄛ", spellingVi: "phô (bật hơi mạnh)" },
  m: { phoneticText: "摸", readingPinyin: "mō", readingBopomofo: "ㄇㄛ", spellingVi: "mô (âm mũi)" },
  f: { phoneticText: "佛", readingPinyin: "fó", readingBopomofo: "ㄈㄛˊ", spellingVi: "phô (môi-răng)" },

  // Âm đầu lưỡi: d, t, n, l (đọc ghép với -e / ưa)
  d: { phoneticText: "得", readingPinyin: "dé", readingBopomofo: "ㄉㄜˊ", spellingVi: "tưa (không bật hơi)" },
  t: { phoneticText: "特", readingPinyin: "tè", readingBopomofo: "ㄊㄜˋ", spellingVi: "thưa (bật hơi)" },
  n: { phoneticText: "讷", readingPinyin: "nè", readingBopomofo: "ㄋㄜˋ", spellingVi: "nưa" },
  l: { phoneticText: "勒", readingPinyin: "lè", readingBopomofo: "ㄌㄜˋ", spellingVi: "lưa" },

  // Âm cuống lưỡi: g, k, h (đọc ghép với -e / ưa)
  g: { phoneticText: "哥", readingPinyin: "gē", readingBopomofo: "ㄍㄜ", spellingVi: "cưa (không bật hơi)" },
  k: { phoneticText: "科", readingPinyin: "kē", readingBopomofo: "ㄎㄜ", spellingVi: "khưa (bật hơi mạnh)" },
  h: { phoneticText: "喝", readingPinyin: "hē", readingBopomofo: "ㄏㄜ", spellingVi: "hưa (họng ma sát)" },

  // Âm mặt lưỡi: j, q, x (đọc ghép với -i / i)
  j: { phoneticText: "基", readingPinyin: "jī", readingBopomofo: "ㄐㄧ", spellingVi: "chi (không bật hơi, bè miệng)" },
  q: { phoneticText: "欺", readingPinyin: "qī", readingBopomofo: "ㄑㄧ", spellingVi: "khi (bật hơi cực mạnh)" },
  x: { phoneticText: "西", readingPinyin: "xī", readingBopomofo: "ㄒㄧ", spellingVi: "xi (bè miệng)" },

  // Âm uốn lưỡi: zh, ch, sh, r (đọc ghép với -i / ư uốn lưỡi)
  zh: { phoneticText: "知", readingPinyin: "zhī", readingBopomofo: "ㄓ", spellingVi: "tri (uốn lưỡi, không bật hơi)" },
  ch: { phoneticText: "吃", readingPinyin: "chī", readingBopomofo: "ㄔ", spellingVi: "si (uốn lưỡi, BẬT HƠI)" },
  sh: { phoneticText: "诗", readingPinyin: "shī", readingBopomofo: "ㄕ", spellingVi: "sư (uốn lưỡi xát)" },
  r: { phoneticText: "日", readingPinyin: "rì", readingBopomofo: "ㄖˋ", spellingVi: "r / nhật (rung uốn lưỡi)" },

  // Âm đầu lưỡi trước: z, c, s (đọc ghép với -i / ư thẳng lưỡi)
  z: { phoneticText: "资", readingPinyin: "zī", readingBopomofo: "ㄗ", spellingVi: "chư (thẳng lưỡi, không bật hơi)" },
  c: { phoneticText: "雌", readingPinyin: "cī", readingBopomofo: "ㄘ", spellingVi: "xư (thẳng lưỡi, BẬT HƠI)" },
  s: { phoneticText: "思", readingPinyin: "sī", readingBopomofo: "ㄙ", spellingVi: "tư (thẳng lưỡi, xát nhẹ)" },

  // Bán nguyên âm: y, w
  y: { phoneticText: "衣", readingPinyin: "yī", readingBopomofo: "ㄧ", spellingVi: "y (như 'i' tiếng Việt)" },
  w: { phoneticText: "乌", readingPinyin: "wū", readingBopomofo: "ㄨ", spellingVi: "u (như 'u' chu tròn)" },

  // === VẬN MẪU (FINALS) ===
  // Vận mẫu đơn (6 nguyên âm đơn chuẩn)
  a: { phoneticText: "啊", readingPinyin: "ā", readingBopomofo: "ㄚ", spellingVi: "a (mở to miệng)" },
  o: { phoneticText: "喔", readingPinyin: "ō", readingBopomofo: "ㄛ", spellingVi: "ô (chu tròn môi)" },
  e: { phoneticText: "婀", readingPinyin: "ē", readingBopomofo: "ㄜ", spellingVi: "ưa / ơ (thanh 1 bằng phẳng, không dấu)" },
  i: { phoneticText: "衣", readingPinyin: "yī", readingBopomofo: "ㄧ", spellingVi: "i (dẹt khóe miệng)" },
  u: { phoneticText: "乌", readingPinyin: "wū", readingBopomofo: "ㄨ", spellingVi: "u (chúm tròn nhỏ)" },
  ü: { phoneticText: "迂", readingPinyin: "yū", readingBopomofo: "ㄩ", spellingVi: "uy (giữ tròn môi huýt sáo)" },
  v: { phoneticText: "迂", readingPinyin: "yū", readingBopomofo: "ㄩ", spellingVi: "uy (ü tròn môi)" },

  // Vận mẫu kép
  ai: { phoneticText: "哀", readingPinyin: "āi", readingBopomofo: "ㄞ", spellingVi: "ai" },
  ei: { phoneticText: "诶", readingPinyin: "ēi", readingBopomofo: "ㄟ", spellingVi: "ây" },
  ao: { phoneticText: "熬", readingPinyin: "āo", readingBopomofo: "ㄠ", spellingVi: "ao" },
  ou: { phoneticText: "欧", readingPinyin: "ōu", readingBopomofo: "ㄡ", spellingVi: "âu" },
  ia: { phoneticText: "鸭", readingPinyin: "yā", readingBopomofo: "ㄧㄚ", spellingVi: "ia" },
  ie: { phoneticText: "耶", readingPinyin: "yē", readingBopomofo: "ㄧㄝ", spellingVi: "iê" },
  ua: { phoneticText: "蛙", readingPinyin: "wā", readingBopomofo: "ㄨㄚ", spellingVi: "oa" },
  uo: { phoneticText: "窝", readingPinyin: "wō", readingBopomofo: "ㄨㄛ", spellingVi: "ua / uô" },
  üe: { phoneticText: "约", readingPinyin: "yuē", readingBopomofo: "ㄩㄝ", spellingVi: "uyê (tròn môi)" },
  ue: { phoneticText: "约", readingPinyin: "yuē", readingBopomofo: "ㄩㄝ", spellingVi: "uyê" },
  ve: { phoneticText: "约", readingPinyin: "yuē", readingBopomofo: "ㄩㄝ", spellingVi: "uyê" },
  iao: { phoneticText: "腰", readingPinyin: "yāo", readingBopomofo: "ㄧㄠ", spellingVi: "ieo" },
  iu: { phoneticText: "优", readingPinyin: "yōu", readingBopomofo: "ㄧㄡ", spellingVi: "iêu (viết tắt của iou)" },
  "iu (iou)": { phoneticText: "优", readingPinyin: "yōu", readingBopomofo: "ㄧㄡ", spellingVi: "iêu (viết tắt của iou)" },
  uai: { phoneticText: "歪", readingPinyin: "wāi", readingBopomofo: "ㄨㄞ", spellingVi: "oai" },
  ui: { phoneticText: "微", readingPinyin: "wēi", readingBopomofo: "ㄨㄟ", spellingVi: "uây (viết tắt của uei)" },
  "ui (uei)": { phoneticText: "微", readingPinyin: "wēi", readingBopomofo: "ㄨㄟ", spellingVi: "uây (viết tắt của uei)" },

  // Vận mẫu mũi trước (Nasal Finals - Front)
  an: { phoneticText: "安", readingPinyin: "ān", readingBopomofo: "ㄢ", spellingVi: "an" },
  en: { phoneticText: "恩", readingPinyin: "ēn", readingBopomofo: "ㄣ", spellingVi: "ân" },
  in: { phoneticText: "音", readingPinyin: "yīn", readingBopomofo: "ㄧㄣ", spellingVi: "in" },
  un: { phoneticText: "温", readingPinyin: "wēn", readingBopomofo: "ㄨㄣ", spellingVi: "uân (viết tắt của uen)" },
  "un (uen)": { phoneticText: "温", readingPinyin: "wēn", readingBopomofo: "ㄨㄣ", spellingVi: "uân (viết tắt của uen)" },
  ün: { phoneticText: "晕", readingPinyin: "yūn", readingBopomofo: "ㄩㄣ", spellingVi: "uyn (tròn môi)" },
  vn: { phoneticText: "晕", readingPinyin: "yūn", readingBopomofo: "ㄩㄣ", spellingVi: "uyn (tròn môi)" },
  ian: { phoneticText: "烟", readingPinyin: "yān", readingBopomofo: "ㄧㄢ", spellingVi: "iên (chú ý: ian đọc là iên)" },
  uan: { phoneticText: "弯", readingPinyin: "wān", readingBopomofo: "ㄨㄢ", spellingVi: "oan" },
  üan: { phoneticText: "冤", readingPinyin: "yuān", readingBopomofo: "ㄩㄢ", spellingVi: "uyên (tròn môi)" },
  van: { phoneticText: "冤", readingPinyin: "yuān", readingBopomofo: "ㄩㄢ", spellingVi: "uyên (tròn môi)" },

  // Vận mẫu mũi sau (Nasal Finals - Back)
  ang: { phoneticText: "肮", readingPinyin: "āng", readingBopomofo: "ㄤ", spellingVi: "ang (thanh 1 bằng phẳng)" },
  eng: { phoneticText: "鞥", readingPinyin: "ēng", readingBopomofo: "ㄥ", spellingVi: "âng (ngân âm mũi ng, không có h-)" },
  ing: { phoneticText: "鹰", readingPinyin: "yīng", readingBopomofo: "ㄧㄥ", spellingVi: "ing" },
  ong: { phoneticText: "嗡", readingPinyin: "wēng (ong)", readingBopomofo: "ㄨㄥ", spellingVi: "ung (chu tròn môi, ngân âm mũi ng)" },
  iang: { phoneticText: "央", readingPinyin: "yāng", readingBopomofo: "ㄧㄤ", spellingVi: "iang" },
  uang: { phoneticText: "汪", readingPinyin: "wāng", readingBopomofo: "ㄨㄤ", spellingVi: "oang" },
  iong: { phoneticText: "雍", readingPinyin: "yōng", readingBopomofo: "ㄩㄥ", spellingVi: "i-ung" },

  // Vận mẫu uốn lưỡi đặc biệt
  er: { phoneticText: "儿", readingPinyin: "ér", readingBopomofo: "ㄦˊ", spellingVi: "ơ uốn lưỡi" },

  // === THANH ĐIỆU (TONES - Đọc chuẩn cao độ âm vị, không đọc từ ví dụ) ===
  ā: { phoneticText: "ā", readingPinyin: "ā", readingBopomofo: "ˉ", spellingVi: "a (thanh 1, cao phẳng 5-5)" },
  á: { phoneticText: "á", readingPinyin: "á", readingBopomofo: "ˊ", spellingVi: "a (thanh 2, vút lên 3-5)" },
  ǎ: { phoneticText: "ǎ", readingPinyin: "ǎ", readingBopomofo: "ˇ", spellingVi: "a (thanh 3, xuống sâu 2-1-4)" },
  à: { phoneticText: "à", readingPinyin: "à", readingBopomofo: "ˋ", spellingVi: "a (thanh 4, rơi dứt khoát 5-1)" },
  "ā (thanh 1)": { phoneticText: "ā", readingPinyin: "ā", readingBopomofo: "ˉ", spellingVi: "a (thanh 1, cao phẳng 5-5)" },
  "á (thanh 2)": { phoneticText: "á", readingPinyin: "á", readingBopomofo: "ˊ", spellingVi: "a (thanh 2, vút lên 3-5)" },
  "ǎ (thanh 3)": { phoneticText: "ǎ", readingPinyin: "ǎ", readingBopomofo: "ˇ", spellingVi: "a (thanh 3, xuống sâu 2-1-4)" },
  "à (thanh 4)": { phoneticText: "à", readingPinyin: "à", readingBopomofo: "ˋ", spellingVi: "a (thanh 4, rơi dứt khoát 5-1)" },
  "a (thanh nhẹ)": { phoneticText: "a", readingPinyin: "a", readingBopomofo: "˙", spellingVi: "a (thanh nhẹ, ngắn nhẹ)" },
};

/**
 * Safely lookup phonetic reading info with fallback across aliases
 */
export function getPhoneticReading(pinyinOrId: string) {
  if (!pinyinOrId) return null;
  const clean = pinyinOrId.toLowerCase().trim();
  if (PHONETIC_READING_MAP[clean]) return PHONETIC_READING_MAP[clean];
  const base = clean.split(/[\s(]/)[0].trim();
  if (PHONETIC_READING_MAP[base]) return PHONETIC_READING_MAP[base];
  return null;
}

/**
 * High-definition native studio recordings for Pinyin Finals and Initials
 * (Nguồn âm thanh bản xứ phòng thu chuẩn cho từng âm Pinyin của AllSet Learning Pronunciation Wiki)
 */
export const PINYIN_STUDIO_AUDIO_MAP: Record<string, string> = {
  // === VẬN MẪU ĐƠN (SIMPLE FINALS) ===
  a: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/a1.mp3",
  o: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/o1.mp3",
  e: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/e1.mp3",
  i: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yi1.mp3",
  u: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wu1.mp3",
  ü: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yu1.mp3",
  v: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yu1.mp3",

  // === VẬN MẪU KÉP (COMPOUND FINALS) ===
  ai: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ai1.mp3",
  ei: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ei1.mp3",
  ao: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ao1.mp3",
  ou: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ou1.mp3",
  ia: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ya1.mp3",
  ie: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ye1.mp3",
  ua: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wa1.mp3",
  uo: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wo1.mp3",
  üe: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yue1.mp3",
  ue: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yue1.mp3",
  ve: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yue1.mp3",
  iao: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yao1.mp3",
  iu: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/you1.mp3",
  iou: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/you1.mp3",
  uai: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wai1.mp3",
  ui: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wei1.mp3",
  uei: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wei1.mp3",

  // === VẬN MẪU MŨI TRƯỚC (FRONT NASAL FINALS) ===
  an: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/an1.mp3",
  en: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/en1.mp3",
  in: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yin1.mp3",
  un: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wen1.mp3",
  uen: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wen1.mp3",
  ün: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yun1.mp3",
  vn: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yun1.mp3",
  ian: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yan1.mp3",
  uan: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wan1.mp3",
  üan: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yuan1.mp3",
  van: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yuan1.mp3",

  // === VẬN MẪU MŨI SAU (BACK NASAL FINALS) ===
  ang: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ang1.mp3",
  eng: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/eng1.mp3",
  ing: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ying1.mp3",
  ong: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/weng1.mp3",
  iang: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yang1.mp3",
  uang: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wang1.mp3",
  iong: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yong1.mp3",

  // === VẬN MẪU UỐN LƯỠI (RETROFLEX FINAL) ===
  er: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/er2.mp3",

  // === THANH MẪU (INITIALS) ===
  b: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/bo1.mp3",
  p: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/po1.mp3",
  m: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/mo1.mp3",
  f: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/fo1.mp3",
  d: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/de1.mp3",
  t: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/te1.mp3",
  n: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ne1.mp3",
  l: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/le1.mp3",
  g: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ge1.mp3",
  k: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ke1.mp3",
  h: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/he1.mp3",
  j: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ji1.mp3",
  q: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/qi1.mp3",
  x: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/xi1.mp3",
  zh: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/zhi1.mp3",
  ch: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/chi1.mp3",
  sh: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/shi1.mp3",
  r: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ri4.mp3",
  z: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/zi1.mp3",
  c: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/ci1.mp3",
  s: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/si1.mp3",
  y: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/yi1.mp3",
  w: "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/wu1.mp3",
};

/**
 * Play high quality studio recording for pinyin phoneme
 */
function playStudioAudio(url: string, slow = false): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    try {
      const audio = new Audio(url);
      audio.playbackRate = slow ? 0.72 : 1.0;
      let finished = false;

      const done = (success: boolean) => {
        if (!finished) {
          finished = true;
          resolve(success);
        }
      };

      audio.onended = () => done(true);
      audio.onerror = () => done(false);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio started playing smoothly
          })
          .catch(() => {
            done(false);
          });
      }

      // Safety timeout
      setTimeout(() => done(true), 3500);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Returns true if a voice is Cantonese (Tiếng Quảng Đông) - MUST BE EXCLUDED!
 */
function isCantoneseVoice(voice: SpeechSynthesisVoice): boolean {
  const lang = (voice.lang || "").toLowerCase().replace(/_/g, "-");
  const name = (voice.name || "").toLowerCase();

  return (
    lang.includes("zh-hk") ||
    lang.includes("zh-mo") ||
    lang.includes("yue") ||
    name.includes("cantonese") ||
    name.includes("hong kong") ||
    name.includes("hongkong") ||
    name.includes("macau") ||
    name.includes("macao") ||
    name.includes("粵") ||
    name.includes("粤") ||
    name.includes("sinji")
  );
}

/**
 * Find Standard Mandarin (Tiếng Phổ Thông / 普通话 / 國語) voices.
 * Strictly excludes Cantonese.
 */
export function getMandarinVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const allVoices = window.speechSynthesis.getVoices();

  return allVoices.filter((v) => {
    if (isCantoneseVoice(v)) return false;

    const lang = (v.lang || "").toLowerCase().replace(/_/g, "-");
    const name = (v.name || "").toLowerCase();

    return (
      lang.startsWith("zh") ||
      lang.startsWith("cmn") ||
      name.includes("chinese") ||
      name.includes("mandarin") ||
      name.includes("普通话") ||
      name.includes("普通話") ||
      name.includes("国语") ||
      name.includes("國語") ||
      name.includes("putonghua")
    );
  });
}

/**
 * Select the best Mandarin voice according to dialect preference.
 */
export function getPreferredMandarinVoice(
  preferDialect: MandarinDialect = getSavedMandarinDialect()
): SpeechSynthesisVoice | null {
  const mandarinVoices = getMandarinVoices();
  if (mandarinVoices.length === 0) {
    // Check if any voice matches zh-CN without being cantonese
    const all = window.speechSynthesis.getVoices();
    return (
      all.find(
        (v) =>
          !isCantoneseVoice(v) &&
          (v.lang.toLowerCase().includes("zh-cn") || v.lang.toLowerCase().includes("cmn"))
      ) || null
    );
  }

  // Look for target dialect
  if (preferDialect === "zh-TW") {
    const tw = mandarinVoices.find((v) => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return l.includes("tw") || l.includes("hant") || n.includes("taiwan") || n.includes("台灣") || n.includes("國語");
    });
    if (tw) return tw;
  } else {
    const cn = mandarinVoices.find((v) => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return l.includes("cn") || l.includes("hans") || n.includes("china") || n.includes("大陆") || n.includes("普通话");
    });
    if (cn) return cn;
  }

  return mandarinVoices[0];
}

/**
 * Synthesize tone pitch contour using Web Audio API as an ultra-reliable instant fallback.
 * Pitch levels (Chao 5-level system):
 * Level 1: ~165 Hz (Lowest pitch)
 * Level 2: ~200 Hz
 * Level 3: ~245 Hz (Mid pitch)
 * Level 4: ~300 Hz
 * Level 5: ~370 Hz (Highest pitch)
 */
export function synthesizeTonePitch(toneKey: string, slow = false): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined") {
        resolve();
        return;
      }
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        resolve();
        return;
      }

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Formant-like filter to simulate natural vowel /a/ body
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 850;
      filter.Q.value = 2.0;

      osc.type = "triangle"; // Warm, rounded sound

      const now = ctx.currentTime;
      const duration = slow ? 0.8 : 0.55;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      // Volume envelope (smooth attack and release)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.05);

      const k = toneKey.toLowerCase();
      if (k.includes("1") || k === "ā") {
        // Tone 1: High flat (5-5) ~350Hz throughout
        osc.frequency.setValueAtTime(350, now);
        gain.gain.setValueAtTime(0.35, now + duration - 0.08);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);
      } else if (k.includes("2") || k === "á") {
        // Tone 2: Mid to high rise (3-5) ~240Hz -> ~360Hz
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + duration);
        gain.gain.setValueAtTime(0.35, now + duration - 0.08);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);
      } else if (k.includes("3") || k === "ǎ") {
        // Tone 3: Dipping (2-1-4) ~210Hz -> ~160Hz -> ~290Hz
        const midTime = duration * 0.45;
        osc.frequency.setValueAtTime(210, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + midTime);
        osc.frequency.exponentialRampToValueAtTime(290, now + duration);
        gain.gain.setValueAtTime(0.35, now + duration - 0.08);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);
      } else if (k.includes("4") || k === "à") {
        // Tone 4: Falling (5-1) ~370Hz -> ~170Hz falling sharply
        const t4Duration = slow ? 0.5 : 0.38;
        osc.frequency.setValueAtTime(370, now);
        osc.frequency.exponentialRampToValueAtTime(170, now + t4Duration);
        gain.gain.setValueAtTime(0.38, now + t4Duration - 0.06);
        gain.gain.linearRampToValueAtTime(0.001, now + t4Duration);
      } else {
        // Tone 0: Neutral (short, light) ~260Hz
        const t0Duration = 0.2;
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + t0Duration);
        gain.gain.linearRampToValueAtTime(0.001, now + t0Duration);
      }

      osc.start(now);
      osc.stop(now + duration + 0.05);

      osc.onended = () => {
        try {
          ctx.close();
        } catch {}
        resolve();
      };

      setTimeout(resolve, (duration + 0.2) * 1000);
    } catch {
      resolve();
    }
  });
}

/**
 * Play text using pure Standard Mandarin SpeechSynthesis (Tiếng Phổ Thông).
 * Fallback to standard online Mandarin audio if SpeechSynthesis is unavailable.
 */
export function playMandarinText(
  text: string,
  slow = false,
  dialect: MandarinDialect = getSavedMandarinDialect()
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    // Clean text
    const cleanText = text.trim();
    if (!cleanText) {
      resolve();
      return;
    }

    // If text is a tone symbol (ā, á, ǎ, à, a) or tone id, route to playToneAudio!
    const cleanLower = cleanText.toLowerCase();
    if (
      ["ā", "á", "ǎ", "à"].includes(cleanText) ||
      cleanLower.startsWith("tone-") ||
      (cleanText.length === 1 && "āáǎà".includes(cleanText))
    ) {
      playToneAudio(cleanText, slow, dialect).then(resolve);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = dialect === "zh-TW" ? "zh-TW" : "zh-CN";
      utterance.rate = slow ? 0.72 : 0.95;
      utterance.pitch = 1.0;

      const voice = getPreferredMandarinVoice(dialect);
      if (voice) {
        utterance.voice = voice;
      }

      let hasEnded = false;
      const finish = () => {
        if (!hasEnded) {
          hasEnded = true;
          resolve();
        }
      };

      utterance.onend = finish;
      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error, using audio fallback:", e);
        fallbackToOnlineMandarin(cleanText, slow, dialect).then(finish);
      };

      // Safety timeout in case onend never fires
      setTimeout(() => {
        if (!hasEnded) finish();
      }, 5000);

      window.speechSynthesis.speak(utterance);
    } else {
      fallbackToOnlineMandarin(cleanText, slow, dialect).then(resolve);
    }
  });
}

/**
 * Online Mandarin pronunciation fallback audio stream
 */
function fallbackToOnlineMandarin(
  text: string,
  slow = false,
  dialect: MandarinDialect = "zh-CN"
): Promise<void> {
  return new Promise((resolve) => {
    try {
      const clean = text.trim();
      const isToneOrSingleVowel = /^[āáǎàaōóǒòoeēéěèeiīíǐìiuūúǔùuǖǘǚǜü]$/i.test(clean);
      const lang = dialect === "zh-TW" ? "zh-TW" : "zh-CN";

      if (isToneOrSingleVowel) {
        playToneAudio(clean, slow, dialect).then(resolve);
        return;
      }

      const primaryUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(clean)}&type=1`;
      const backupUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(clean)}`;

      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          resolve();
        }
      };

      const audio = new Audio(primaryUrl);
      audio.playbackRate = slow ? 0.75 : 1.0;
      audio.onended = finish;
      audio.onerror = () => {
        try {
          const backupAudio = new Audio(backupUrl);
          backupAudio.playbackRate = slow ? 0.75 : 1.0;
          backupAudio.onended = finish;
          backupAudio.onerror = finish;
          backupAudio.play().catch(finish);
        } catch {
          finish();
        }
      };

      audio.play().catch(() => {
        try {
          const backupAudio = new Audio(backupUrl);
          backupAudio.playbackRate = slow ? 0.75 : 1.0;
          backupAudio.onended = finish;
          backupAudio.onerror = finish;
          backupAudio.play().catch(finish);
        } catch {
          finish();
        }
      });

      setTimeout(finish, 4500);
    } catch {
      resolve();
    }
  });
}

/**
 * Phát âm thanh điệu đơn lập (Pure tone sound vocalization: ā, á, ǎ, à, a)
 * Đảm bảo phát âm chuẩn 100% bằng âm thanh thu âm bản xứ chuẩn (0ms latency, không phụ thuộc mạng),
 * KHÔNG BAO GIỜ đọc từ chữ Hán ví dụ.
 */
export function playToneAudio(
  toneIdentifier: string,
  slow = false,
  _dialect: MandarinDialect = getSavedMandarinDialect()
): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined") {
        resolve();
        return;
      }

      const key = toneIdentifier.toLowerCase().trim();
      let base64Audio: string | undefined = TONE_AUDIO_BASE64[key];

      if (!base64Audio) {
        if (key.includes("1") || /[āōēīūǖ]/.test(key) || key.includes("ˉ") || key.includes("¯")) {
          base64Audio = TONE_AUDIO_BASE64["tone-1"];
        } else if (key.includes("2") || /[áóéíúǘ]/.test(key) || key.includes("ˊ")) {
          base64Audio = TONE_AUDIO_BASE64["tone-2"];
        } else if (key.includes("3") || /[ǎǒěǐǔǚ]/.test(key) || key.includes("ˇ")) {
          base64Audio = TONE_AUDIO_BASE64["tone-3"];
        } else if (key.includes("4") || /[àòèìùǜ]/.test(key) || key.includes("ˋ")) {
          base64Audio = TONE_AUDIO_BASE64["tone-4"];
        } else if (key.includes("0") || key === "a" || key.includes("nhẹ") || key.includes("khinh") || key.includes("˙")) {
          base64Audio = TONE_AUDIO_BASE64["tone-0"];
        }
      }

      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          resolve();
        }
      };

      if (base64Audio) {
        const audio = new Audio(base64Audio);
        audio.playbackRate = slow ? 0.75 : 1.0;
        audio.onended = finish;
        audio.onerror = () => {
          synthesizeTonePitch(key, slow).then(finish);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Audio playing smoothly
            })
            .catch((err) => {
              console.warn("Direct HTML5 audio play prevented, using Web Audio synthesizer:", err);
              synthesizeTonePitch(key, slow).then(finish);
            });
        }

        // Safety timeout
        setTimeout(finish, 3500);
      } else {
        synthesizeTonePitch(key, slow).then(finish);
      }
    } catch (err) {
      console.error("playToneAudio error:", err);
      resolve();
    }
  });
}

/**
 * PHÁT ÂM TỪ PHIÊN ÂM (Phonetic spelling pronunciation)
 * e.g. for "b", speaks "玻" (bō); for "zh", speaks "知" (zhī); for "a", speaks "啊" (ā).
 * Với thanh điệu: Đọc âm thanh điệu nguyên bản (ā, á, ǎ, à, a), TUYỆT ĐỐI KHÔNG đọc từ ví dụ (妈, 麻, v.v.).
 * Với vận mẫu & thanh mẫu: Ưu tiên phát âm thanh phòng thu bản xứ chuẩn Pinyin (AllSet Learning),
 * tự động fallback sang bảng âm đọc quy chuẩn Tiếng Phổ Thông (SpeechSynthesis / Youdao).
 */
export async function playPhoneticAudio(item: PhoneticItem, slow = false): Promise<void> {
  // 1. THANH ĐIỆU (TONES): Phát âm âm thanh điệu thuần túy (ā, á, ǎ, à, a)
  if (item.type === "tone") {
    const toneKey = item.id || item.pinyin;
    return playToneAudio(toneKey, slow);
  }

  const pinyinKey = item.pinyin.toLowerCase().trim();
  const baseKey = pinyinKey.split(/[\s(]/)[0].trim();
  const rawIdKey = item.id ? item.id.toLowerCase().replace(/^(fin|ini|tone)-/, "") : "";

  // 2. ƯU TIÊN 1: Phát âm thanh bản xứ phòng thu chất lượng cao (Studio audio mp3)
  const studioUrl =
    PINYIN_STUDIO_AUDIO_MAP[pinyinKey] ||
    PINYIN_STUDIO_AUDIO_MAP[baseKey] ||
    PINYIN_STUDIO_AUDIO_MAP[rawIdKey];

  if (studioUrl) {
    const played = await playStudioAudio(studioUrl, slow);
    if (played) return;
  }

  // 3. ƯU TIÊN 2: Tra cứu từ bảng phiên âm quy chuẩn Tiếng Phổ Thông
  const reading = getPhoneticReading(pinyinKey);
  if (reading) {
    return playMandarinText(reading.phoneticText, slow);
  }

  // 4. Fallback chữ ví dụ hoặc pinyin
  const fallback = item.exampleWord || item.pinyin;
  return playMandarinText(fallback, slow);
}

/**
 * PHÁT ÂM CHỮ HÁN VÍ DỤ (Example Chinese word pronunciation)
 * e.g. for "b", speaks "八" (bā - Số tám); for "nihao", speaks "你好" (nǐ hǎo).
 */
export function playWordAudio(item: PhoneticItem, slow = false): Promise<void> {
  const text = item.exampleWord || item.pinyin;
  return playMandarinText(text, slow);
}

/**
 * Backward-compatible function: defaults to playing word or phonetic
 */
export function playNativeAudio(text: string, slow = false): Promise<void> {
  return playMandarinText(text, slow);
}

/**
 * Audio recorder manager for microphone voice capture
 */
export class AudioRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  public async startRecording(onVolumeLevel?: (level: number) => void): Promise<void> {
    this.audioChunks = [];

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    let mimeType = "audio/webm";
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      mimeType = "audio/webm;codecs=opus";
    } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
      mimeType = "audio/mp4";
    } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
      mimeType = "audio/ogg";
    }

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    if (onVolumeLevel) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const updateVolume = () => {
          if (!this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          onVolumeLevel(normalized);
          this.animFrameId = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (e) {
        console.warn("AudioContext analyzer not available:", e);
      }
    }

    this.mediaRecorder.start(100);
  }

  public stopRecording(): Promise<{ blob: Blob; base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder chưa được khởi tạo."));
        return;
      }

      this.mediaRecorder.onstop = () => {
        if (this.animFrameId) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
        if (this.audioContext && this.audioContext.state !== "closed") {
          this.audioContext.close();
          this.audioContext = null;
        }

        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        const mimeType = this.mediaRecorder?.mimeType || "audio/webm";
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve({ blob: audioBlob, base64, mimeType });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  public isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}
