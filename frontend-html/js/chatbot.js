function initChatbot() {
  // 1. Create HTML Elements
  const chatbotHTML = `
    <div class="chatbot-trigger" id="chatbot-trigger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    </div>
    <div class="chat-window" id="chat-window">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-bot-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
          </div>
          <div>
            <h3>Smart Assistant</h3>
            <p>Always active</p>
          </div>
        </div>
        <button class="logout-btn" onclick="toggleChat()" style="color:#fff;background:none;border:none;cursor:pointer;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="chat-body" id="chat-body">
        <div class="chat-msg msg-bot">Hello! I am your Smart University assistant. How can I help you today?</div>
      </div>
      <form class="chat-footer" id="chat-form">
        <input type="text" class="chat-input" placeholder="Type your message..." id="chat-input" autocomplete="off">
        <button type="submit" class="chat-send-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  // 2. Logic
  const trigger = document.getElementById('chatbot-trigger');
  const chatWin = document.getElementById('chat-window');
  const form    = document.getElementById('chat-form');
  const input   = document.getElementById('chat-input');
  const body    = document.getElementById('chat-body');

  window.toggleChat = () => {
    chatWin.classList.toggle('show');
    if (chatWin.classList.contains('show')) input.focus();
  };

  trigger.addEventListener('click', toggleChat);

  form.onsubmit = (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;

    // Add User Message
    addMessage(msg, 'user');
    input.value = '';

    // Simulate Bot Response (To be replaced by ML model)
    setTimeout(() => {
      addMessage("Thinking...", 'bot');
    }, 500);
  };

  function addMessage(text, side) {
    const div = document.createElement('div');
    div.className = `chat-msg msg-${side}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }
}

// Auto-init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}
