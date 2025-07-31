import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch"; // For DuckDuckGo fallback

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Add CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// Your multiple OpenAI API keys (comma separated in .env)
const OPENAI_KEYS = process.env.OPENAI_API_KEYS?.split(",").map(key => key.trim()) || [];

// DuckDuckGo fallback
async function getDuckDuckGoAnswer(prompt) {
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(prompt)}&format=json`);
    const data = await res.json();
    return data.Abstract || "Sorry, no answer found via DuckDuckGo.";
  } catch (err) {
    return "DuckDuckGo search failed.";
  }
}

// Try OpenAI with fallback logic
async function askOpenAI(prompt) {
  for (let key of OPENAI_KEYS) {
    try {
      const openai = new OpenAI({ apiKey: key });
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });
      const reply = response.choices[0].message.content;
      return reply;
    } catch (error) {
      console.warn(`Key failed: ${key.slice(0, 8)}... — ${error.message}`);
    }
  }

  // Fallback to DuckDuckGo if all keys fail
  return await getDuckDuckGoAnswer(prompt);
}

// Main API route
app.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided." });
  }

  try {
    const reply = await askOpenAI(prompt);
    res.json({ reply });
  } catch (error) {
    console.error("Final failure:", error);
    res.status(500).json({ error: "Failed to get a response from Friday." });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Friday backend is live ✅");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
