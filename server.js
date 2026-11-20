import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({limit:"1mb"}));

app.get("/health", (_req,res) => res.json({ok:true, app:"BABY AI"}));

app.post("/api/chat", async (req,res) => {
  try {
    const {AI_API_URL, AI_API_KEY, AI_MODEL} = process.env;
    if (!AI_API_URL || !AI_API_KEY || !AI_MODEL) {
      return res.status(503).json({error:"AI_API_URL, AI_API_KEY, AI_MODEL тохируулаагүй байна."});
    }
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    if (!messages.length) return res.status(400).json({error:"Мессеж хоосон байна."});
    const safeMessages = [
      {role:"system", content:"Чи BABY AI нэртэй, Монгол хэлээр ойлгомжтой, эелдэг хариулдаг туслах. Мэдэхгүй зүйлээ зохиож хэлэхгүй."},
      ...messages.filter(m => ["user","assistant"].includes(m.role) && typeof m.content === "string")
    ];
    const upstream = await fetch(AI_API_URL, {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${AI_API_KEY}`},
      body:JSON.stringify({model:AI_MODEL,messages:safeMessages,temperature:0.7})
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(502).json({error:"AI provider request failed", detail:data});
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string") return res.status(502).json({error:"AI provider returned an unexpected response"});
    res.json({reply});
  } catch (error) {
    res.status(500).json({error:"Server error", detail:error.message});
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`BABY AI server listening on ${port}`));
