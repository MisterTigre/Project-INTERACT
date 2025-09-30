class Chat {
    constructor(containerId, data = null) {
        this.container = document.getElementById(containerId);
        this.currentContactName = null;
        this.contacts = new Map(); 
        this.data = data; // Store the data parameter
        
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Back button event listener
        const backBtn = this.container.querySelector('#back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showContactSelection();
            });
        }

        // Send button event listener
        const sendBtn = this.container.querySelector('#send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.handleSendMessage();
            });
        }

        // Enter key on message input
        const messageInput = this.container.querySelector('#message-input');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSendMessage();
                }
            });
        }
    }    receiveMessage(senderName, messageText) {
        // If sender doesn't exist, create them
        if (!this.contacts.has(senderName)) {
            this.addContact(senderName);
        }

        // Create message element
        const messageElement = this.createMessageElement('received', messageText, senderName);
        
        // Add to appropriate messages container
        const messagesContainer = this.container.querySelector(`.messages[data-contact="${senderName}"]`);
        if (messagesContainer) {
            messagesContainer.appendChild(messageElement);
            
            // Scroll to bottom if this is the current chat
            if (this.currentContactName === senderName) {
                this.scrollToBottom();
            }
        }

        // Update unread count if not current chat
        if (this.currentContactName !== senderName) {
            const contact = this.contacts.get(senderName);
            contact.unreadCount++;
            this.updateContactUnreadCount(senderName, contact.unreadCount);
        }
    }    addContact(contactName, avatarUrl = 'https://placehold.co/50x50', unreadCount = 0) {        
        // Add to contacts map
        this.contacts.set(contactName, {avatar: avatarUrl, unreadCount});

        // Create contact card element
        const contactCard = document.createElement('div');
        contactCard.className = 'contact-card';
        contactCard.dataset.contact = contactName;
        
        // Create avatar element
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'contact-avatar';
        const avatarImage = document.createElement('img');
        avatarImage.src = avatarUrl;
        avatarImage.alt = contactName;
        avatarContainer.appendChild(avatarImage);

        // Create info element
        const contactInfo = document.createElement('div');
        contactInfo.className = 'contact-info';
        const contactNameElement = document.createElement('div');
        contactNameElement.className = 'contact-name';
        contactNameElement.textContent = contactName;
        contactInfo.appendChild(contactNameElement);

        // Append avatar and info to contact card
        contactCard.appendChild(avatarContainer);
        contactCard.appendChild(contactInfo);

        // Add unread count if needed
        if (unreadCount > 0) {
            const unreadCountElement = document.createElement('div');
            unreadCountElement.className = 'unread-count';
            unreadCountElement.textContent = unreadCount;
            contactCard.appendChild(unreadCountElement);
        }

        // Add click listener
        contactCard.addEventListener('click', () => {
            this.openChat(contactName);
        });

        // Add to contact list
        const contactSelectionList = this.container.querySelector('.contact-selection-list');
        contactSelectionList.appendChild(contactCard);

        // Create messages container for this contact
        const messagesContainer = this.container.querySelector('#messages-container');
        const contactMessagesContainer = document.createElement('div');
        contactMessagesContainer.className = `messages`;
        contactMessagesContainer.dataset.contact = contactName;
        messagesContainer.appendChild(contactMessagesContainer);
    }    sendMessage(contactName, messageText) {
        if (!contactName || !messageText.trim()) return;

        // Create message element
        const messageElement = this.createMessageElement('sent', messageText);
        
        // Add to appropriate messages container
        const messagesContainer = this.container.querySelector(`.messages[data-contact="${contactName}"]`);
        if (messagesContainer) {
            messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
        }
    }    createMessageElement(type, messageText, senderName = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (type === 'received' && senderName) {
            // Add avatar for received messages
            const contact = this.contacts.get(senderName);
            const avatarSrc = contact.avatar;
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = avatarSrc;
            avatarImg.alt = senderName;
            avatarDiv.appendChild(avatarImg);
            messageDiv.appendChild(avatarDiv);
        }

        // Create message
        const contentDiv = document.createElement('div'); // Container
        contentDiv.className = 'message-content';
        const textDiv = document.createElement('div'); // Text
        textDiv.className = 'message-text';
        textDiv.textContent = messageText;
        const timeDiv = document.createElement('div'); // Time
        timeDiv.className = 'message-time';
        timeDiv.textContent = time;
        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(timeDiv);

        // Append content to messageDiv
        messageDiv.appendChild(contentDiv);

        return messageDiv;
    }    openChat(contactName) {
        if (!this.contacts.has(contactName)) return;

        this.currentContactName = contactName;
        const contact = this.contacts.get(contactName);

        // Hide contact selection, show chat
        this.container.querySelector('#contact-selection').classList.remove('active');
        this.container.querySelector('#chat-page').classList.add('active');

        // Update chat header
        this.container.querySelector('#current-avatar').src = contact.avatar;
        this.container.querySelector('#current-contact-name').textContent = contactName;

        // Show appropriate messages
        this.container.querySelectorAll('.messages').forEach(messagesContainer => {
            messagesContainer.classList.remove('active');
        });
        
        const currentMessages = this.container.querySelector(`.messages[data-contact="${contactName}"]`);
        if (currentMessages) {
            currentMessages.classList.add('active');
        }

        // Clear unread count
        contact.unreadCount = 0;
        this.updateContactUnreadCount(contactName, 0);

        // Focus on input
        const messageInput = this.container.querySelector('#message-input');
        if (messageInput) {
            messageInput.focus();
        }

        this.scrollToBottom();
    }    showContactSelection() {
        this.currentContactName = null;
        this.container.querySelector('#chat-page').classList.remove('active');
        this.container.querySelector('#contact-selection').classList.add('active');
        
        // Clear input
        const messageInput = this.container.querySelector('#message-input');
        if (messageInput) {
            messageInput.value = '';
        }
    }    handleSendMessage() {
        const messageInput = this.container.querySelector('#message-input');
        const messageText = messageInput.value.trim();
        
        if (messageText && this.currentContactName) {
            this.sendMessage(this.currentContactName, messageText);
            messageInput.value = '';
        }
    }    updateContactUnreadCount(contactName, count) {
        const contactCard = this.container.querySelector(`[data-contact="${contactName}"]`);
        if (!contactCard) return;

        let unreadElement = contactCard.querySelector('.unread-count');
        
        if (count > 0) {
            if (!unreadElement) {
                unreadElement = document.createElement('div');
                unreadElement.className = 'unread-count';
                contactCard.appendChild(unreadElement);
            }
            unreadElement.textContent = count;
        } else if (unreadElement) {
            unreadElement.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = this.container.querySelector('#messages-container');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    // Utility methods for external use
    getContacts() {
        return Array.from(this.contacts.values());
    }    getContact(contactName) {
        return this.contacts.get(contactName);
    }
}