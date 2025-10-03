function createModule(type, id, data) {
    switch (type) {
        case "map":
            return new MapModule(id, data)
        case "chat":
            return new ChatModule(id, data)
        default:
            throw `Invalid module type "${type}"`
    }
}

class Orchestrator {
    constructor(config) {
        this.config = config

        this.modules = {}

        for (const module of config.modules) {
            this.modules[module.id] = createModule(module.type, module.id, module.data)
        }

        this.story = config.story
        this.storyIndex = 0
    }

    storyNext() {
        const storyEvent = this.story[this.storyIndex]
        if (!storyEvent) {
            // Story is over
            return
        }

        storyEvent.delay ??= 0
        setTimeout(() => this.#doStoryNext(), storyEvent.delay)
    }

    #doStoryNext() {
        const storyEvent = this.story[this.storyIndex]

        const payload = storyEvent.payload
        console.log(storyEvent.type)
        switch (storyEvent.type) {
            case "event":
                break
            case "choice":
                payload.callback = this.#callbackChoice.bind(this)
                break
            case "answer":
                payload.callback = this.#callbackAnswer.bind(this)
                break
            case "goto":
                this.jumpTo(storyEvent.destination)
                return
            case "end":
                return
            default:
                console.error(`Invalid event type: ${storyEvent.type}`)
                return
        }

        this.modules[storyEvent.moduleId].notify(storyEvent.msg, storyEvent.payload)

        if (storyEvent.type === "event") {
            this.storyIndex++
            this.storyNext()
        }
    }

    jumpTo(storyEventId) {
        for (let i = 0; i < this.story.length; i++) {
            const storyEvent = this.story[i];
            if (storyEvent.id === storyEventId) {
                this.storyIndex = i
                this.storyNext()
                return
            }
        }

        console.error(`Story event ID not found: ${storyEventId}`)
    }

    #callbackChoice(choice) {
        const storyEvent = this.story[this.storyIndex]
        if (storyEvent.choiceDestinations === undefined) {
            console.error("A story event with choices must define the attribute choiceDestinations")
            return
        }

        this.jumpTo(storyEvent.choiceDestinations[choice])
    }

    #callbackAnswer(answer) {
        const storyEvent = this.story[this.storyIndex]
        console.log(`Answer: ${answer}`)

        // TODO: Fetch Osint4Fun to check answer

        const result = 0
        const nextStory = []

        if (result)
        {
            this.storyIndex = 0
            this.story = nextStory
        }
        else
        {
            this.jumpTo(storyEvent.jumpOnIncorrect)
        }
    }
}

var orchestrator = new Orchestrator(modulesConfig)
orchestrator.storyNext()