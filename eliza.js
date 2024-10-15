

let context = {
    userName: '',
    userMood: '',
    conversationHistory: [],
};

document.addEventListener('DOMContentLoaded', function() {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');

    if (sendBtn) sendBtn.addEventListener('click', processUserInput);
    if (userInput) userInput.addEventListener('keydown', e => { 
        if (e.key === 'Enter') processUserInput(); 
    });

    startNewChat();
});

function startNewChat() {
    context.userName = '';
    context.userMood = '';
    context.conversationHistory = [];
    document.getElementById('chat-history').innerHTML = '';
    appendMessage('eliza', "Hello! I'm ELIZA, an AI chatbot. What's your name?");
}

function processUserInput() {
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');
    if (!userInput || !chatHistory) return;

    const userMessage = userInput.value.trim();
    if (userMessage === "") return;

    appendMessage('user', userMessage);


    // Save user message in conversation history
    context.conversationHistory.push({role: 'user', content: userMessage});

    const elizaResponse = getElizaResponse(userMessage);

    setTimeout(() => {
        appendMessage('eliza', elizaResponse);

        // Save Eliza response in conversation
        context.conversationHistory.push({role: 'eliza', content: elizaResponse});
    }, 500 + Math.random() * 1000);

    userInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;

}

function appendMessage(sender, message) {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    const newMessage = document.createElement('div');
    newMessage.classList.add('message', sender);
    newMessage.textContent = message;
    chatHistory.appendChild(newMessage);
}

function getElizaResponse(input) {
    // Basic response flow for now, more detailed responses in later commits
    if (!context.userName) {
        context.userName = extractName(input);
        return `Nice to meet you, ${context.userName}! How are you feeling today?`;
    }

    return "Tell me more about that.";
}

function extractName(input) {
    const nameMatch = input.match(/(?:I'm|I am|name is|call me) (\w+)/i);
    return nameMatch ? nameMatch[1] : "there";
}