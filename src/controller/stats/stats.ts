export enum ID {
    edmm = 'EDMM',
    ansible = 'Ansible',
    terraform = 'Terraform',
    tosca_fm = 'TOSCA-FM',
    tosca = 'TOSCA',
    pattern = 'PATTERN',
    pulumi = 'Pulumi',
    ejs = 'EJS',
    vdmm = 'VDMM',
}

export class Weights {
    static readonly reference = 1
    static readonly if_then = 2
    static readonly if_else = 1
    static readonly if_then_else = Weights.if_then + Weights.if_else
    static readonly ternary = Weights.if_then_else
    static readonly optional_chain = 1
    static readonly store = 1
}

export function isFeature(value: string) {
    return Features.includes(value)
}

export function isNotFeature(value: string) {
    return !isFeature(value)
}

export const Features = ['analytics', 'analytics_advanced', 'analytics_enterprise', 'elastic', 'deployment_quality']

export type Map = {[key: string]: Stats}

export type List = Stats[]

export type Stats = {
    id: string

    files: number
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

    files = 0
    loc = 0

    inputs = 0
    outputs = 0
    components = 0
    properties = 0
    relations = 0
    artifacts = 0
    technologies = 0

    conditions = 0
    expressions = 0
    mappings = 0

    constructor(id: string) {
        this.id = id
    }

    build(): Stats {
        return {
            id: this.id,
            files: this.files,
            loc: this.loc,

            /**
             * Topology
             */
            elements:
                this.inputs +
                this.outputs +
                this.components +
                this.properties +
                this.relations +
                this.artifacts +
                this.technologies,
            inputs: this.inputs,
            outputs: this.outputs,
            components: this.components,
            properties: this.properties,
            relations: this.relations,
            artifacts: this.artifacts,
            technologies: this.technologies,

            /**
             * Variability
             */
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
        first.files += other.files
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
        first.files -= other.files
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
