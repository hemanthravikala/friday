const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- CHANGE 1: Create a list of API Key/Model configurations ---
// The code will try these in order, one by one.
const API_CONFIGS = [
  {
    key: process.env.API_KEY_1,
    model: "mistralai/mistral-7b-instruct:free"
  },
  {
    key: process.env.API_KEY_2,
    model: "mistralai/mistral-7b-instruct:free"
  },
  {
    key: process.env.API_KEY_3,
    model: "deepseek/deepseek-chat:free" // Your Deepseek model
  },
  {
    key: process.env.API_KEY_4,
    model: "qwen/qwen3-4b:free" // Your Qwen model
  }
];

const BASE_URL = "https://openrouter.ai/api/v1";

async function getAIResponse(message) {
  // --- CHANGE 2: Loop through the new API_CONFIGS array ---
  for (const config of API_CONFIGS) {
    const { key, model } = config;

    // If a key is missing from Render's environment, skip it
    if (!key) {
      console.log(`Skipping model ${model}: API key not set.`);
      continue;
    }

    try {
      // Log which model is being attempted
      console.log(`Attempting call with model: ${model}`);

      const res = await axios.post(`${BASE_URL}/chat/completions`, {
        model: model, // Use the model from the config
        messages: [{ role: "user", content: message }],
      }, {
        headers: {
          Authorization: `Bearer ${key}`, // Use the key from the config
          "Content-Type": "application/json",
          "HTTP-Referer": "https://hemanthravikala.github.io",
          "X-Title": "Friday AI Assistant"
        }
      });

      // Successful response
      return { content: res.data.choices[0].message.content };

    } catch (err) {
      // Log which model failed, then try the next one
      console.log(`Failed to use model: ${model}. Trying next...`);
      
      if (err.response) {
        console.error("Error Status:", err.response.status);
        console.error("Error Data:", JSON.stringify(err.response.data, null, 2));
      } else {
        console.error("Full Error:", err.message);
      }
    }
  }

  // This message is sent to the user if all API keys/models fail
  return { content: "All AI API keys and models failed. Please try again later." };
}

// --- Your existing server code (no changes needed) ---

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
