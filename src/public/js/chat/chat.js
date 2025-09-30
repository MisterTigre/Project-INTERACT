class Chat {
    constructor(containerId, data = null) {
        this.container = document.getElementById(containerId);
        this.currentContactName = null;
        this.contacts = new Map(); 
        this.data = data;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const backBtn = this.container.querySelector('#back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showContactSelection();
            });
        }

        const sendBtn = this.container.querySelector('#send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.handleSendMessage();
            });
        }

        const messageInput = this.container.querySelector('#message-input');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSendMessage();
                }
            });
        }
    }

    receiveMessage(senderName, messageText) {
        if (!this.contacts.has(senderName)) {
            this.addContact(senderName);
        }

        const messageElement = this.createMessageElement('received', messageText, senderName);
        
        const messagesContainer = this.container.querySelector(`.messages[data-contact="${senderName}"]`);
        if (messagesContainer) {
            messagesContainer.appendChild(messageElement);
            
            if (this.currentContactName === senderName) {
                this.scrollToBottom();
            }
        }

        if (this.currentContactName !== senderName) {
            const contact = this.contacts.get(senderName);
            contact.unreadCount++;
            this.updateContactUnreadCount(senderName, contact.unreadCount);
        }
    }

    addContact(contactName, avatarUrl = 'https://placehold.co/50x50', unreadCount = 0) {        
        this.contacts.set(contactName, {avatar: avatarUrl, unreadCount});

        // Create contact card using Bootstrap classes
        const contactCard = document.createElement('div');
        contactCard.className = 'card mb-3 shadow-sm';
        contactCard.dataset.contact = contactName;
        contactCard.style.cursor = 'pointer';
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-3';
        
        const row = document.createElement('div');
        row.className = 'd-flex align-items-center';

        // Avatar
        const avatarImg = document.createElement('img');
        avatarImg.src = avatarUrl;
        avatarImg.alt = contactName;
        avatarImg.className = 'rounded-circle me-3';
        avatarImg.width = 60;
        avatarImg.height = 60;

        // Contact info
        const contactInfo = document.createElement('div');
        contactInfo.className = 'flex-grow-1';
        
        const contactNameElement = document.createElement('h6');
        contactNameElement.className = 'mb-1 fw-bold';
        contactNameElement.textContent = contactName;

        contactInfo.appendChild(contactNameElement);

        row.appendChild(avatarImg);
        row.appendChild(contactInfo);

        // Unread count badge
        if (unreadCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-danger rounded-pill unread-count';
            badge.textContent = unreadCount;
            row.appendChild(badge);
        }

        cardBody.appendChild(row);
        contactCard.appendChild(cardBody);

        // Hover effects
        contactCard.addEventListener('mouseenter', () => {
            contactCard.classList.add('shadow');
        });
        contactCard.addEventListener('mouseleave', () => {
            contactCard.classList.remove('shadow');
        });

        contactCard.addEventListener('click', () => {
            this.openChat(contactName);
        });

        const contactSelectionList = this.container.querySelector('.contact-selection-list');
        contactSelectionList.appendChild(contactCard);

        // Create messages container
        const messagesContainer = this.container.querySelector('#messages-container');
        const contactMessagesContainer = document.createElement('div');
        contactMessagesContainer.className = 'messages p-3';
        contactMessagesContainer.dataset.contact = contactName;
        contactMessagesContainer.style.display = 'none';
        messagesContainer.appendChild(contactMessagesContainer);
    }

    sendMessage(contactName, messageText) {
        if (!contactName || !messageText.trim()) return;

        const messageElement = this.createMessageElement('sent', messageText);
        
        const messagesContainer = this.container.querySelector(`.messages[data-contact="${contactName}"]`);
        if (messagesContainer) {
            messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
        }
    }

    createMessageElement(type, messageText, senderName = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `d-flex mb-3 ${type === 'sent' ? 'justify-content-end' : 'justify-content-start'}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (type === 'received' && senderName) {
            // Avatar for received messages
            const contact = this.contacts.get(senderName);
            const avatarImg = document.createElement('img');
            avatarImg.src = contact.avatar;
            avatarImg.alt = senderName;
            avatarImg.className = 'rounded-circle me-2';
            avatarImg.width = 30;
            avatarImg.height = 30;
            messageDiv.appendChild(avatarImg);
        }

        // Message content
        const messageContent = document.createElement('div');
        messageContent.className = type === 'sent' ? 'text-end' : 'text-start';
        messageContent.style.maxWidth = '70%';

        const messageText1 = document.createElement('div');
        messageText1.className = `p-2 rounded ${type === 'sent' ? 'bg-primary text-white' : 'bg-white border'}`;
        messageText1.textContent = messageText;

        const timeElement = document.createElement('small');
        timeElement.className = 'text-muted d-block mt-1';
        timeElement.textContent = time;

        messageContent.appendChild(messageText1);
        messageContent.appendChild(timeElement);
        messageDiv.appendChild(messageContent);

        return messageDiv;
    }

    openChat(contactName) {
        if (!this.contacts.has(contactName)) return;

        this.currentContactName = contactName;
        const contact = this.contacts.get(contactName);

        // Show/hide pages
        this.container.querySelector('#contact-selection').classList.replace('d-block', 'd-none');
        this.container.querySelector('#chat-page').classList.replace('d-none', 'd-block');

        // Update chat header
        this.container.querySelector('#current-avatar').src = contact.avatar;
        this.container.querySelector('#current-contact-name').textContent = contactName;

        // Show appropriate messages
        this.container.querySelectorAll('.messages').forEach(messagesContainer => {
            messagesContainer.style.display = 'none';
        });
        
        const currentMessages = this.container.querySelector(`.messages[data-contact="${contactName}"]`);
        if (currentMessages) {
            currentMessages.style.display = 'block';
        }

        // Clear unread count
        contact.unreadCount = 0;
        this.updateContactUnreadCount(contactName, 0);

        const messageInput = this.container.querySelector('#message-input');
        if (messageInput) {
            messageInput.focus();
        }

        this.scrollToBottom();
    }

    showContactSelection() {
        this.currentContactName = null;
        this.container.querySelector('#chat-page').classList.replace('d-block', 'd-none');
        this.container.querySelector('#contact-selection').classList.replace('d-none', 'd-block');
        
        const messageInput = this.container.querySelector('#message-input');
        if (messageInput) {
            messageInput.value = '';
        }
    }

    handleSendMessage() {
        const messageInput = this.container.querySelector('#message-input');
        const messageText = messageInput.value.trim();
        
        if (messageText && this.currentContactName) {
            this.sendMessage(this.currentContactName, messageText);
            messageInput.value = '';
        }
    }

    updateContactUnreadCount(contactName, count) {
        const contactCard = this.container.querySelector(`[data-contact="${contactName}"]`);
        if (!contactCard) return;

        let unreadElement = contactCard.querySelector('.unread-count');
        
        if (count > 0) {
            if (!unreadElement) {
                unreadElement = document.createElement('span');
                unreadElement.className = 'badge bg-danger rounded-pill unread-count';
                const row = contactCard.querySelector('.d-flex');
                row.appendChild(unreadElement);
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

    getContacts() {
        return Array.from(this.contacts.values());
    }

    getContact(contactName) {
        return this.contacts.get(contactName);
    }
}