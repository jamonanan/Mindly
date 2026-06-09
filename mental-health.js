
const FUNCTION_URL = "http://127.0.0.1:5001/mindly-7f7c4/us-central1/chatWithGemini";

const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

let chatHistory = [
    {
        role: "user",
        parts: [{ text: "Hello" }],
    },
    {
        role: "model",
        parts: [{ text: "Hello I'm your support buddy. How are you feeling about your studies today?" }],
    }
];

function createMessageElement(text, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(isUser ? "user-message" : "ai-message");

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let avatarHtml = '';
    if (!isUser) {
        avatarHtml = `
        <div class="avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="5" r="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="8" cy="16" r="1" fill="currentColor"/>
                <circle cx="16" cy="16" r="1" fill="currentColor"/>
            </svg>
        </div>`;
    }

    messageDiv.innerHTML = `
        ${avatarHtml}
        <div class="message-content">
            <p>${text.replace(/\n/g, '<br>')}</p>
            <span class="timestamp">${time}</span>
        </div>
    `;

    return messageDiv;
}

function appendMessage(element) {
    chatMessages.appendChild(element);
    scrollToBottom();
}

function scrollToBottom() {
    const container = document.getElementById("chat-container");
    container.scrollTop = container.scrollHeight;
}

async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Append user message
    const userMsgEl = createMessageElement(text, true);
    appendMessage(userMsgEl);
    chatInput.value = "";

    // 2. Add typing indicator
    const typingEl = createMessageElement("Typing...", false);
    appendMessage(typingEl);

    try {
        // 3. Send message to backend function
        const response = await fetch(FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                history: chatHistory
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const responseText = result.response;

        // Update history
        chatHistory.push({ role: "user", parts: [{ text: text }] });
        chatHistory.push({ role: "model", parts: [{ text: responseText }] });

        // 4. Replace typing indicator with actual response
        chatMessages.removeChild(typingEl);
        const aiMsgEl = createMessageElement(responseText, false);
        appendMessage(aiMsgEl);

    } catch (error) {
        console.error("Error sending message:", error);
        chatMessages.removeChild(typingEl);
        const errorEl = createMessageElement("Sorry, I'm having trouble connecting to the server. Please ensure the backend is running.", false);
        appendMessage(errorEl);
    }
}

// Event Listeners
sendBtn.addEventListener("click", handleSendMessage);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSendMessage();
    }
});
