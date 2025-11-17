const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Your API keys from Render Environment Variables
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
          // --- CHANGE 1: Set to your live frontend URL ---
          "HTTP-Referer": "https://hemanthravikala.github.io",
          // --- CHANGE 2: Set to your app name ---
          "X-Title": "Friday AI Assistant"
        }
      });

      // Successful response
      return { content: res.data.choices[0].message.content };

    } catch (err) {
      console.log("OpenRouter key failed, trying next...");
      
      // --- CHANGE 3: Added detailed error logging ---
      // This will show the *real* error in your Render logs
      if (err.response) {
        // The request failed with a response from OpenRouter
        console.error("Error Status:", err.response.status);
        console.error("Error Data:", JSON.stringify(err.response.data, null, 2));
      } else {
        // The request failed for other reasons (e.g., network issue)
        console.error("Full Error:", err.message);
      }
    }
  }

  // This message is sent to the user if all API keys fail
  return { content: "All AI API keys failed. Please try again later." };
}

// --- Your existing server code (all correct) ---

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
