import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openrouterKeys = [process.env.OPENROUTER_API_KEY_1, process.env.OPENROUTER_API_KEY_2];

async function askOpenRouter(question) {
  for (let key of openrouterKeys) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://hemanthravikala.github.io/",
          "X-Title": "FridayAI"
        },
        body: JSON.stringify({
          model: "qwen/qwen1.5-14b-chat",
          messages: [{ role: "user", content: question }]
        })
      });

      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
      }
    } catch (err) {
      console.log(`❌ Key failed, trying next...`);
    }
  }
  return null;
}

async function searchDuckDuckGo(question) {
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(question)}&format=json`);
    const data = await res.json();
    return data.Abstract || data.RelatedTopics?.[0]?.Text || "No answer found on DuckDuckGo.";
  } catch {
    return "DuckDuckGo search failed.";
  }
}

app.post("/ask", async (req, res) => {
  const { question, mode } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: "Invalid question" });
  }

  if (mode === "web") {
    const result = await searchDuckDuckGo(question);
    return res.json({ response: result });
  }

  // Default or "ai" mode
  const result = await askOpenRouter(question);
  if (result) {
    return res.json({ response: result });
  }

  // AI failed, fallback to DuckDuckGo
  const fallback = await searchDuckDuckGo(question);
  return res.json({ response: fallback });
});

app.get("/", (req, res) => {
  res.send("✅ Friday backend running");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
