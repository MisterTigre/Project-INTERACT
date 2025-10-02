class ChatModule {
    constructor(id, data) {
        this.container = document.getElementById(id)
        if (!this.container) {
            console.error(`ChatModule: Container with id '${id}' not found`)
            return
        }
        this.discussions = new Map()
        this.currentDiscussion = null
        this.contacts = new Map()

        this.#setupEventListeners()
    }

    #setupEventListeners() {
        const backBtn = this.container.querySelector('#back-btn')
        if (!backBtn) {
            console.error('ChatModule: Back button not found')
        } else {
            backBtn.addEventListener('click', () => {
                this.#showDiscussionSelection()
            })
        }

        const sendBtn = this.container.querySelector('#send-btn')
        if (!sendBtn) {
            console.error('ChatModule: Send button not found')
        } else {
            sendBtn.addEventListener('click', () => {
                this.#sendMessage()
            })
        }

        const messageInput = this.container.querySelector('#message-input')
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
            case "send":
                this.#receiveMessage(payload)
                break
            case "answer":
                this.#enableAnswer(payload.discussionId)
                break
            case "choice":
                this.#enableChoices(payload.discussionId, payload.choices)
                break
            default:
                console.error("Invalid message :" + msg)
                return
        }
    }

    #addDiscussion(discussion) {
        if (!discussion || !discussion.id || !discussion.name || !discussion.icon) {
            console.error('ChatModule: Invalid discussion data')
            return
        }
        this.discussions.set(discussion.id, { name: discussion.name, icon: discussion.icon, unreadCount: 0, state: discussion.state ?? "locked" })

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

        const messagesContainer = this.container.querySelector('#messages-container')
        const discussionMessagesContainer = document.createElement('div')
        discussionMessagesContainer.className = 'messages p-3'
        discussionMessagesContainer.id = discussion.id
        discussionMessagesContainer.style.display = 'none'
        messagesContainer.appendChild(discussionMessagesContainer)
    }

    #addContact(contact) {
        if (!contact || !contact.id || !contact.name || !contact.icon) {
            console.error('ChatModule: Invalid contact data')
            return
        }
        this.contacts.set(contact.id, { name: contact.name, icon: contact.icon })
    }

    #receiveMessage(message) {
        if (
            !message ||
            !this.discussions.has(message.discussionId) ||
            !this.contacts.has(message.contactId) ||
            !message.content
        ) {
            console.error('ChatModule: Invalid message data')
            return
        }
        const messageElement = this.#createMessageElement('received', message.content, message.contactId)

        if (!messageElement) {
            console.error('ChatModule: Failed to create message element')
            return
        }
        const messagesContainer = this.container.querySelector(`.messages#${message.discussionId}`)

        if (messagesContainer) {
            messagesContainer.appendChild(messageElement)

            if (this.currentDiscussion === message.discussionId) {
                this.#scrollToBottom()
            }
        }

        if (this.currentDiscussion !== message.discussionId) {
            this.discussions.get(message.discussionId).unreadCount++
            this.#updateDiscussionUnreadCount(message.discussionId)
        }
    }

    #enableLocked(discussionId) {
        if (!this.discussions.has(discussionId)) {
            console.error('ChatModule: Invalid discussion ID')
            return
        }
        this.discussions.get(discussionId).state = "locked"
        if (discussionId !== this.currentDiscussion) return
        this.#updateAnswerVisibility()
    }

    #enableAnswer(discussionId) {
        if (!this.discussions.has(discussionId)) {
            console.error('ChatModule: Invalid discussion ID')
            return
        }
        this.discussions.get(discussionId).state = "canAnswer"
        if (this.discussionId !== this.currentDiscussion) return
        this.#updateAnswerVisibility()
    }

    #enableChoices(discussionId, choices) {
        if (!this.discussions.has(discussionId)) {
            console.error('ChatModule: Invalid discussion ID')
            return
        }
        this.discussions.get(discussionId).state = "canChoose"
        this.discussions.get(discussionId).choices = choices
        if (this.discussionId !== this.currentDiscussion) return
        this.#updateAnswerVisibility()
    }

    #openChat(discussionId) {
        if (!this.discussions.has(discussionId)) {
            console.error('ChatModule: Invalid discussion ID')
            return
        }

        this.currentDiscussion = discussionId
        const discussion = this.discussions.get(discussionId)

        this.container.querySelector('#discussion-selection').classList.replace('d-block', 'd-none')
        this.container.querySelector('#chat-page').classList.replace('d-none', 'd-block')

        this.container.querySelector('#current-avatar').src = discussion.icon
        this.container.querySelector('#current-discussion-name').textContent = discussion.name

        this.container.querySelectorAll('.messages').forEach(messagesContainer => {
            messagesContainer.style.display = 'none'
        })

        const currentMessages = this.container.querySelector(`.messages#${discussionId}`)
        if (currentMessages) {
            currentMessages.style.display = 'block'
        }

        this.#updateAnswerVisibility()

        discussion.unreadCount = 0
        this.#updateDiscussionUnreadCount(discussionId)

        this.#scrollToBottom()
    }

    #createMessageElement(type, content, contactId = null) {
        if (!content) {
            console.error('ChatModule: Message content is missing')
            return null
        }
        if (type !== 'sent' && type !== 'received') {
            console.error(`ChatModule: Invalid message type '${type}'. Must be 'sent' or 'received'`)
            return null
        }
        if (type === 'received' && (!contactId || !this.contacts.has(contactId))) {
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
            const contact = this.contacts.get(contactId)
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

        const messageText1 = document.createElement('div')
        messageText1.className = `p-2 rounded ${type === 'sent' ? 'bg-primary text-white' : 'bg-white border'}`
        messageText1.textContent = content.text ? content.text : "Contient une image"

        const timeElement = document.createElement('small')
        timeElement.className = 'text-muted d-block mt-1'
        timeElement.textContent = time

        messageContent.appendChild(messageText1)
        messageContent.appendChild(timeElement)
        messageDiv.appendChild(messageContent)

        return messageDiv
    }

    #createChoicesUI(choices) {
        const cardFooter = this.container.querySelector('.card-footer')
        if (!cardFooter) {
            console.error('ChatModule: Card footer not found')
            return
        }

        const choicesContainer = document.createElement('div')
        choicesContainer.id = 'choices-container'
        choicesContainer.className = 'd-flex flex-column mb-3'

        choices.forEach((choice) => {
            const choiceButton = document.createElement('button')
            choiceButton.className = 'btn btn-outline-primary w-100 mb-2'
            choiceButton.textContent = choice.text || choice
            choiceButton.addEventListener('click', () => {
                this.#selectChoice(choice)
            })
            choicesContainer.appendChild(choiceButton)
        })

        const inputGroup = cardFooter.querySelector('.input-group')
        if (!inputGroup) {
            console.error('ChatModule: Input group not found in card footer')
            return
        }
        cardFooter.insertBefore(choicesContainer, inputGroup)
    }

    #selectChoice(choice) {
        if (!this.currentDiscussion) {
            console.error('ChatModule: No discussion is currently open')
            return
        }

        const choiceText = choice.text || choice
        const messageElement = this.#createMessageElement('sent', { text: choiceText })
        if (!messageElement) {
            console.error('ChatModule: Failed to create message element for choice')
            return
        }

        const messagesContainer = this.container.querySelector(`.messages#${this.currentDiscussion}`)
        if (!messagesContainer) {
            console.error('ChatModule: Messages container not found for current discussion')
            return
        }
        messagesContainer.appendChild(messageElement)
        this.#scrollToBottom()
        

        this.#enableLocked(this.currentDiscussion)
    }

    #sendMessage() {
        const messageInput = this.container.querySelector('#message-input')
        if (!messageInput) {
            console.error('ChatModule: Message input not found')
            return
        }
        const messageText = messageInput.value.trim()

        if (!messageText) {
            console.error('ChatModule: No message to send')
            return
        }
        if (!this.currentDiscussion) {
            console.error('ChatModule: No discussion is currently open')
            return
        }

        const messageElement = this.#createMessageElement('sent', { text: messageText })
        if (!messageElement) {
            console.error('ChatModule: Failed to create message element for sent message')
            return
        }

        const messagesContainer = this.container.querySelector(`.messages#${this.currentDiscussion}`)
        if (!messagesContainer) {
            console.error('ChatModule: Messages container not found for current discussion')
            return
        }
        messagesContainer.appendChild(messageElement)
        this.#scrollToBottom()
        messageInput.value = ''
        this.#enableLocked(this.currentDiscussion)
        
    }

    #updateAnswerVisibility() {
        if (!this.currentDiscussion) {
            console.error('ChatModule: No discussion is currently open')
            return
        }
        const inputGroup = this.container.querySelector('.input-group')
        const choicesContainer = this.container.querySelector('#choices-container')

        if (!inputGroup) {
            console.error('ChatModule: Input group not found in card footer')
            return
        }
        inputGroup.classList.add('d-none')
        if (choicesContainer) {
            choicesContainer.remove()
        }

        const discussion = this.discussions.get(this.currentDiscussion)
        if (!discussion || !discussion.state) {
            console.error('ChatModule: Current discussion data not found')
            return
        }
        if (discussion.state === "canAnswer") {
            inputGroup.classList.remove('d-none')
        } else if (discussion.state === "canChoose" && discussion.choices) {
            this.#createChoicesUI(discussion.choices)
        }
    }

    #updateDiscussionUnreadCount(discussionId) {
        if (!this.discussions.has(discussionId)) {
            console.error('ChatModule: Invalid discussion ID')
            return
        }
        const discussionCard = this.container.querySelector(`#${discussionId}`)
        if (!discussionCard) {
            console.error('ChatModule: Discussion card not found in DOM')
            return
        }

        const count = this.discussions.get(discussionId).unreadCount
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
        } else {
            console.error('ChatModule: Messages container not found for scrolling')
            return
        }
    }
}