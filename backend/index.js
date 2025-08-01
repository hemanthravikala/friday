import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openrouterKeys = [process.env.OPENROUTER_KEY_1, process.env.OPENROUTER_KEY_2];
let currentKeyIndex = 0;

// OpenRouter AI request
async function askOpenRouter(question) {
  for (let i = 0; i < openrouterKeys.length; i++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKeys[i]}`,
        },
        body: JSON.stringify({
          model: 'qwen:1.5-chat',
          messages: [{ role: 'user', content: question }],
        }),
      });

      const data = await response.json();
      if (data?.choices?.[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      }
    } catch (err) {
      console.log(`❌ OpenRouter key ${i + 1} failed`);
    }
  }
  return null;
}

// DuckDuckGo fallback
async function fetchFromDuckDuckGo(query) {
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    const data = await res.json();
    return data.Abstract || data.RelatedTopics?.[0]?.Text || "No answer found.";
  } catch {
    return "DuckDuckGo failed.";
  }
}

// 🔄 MAIN POST HANDLER
app.post('/ask', async (req, res) => {
  const { question, mode } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Invalid question format' });
  }

  if (mode === 'ai') {
    const aiResponse = await askOpenRouter(question);
    if (aiResponse) return res.json({ response: aiResponse });

    // fallback to DuckDuckGo if AI fails
    const fallback = await fetchFromDuckDuckGo(question);
    return res.json({ response: fallback });
  } else {
    const result = await fetchFromDuckDuckGo(question);
    return res.json({ response: result });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
