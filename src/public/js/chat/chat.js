class Chat {
    constructor(id) {
        this.container = document.getElementById(this.id);
        this.currentContact = null;
        this.contacts = new Map(); 
    }

    addContact(id, name, avatar = 'https://placehold.co/50x50', unreadCount = 0) {        
        // Add to contacts map
        this.contacts.set(id, { id, name, avatar, unreadCount });

        // Create contact card element
        const contactCard = document.createElement('div');
        contactCard.className = 'contact-card';
        contactCard.dataset.contact = id;
        
        contactCard.innerHTML = `
            <div class="contact-avatar">
                <img src="${avatar}" alt="${name}">
            </div>
            <div class="contact-info">
                <div class="contact-name">${name}</div>
            </div>
            ${unreadCount > 0 ? `<div class="unread-count">${unreadCount}</div>` : ''}
        `;

        // Add click listener
        contactCard.addEventListener('click', () => {
            this.openChat(id);
        });

        // Add to contact list
        const contactList = this.container.querySelector('.contact-selection-list');
        contactList.appendChild(contactCard);

        // Create messages container for this contact
        const messagesContainer = this.container.querySelector('#messages-container');
        const newMessagesDiv = document.createElement('div');
        newMessagesDiv.className = `messages-${id} messages`;
        messagesContainer.appendChild(newMessagesDiv);
    }

    receiveMessage(sender, message, timestamp = null) {
        // If sender doesn't exist, create them
        if (!this.contacts.has(sender)) {
            this.addContact({
                id: sender,
                name: sender.charAt(0).toUpperCase() + sender.slice(1)
            });
        }

        // Create message element
        const messageElement = this.createMessageElement('received', message, timestamp, sender);
        
        // Add to appropriate messages container
        const messagesDiv = this.container.querySelector(`.messages-${sender}`);
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

    sendMessage(contactId, message, timestamp = null) {
        if (!contactId || !message.trim()) return;

        // Create message element
        const messageElement = this.createMessageElement('sent', message, timestamp);
        
        // Add to appropriate messages container
        const messagesDiv = this.container.querySelector(`.messages-${contactId}`);
        if (messagesDiv) {
            messagesDiv.appendChild(messageElement);
            this.scrollToBottom();
        }
    }

    createMessageElement(type, message, timestamp = null, sender = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const time = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let avatarHTML = '';
        if (type === 'received' && sender) {
            const contact = this.contacts.get(sender);
            const avatarSrc = contact ? contact.avatar : 'https://via.placeholder.com/30';
            avatarHTML = `
                <div class="message-avatar">
                    <img src="${avatarSrc}" alt="${sender}">
                </div>
            `;
        }

        messageDiv.innerHTML = `
            ${avatarHTML}
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        return messageDiv;
    }

    openChat(contactId) {
        if (!this.contacts.has(contactId)) return;

        this.currentContact = contactId;
        const contact = this.contacts.get(contactId);

        // Hide contact selection, show chat
        this.container.querySelector('#contact-selection').classList.remove('active');
        this.container.querySelector('#chat-page').classList.add('active');

        // Update chat header
        this.container.querySelector('#current-avatar').src = contact.avatar;
        this.container.querySelector('#current-contact-name').textContent = contact.name;

        // Show appropriate messages
        this.container.querySelectorAll('.messages').forEach(msgs => {
            msgs.classList.remove('active');
        });
        
        const currentMessages = this.container.querySelector(`.messages-${contactId}`);
        if (currentMessages) {
            currentMessages.classList.add('active');
        }

        // Clear unread count
        contact.unreadCount = 0;
        this.updateContactUnreadCount(contactId, 0);

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