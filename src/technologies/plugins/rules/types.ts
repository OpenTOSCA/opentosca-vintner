import {NodeType} from '#spec/node-type'

export enum METADATA {
    VINTNER_GENERATE = 'vintner_generate',
    VINTNER_IGNORE = 'vintner_ignore',
    VINTNER_NAME = 'vintner_name',
    VINTNER_GENERATED = 'vintner_generated',
    VINTNER_ORCHESTRATOR = 'vintner_orchestrator',
    VINTNER_ABSTRACT = 'vintner_abstract',
    VINTNER_NORMATIVE = 'vintner_normative',
}

export enum PROPERTIES {
    APPLICATION_PROTOCOL = 'application_protocol',
    PORT = 'PORT',
}

export type ImplementationGenerator = {
    technology: string
    component: string
    artifact?: string
    hosting?: string[]
    generate: (name: string, type: NodeType) => NodeType
    weight: number
    // TODO: make this mandatory
    implementation?: string
    reasoning: string
}
