export type Stats = {
    id: string

    models: number
    loc: number

    elements: number
    inputs: number
    outputs: number
    components: number
    properties: number
    relations: number
    artifacts: number
    technologies: number

    variability: number
    conditions: number
    expressions: number
    mappings: number
}

export class Builder implements Omit<Stats, 'elements' | 'variability'> {
    id: string

    models = 0
    loc = 0

    inputs = 0
    outputs = 0
    components = 0
    properties = 0
    relations = 0
    artifacts = 0
    // TODO: technologies
    technologies = NaN

    conditions = 0
    expressions = 0
    mappings = 0

    constructor(id: string) {
        this.id = id
    }

    build(): Stats {
        return {
            id: this.id,
            models: this.models,
            loc: this.loc,
            // TODO: add technologies
            elements: this.inputs + this.outputs + this.components + this.properties + this.relations,
            inputs: this.inputs,
            outputs: this.outputs,
            components: this.components,
            properties: this.properties,
            relations: this.relations,
            artifacts: this.artifacts,
            technologies: this.technologies,
            variability: this.conditions + this.expressions + this.mappings,
            conditions: this.conditions,
            expressions: this.expressions,
            mappings: this.mappings,
        }
    }
}

export function sum(stats: Stats[]) {
    const first = stats[0]
    const others = stats.slice(1)

    for (const other of others) {
        first.models += other.models
        first.loc += other.loc
        first.elements += other.elements
        first.inputs += other.inputs
        first.outputs += other.outputs
        first.components += other.components
        first.properties += other.properties
        first.relations += other.relations
        first.artifacts += other.artifacts
        first.technologies += other.technologies
        first.variability += other.variability
        first.conditions += other.conditions
        first.expressions += other.expressions
        first.mappings += other.mappings
    }
    return first
}

export function diff(stats: Stats[]) {
    const first = stats[0]
    const others = stats.slice(1)

    for (const other of others) {
        first.models -= other.models
        first.loc -= other.loc
        first.elements -= other.elements
        first.inputs -= other.inputs
        first.outputs -= other.outputs
        first.components -= other.components
        first.properties -= other.properties
        first.relations -= other.relations
        first.artifacts -= other.artifacts
        first.technologies -= other.technologies
        first.variability -= other.variability
        first.conditions -= other.conditions
        first.expressions -= other.expressions
        first.mappings -= other.mappings
    }
    return first
}
