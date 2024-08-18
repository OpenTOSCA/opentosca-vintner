import * as check from '#check'
import {NodeType} from '#spec/node-type'
import {constructType} from '#technologies/utils'

export enum METADATA {
    VINTNER_GENERATE = 'vintner_generate',
    VINTNER_IGNORE = 'vintner_ignore',
    VINTNER_NAME = 'vintner_name',
    VINTNER_GENERATED = 'vintner_generated',
    VINTNER_ORCHESTRATOR = 'vintner_orchestrator',
    VINTNER_ABSTRACT = 'vintner_abstract',
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
}

// TODO: migrate or delete this
export abstract class ImplementationGenerator2 {
    private _id: string | undefined
    get id() {
        if (check.isUndefined(this._id)) {
            this._id = constructType(this)
        }
        return this._id
    }

    abstract technology: string
    abstract component: string
    abstract artifact?: string
    abstract hosting?: string[]

    abstract generate(name: string, type: NodeType): NodeType
}
