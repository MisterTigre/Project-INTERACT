class ChatModule {
    constructor(id, data) {
        this.container = document.getElementById(id)
        this.discussions = new Map()
        this.currentDiscussion = null
        this.contacts = new Map()

        this.#setupEventListeners()
    }

    #setupEventListeners() {
        const backBtn = this.container.querySelector('#back-btn')
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.#showDiscussionSelection()
            })
        }

        const sendBtn = this.container.querySelector('#send-btn')
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.#sendMessage()
            })
        }

        const messageInput = this.container.querySelector('#message-input')
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.#sendMessage()
                }
            })
        }
    }

    #showDiscussionSelection() {
        this.currentDiscussion = null
        this.container.querySelector('#chat-page').classList.replace('d-block', 'd-none')
        this.container.querySelector('#discussion-selection').classList.replace('d-none', 'd-block')

        const messageInput = this.container.querySelector('#message-input')
        if (messageInput) {
            messageInput.value = ''
        }
    }

    notify(msg, payload) {
        switch (msg) {
            case "addDiscussion":
                this.#addDiscussion(payload)
                break
            case "addContact":
                this.#addContact(payload)
                break
            case "receive":
                this.#receiveMessage(payload)
                break
            case "answer":
                this.#toggleAnswer(payload.discussion.id)
                break
            case "choice":
                break
            default:
                return
        }
    }

    #addDiscussion(discussion) {
        this.discussions.set(discussion.id, { name: discussion.name, icon: discussion.icon, unreadCount: 0, canAnswer: discussion.canAnswer ?? false })

        const discussionCard = document.createElement('div')
        discussionCard.className = 'card mb-3 shadow-sm'
        discussionCard.id = discussion.id
        discussionCard.style.cursor = 'pointer'

        const cardBody = document.createElement('div')
        cardBody.className = 'card-body p-3'

        const row = document.createElement('div')
        row.className = 'd-flex align-items-center'

        // Avatar
        const avatarImg = document.createElement('img')
        avatarImg.src = discussion.icon
        avatarImg.alt = discussion.name
        avatarImg.className = 'rounded-circle me-3'
        avatarImg.width = 50
        avatarImg.height = 50

        // discussion info
        const discussionInfo = document.createElement('div')
        discussionInfo.className = 'flex-grow-1'

        const discussionNameElement = document.createElement('h6')
        discussionNameElement.className = 'mb-1 fw-bold'
        discussionNameElement.textContent = discussion.name

        discussionInfo.appendChild(discussionNameElement)

        row.appendChild(avatarImg)
        row.appendChild(discussionInfo)

        cardBody.appendChild(row)
        discussionCard.appendChild(cardBody)

        // Hover effects
        discussionCard.addEventListener('mouseenter', () => {
            discussionCard.classList.add('shadow')
        })
        discussionCard.addEventListener('mouseleave', () => {
            discussionCard.classList.remove('shadow')
        })

        discussionCard.addEventListener('click', () => {
            this.#openChat(discussion.id)
        })

        const discussionSelectionList = this.container.querySelector('.discussion-selection-list')
        discussionSelectionList.appendChild(discussionCard)

        // Create messages container
        const messagesContainer = this.container.querySelector('#messages-container')
        const discussionMessagesContainer = document.createElement('div')
        discussionMessagesContainer.className = 'messages p-3'
        discussionMessagesContainer.id = discussion.id
        discussionMessagesContainer.style.display = 'none'
        messagesContainer.appendChild(discussionMessagesContainer)
    }

    #addContact(contact) {
        this.contacts.set(contact.id, { name: contact.name, icon: contact.icon })
    }

    #receiveMessage(message) {
        if (!this.discussions.has(message.discussion.id)) {
            this.#addDiscussion(message.discussion)
        }
        if (!this.contacts.has(message.contact.id)) {
            this.#addContact(message.contact);
        }

        const messageElement = this.#createMessageElement('received', message.content, message.contact.id);

        const messagesContainer = this.container.querySelector(`.messages#${message.discussion.id}`);

        if (messagesContainer) {
            messagesContainer.appendChild(messageElement);

            if (this.currentDiscussion === message.discussion.id) {
                this.#scrollToBottom();
            }
        }

        if (this.currentDiscussion !== message.discussion.id) {
            const discussion = this.discussions.get(message.discussion.id);
            discussion.unreadCount++;
            this.#updateDiscussionUnreadCount(message.discussion.id, discussion.unreadCount);
        }
    }

    #createMessageElement(type, content, contactId = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `d-flex mb-3 ${type === 'sent' ? 'justify-content-end' : 'justify-content-start'}`;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Message content
        const messageContent = document.createElement('div');
        messageContent.className = type === 'sent' ? 'text-end' : 'text-start';
        messageContent.style.maxWidth = '70%';

        if (type === 'received' && contactId) {
            // Avatar for received messages
            const contact = this.contacts.get(contactId);
            const iconImg = document.createElement('img');
            iconImg.src = contact.icon;
            iconImg.alt = contact.name;
            iconImg.className = 'rounded-circle me-2';
            iconImg.width = 30;
            iconImg.height = 30;
            messageDiv.appendChild(iconImg);
            const nameElement = document.createElement('small');
            nameElement.className = 'text-muted fw-bold d-block mb-1';
            nameElement.textContent = contact.name;
            messageContent.appendChild(nameElement);
        }

        const messageText1 = document.createElement('div');
        messageText1.className = `p-2 rounded ${type === 'sent' ? 'bg-primary text-white' : 'bg-white border'}`;
        messageText1.textContent = content.text ? content.text : "Contient une image";

        const timeElement = document.createElement('small');
        timeElement.className = 'text-muted d-block mt-1';
        timeElement.textContent = time;

        messageContent.appendChild(messageText1);
        messageContent.appendChild(timeElement);
        messageDiv.appendChild(messageContent);

        return messageDiv;
    }

    #sendMessage() {
        const messageInput = this.container.querySelector('#message-input');
        const messageText = messageInput.value.trim();

        if (!messageText || !this.currentDiscussion) return

        const messageElement = this.#createMessageElement('sent', {text:messageText});

        const messagesContainer = this.container.querySelector(`.messages#${this.currentDiscussion}`);
        if (messagesContainer) {
            messagesContainer.appendChild(messageElement)
            this.#scrollToBottom()
            messageInput.value = ''
            this.#toggleAnswer(this.currentDiscussion)
            this.#updateInputGroupVisibility()
        }
    }

    #openChat(discussionId) {
        if (!this.discussions.has(discussionId)) return

        this.currentDiscussion = discussionId
        const discussion = this.discussions.get(discussionId)

        // Show/hide pages
        this.container.querySelector('#discussion-selection').classList.replace('d-block', 'd-none')
        this.container.querySelector('#chat-page').classList.replace('d-none', 'd-block')

        // Update chat header
        this.container.querySelector('#current-avatar').src = discussion.icon
        this.container.querySelector('#current-discussion-name').textContent = discussion.name

        // Show appropriate messages
        this.container.querySelectorAll('.messages').forEach(messagesContainer => {
            messagesContainer.style.display = 'none'
        })

        const currentMessages = this.container.querySelector(`.messages#${discussionId}`)
        if (currentMessages) {
            currentMessages.style.display = 'block'
        }

        // Update input group visibility based on answer permission
        this.#updateInputGroupVisibility()

        // Clear unread count
        discussion.unreadCount = 0
        this.#updateDiscussionUnreadCount(discussionId, 0)

        this.#scrollToBottom()
    }

    #toggleAnswer(discussionId) {
        if (!this.discussions.has(discussionId)) return
        this.discussions.get(discussionId).canAnswer = !this.discussions.get(discussionId).canAnswer
        this.#updateInputGroupVisibility()
    }

    #updateInputGroupVisibility() {
        const inputGroup = this.container.querySelector('.input-group')
        if (!inputGroup) return
        if(!this.currentDiscussion) return
        if (this.discussions.get(this.currentDiscussion).canAnswer) {
            inputGroup.classList.remove('d-none')
        } else {
            inputGroup.classList.add('d-none')
        }
    }

    #updateDiscussionUnreadCount(discussionId, count) {
        const discussionCard = this.container.querySelector(`#${discussionId}`)
        if (!discussionCard) return

        let unreadElement = discussionCard.querySelector('.unread-count')

        if (count > 0) {
            if (!unreadElement) {
                unreadElement = document.createElement('span')
                unreadElement.className = 'badge bg-danger rounded-pill unread-count'
                const row = discussionCard.querySelector('.d-flex')
                row.appendChild(unreadElement)
            }
            unreadElement.textContent = count
        } else if (unreadElement) {
            unreadElement.remove()
        }
    }

    #scrollToBottom() {
        const messagesContainer = this.container.querySelector('#messages-container')
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight
            }, 100)
        }
    }
}