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
let currentKeyIndex = 0;

// DuckDuckGo fallback
async function fetchFromDuckDuckGo(question) {
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(question)}&format=json`);
    const data = await res.json();
    return data.Abstract || data.RelatedTopics?.[0]?.Text || "No answer found on DuckDuckGo.";
  } catch {
    return "DuckDuckGo search failed.";
  }
}

// Ask OpenRouter API with Qwen model
async function askOpenRouter(question) {
  for (let i = 0; i < openrouterKeys.length; i++) {
    const key = openrouterKeys[i];
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://hemanthravikala.github.io", // optional
          "X-Title": "Friday-AI", // optional
        },
        body: JSON.stringify({
          model: "qwen/qwen1.5-7b-chat",
          messages: [
            { role: "system", content: "You are Friday, a helpful assistant." },
            { role: "user", content: question }
          ]
        })
      });

      if (!response.ok) throw new Error("OpenRouter error");
      const data = await response.json();
      return data.choices?.[0]?.message?.content.trim() || null;
    } catch (err) {
      console.log(`❌ OpenRouter key ${i + 1} failed.`);
    }
  }
  return null;
}

// Route to handle user questions
app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Invalid question format' });
  }

  const aiResponse = await askOpenRouter(question);
  if (aiResponse) {
    return res.json({ response: aiResponse });
  }

  const duckAnswer = await fetchFromDuckDuckGo(question);
  return res.json({ response: duckAnswer });
});

// Default route
app.get('/', (req, res) => {
  res.send('✅ Friday backend using OpenRouter is live');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
