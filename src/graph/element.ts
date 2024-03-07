import * as assert from '#assert'
import * as check from '#check'
import Import from '#graph/import'
import Technology from '#graph/technology'
import {ConditionsWrapper, LogicExpression, VariabilityAlternative} from '#spec/variability'
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

    abstract readonly raw: VariabilityAlternative

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

    get manualId() {
        return 'manual.' + this.id
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

    abstract constructPresenceCondition(): LogicExpression
    protected _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (check.isUndefined(this._presenceCondition)) this._presenceCondition = this.constructPresenceCondition()
        return this._presenceCondition
    }

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

    getTypeSpecificConditionWrapper(): ConditionsWrapper | undefined {
        return undefined
    }

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

    defaultAlternative = false

    constructDefaultAlternativeCondition(): LogicExpression | undefined {
        return undefined
    }

    protected _defaultAlternativeCondition?: LogicExpression

    get defaultAlternativeCondition(): LogicExpression | undefined {
        if (!this.defaultAlternative) return
        if (check.isUndefined(this._defaultAlternativeCondition))
            this._defaultAlternativeCondition = this.constructDefaultAlternativeCondition()
        return this._defaultAlternativeCondition
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

    get implied() {
        return this.raw.implied ?? false
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

    isTechnology(): this is Technology {
        return false
    }
}
