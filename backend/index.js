import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const API_KEYS = process.env.API_KEYS?.split(",") || [];

async function getAIResponse(message) {
  if (!API_KEYS.length) {
    throw new Error("No API keys found in environment variables.");
  }

  const randomKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openchat/openchat-7b",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant named Friday",
        },
        {
          role: "user",
          content: message,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${randomKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

app.post("/ask", async (req, res) => {
  try {
    const userInput = req.body.message;
    const aiReply = await getAIResponse(userInput);
    res.json(aiReply);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ Homepage route (fixes “Cannot GET /”)
app.get("/", (req, res) => {
  res.send("✅ Friday Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
