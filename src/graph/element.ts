import * as assert from '#assert'
import * as check from '#check'
import Import from '#graph/import'
import {ConditionsWrapper, LogicExpression} from '#spec/variability'
import * as utils from '#utils'
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
        if (check.isUndefined(this._id)) {
            let id = this.type + '.' + this.name
            if (check.isDefined(this.index)) {
                id += '@' + this.index.toString()
            }
            if (check.isDefined(this.container)) {
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
        if (check.isUndefined(this._display)) {
            let display = this.type + ' "' + this.name
            if (check.isDefined(this.index)) {
                display += '@' + this.index.toString()
            }
            display += '"'
            if (check.isDefined(this.container)) {
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
        if (check.isDefined(this._effectiveConditions))
            throw new Error(`${this.Display} has already effective conditions assigned`)
        this._effectiveConditions = conditions
    }

    get effectiveConditions() {
        if (check.isUndefined(this._effectiveConditions))
            throw new Error(`${this.Display} has no effective conditions assigned`)
        return this._effectiveConditions
    }

    abstract presenceCondition: LogicExpression

    abstract defaultConsistencyCondition: boolean
    abstract defaultSemanticCondition: boolean
    abstract consistencyPruning: boolean
    abstract semanticPruning: boolean
    isConditionAllowed(wrapper?: ConditionsWrapper) {
        if (check.isUndefined(wrapper)) return false

        // TODO: have a ConditionsWrapper class to prevent default value assignment at different places?
        // TODO. why is this false; since semantic is true
        wrapper.consistency = wrapper.consistency ?? false
        // TODO: why is this true; since type-specific will be most likely semantic
        wrapper.semantic = wrapper.semantic ?? true

        const consistency =
            (this.defaultConsistencyCondition && this.defaultEnabled) ||
            (this.consistencyPruning && this.pruningEnabled)

        const semantic =
            (this.defaultSemanticCondition && this.defaultEnabled) || (this.semanticPruning && this.pruningEnabled)

        return (wrapper.consistency && consistency) || (wrapper.semantic && semantic)
    }

    getTypeSpecificCondition(): ConditionsWrapper | undefined {
        return undefined
    }

    abstract getElementSpecificCondition(): ConditionsWrapper | undefined

    private _defaultCondition?: LogicExpression
    get defaultCondition(): LogicExpression {
        if (check.isUndefined(this._defaultCondition)) {
            const candidates = [this.getTypeSpecificCondition(), this.getElementSpecificCondition()]
            const selected = candidates.find(it => this.isConditionAllowed(it))
            assert.isDefined(selected, `${this.Display} has no default condition`)

            selected.conditions = utils.toList(selected.conditions)
            if (selected.conditions.length === 1) {
                this._defaultCondition = selected.conditions[0]
            } else {
                this._defaultCondition = {and: selected.conditions}
            }
        }
        return this._defaultCondition
    }

    defaultAlternative = false
    abstract defaultAlternativeCondition?: LogicExpression

    abstract defaultEnabled: boolean
    abstract pruningEnabled: boolean

    private _graph?: Graph

    set graph(graph) {
        this._graph = graph
    }

    get graph() {
        if (check.isUndefined(this._graph)) throw new Error(`${this.Display} has no graph assigned`)
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
