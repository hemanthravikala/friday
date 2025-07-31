import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openaiKeys = [process.env.OPENAI_API_KEY_1, process.env.OPENAI_API_KEY_2];
let currentKeyIndex = 0;

const openai = new OpenAI({ apiKey: openaiKeys[currentKeyIndex] });

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

// Handle AI question
async function askOpenAI(question) {
  for (let i = 0; i < openaiKeys.length; i++) {
    const key = openaiKeys[i];
    try {
      const tempOpenAI = new OpenAI({ apiKey: key });
      const chat = await tempOpenAI.chat.completions.create({
        messages: [{ role: "user", content: question }],
        model: "gpt-3.5-turbo",
      });
      return chat.choices[0].message.content.trim();
    } catch (err) {
      console.log(`❌ API key ${i + 1} failed. Trying next...`);
    }
  }
  return null;
}

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Invalid question format' });
  }

  const aiResponse = await askOpenAI(question);
  if (aiResponse) {
    return res.json({ response: aiResponse });
  }

  const duckAnswer = await fetchFromDuckDuckGo(question);
  return res.json({ response: duckAnswer });
});

app.get('/', (req, res) => {
  res.send('✅ Friday backend is live');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
