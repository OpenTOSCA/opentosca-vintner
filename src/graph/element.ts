import Import from '#graph/import'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'
import * as validator from '#validator'
import Artifact from './artifact'
import Graph from './graph'
import Group from './group'
import Input from './input'
import Node from './node'
import Policy from './policy'
import Property from './property'
import Relation from './relation'
import Type from './type'

export default abstract class Element {
    abstract readonly type: string
    abstract readonly name: string

    readonly index?: number
    readonly container?: Element

    private _id?: string
    get id() {
        if (validator.isUndefined(this._id)) {
            let id = this.type + '.' + this.name
            if (validator.isDefined(this.index)) {
                id += '@' + this.index.toString()
            }
            if (validator.isDefined(this.container)) {
                id += '.' + this.container.id
            }
            this._id = id
        }
        return this._id
    }

    get explicitId() {
        return 'explicit.' + this.id
    }

    private _display?: string
    get display() {
        if (validator.isUndefined(this._display)) {
            let display = this.type + ' "' + this.name
            if (validator.isDefined(this.index)) {
                display += '@' + this.index.toString()
            }
            display += '"'
            if (validator.isDefined(this.container)) {
                display += ' of ' + this.container.display
            }
            this._display = display
        }

        return this._display
    }

    get Display() {
        return utils.toFirstUpperCase(this.display)
    }

    present?: boolean
    conditions: LogicExpression[] = []

    private _effectiveConditions?: LogicExpression[]
    set effectiveConditions(conditions: LogicExpression[]) {
        if (validator.isDefined(this._effectiveConditions))
            throw new Error(`${this.Display} has already effective conditions assigned`)
        this._effectiveConditions = conditions
    }

    get effectiveConditions() {
        if (validator.isUndefined(this._effectiveConditions))
            throw new Error(`${this.Display} has no effective conditions assigned`)
        return this._effectiveConditions
    }

    abstract presenceCondition: LogicExpression

    abstract defaultCondition: LogicExpression

    defaultAlternative = false
    abstract defaultAlternativeCondition?: LogicExpression

    abstract defaultEnabled: boolean
    abstract pruningEnabled: boolean

    private _graph?: Graph

    set graph(graph) {
        this._graph = graph
    }

    get graph() {
        if (validator.isUndefined(this._graph)) throw new Error(`${this.Display} has no graph assigned`)
        return this._graph
    }

    isInput(): this is Input {
        return false
    }

    isNode(): this is Node {
        return false
    }

    isRelation(): this is Relation {
        return false
    }

    isProperty(): this is Property {
        return false
    }

    isPolicy(): this is Policy {
        return false
    }

    isGroup(): this is Group {
        return false
    }

    isArtifact(): this is Artifact {
        return false
    }

    isType(): this is Type {
        return false
    }

    isImport(): this is Import {
        return false
    }
}
