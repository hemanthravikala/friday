const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEYS = [
  "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",
  "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"
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
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourfrontend.site",
          "X-Title": "AI Web",
        }
      });

      return res.data.choices[0].message;
    } catch (err) {
      console.log("Failed with one key, trying next...");
    }
  }
  return { content: "Both API keys failed or no internet." };
}

app.post("/ask", async (req, res) => {
  const userInput = req.body.message;
  const aiReply = await getAIResponse(userInput);
  res.json(aiReply);
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
