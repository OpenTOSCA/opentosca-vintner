import {NodeType} from '#spec/node-type'

export enum METADATA {
    VINTNER_GENERATE = 'vintner_generate',
    VINTNER_IGNORE = 'vintner_ignore',
    VINTNER_NAME = 'vintner_name',
}

export enum PROPERTIES {
    APPLICATION_PROTOCOL = 'application_protocol',
    PORT = 'PORT',
}

export type TypePlugin = {
    id: string
    generate: (name: string, type: NodeType) => NodeType
}
