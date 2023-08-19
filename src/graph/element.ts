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

    abstract toscaId: any

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

    private _present?: boolean
    set present(present: boolean) {
        assert.isUndefined(this._present, `${this.Display} has already a presence assigned`)
        this._present = present
    }

    get present() {
        assert.isDefined(this._present, `${this.Display} has no presence assigned`)
        return this._present
    }

    conditions: LogicExpression[] = []

    private _effectiveConditions?: LogicExpression[]
    set effectiveConditions(conditions: LogicExpression[]) {
        assert.isUndefined(this._effectiveConditions, `${this.Display} has already effective conditions assigned`)
        this._effectiveConditions = conditions
    }

    get effectiveConditions() {
        assert.isDefined(this._effectiveConditions, `${this.Display} has no effective conditions assigned`)
        return this._effectiveConditions
    }

    abstract presenceCondition: LogicExpression

    get defaultConsistencyCondition() {
        return true
    }

    get defaultSemanticCondition() {
        return true
    }

    get consistencyPruning() {
        return true
    }

    get semanticPruning() {
        return true
    }

    isConditionAllowed(wrapper?: ConditionsWrapper) {
        if (check.isUndefined(wrapper)) return false

        wrapper.consistency = wrapper.consistency ?? false
        const consistencyAllowed =
            (this.defaultConsistencyCondition && this.defaultEnabled) ||
            (this.consistencyPruning && this.pruningEnabled)

        // Default is "true" since type-specific condition will likely be semantic
        wrapper.semantic = wrapper.semantic ?? true
        const semanticAllowed =
            (this.defaultSemanticCondition && this.defaultEnabled) || (this.semanticPruning && this.pruningEnabled)

        return (consistencyAllowed && wrapper.consistency) || (semanticAllowed && wrapper.semantic)
    }

    getTypeSpecificConditionWrapper(): ConditionsWrapper | undefined {
        return undefined
    }

    // TODO: DRY
    getTypeSpecificCondition(): ConditionsWrapper | undefined {
        const tsc = this.getTypeSpecificConditionWrapper()
        if (check.isUndefined(tsc)) return
        assert.isDefined(tsc.conditions, `${this.Display} holds type-specific condition without any condition`)

        tsc.consistency = tsc.consistency ?? false
        tsc.semantic = tsc.semantic ?? true

        return utils.copy(tsc)
    }

    getElementGenericCondition(): ConditionsWrapper | undefined {
        return {conditions: true, consistency: true, semantic: true}
    }

    private _defaultCondition?: LogicExpression
    get defaultCondition(): LogicExpression {
        if (check.isUndefined(this._defaultCondition)) {
            const candidates = [this.getTypeSpecificCondition(), this.getElementGenericCondition()]
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

    get defaultAlternativeCondition(): LogicExpression | undefined {
        return undefined
    }

    get defaultEnabled() {
        return false
    }

    get pruningEnabled() {
        return false
    }

    private _graph?: Graph

    set graph(graph) {
        assert.isUndefined(this._graph, `${this.Display} has already graph assigned`)
        this._graph = graph
    }

    get graph() {
        assert.isDefined(this._graph, `${this.Display} has no graph assigned`)
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
