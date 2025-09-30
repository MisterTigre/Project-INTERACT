class Chat {
    constructor(id, data=null) {
        this.container = document.getElementById(id);
        this.currentContact = null;
        this.contacts = new Map(); 
        this.data = data; // Store the data parameter
    }

    addContact(name, avatar = 'https://placehold.co/50x50', unreadCount = 0) {        
        // Add to contacts map
        this.contacts.set(name, {avatar, unreadCount });

        // Create contact card element
        const contactCard = document.createElement('div');
        contactCard.className = 'contact-card';
        contactCard.dataset.contact = name;
        
        // Create avatar element
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'contact-avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = avatar;
        avatarImg.alt = name;
        avatarDiv.appendChild(avatarImg);

        // Create info element
        const infoDiv = document.createElement('div');
        infoDiv.className = 'contact-info';
        const nameDiv = document.createElement('div');
        nameDiv.className = 'contact-name';
        nameDiv.textContent = name;
        infoDiv.appendChild(nameDiv);

        // Append avatar and info to contact card
        contactCard.appendChild(avatarDiv);
        contactCard.appendChild(infoDiv);

        // Add unread count if needed
        if (unreadCount > 0) {
            const unreadDiv = document.createElement('div');
            unreadDiv.className = 'unread-count';
            unreadDiv.textContent = unreadCount;
            contactCard.appendChild(unreadDiv);
        }

        // Add click listener
        contactCard.addEventListener('click', () => {
            this.openChat(name);
        });

        // Add to contact list
        const contactList = this.container.querySelector('.contact-selection-list');
        contactList.appendChild(contactCard);

        // Create messages container for this contact
        const messagesContainer = this.container.querySelector('#messages-container');
        const newMessagesDiv = document.createElement('div');
        newMessagesDiv.className = `messages`;
        newMessagesDiv.dataset.contact = name;
        messagesContainer.appendChild(newMessagesDiv);
    }

    receiveMessage(sender, message) {
        // If sender doesn't exist, create them
        if (!this.contacts.has(sender)) {
            this.addContact(sender);
        }

        // Create message element
        const messageElement = this.createMessageElement('received', message, sender);
        
        // Add to appropriate messages container
        const messagesDiv = this.container.querySelector(`.messages[data-contact="${sender}"]`);
        if (messagesDiv) {
            messagesDiv.appendChild(messageElement);
            
            // Scroll to bottom if this is the current chat
            if (this.currentContact === sender) {
                this.scrollToBottom();
            }
        }

        // Update unread count if not current chat
        if (this.currentContact !== sender) {
            const contact = this.contacts.get(sender);
            contact.unreadCount++;
            this.updateContactUnreadCount(sender, contact.unreadCount);
        }
    }

    sendMessage(contactId, message, ) {
        if (!contactId || !message.trim()) return;

        // Create message element
        const messageElement = this.createMessageElement('sent', message);
        
        // Add to appropriate messages container
        const messagesDiv = this.container.querySelector(`.messages-${contactId}`);
        if (messagesDiv) {
            messagesDiv.appendChild(messageElement);
            this.scrollToBottom();
        }
    }

    createMessageElement(type, message, sender = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (type === 'received' && sender) {
            // Add avatar for received messages
            const contact = this.contacts.get(sender);
            const avatarSrc = contact.avatar;
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = avatarSrc;
            avatarImg.alt = sender;
            avatarDiv.appendChild(avatarImg);
            messageDiv.appendChild(avatarDiv);
        }

        // Create message
        const contentDiv = document.createElement('div'); // Container
        contentDiv.className = 'message-content';
        const textDiv = document.createElement('div'); // Text
        textDiv.className = 'message-text';
        textDiv.textContent = message;
        const timeDiv = document.createElement('div'); // Time
        timeDiv.className = 'message-time';
        timeDiv.textContent = time;
        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(timeDiv);

        // Append content to messageDiv
        messageDiv.appendChild(contentDiv);

        return messageDiv;
    }

    openChat(name) {
        if (!this.contacts.has(name)) return;

        this.currentContact = name;
        const contact = this.contacts.get(name);

        // Hide contact selection, show chat
        this.container.querySelector('#contact-selection').classList.remove('active');
        this.container.querySelector('#chat-page').classList.add('active');

        // Update chat header
        this.container.querySelector('#current-avatar').src = contact.avatar;
        this.container.querySelector('#current-contact-name').textContent = name;

        // Show appropriate messages
        this.container.querySelectorAll('.messages').forEach(msgs => {
            msgs.classList.remove('active');
        });
        
        const currentMessages = this.container.querySelector(`.messages[data-contact="${name}"]`);
        if (currentMessages) {
            currentMessages.classList.add('active');
        }

        // Clear unread count
        contact.unreadCount = 0;
        this.updateContactUnreadCount(name, 0);

        // Focus on input
        const messageInput = this.container.querySelector('#message-input');
        if (messageInput) {
            messageInput.focus();
        }

        this.scrollToBottom();
    }

    showContactSelection() {
        this.currentContact = null;
        this.container.querySelector('#chat-page').classList.remove('active');
        this.container.querySelector('#contact-selection').classList.add('active');
        
        // Clear input
        const messageInput = this.container.querySelector('#message-input');
        if (messageInput) {
            messageInput.value = '';
        }
    }

    handleSendMessage() {
        const messageInput = this.container.querySelector('#message-input');
        const message = messageInput.value.trim();
        
        if (message && this.currentContact) {
            this.sendMessage(this.currentContact, message);
            messageInput.value = '';
        }
    }

    updateContactUnreadCount(contactId, count) {
        const contactCard = this.container.querySelector(`[data-contact="${contactId}"]`);
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
    }

    getContact(contactId) {
        return this.contacts.get(contactId);
    }
}