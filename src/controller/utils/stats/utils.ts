export class Stats {
    models = 0
    loc = 0

    elements = 0
    inputs = 0
    outputs = 0
    components = 0
    properties = 0
    relations = 0
    artifacts = 0

    variability = 0
    conditions = 0
    expressions = 0
    mappings = 0

    propagate() {
        this.elements = this.inputs + this.outputs + this.components + this.properties + this.relations
        this.variability = this.conditions + this.expressions + this.mappings
        return this
    }
}

// TODO: technologies
