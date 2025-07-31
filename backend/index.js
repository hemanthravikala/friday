const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEYS = process.env.API_KEYS?.split(",") || [];

const BASE_URL = "https://openrouter.ai/api/v1";

async function getAIResponse(message) {
  for (const key of API_KEYS) {
    try {
      const res = await axios.post(`${BASE_URL}/chat/completions`, {
        model: "qwen/qwen3-4b:free",
        messages: [{ role: "user", content: message }],
      }, {
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourfrontend.site",
          "X-Title": "AI Web",
        }
      });
      return res.data.choices[0].message;
    } catch (err) {
      console.log("Key failed. Trying next...");
    }
  }
  return { content: "All API keys failed or network error." };
}

app.post("/ask", async (req, res) => {
  const userInput = req.body.message;
  const aiReply = await getAIResponse(userInput);
  res.json(aiReply);
});

app.get("/", (req, res) => {
  res.send("✅ Friday Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
