import { DailyStudySummary, StudyLogItem, UserStats } from "../types";

const HISTORY_KEY = "pinyin_bopomofo_study_history_v1";
const STATS_KEY = "pinyin_bopomofo_user_stats_v1";

export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getStudyHistory(): StudyLogItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      // Seed some friendly initial progress so daily progress is instantly visual
      const sampleHistory = generateInitialSeedData();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(sampleHistory));
      return sampleHistory;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading study history:", e);
    return [];
  }
}

export function saveStudyRecord(
  item: Omit<StudyLogItem, "id" | "timestamp" | "dateStr">
): StudyLogItem {
  const history = getStudyHistory();
  const today = getTodayDateStr();
  const newRecord: StudyLogItem = {
    ...item,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    dateStr: today,
  };

  const updatedHistory = [newRecord, ...history];
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    updateUserStatsOnNewLog(newRecord);
  } catch (e) {
    console.error("Failed to save study record:", e);
  }
  return newRecord;
}

function updateUserStatsOnNewLog(newRecord: StudyLogItem): void {
  const stats = getUserStats();
  const today = getTodayDateStr();

  // Streak calculation
  let newStreak = stats.currentStreak;
  if (!stats.lastActiveDate) {
    newStreak = 1;
  } else if (stats.lastActiveDate === today) {
    // Already active today, streak doesn't change
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (stats.lastActiveDate === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  const allLogs = getStudyHistory();
  const totalScores = allLogs.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = allLogs.length > 0 ? Math.round(totalScores / allLogs.length) : 0;

  const masteredSet = new Set(stats.masteredIds || []);
  if (newRecord.score >= 85) {
    masteredSet.add(newRecord.pinyin);
  }

  const updatedStats: UserStats = {
    totalSessions: stats.totalSessions + 1,
    totalPracticedCount: allLogs.length,
    currentStreak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
    lastActiveDate: today,
    averageScore: avgScore,
    masteredIds: Array.from(masteredSet),
  };

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
  } catch (e) {
    console.error("Failed to save user stats:", e);
  }
}

export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      const initialStats: UserStats = {
        totalSessions: 5,
        totalPracticedCount: 14,
        currentStreak: 3,
        bestStreak: 4,
        lastActiveDate: getTodayDateStr(),
        averageScore: 88,
        masteredIds: ["b", "m", "f", "d", "a", "i", "u", "nǐ hǎo"],
      };
      localStorage.setItem(STATS_KEY, JSON.stringify(initialStats));
      return initialStats;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      totalSessions: 0,
      totalPracticedCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastActiveDate: "",
      averageScore: 0,
      masteredIds: [],
    };
  }
}

export function getDailyProgressSummaries(): DailyStudySummary[] {
  const history = getStudyHistory();
  const map: Record<string, StudyLogItem[]> = {};

  history.forEach((item) => {
    if (!map[item.dateStr]) {
      map[item.dateStr] = [];
    }
    map[item.dateStr].push(item);
  });

  const dates = Object.keys(map).sort((a, b) => (a > b ? -1 : 1));

  return dates.map((date) => {
    const items = map[date];
    const totalScore = items.reduce((acc, curr) => acc + curr.score, 0);
    const avg = items.length > 0 ? Math.round(totalScore / items.length) : 0;
    const high = Math.max(...items.map((i) => i.score));
    return {
      date,
      itemsPracticed: items.length,
      averageScore: avg,
      highScore: high,
      details: items,
    };
  });
}

export function clearAllHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(STATS_KEY);
}

function generateInitialSeedData(): StudyLogItem[] {
  const now = new Date();
  const makeDate = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  return [
    {
      id: "seed_1",
      timestamp: Date.now() - 3600000,
      dateStr: makeDate(0),
      targetWord: "八",
      pinyin: "bā",
      bopomofo: "ㄅㄚ",
      type: "initial",
      score: 95,
      accuracyLevel: "Xuất sắc",
      feedbackVi: "Hai môi khép chặt chặn khí chuẩn xác, không bật hơi, thanh 1 cao phẳng rất tốt.",
    },
    {
      id: "seed_2",
      timestamp: Date.now() - 7200000,
      dateStr: makeDate(0),
      targetWord: "你好",
      pinyin: "nǐ hǎo",
      bopomofo: "ㄋㄧˇ ㄏㄠˇ",
      type: "vocabulary",
      score: 91,
      accuracyLevel: "Xuất sắc",
      feedbackVi: "Biến điệu thanh 3 nhuần nhuyễn ('ní hǎo'), khẩu hình mở đẹp.",
    },
    {
      id: "seed_3",
      timestamp: Date.now() - 86400000,
      dateStr: makeDate(1),
      targetWord: "怕",
      pinyin: "pà",
      bopomofo: "ㄆㄚˋ",
      type: "initial",
      score: 87,
      accuracyLevel: "Rất tốt",
      feedbackVi: "Âm bật hơi p khá mạnh, thanh 4 giáng rõ, cần chú ý dứt khoát hơn ở phần cuối.",
    },
    {
      id: "seed_4",
      timestamp: Date.now() - 86400000 * 1.5,
      dateStr: makeDate(1),
      targetWord: "吃",
      pinyin: "chī",
      bopomofo: "ㄔ",
      type: "initial",
      score: 82,
      accuracyLevel: "Rất tốt",
      feedbackVi: "Đầu lưỡi cong tốt, cần tăng thêm luồng hơi bật nén cho âm ch uốn lưỡi.",
    },
    {
      id: "seed_5",
      timestamp: Date.now() - 86400000 * 2.2,
      dateStr: makeDate(2),
      targetWord: "妈",
      pinyin: "mā",
      bopomofo: "ㄇㄚ",
      type: "tone",
      score: 96,
      accuracyLevel: "Xuất sắc",
      feedbackVi: "Thanh 1 âm vực 5-5 duy trì rất đều, âm hai môi m chuẩn xác.",
    },
  ];
}
