
      // === Selectors (same as before) ===
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

const API_KEY = "AIzaSyBPHvhMcLeT52nrrKXX5hBG2ymA34DvdXE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// ✅ small helper to make bot message with avatar
function appendBotMessage(text) {
  const botHTML = `
    <svg 
      class="bot-avatar"
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="50"
      viewBox="0 0 1024 1024">
      <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
    </svg>
    <div class="message-text">${text}</div>`;
  const botDiv = createMessageElement(botHTML, "bot-message");
  chatBody.appendChild(botDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
}

// === Generate bot response ===
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");
  
  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data ? [{ inline_data: userData.file }] : []),
    ],
  });
  
  const lowerMessage = userData.message.toLowerCase();
  
  // ✅ Custom replies with avatar
  if (
    lowerMessage.includes("your name") ||
    lowerMessage.includes("who are you") ||
    lowerMessage.includes("what is your name")
  ) {
    incomingMessageDiv.remove(); // remove the "thinking" placeholder
    appendBotMessage("I’m Max AI 🤖 — I’m here to make your day easier, answer your questions, and keep you company.🤗");
    chatHistory.push({
      role: "model",
      parts: [{ text: "I’m Max AI 🤖 I’m here to make your day easier, answer your questions, and keep you company �!" }],
    });
    return;
  }
  
  if (
    lowerMessage.includes("your owner") ||
    lowerMessage.includes("who owns you") ||
    lowerMessage.includes("who is your owner")
  ) {
    incomingMessageDiv.remove();
    appendBotMessage("I was created and lovingly maintained by Max🌟He built me so I can be here, helping and chatting with you.📌✌️");
    chatHistory.push({ role: "model", parts: [{ text: "I was created and lovingly maintained by Max🌟He built me so I can be here, helping and chatting with you.📌�" }] });
    return;
  }
  if (
    lowerMessage.includes("who made you") ||
    lowerMessage.includes("who built you") ||
    lowerMessage.includes("who created you")
  ) {
    incomingMessageDiv.remove(); // remove the "thinking" placeholder
    appendBotMessage("I was created and lovingly maintained by Max🌟He built me so I can be here, helping and chatting with you.📌✌️");
    chatHistory.push({
      role: "model",
      parts: [{ text: "I was created and lovingly maintained by Max🌟He built me so I can be here, helping and chatting with you📌✌️" }],
    });
    return;
  }
  
  // API call for all other messages
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: chatHistory }),
  };
  
  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    
    const apiResponseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
    messageElement.innerText = apiResponseText;
    chatHistory.push({
      role: "model",
      parts: [{ text: apiResponseText }],
    });
  } catch (error) {
    messageElement.innerText = error.message;
    messageElement.style.color = "#ff0000";
  } finally {
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

// === handle outgoing ===
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  if (!userData.message) return;
  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));
  
  // add user message
  const messageContent = `<div class="message-text"></div>
    ${
      userData.file.data
        ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />`
        : ""
    }`;
  const outgoingMessageDiv = createMessageElement(
    messageContent,
    "user-message"
  );
  outgoingMessageDiv.querySelector(".message-text").textContent =
    userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  
  // show placeholder bot thinking bubble
  setTimeout(() => {
    const messageContent = `<svg 
            class="bot-avatar"
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 1024 1024">
          <path d="..."></path>
          </svg>
          <div class="message-text">
            <div class="thinking-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>`;
    const incomingMessageDiv = createMessageElement(
      messageContent,
      "bot-message",
      "thinking"
    );
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// events
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));

messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});

// ✅ toggler logic unchanged
chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");
});
closeChatbot.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});
