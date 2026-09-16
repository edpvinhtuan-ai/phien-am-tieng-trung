import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Support audio base64 uploads up to 25MB
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy get GoogleGenAI
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// AI Pronunciation Assessment API
app.post("/api/assess-pronunciation", async (req, res) => {
  try {
    const { targetWord, pinyin, bopomofo, audioBase64, mimeType, description, practiceMode, readingPinyin } = req.body;

    if (!targetWord || !pinyin) {
      return res.status(400).json({ error: "Thiếu thông tin âm cần luyện tập (targetWord hoặc pinyin)" });
    }

    const ai = getGeminiClient();

    // Fallback if no API key or invalid audio
    if (!ai || !audioBase64) {
      // Return simulated intelligent feedback so user can test even without key
      const fallbackScore = Math.floor(Math.random() * 15) + 82; // 82-96
      return res.json({
        score: fallbackScore,
        initialScore: Math.floor(Math.random() * 10) + 85,
        finalScore: Math.floor(Math.random() * 10) + 85,
        toneScore: Math.floor(Math.random() * 12) + 80,
        recognizedPinyin: readingPinyin || pinyin,
        recognizedTone: pinyin.match(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]/)?.[0] ? "Chuẩn xác" : "Thanh chuẩn",
        accuracyLevel: fallbackScore >= 90 ? "Xuất sắc" : fallbackScore >= 80 ? "Rất tốt" : "Cần luyện thêm",
        feedbackVi: `Phát âm âm "${pinyin}" (${bopomofo || ""}) chuẩn Tiếng Phổ Thông! Khẩu hình mở tốt, âm thanh rõ ràng.`,
        tipsVi: `Chú ý giữ độ cao ổn định của thanh điệu Tiếng Phổ Thông và mở khoang miệng tròn trịa khi kết thúc âm.`,
        mouthShapeAdvice: `Đầu lưỡi đặt tự nhiên, luồng hơi thoát đều, không gồng cơ hàm quá mức.`,
        isAiEvaluated: false,
        note: !ai ? "Đang chạy chế độ đánh giá mẫu (Chưa cấu hình GEMINI_API_KEY)" : "Không nhận được dữ liệu âm thanh",
      });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.-]+;base64,/, "");
    const safeMimeType = mimeType || "audio/webm";

    const promptText = `Bạn là chuyên gia ngữ âm TIẾNG TRUNG PHỔ THÔNG (Standard Mandarin / 普通话 / 國語 - Tuyệt đối KHÔNG sử dụng chuẩn tiếng Quảng Đông).
Người học đang luyện phát âm chuẩn Phổ thông với các thông số sau:
- Chế độ luyện tập: ${practiceMode === "phonetic" ? "Luyện phát âm từ phiên âm (âm đọc quy chuẩn của thanh mẫu/vận mẫu)" : "Luyện phát âm từ vựng / chữ Hán ví dụ"}
- Mục tiêu chính: "${targetWord}"
- Phiên âm Latin (Hanyu Pinyin): "${pinyin}"
${readingPinyin ? `- Âm đọc quy chuẩn của phiên âm: "${readingPinyin}" (Lưu ý: các thanh mẫu thường đọc kèm nguyên âm mang thanh 1 như b->bō, p->pō, d->dé, g->gē, zh->zhī, v.v.)` : ""}
- Ký hiệu Chú âm (Bopomofo / Zhuyin): "${bopomofo || 'Không có'}"
${description ? `- Mô tả: ${description}` : ''}

Hãy nghe bản ghi âm của người học và đánh giá chi tiết theo chuẩn TIẾNG PHỔ THÔNG BẮC KINH / ĐÀI LOAN:
1. "score": Tổng điểm từ 0 đến 100 dựa trên độ chính xác chuẩn Phổ thông.
2. "initialScore": Điểm thanh mẫu (Initial/Phụ âm đầu) từ 0 đến 100 (độ chuẩn xác, độ bật hơi aspirated nếu có như p, t, k, q, ch, c).
3. "finalScore": Điểm vận mẫu (Final/Nguyên âm) từ 0 đến 100 (độ tròn môi, mở khẩu hình, âm mũi an/ang, en/eng...).
4. "toneScore": Điểm thanh điệu (Tone/Dấu) từ 0 đến 100 (thanh 1 cao bằng 55, thanh 2 lên 35, thanh 3 hạ sâu 214, thanh 4 dứt khoát 51, hoặc khinh thanh).
5. "recognizedPinyin": Phiên âm pinyin chuẩn Phổ thông mà bạn nghe được người dùng đọc thực tế.
6. "recognizedTone": Nhận xét thanh điệu mà người học đã phát ra (VD: "Đúng thanh 4", "Bị nhầm thành thanh 1", "Chưa xuống đủ sâu thanh 3"...).
7. "accuracyLevel": Một trong ba nhãn: "Xuất sắc", "Rất tốt", hoặc "Cần cải thiện".
8. "feedbackVi": Lời nhận xét chi tiết bằng tiếng Việt, chỉ rõ ưu điểm và nhược điểm khi phát âm tiếng Phổ thông.
9. "tipsVi": Lời khuyên cụ thể để sửa lỗi phát âm (cách đặt lưỡi, cách lấy hơi, so sánh với tiếng Việt).
10. "mouthShapeAdvice": Hướng dẫn vị trí môi, răng, đầu lưỡi cụ thể cho âm này.

Hãy phân tích cực kỳ chính xác và trả về JSON chuẩn theo schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          inlineData: {
            mimeType: safeMimeType,
            data: cleanBase64,
          },
        },
        {
          text: promptText,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Điểm tổng thể từ 0 đến 100" },
            initialScore: { type: Type.INTEGER, description: "Điểm thanh mẫu từ 0 đến 100" },
            finalScore: { type: Type.INTEGER, description: "Điểm vận mẫu từ 0 đến 100" },
            toneScore: { type: Type.INTEGER, description: "Điểm thanh điệu từ 0 đến 100" },
            recognizedPinyin: { type: Type.STRING, description: "Pinyin AI nghe được thực tế" },
            recognizedTone: { type: Type.STRING, description: "Nhận xét thanh điệu thực tế" },
            accuracyLevel: { type: Type.STRING, description: "Xuất sắc | Rất tốt | Cần cải thiện" },
            feedbackVi: { type: Type.STRING, description: "Nhận xét phân tích bằng tiếng Việt" },
            tipsVi: { type: Type.STRING, description: "Lời khuyên cải thiện bằng tiếng Việt" },
            mouthShapeAdvice: { type: Type.STRING, description: "Khẩu hình và vị trí đặt lưỡi" },
          },
          required: [
            "score",
            "initialScore",
            "finalScore",
            "toneScore",
            "recognizedPinyin",
            "feedbackVi",
            "tipsVi",
            "mouthShapeAdvice",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      ...parsed,
      isAiEvaluated: true,
    });
  } catch (error: any) {
    console.error("AI pronunciation evaluation error:", error);
    return res.status(500).json({
      error: "Không thể phân tích âm thanh bằng AI. Vui lòng thử lại.",
      details: error?.message || String(error),
    });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
