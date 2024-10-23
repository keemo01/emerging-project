let context = {
    currentChatId: null,
    chats: [], // Array to store all chat sessions
};

document.addEventListener('DOMContentLoaded', function() {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const newChatBtn = document.getElementById('new-chat-btn');

    if (sendBtn) sendBtn.addEventListener('click', processUserInput);
    if (userInput) userInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') processUserInput();
    });
    if (newChatBtn) newChatBtn.addEventListener('click', startNewChat);

    // Start first chat if no chats exist
    if (context.chats.length === 0) {
        startNewChat();
    } else {
        loadChatHistory();
    }
});

function createNewChat() {
    const chatId = Date.now().toString();
    const newChat = {
        id: chatId,
        userName: '',
        userMood: '',
        conversationHistory: [],
        timestamp: new Date()
    };
    context.chats.push(newChat);
    return chatId;
}

function startNewChat() {
    const chatId = createNewChat();
    context.currentChatId = chatId;
    
    // Clear chat display
    document.getElementById('chat-history').innerHTML = '';
    
    // Add new chat to sidebar
    updateChatHistoryList();
    
    // Start conversation
    appendMessage('eliza', "Hello! I'm ELIZA, an AI chatbot. What's your name?");
}

function updateChatHistoryList() {
    const chatHistoryList = document.getElementById('chat-history-list');
    chatHistoryList.innerHTML = '';
    
    context.chats.sort((a, b) => b.timestamp - a.timestamp).forEach(chat => {
        const li = document.createElement('li');
        li.classList.add('chat-history-item');
        if (chat.id === context.currentChatId) {
            li.classList.add('active');
        }
        
        // Create chat preview text
        const previewName = chat.userName || 'New Chat';
        const timestamp = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }).format(new Date(chat.timestamp));
        
        li.innerHTML = `
            <div class="chat-preview">
                <span class="chat-title">${previewName}</span>
                <span class="chat-timestamp">${timestamp}</span>
            </div>
        `;
        
        li.addEventListener('click', () => switchToChat(chat.id));
        chatHistoryList.appendChild(li);
    });
}

function switchToChat(chatId) {
    context.currentChatId = chatId;
    const chat = context.chats.find(c => c.id === chatId);
    
    // Update UI
    document.getElementById('chat-history').innerHTML = '';
    updateChatHistoryList();
    
    // Reload conversation
    chat.conversationHistory.forEach(msg => {
        appendMessage(msg.role, msg.content);
    });
}

function getCurrentChat() {
    return context.chats.find(chat => chat.id === context.currentChatId);
}

function processUserInput() {
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');
    if (!userInput || !chatHistory) return;

    const userMessage = userInput.value.trim();
    if (userMessage === "" || userMessage.length < 2) return;

    const currentChat = getCurrentChat();
    appendMessage('user', userMessage);

    // Save user message in conversation history
    currentChat.conversationHistory.push({role: 'user', content: userMessage});

    const elizaResponse = getElizaResponse(userMessage, currentChat);

    setTimeout(() => {
        appendMessage('eliza', elizaResponse);
        currentChat.conversationHistory.push({role: 'eliza', content: elizaResponse});
        
        // Update timestamp
        currentChat.timestamp = new Date();
        updateChatHistoryList();
    }, 500 + Math.random() * 1000);

    userInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function getElizaResponse(input, chat) {
    // Handle the case where ELIZA doesn't know the user's name yet
    if (!chat.userName) {
        chat.userName = extractName(input);
        return `Nice to meet you, ${chat.userName}! How are you feeling today?`;
    }

    // Handle the case where ELIZA doesn't know the user's mood yet
    if (!chat.userMood) {
        chat.userMood = extractMood(input);
        return `I see you're feeling ${chat.userMood}. Can you tell me more about what has been on your mind recently?`;
    }

    // Keyword detection for more personalized responses
    if (input.match(/\b(sad|depressed|unhappy|down)\b/i)) {
        return `I'm really sorry you're feeling this way, ${chat.userName}. What do you think is causing you to feel down?`;
    } else if (input.match(/\b(happy|good|excited|great)\b/i)) {
        return `That's fantastic to hear, ${chat.userName}! What's been the highlight of your day?`;
    } else if (input.match(/\b(stress|anxious|nervous)\b/i)) {
        return `It sounds like you're dealing with a lot of stress, ${chat.userName}. Is there something specific making you feel this way?`;
    }

    return "I'd love to hear more about that.";
}

function appendMessage(sender, message) {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    const newMessage = document.createElement('div');
    newMessage.classList.add('message', sender);
    newMessage.textContent = message;

    chatHistory.appendChild(newMessage);
}

// Keep the original extractName and extractMood functions
function extractName(input) {
    const nameMatch = input.match(/(?:I'm|I am|name is|call me|my name is) (\w+)/i);
    return nameMatch ? nameMatch[1] : "there";
}

function extractMood(input) {
    const moodMatch = input.match(/\b(happy|sad|good|bad|depressed|excited|nervous|anxious|stressed|great)\b/i);
    return moodMatch ? moodMatch[1] : "neutral";
}