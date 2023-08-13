import * as assert from '#assert'
import * as check from '#check'
import {NodeTemplate} from '#spec/node-template'
import {ConditionsWrapper, LogicExpression, NodeDefaultConditionMode} from '#spec/variability'
import * as utils from '#utils'
import Artifact from './artifact'
import Element from './element'
import Group from './group'
import Property from './property'
import Relation from './relation'
import Type from './type'

export default class Node extends Element {
    readonly type = 'node'
    readonly name: string
    readonly raw: NodeTemplate

    readonly types: Type[] = []
    readonly typesMap: Map<String, Type[]> = new Map()
    readonly relations: Relation[] = []
    readonly ingoing: Relation[] = []
    readonly outgoing: Relation[] = []
    readonly outgoingMap: Map<String, Relation[]> = new Map()
    readonly groups: Group[] = []
    readonly artifacts: Artifact[] = []
    readonly artifactsMap: Map<String, Artifact[]> = new Map()
    readonly properties: Property[] = []
    readonly propertiesMap: Map<String, Property[]> = new Map()

    readonly weight: number = 1

    constructor(data: {name: string; raw: NodeTemplate}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)

        /**
         * Get weight
         */
        if (check.isDefined(data.raw.weight)) {
            if (check.isBoolean(data.raw.weight)) {
                this.weight = data.raw.weight ? 1 : 0
            }

            if (check.isNumber(data.raw.weight)) {
                if (data.raw.weight < 0)
                    throw new Error(`Weight "${data.raw.weight}" of ${this.display} is not a negative number`)
                this.weight = data.raw.weight
            }

            throw new Error(`Weight "${data.raw.weight}" of ${this.display} is not a number or boolean`)
        }
    }

    get toscaId() {
        return this.name
    }

    get getDefaultMode(): NodeDefaultConditionMode {
        return (
            (check.isString(this.raw)
                ? this.graph.options.default.node_default_condition_mode
                : this.raw.default_condition_mode) ??
            this.graph.options.default.node_default_condition_mode ??
            'incoming-artifact'
        )
    }

    get defaultEnabled() {
        return this.raw.default_condition ?? Boolean(this.graph.options.default.node_default_condition)
    }

    get pruningEnabled() {
        return this.raw.pruning ?? Boolean(this.graph.options.pruning.node_pruning)
    }

    get hasHost() {
        return this.outgoing.find(it => it.isHostedOn())
    }

    get isTarget() {
        return !utils.isEmpty(this.ingoing)
    }

    get isSource() {
        return !utils.isEmpty(this.outgoing)
    }

    get hasArtifact() {
        return !utils.isEmpty(this.artifacts)
    }

    private getTypeSpecificCondition(): ConditionsWrapper | undefined {
        // Conditional types are not supported
        if (this.types.length > 1) return

        const type = this.types[0]

        const tsc =
            this.graph.serviceTemplate.topology_template?.variability?.type_specific_conditions?.node_types?.[type.name]
        if (check.isUndefined(tsc)) return
        assert.isDefined(tsc.conditions, `${this.Display} holds type-specific condition without any condition`)

        tsc.consistency = tsc.consistency ?? false
        tsc.consistency = tsc.semantic ?? true

        return utils.copy(tsc)
    }

    private getElementSpecificCondition(): ConditionsWrapper | undefined {
        const conditions: LogicExpression[] = []

        const mode = this.getDefaultMode
        mode.split('-').forEach(it => {
            if (it === 'host') {
                return conditions.push(this.hasHost ? {host_presence: 'SELF', _cached_element: this} : true)
            }

            if (it === 'source') {
                return conditions.push(this.isSource ? {has_source: this.toscaId, _cached_element: this} : true)
            }

            if (it === 'incoming') {
                return conditions.push(
                    this.isTarget ? {has_incoming_relation: this.toscaId, _cached_element: this} : true
                )
            }

            if (it === 'incomingnaive') {
                return conditions.push(
                    this.isTarget ? {has_incoming_relation_naive: this.toscaId, _cached_element: this} : true
                )
            }

            if (it === 'artifact') {
                return conditions.push(this.hasArtifact ? {has_artifact: this.toscaId, _cached_element: this} : true)
            }

            if (it === 'artifactnaive') {
                return conditions.push(
                    this.hasArtifact ? {has_artifact_naive: this.toscaId, _cached_element: this} : true
                )
            }

            throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)
        })

        return {conditions, consistency: false, semantic: true}
    }

    private isConditionAllowed(wrapper?: ConditionsWrapper) {
        if (check.isUndefined(wrapper)) return false

        // TODO: have a ConditionsWrapper class to prevent default value assignment at different places ...
        const isConsistency = wrapper.consistency ?? false
        const isConsistencyAllowed = this.graph.options.default.node_default_consistency_condition ?? false
        const isSemantic = wrapper.semantic ?? true
        const isSemanticAllowed = this.graph.options.default.node_default_semantic_condition ?? true

        return true
        // TODO: enable this again
        // return (isConsistency && isConsistencyAllowed) || (isSemantic && isSemanticAllowed)
    }

    // TODO: implement this pattern everywhere
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

    readonly defaultAlternativeCondition = undefined

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (check.isUndefined(this._presenceCondition))
            this._presenceCondition = {node_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    getTypeCondition(type: Type): LogicExpression {
        return {node_type_presence: [this.toscaId, type.index], _cached_element: type}
    }

    getPropertyCondition(property: Property): LogicExpression {
        return {node_property_presence: [this.toscaId, property.index ?? property.name], _cached_element: property}
    }

    isNode() {
        return true
    }
}
