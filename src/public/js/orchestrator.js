function create_module(type, id, data) {
    switch (type) {
        case "test":
            return new Test(id, data)
        case "map":
            return new Map(id, data)
        default:
            throw `Invalid module type "${type}"`
    }
}

class Orchestrator {
    constructor(config) {
        this.config = config

        this.modules = {}

        for (const module of config.modules) {
            this.modules[module.id] = create_module(module.type, module.id, module.data)
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
        setTimeout(() => this.#doStoryNext(), storyEvent.delay);
    }

    #doStoryNext() {
        const storyEvent = this.story[this.storyIndex]

        const payload = storyEvent.payload
        switch (storyEvent.type) {
            case "event":
                break
            case "choice":
                payload.callback = this.#callbackChoice.bind(this)
                break
            case "answer":
                // TODO
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
        let storyEvent = this.story[this.storyIndex]
        if (storyEvent.choiceDestinations === undefined) {
            console.error("A story event with choices must define the attribute choiceDestinations")
            return
        }

        this.jumpTo(storyEvent.choiceDestinations[choice])
    }
}

var orchestrator = new Orchestrator(modulesConfig)
orchestrator.storyNext()