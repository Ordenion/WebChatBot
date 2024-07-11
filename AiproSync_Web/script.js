document.addEventListener("DOMContentLoaded", function() {
    var chatBox = document.getElementById('chat-box');
    var chatBubble = document.getElementById('chat-bubble');
    chatBox.style.display = 'none';
    chatBubble.style.display = 'flex';
    console.log('Initial state - chatBox:', chatBox.style.display, 'chatBubble:', chatBubble.style.display);
});

document.getElementById('chat-bubble').onclick = function() {
    var chatBox = document.getElementById('chat-box');
    var chatBubble = document.getElementById('chat-bubble');
    chatBox.style.display = 'flex';
    chatBubble.style.display = 'none';
    document.getElementById('user-input').focus();
};

document.getElementById('close-chat').onclick = function() {
    var chatBox = document.getElementById('chat-box');
    var chatBubble = document.getElementById('chat-bubble');
    chatBox.style.display = 'none';
    chatBubble.style.display = 'flex';
};

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter behavior (new line)
        sendMessage();
    } else {
        adjustTextareaHeight();
    }
}

function adjustTextareaHeight() {
    const textarea = document.getElementById('user-input');
    textarea.style.height = 'auto';
    const maxHeight = 72; // Max height for three rows
    if (textarea.scrollHeight > maxHeight) {
        textarea.style.height = maxHeight + 'px';
        textarea.style.overflowY = 'scroll'; // Show scrollbar if content exceeds max height
    } else {
        textarea.style.height = textarea.scrollHeight + 'px';
        textarea.style.overflowY = 'hidden'; // Hide scrollbar if content fits within max height
    }
}

async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;

    displayMessage('user', userInput);

    document.getElementById('user-input').value = '';
    adjustTextareaHeight(); // Reset the height after sending the message

    const typingIndicator = displayTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userInput,
                user_id: 'default_user_id' // Use user ID
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        removeTypingIndicator(typingIndicator);
        displayMessage('bot', data.response || 'No response from bot');
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator(typingIndicator);
        displayMessage('bot', 'Error: ' + error.message);
    }
}

function displayMessage(sender, message) {
    const chatBoxContent = document.getElementById('chat-box-content');
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container ' + sender;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message ' + sender;
    messageElement.textContent = message;

    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageContainer.appendChild(messageElement);
    messageContainer.appendChild(timestamp);
    chatBoxContent.appendChild(messageContainer);
    chatBoxContent.scrollTop = chatBoxContent.scrollHeight;
}

function displayTypingIndicator() {
    const chatBoxContent = document.getElementById('chat-box-content');
    const typingIndicatorContainer = document.createElement('div');
    typingIndicatorContainer.className = 'message-container bot';

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot typing-indicator';

    const dot1 = document.createElement('div');
    dot1.className = 'dot';
    const dot2 = document.createElement('div');
    dot2.className = 'dot';
    const dot3 = document.createElement('div');
    dot3.className = 'dot';

    typingIndicator.appendChild(dot1);
    typingIndicator.appendChild(dot2);
    typingIndicator.appendChild(dot3);

    typingIndicatorContainer.appendChild(typingIndicator);
    chatBoxContent.appendChild(typingIndicatorContainer);
    chatBoxContent.scrollTop = chatBoxContent.scrollHeight;

    return typingIndicatorContainer;
}

function removeTypingIndicator(typingIndicator) {
    typingIndicator.remove();
}
