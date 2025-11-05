function createModule(type, id, data, callback) {
    switch (type) {
        case "map":
            return new MapModule(id, data, callback)
        case "chat":
            return new ChatModule(id, data, callback)
        case "challengeArray":
            return new ChallengeArray(id, data, callback)
        case "calendar":
            return new CalendarModule(id, data, callback)
        default:
            throw `Invalid module type "${type}"`
    }
}

class Orchestrator {
    constructor(config) {
        this.config = config

        this.modules = {}

        for (const module of config.modules) {
            this.modules[module.id] = createModule(module.type, module.id, module.data, this.#callback.bind(this))
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

        switch (storyEvent.type) {
            case "event":
            case "choice":
            case "answer":
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

    #callback(params) {
        if (params === undefined) {
            this.storyIndex++
            this.storyNext()
            return
        }
        
        if (params.answer) {
            this.#callbackAnswer(params.answer)
            return
        }

        this.#callbackChoice(params.choice ?? 0)
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

        const url = this.config.answerUrl
        if (url === undefined) {
            console.error("Answer URL is not defined")
        }
        fetch("/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({"url": url, "answer":answer}),
        }).then(async response => {
            const json = await response.json()
            if (!json.success){
                this.jumpTo(storyEvent.jumpOnIncorrect)
                return
            }

            // Update modules
            const modulesToKeep = []
            for (const module of json.nextQuestion.modules) {
                modulesToKeep.push(module.id)
                if (this.modules[module.id]) {
                    // TODO: Edit module if changed
                    console.log(`Edit module ${module.id}`)
                } else {
                    // TODO: Add module
                    console.log(`Add module ${module.id}`)
                }
            }

            for (const moduleId of Object.keys(this.modules)) {
                if (!modulesToKeep.includes(moduleId)) {
                    // TODO: Remove module
                    console.log(`Remove module ${moduleId}`)
                }
            }

            this.storyIndex = 0
            this.story = json.nextQuestion.story
            this.storyNext()
        })
    }
}

var orchestrator = new Orchestrator(modulesConfig)
orchestrator.storyNext()