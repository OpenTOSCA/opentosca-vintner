import {NodeType} from '#spec/node-type'

export enum METADATA {
    VINTNER_GENERATE = 'vintner_generate',
    VINTNER_IGNORE = 'vintner_ignore',
    VINTNER_NAME = 'vintner_name',
    VINTNER_GENERATED = 'vintner_generated',
    VINTNER_IMPLEMENTED = 'vintner_implemented',
}

export enum PROPERTIES {
    APPLICATION_PROTOCOL = 'application_protocol',
    PORT = 'PORT',
}

export type ImplementationGenerator = {
    id: string
    generate: (name: string, type: NodeType) => NodeType
}
