
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Үндсэн хуудас
app.get("/", (_req, res) => {
  res.send("Babi AI server is running!");
});

// Серверийн шалгалт
app.get("/health", (_req, res) => {
  res.json({ ok: true, app: "Babi AI" });
});

// AI чат
app.post("/api/chat", async (req, res) => {
  console.log("CHAT REQUEST RECEIVED");

  try {
    const { AI_API_URL, AI_API_KEY, AI_MODEL } = process.env;

    if (!AI_API_URL || !AI_API_KEY || !AI_MODEL) {
      console.error("AI environment variables missing");
      return res.status(503).json({
        error: "AI тохиргоо дутуу байна."
      });
    }

    const messages = Array.isArray(req.body?.messages)
      ? req.body.messages
      : [];

    if (!messages.length) {
      return res.status(400).json({
        error: "Мессеж хоосон байна."
      });
    }

    const safeMessages = [
      {
        role: "system",
        content: "Чи Babi AI нэртэй, Монгол хэлээр ойлгомжтой, эелдэг хариулдаг туслах."
      },
      ...messages.filter(
        m =>
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string"
      )
    ];

    const upstream = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: safeMessages,
        temperature: 0.7
      })
    });

    const raw = await upstream.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("AI provider JSON бус хариу буцаалаа.");
    }

    if (!upstream.ok) {
      console.error("AI PROVIDER ERROR:", upstream.status);
      return res.status(502).json({
        error: "Gemini API алдаа",
        status: upstream.status,
        detail: data.error?.message || "Provider request failed"
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string") {
      console.error("Unexpected AI response");
      return res.status(502).json({
        error: "AI хариултын формат буруу байна."
      });
    }

    console.log("AI RESPONSE SUCCESS");

    return res.json({ reply });

  } catch (error) {
    console.error("CHAT ERROR:", error.message);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
});

const port = Number(process.env.PORT || 10000);

app.listen(port, "0.0.0.0", () => {
  console.log(`Babi AI server listening on 0.0.0.0:${port}`);
});
