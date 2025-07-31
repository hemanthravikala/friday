const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEYS = [
  process.env.API_KEY_1,
  process.env.API_KEY_2
];

const BASE_URL = "https://openrouter.ai/api/v1";

async function getAIResponse(message) {
  for (const key of API_KEYS) {
    try {
      const res = await axios.post(`${BASE_URL}/chat/completions`, {
        model: "qwen/qwen3-4b:free",
        messages: [{ role: "user", content: message }],
      }, {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourfrontend.site",
          "X-Title": "AI Web",
        }
      });

      return { content: res.data.choices[0].message.content };
    } catch (err) {
      console.log("OpenRouter key failed, trying next...");
    }
  }

  // If all API keys fail, fallback to DuckDuckGo
  try {
    const res = await axios.get("https://api.duckduckgo.com/", {
      params: {
        q: message,
        format: "json"
      }
    });

    return { content: res.data.AbstractText || "No direct answer found." };
  } catch (err) {
    return { content: "All API keys failed and DuckDuckGo also failed." };
  }
}

app.get("/", (req, res) => {
  res.send("✅ Friday Backend is running!");
});

app.post("/ask", async (req, res) => {
  const userInput = req.body.message;
  const aiReply = await getAIResponse(userInput);
  res.json(aiReply);
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
