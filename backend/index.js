const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ✅ Use API_KEY_1 and API_KEY_2 directly
const API_KEYS = [
  process.env.API_KEY_1,
  process.env.API_KEY_2
].filter(Boolean);

let currentKeyIndex = 0;

function getNextKey() {
  if (API_KEYS.length === 0) return null;
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

async function askOpenAI(message) {
  let tries = API_KEYS.length;
  while (tries--) {
    const apiKey = getNextKey();
    const config = new Configuration({ apiKey });
    const openai = new OpenAIApi(config);
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      });
      return completion.data.choices[0].message.content;
    } catch (err) {
      console.warn(`Key failed: ${apiKey.slice(0, 8)}...`, err.message);
      continue;
    }
  }
  return "❌ All API keys failed or network error.";
}

// ✅ Root route — health check
app.get("/", (req, res) => {
  res.send("✅ Friday Backend is running!");
});

// ✅ /ask route — frontend calls this
app.post("/ask", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const reply = await askOpenAI(message);
  res.json({ reply });
});

app.listen(port, () => {
  console.log(`✅ Backend running at http://localhost:${port}`);
});
