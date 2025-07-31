async function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById('chat-box');

  // Show user message
  const userDiv = document.createElement('div');
  userDiv.className = 'user';
  userDiv.textContent = message;
  chatBox.appendChild(userDiv);
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch('https://friday-backend-p9dp.onrender.com/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    const botDiv = document.createElement('div');
    botDiv.className = 'bot';
    botDiv.textContent = data.content || '⚠️ No response received.';
    chatBox.appendChild(botDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bot';
    errorDiv.textContent = '⚠️ Error contacting Friday.';
    chatBox.appendChild(errorDiv);
  }
}
