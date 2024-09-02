import * as check from '#check'
import {NodeType} from '#spec/node-type'
import {constructRuleName} from '#technologies/utils'

export enum METADATA {
    VINTNER_IGNORE = 'vintner_ignore',
    VINTNER_NAME = 'vintner_name',
    VINTNER_GENERATED = 'vintner_generated',
    VINTNER_ORCHESTRATOR = 'vintner_orchestrator',
    VINTNER_ABSTRACT = 'vintner_abstract',
    VINTNER_NORMATIVE = 'vintner_normative',
    VINTNER_LINK = 'vintner_link',
}

export enum PROPERTIES {
    APPLICATION_PROTOCOL = 'application_protocol',
    PORT = 'PORT',
}

export type ImplementationGenerator = {
    technology: string
    component: string
    artifact?: string
    hosting: string[]
    generate: (name: string, type: NodeType) => NodeType
    weight: number
    // TODO: make this mandatory
    details?: string
    reason: string
}

// TODO: migrate to this
export abstract class GeneratorAbstract implements ImplementationGenerator {
    private _id?: string
    get id() {
        if (check.isUndefined(this._id)) {
            this._id = constructRuleName(this)
        }
        return this._id
    }

    abstract technology: string
    abstract component: string
    abstract artifact?: string
    abstract hosting: string[]
    abstract weight: number
    abstract reason: string
    abstract details: string

    abstract generate(name: string, type: NodeType): NodeType
}
