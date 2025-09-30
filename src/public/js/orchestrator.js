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

        for (let module of config.modules)
        {
            this.modules[module.id] = create_module(module.type, module.id, module.data)
        }

        this.story = config.story
        this.storyIndex = 0
    }

    storyNext()
    {
        let storyEvent = this.story[this.storyIndex]
        this.modules[storyEvent.id].notify(storyEvent.msg, storyEvent.payload)
        this.storyIndex++
    }
}

var orchestrator = new Orchestrator(modulesConfig)