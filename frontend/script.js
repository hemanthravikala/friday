document.getElementById("ask-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const question = input.value.trim();
  input.value = "";

  if (!question) return;

  addMessage(question, "user");
  addMessage("⌛ Thinking...", "assistant");

  try {
    const response = await fetch("https://your-backend.onrender.com/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    const enhanced = enhanceText(data.answer || "⚠️ Error: No response from Friday.");
    updateLastAssistantMessage(enhanced);
  } catch {
    updateLastAssistantMessage("⚠️ Error contacting Friday.");
  }
});

function addMessage(text, role) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.innerHTML = role === "assistant" ? enhanceText(text) : text;
  document.getElementById("chat-box").appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });
}

function updateLastAssistantMessage(newHTML) {
  const messages = document.querySelectorAll(".message.assistant");
  if (messages.length) {
    messages[messages.length - 1].innerHTML = newHTML;
  }
}

// Enhance text: Adds bold, paragraphs, lists, etc.
function enhanceText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // bold
    .replace(/### (.*?)\n/g, "<h3>$1</h3>") // h3
    .replace(/1\. (.*?)\n/g, "<p><b>1.</b> $1</p>") // numbered
    .replace(/2\. (.*?)\n/g, "<p><b>2.</b> $1</p>")
    .replace(/3\. (.*?)\n/g, "<p><b>3.</b> $1</p>")
    .replace(/4\. (.*?)\n/g, "<p><b>4.</b> $1</p>")
    .replace(/5\. (.*?)\n/g, "<p><b>5.</b> $1</p>")
    .replace(/\n\n+/g, "<br><br>") // double line breaks
    .replace(/\n/g, "<br>"); // single line breaks
}
