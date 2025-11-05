class ChatModule {
    #callback
    #container
    #discussions
    #currentDiscussion
    #contacts
    #waitingFor
    #discussionIdToRead

    /**
     * Creates a new ChatModule instance.
     * @param {string} id - The ID of the HTML container element for the chat module
     * @param {Object} data - Initial data for the chat module (currently unused)
     * @param {Function} callback - Callback function to be invoked on various chat events
     */
    constructor(id, data, callback) {
        this.#callback = callback
        this.#container = document.getElementById(id)
        if (!this.#container) {
            console.error(`ChatModule: Container with id '${id}' not found`)
            return
        }
        this.#discussions = new Map()
        this.#currentDiscussion = null
        this.#contacts = new Map()

        this.#waitingFor = "nothing"

        this.#setupEventListeners()
    }

    /**
     * Public interface for receiving notifications and messages from external sources.
     * Handles various message types to manage discussions, contacts, and messages.
     * @param {string} msg - The type of notification ('addDiscussion', 'addContact', 'send', 'answer', 'choice', 'sendAndWait')
     * @param {Object} payload - The data payload associated with the notification
     */
    notify(msg, payload) {
        switch (msg) {
            case "addDiscussion":
                this.#addDiscussion(payload)
                this.#callback()
                break
            case "addContact":
                this.#addContact(payload)
                this.#callback()
                break
            case "send":
                this.#receiveMessage(payload)
                break
            case "answer":
                this.#enableAnswer(payload.discussionId)
                break
            case "choice":
                this.#enableChoices(payload.discussionId, payload.choices)
                break
            case "sendAndWait":
                this.#waitingFor = "read"
                this.#discussionIdToRead = payload.discussionId
                this.#receiveMessage(payload)
                break
            default:
                console.error(`Invalid message: ${msg}`)
                return
        }
    }

    /**
     * Adds a new discussion to the chat module and creates its UI elements.
     * @param {Object} discussion - The discussion data
     * @param {string} discussion.id - The unique identifier for the discussion
     * @param {string} discussion.name - The display name of the discussion
     * @param {string} discussion.icon - The URL or path to the discussion's icon
     * @param {string} [discussion.state] - The initial state of the discussion (defaults to 'locked')
     */
    #addDiscussion(discussion) {
        if (!discussion || !discussion.id || !discussion.name || !discussion.icon) {
            console.error('ChatModule: Invalid discussion data')
            return
        }
        if (this.#discussions.has(discussion.id)){
            console.error("ChatModule: Discussion already exists")
            return
        }
        this.#discussions.set(discussion.id, { name: discussion.name, icon: discussion.icon, unreadCount: 0, state: discussion.state ?? "locked", callback: null })

        const discussionCard = document.createElement('div')
        discussionCard.className = 'card mb-3 shadow-sm'
        discussionCard.id = discussion.id
        discussionCard.style.cursor = 'pointer'

        const cardBody = document.createElement('div')
        cardBody.className = 'card-body p-3'

        const row = document.createElement('div')
        row.className = 'd-flex align-items-center'

        const iconImg = document.createElement('img')
        iconImg.src = discussion.icon
        iconImg.alt = discussion.name
        iconImg.className = 'rounded-circle me-3'
        iconImg.width = 50
        iconImg.height = 50

        const discussionInfo = document.createElement('div')
        discussionInfo.className = 'flex-grow-1'

        const discussionNameElement = document.createElement('h6')
        discussionNameElement.className = 'mb-1 fw-bold'
        discussionNameElement.textContent = discussion.name

        discussionInfo.appendChild(discussionNameElement)

        row.appendChild(iconImg)
        row.appendChild(discussionInfo)

        cardBody.appendChild(row)
        discussionCard.appendChild(cardBody)

        discussionCard.addEventListener('mouseenter', () => {
            discussionCard.classList.toggle('shadow', true)
        })
        discussionCard.addEventListener('mouseleave', () => {
            discussionCard.classList.toggle('shadow', false)
        })

        discussionCard.addEventListener('click', () => {
            this.#openChat(discussion.id)
        })

        const discussionSelectionList = this.#container.querySelector('.discussion-selection-list')
        discussionSelectionList.appendChild(discussionCard)

        const messagesContainer = this.#container.querySelector('#messages-container')
        const discussionMessagesContainer = document.createElement('div')
        discussionMessagesContainer.className = 'messages p-3'
        discussionMessagesContainer.id = discussion.id
        discussionMessagesContainer.style.display = 'none'
        messagesContainer.appendChild(discussionMessagesContainer)
    }

    /**
     * Adds a contact to the chat module's contact list.
     * @param {Object} contact - The contact data
     * @param {string} contact.id - The unique identifier for the contact
     * @param {string} contact.name - The display name of the contact
     * @param {string} contact.icon - The URL or path to the contact's icon
     */
    #addContact(contact) {
        if (!contact || !contact.id || !contact.name || !contact.icon) {
            console.error('ChatModule: Invalid contact data')
            return
        }
        this.#contacts.set(contact.id, { name: contact.name, icon: contact.icon })
    }

    /**
     * Receives and processes an incoming message from a contact.
     * Shows typing indicator before displaying the actual message.
     * @param {Object} message - The message object
     * @param {string} message.discussionId - The ID of the discussion the message belongs to
     * @param {string} message.contactId - The ID of the contact sending the message
     * @param {Object} message.content - The content of the message
     */
    #receiveMessage(message) {
        if (
            !message ||
            !this.#discussions.has(message.discussionId) ||
            !this.#contacts.has(message.contactId) ||
            !message.content
        ) {
            console.error('ChatModule: Invalid message data')
            return
        }

        const typingDuration = this.#calculateTypingDuration(message.content)
        
        if (this.#currentDiscussion === message.discussionId) {
            this.#showTypingIndicator(message.contactId, typingDuration).then(() => {
                this.#displayActualMessage(message)
            })
        } else {
            setTimeout(() => {
                this.#displayActualMessage(message)
            }, typingDuration)
        }
    }

    /**
     * Enables free text answering for a discussion.
     * Sets the waiting state and updates the discussion to allow user input.
     * @param {string} discussionId - The ID of the discussion to enable answering for
     */
    #enableAnswer(discussionId) {
        this.#waitingFor = "answer"
        this.#updateDiscussionState(discussionId, "canAnswer")
    }

    /**
     * Enables choice selection for a discussion, displaying predefined choice buttons.
     * @param {string} discussionId - The ID of the discussion to enable choices for
     * @param {Array<string>} choices - Array of choice objects or strings to display
     */
    #enableChoices(discussionId, choices) {
        this.#waitingFor = "choice"
        this.#updateDiscussionState(discussionId, "canChoose", { choices })
    }

    /**
     * Sets a discussion to the 'locked' state, preventing user input.
     * @param {string} discussionId - The ID of the discussion to lock
     */
    #enableLocked(discussionId) {
        this.#updateDiscussionState(discussionId, "locked")
    }

    /**
     * Adds a sent message to the currently open discussion.
     * @param {string} messageText - The text content of the message to add
     * @returns {boolean} True if the message was successfully added, false otherwise
     */
    #addMessageToCurrentDiscussion(messageText) {
        if (!this.#currentDiscussion) {
            console.error('ChatModule: No discussion is currently open')
            return false
        }

        const messageElement = this.#createMessageElement('sent', { text: messageText })
        if (!messageElement) {
            console.error('ChatModule: Failed to create message element')
            return false
        }

        const messagesContainer = this.#container.querySelector(`.messages#${this.#currentDiscussion}`)
        if (!messagesContainer) {
            console.error('ChatModule: Messages container not found')
            return false
        }

        messagesContainer.appendChild(messageElement)
        this.#scrollToBottom()
        this.#enableLocked(this.#currentDiscussion)
        return true
    }

    /**
     * Handles the selection of a choice button by the user.
     * Adds the choice as a message and invokes the callback with the choice ID.
     * @param {string} choice - The choice object or string that was selected
     * @param {number} choiceId - The numeric ID/index of the selected choice
     */
    #selectChoice(choice, choiceId) {
        const choiceText = choice.text || choice
        if (this.#addMessageToCurrentDiscussion(choiceText)) {
            this.#callback({ choice: choiceId })
            this.#waitingFor = "nothing"
        }
    }

    /**
     * Sends a text message from the user in the current discussion.
     * Reads the message from the input field, adds it to the chat, and triggers the callback.
     */
    #sendMessage() {
        const messageInput = this.#container.querySelector('#message-input')
        if (!messageInput) return
        
        const messageText = messageInput.value.trim()
        if (!messageText) return

        if (this.#addMessageToCurrentDiscussion(messageText)) {
            this.#callback({ answer: messageText })
            this.#waitingFor = "nothing"
            messageInput.value = ''
        }
    }

    /**
     * Shows the discussion selection view and hides the chat page view.
     * Clears the current discussion and resets the message input.
     */
    #showDiscussionSelection() {
        this.#currentDiscussion = null
        this.#container.querySelector('#chat-page').classList.replace('d-block', 'd-none')
        this.#container.querySelector('#discussion-selection').classList.replace('d-none', 'd-block')

        const messageInput = this.#container.querySelector('#message-input')
        if (messageInput) {
            messageInput.value = ''
        }
        
        const badge = this.#container.querySelector('#back-btn-badge')
        if (badge) {
            badge.classList.add('d-none')
        }
    }

    /**
     * Opens a specific chat discussion in the chat view.
     * Updates the UI to show the discussion messages and resets unread counts.
     * @param {string} discussionId - The ID of the discussion to open
     */
    #openChat(discussionId) {
        if (!this.#validateDiscussionId(discussionId, 'openChat')) return

        this.#currentDiscussion = discussionId
        const discussion = this.#discussions.get(discussionId)

        this.#container.querySelector('#discussion-selection').classList.replace('d-block', 'd-none')
        this.#container.querySelector('#chat-page').classList.replace('d-none', 'd-block')

        this.#container.querySelector('#current-avatar').src = discussion.icon
        this.#container.querySelector('#current-discussion-name').textContent = discussion.name

        this.#container.querySelectorAll('.messages').forEach(messagesContainer => {
            messagesContainer.style.display = 'none'
        })

        const currentMessages = this.#container.querySelector(`.messages#${discussionId}`)
        if (currentMessages) {
            currentMessages.style.display = 'block'
        }

        this.#updateAnswerVisibility()

        discussion.unreadCount = 0
        this.#updateDiscussionUnreadCount(discussionId)
        
        this.#updateBackButtonBadge()

        this.#scrollToBottom()

        if (this.#waitingFor === "read" && this.#discussionIdToRead === discussionId) {
            this.#callback()
            this.#waitingFor = "nothing"
        }
    }

    /**
     * Validates whether a discussion ID exists in the discussions map.
     * @param {string} discussionId - The ID of the discussion to validate
     * @param {string} [methodName='ChatModule'] - The name of the calling method for error logging
     * @returns {boolean} True if the discussion ID is valid, false otherwise
     */
    #validateDiscussionId(discussionId, methodName = 'ChatModule') {
        if (!this.#discussions.has(discussionId)) {
            console.error(`${methodName}: Invalid discussion ID`)
            return false
        }
        return true
    }

    /**
     * Creates a typing indicator element for a specific contact.
     * @param {string} contactId - The ID of the contact who is typing
     * @returns {HTMLElement} The typing indicator element
     */
    #createTypingIndicator(contactId) {
        const template = this.#container.querySelector('#typing-indicator-template')
        const indicator = template.cloneNode(true)
        indicator.id = 'typing-indicator-active'
        indicator.classList.remove('d-none')

        const contact = this.#contacts.get(contactId)
        indicator.querySelector('.typing-avatar').src = contact.icon
        indicator.querySelector('.typing-avatar').alt = contact.name
        indicator.querySelector('.typing-name').textContent = contact.name

        return indicator
    }

    /**
     * Shows a typing indicator in the current discussion for a specified duration.
     * @param {string} contactId - The ID of the contact who is typing
     * @param {number} duration - The duration in milliseconds to show the typing indicator
     * @returns {Promise<void>} A promise that resolves when the indicator is removed
     */
    #showTypingIndicator(contactId, duration) {
        if (!this.#currentDiscussion) return

        const messagesContainer = this.#container.querySelector(`.messages#${this.#currentDiscussion}`)
        if (!messagesContainer) return

        const existingIndicator = messagesContainer.querySelector('#typing-indicator-active')
        if (existingIndicator) {
            existingIndicator.remove()
        }

        const typingIndicator = this.#createTypingIndicator(contactId)
        messagesContainer.appendChild(typingIndicator)
        this.#scrollToBottom()

        return new Promise(resolve => {
            setTimeout(() => {
                const indicator = messagesContainer.querySelector('#typing-indicator-active')
                if (indicator) {
                    indicator.remove()
                }
                resolve()
            }, duration)
        })
    }

    /**
     * Calculates an appropriate typing indicator duration based on message content length.
     * @param {Object} content - The message content object
     * @param {string} [content.text] - The text content of the message
     * @returns {number} The calculated duration in milliseconds (between 1000 and 5000)
     */
    #calculateTypingDuration(content) {
        if (!content || !content.text) return 1000
        
        const messageLength = content.text.length
        const duration = Math.min(1000 + (messageLength * 50), 5000)
        return duration
    }

    /**
     * Displays the actual message in the discussion after the typing indicator.
     * Updates unread counts and notifies callbacks as needed.
     * @param {Object} message - The message object to display
     * @param {string} message.discussionId - The ID of the discussion
     * @param {string} message.contactId - The ID of the contact
     * @param {Object} message.content - The message content
     */
    #displayActualMessage(message) {
        const messageElement = this.#createMessageElement('received', message.content, message.contactId)

        if (!messageElement) {
            console.error('ChatModule: Failed to create message element')
            return
        }
        const messagesContainer = this.#container.querySelector(`.messages#${message.discussionId}`)

        if (messagesContainer) {
            messagesContainer.appendChild(messageElement)

            if (this.#currentDiscussion === message.discussionId) {
                this.#scrollToBottom()
            }
        }

        if (this.#currentDiscussion !== message.discussionId) {
            this.#discussions.get(message.discussionId).unreadCount++
            this.#updateDiscussionUnreadCount(message.discussionId)
        }
        
        if (this.#currentDiscussion) {
            this.#updateBackButtonBadge()
        }

        if (this.#waitingFor !== "read" || (this.#waitingFor === "read" && this.#currentDiscussion === this.#discussionIdToRead )) {
            this.#callback()
        }
    }

    /**
     * Creates a message DOM element for display in the chat interface.
     * @param {string} type - The message type ('sent' or 'received')
     * @param {Object} content - The message content object
     * @param {string} [content.text] - The text content of the message
     * @param {string} [content.image] - The URL of an image
     * @param {string} [content.file] - The URL of a file
     * @param {string} [content.fileName] - The name of the file (for file type)
     * @param {string|null} [contactId=null] - The ID of the contact (required for received messages)
     * @returns {HTMLElement|null} The created message element, or null if creation fails
     */
    #createMessageElement(type, content, contactId = null) {
        if (!content) {
            console.error('ChatModule: Message content is missing')
            return null
        }
        if (type !== 'sent' && type !== 'received') {
            console.error(`ChatModule: Invalid message type '${type}'. Must be 'sent' or 'received'`)
            return null
        }
        if (type === 'received' && (!contactId || !this.#contacts.has(contactId))) {
            console.error(`ChatModule: contactId '${contactId}' not found in contacts`)
            return null
        }
        const messageDiv = document.createElement('div')
        messageDiv.className = `d-flex mb-3 ${type === 'sent' ? 'justify-content-end' : 'justify-content-start'}`

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        const messageContent = document.createElement('div')
        messageContent.className = type === 'sent' ? 'text-end' : 'text-start'
        messageContent.style.maxWidth = '70%'

        if (type === 'received') {
            const contact = this.#contacts.get(contactId)
            const iconImg = document.createElement('img')
            iconImg.src = contact.icon
            iconImg.alt = contact.name
            iconImg.className = 'rounded-circle me-2'
            iconImg.width = 30
            iconImg.height = 30
            messageDiv.appendChild(iconImg)
            const nameElement = document.createElement('small')
            nameElement.className = 'text-muted fw-bold d-block mb-1'
            nameElement.textContent = contact.name
            messageContent.appendChild(nameElement)
        }

        const messageBody = document.createElement('div')
        messageBody.className = `p-2 rounded ${type === 'sent' ? 'bg-primary text-white' : 'bg-white border'}`

        if (content.image) {
            const imageElement = document.createElement('img')
            imageElement.src = content.image
            imageElement.alt = 'Image'
            imageElement.className = 'img-fluid rounded'
            imageElement.style.maxWidth = '100%'
            imageElement.style.cursor = 'pointer'
            imageElement.addEventListener('click', () => {
                window.open(content.image, '_blank')
            })
            messageBody.appendChild(imageElement)
        } else if (content.file) {
            const fileContainer = document.createElement('div')
            fileContainer.className = 'd-flex align-items-center justify-content-between'

            const fileName = document.createElement('div')
            fileName.textContent = content.fileName || 'Fichier'
            
            const downloadBtn = document.createElement('a')
            downloadBtn.href = content.file
            downloadBtn.download = content.fileName || ''
            downloadBtn.className = 'btn btn-sm btn-light rounded-circle ms-3'
            downloadBtn.style.width = '32px'
            downloadBtn.style.height = '32px'
            downloadBtn.style.padding = '0'
            downloadBtn.style.display = 'flex'
            downloadBtn.style.alignItems = 'center'
            downloadBtn.style.justifyContent = 'center'
            downloadBtn.innerHTML = '<i class="bi bi-download"></i>'
            downloadBtn.target = '_blank'
            downloadBtn.title = 'Télécharger'
            
            fileContainer.appendChild(fileName)
            fileContainer.appendChild(downloadBtn)
            messageBody.appendChild(fileContainer)
        } else {
            messageBody.textContent = content.text || "Message vide"
        }

        const timeElement = document.createElement('small')
        timeElement.className = 'text-muted d-block mt-1'
        timeElement.textContent = time

        messageContent.appendChild(messageBody)
        messageContent.appendChild(timeElement)
        messageDiv.appendChild(messageContent)

        return messageDiv
    }

    /**
     * Creates and displays choice buttons in the chat interface.
     * @param {Array<string>} choices - Array of choice objects with text property or plain strings
     */
    #createChoicesUI(choices) {
        const choicesContainer = this.#container.querySelector('#choices-container')
        if (!choicesContainer) {
            console.error('ChatModule: Choices container not found')
            return
        }

        choicesContainer.innerHTML = ''
        choicesContainer.classList.remove('d-none')
        choicesContainer.classList.add('d-flex')

        let choiceId = 0
        choices.forEach((choice) => {
            const choiceButton = document.createElement('button')
            choiceButton.className = 'btn btn-outline-primary w-100 mb-2'
            choiceButton.textContent = choice.text || choice
            let tempId = choiceId
            choiceButton.addEventListener('click', () => {
                this.#selectChoice(choice, tempId)
            })
            choicesContainer.appendChild(choiceButton)
            choiceId++
        })
    }

    /**
     * Sets up event listeners for the chat interface elements (back button, send button, message input).
     */
    #setupEventListeners() {
        const backBtn = this.#container.querySelector('#back-btn')
        if (!backBtn) {
            console.error('ChatModule: Back button not found')
        } else {
            backBtn.addEventListener('click', () => {
                this.#showDiscussionSelection()
            })
        }

        const sendBtn = this.#container.querySelector('#send-btn')
        if (!sendBtn) {
            console.error('ChatModule: Send button not found')
        } else {
            sendBtn.addEventListener('click', () => {
                this.#sendMessage()
            })
        }

        const messageInput = this.#container.querySelector('#message-input')
        if (!messageInput) {
            console.error('ChatModule: Message input not found')
        } else {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.#sendMessage()
                }
            })
        }
    }

    /**
     * Updates the visibility of answer input controls based on the current discussion's state.
     * Shows text input for 'canAnswer' state, choice buttons for 'canChoose' state, or hides both for 'locked' state.
     */
    #updateAnswerVisibility() {
        if (!this.#currentDiscussion) {
            console.error('ChatModule: No discussion is currently open')
            return
        }
        const cardFooter = this.#container.querySelector('.card-footer')
        const inputGroup = this.#container.querySelector('.input-group')
        const choicesContainer = this.#container.querySelector('#choices-container')

        if (!cardFooter || !inputGroup || !choicesContainer) {
            console.error('ChatModule: Required footer elements not found')
            return
        }

        const discussion = this.#discussions.get(this.#currentDiscussion)
        if (!discussion || !discussion.state) {
            console.error('ChatModule: Current discussion data not found')
            return
        }
        
        cardFooter.classList.add('d-none')
        inputGroup.classList.add('d-none')
        choicesContainer.classList.remove('d-flex')
        choicesContainer.classList.add('d-none')
        
        if (discussion.state === "canAnswer") {
            cardFooter.classList.remove('d-none')
            inputGroup.classList.remove('d-none')
        } else if (discussion.state === "canChoose" && discussion.choices) {
            cardFooter.classList.remove('d-none')
            this.#createChoicesUI(discussion.choices)
        }
        this.#scrollToBottom()
    }

    /**
     * Updates the state of a discussion and optionally merges additional data.
     * @param {string} discussionId - The ID of the discussion to update
     * @param {string} state - The new state for the discussion (e.g., 'locked', 'canAnswer', 'canChoose')
     * @param {Object} [additionalData={}] - Additional data to merge into the discussion object
     */
    #updateDiscussionState(discussionId, state, additionalData = {}) {
        if (!this.#validateDiscussionId(discussionId, 'updateDiscussionState')) return
        
        const discussion = this.#discussions.get(discussionId)
        discussion.state = state
        Object.assign(discussion, additionalData)
        
        if (discussionId === this.#currentDiscussion) {
            this.#updateAnswerVisibility()
        }
    }

    /**
     * Updates the unread message count badge for a specific discussion in the discussion list.
     * @param {string} discussionId - The ID of the discussion to update
     */
    #updateDiscussionUnreadCount(discussionId) {
        if (!this.#validateDiscussionId(discussionId, 'updateDiscussionUnreadCount')) return
        const discussionCard = this.#container.querySelector(`#${discussionId}`)
        if (!discussionCard) {
            console.error('ChatModule: Discussion card not found in DOM')
            return
        }

        const count = this.#discussions.get(discussionId).unreadCount
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

    /**
     * Updates the badge on the back button showing the total number of unread messages
     * in all discussions except the currently open one.
     */
    #updateBackButtonBadge() {
        const badge = this.#container.querySelector('#back-btn-badge')
        if (!badge) {
            console.error('ChatModule: Back button badge not found')
            return
        }

        let totalUnread = 0
        this.#discussions.forEach((discussion, discussionId) => {
            if (discussionId !== this.#currentDiscussion) {
                totalUnread += discussion.unreadCount
            }
        })

        const badgeCount = badge.querySelector('.badge-count')
        if (totalUnread > 0) {
            badgeCount.textContent = totalUnread > 99 ? '99+' : totalUnread
            badge.classList.remove('d-none')
        } else {
            badge.classList.add('d-none')
        }
    }

    /**
     * Scrolls the messages container to the bottom to show the most recent messages.
     */
    #scrollToBottom() {
        const messagesContainer = this.#container.querySelector('#messages-container')
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight
        } else {
            console.error('ChatModule: Messages container not found for scrolling')
            return
        }
    }
}