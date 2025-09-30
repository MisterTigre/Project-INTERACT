function create_module(type, id, data) {
    switch (type) {
        case "test":
            return new Test(id, data)
    
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
    }
}

var orchestrator = new Orchestrator(modulesConfig)