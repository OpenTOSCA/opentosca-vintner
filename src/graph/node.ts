import * as assert from '#assert'
import * as check from '#check'
import Technology from '#graph/technology'
import {NodeTemplate} from '#spec/node-template'
import {LogicExpression, NodeDefaultConditionMode} from '#spec/variability'
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
    readonly technologies: Technology[] = []

    readonly technologyRequired: boolean

    readonly weight: number = 1

    constructor(data: {name: string; raw: NodeTemplate}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)

        /**
         * If an empty technology array has been modeled, then the node requires a technology
         */
        if (check.isDefined(data.raw.technology)) {
            assert.isArray(data.raw.technology, `Technology of ${this.display} not normalized`)
            this.technologyRequired = utils.isEmpty(data.raw.technology)
        } else {
            this.technologyRequired = false
        }

        /**
         * Get weight
         */
        if (check.isDefined(data.raw.weight)) {
            if (check.isBoolean(data.raw.weight)) {
                this.weight = data.raw.weight ? 1 : 0
            }

            assert.isNumber(
                data.raw.weight,
                `Weight "${data.raw.weight}" of ${this.display} is not a number or boolean`
            )

            if (data.raw.weight < 0)
                throw new Error(`Weight "${data.raw.weight}" of ${this.display} is not a negative number`)

            this.weight = data.raw.weight
        }
    }

    get toscaId() {
        return this.name
    }

    get persistent() {
        if (check.isDefined(this.raw.persistent)) {
            assert.isBoolean(this.raw.persistent)
            return this.raw.persistent
        }
    }

    get getDefaultMode(): NodeDefaultConditionMode {
        return this.raw.default_condition_mode ?? this.graph.options.default.nodeDefaultConditionMode
    }

    get defaultEnabled() {
        return check.isTrue(this.persistent)
            ? false
            : this.raw.default_condition ?? this.graph.options.default.nodeDefaultCondition
    }

    get pruningEnabled() {
        return check.isTrue(this.persistent) ? false : this.raw.pruning ?? this.graph.options.pruning.nodePruning
    }

    private _hosts?: Node[]
    get hosts(): Node[] {
        if (check.isUndefined(this._hosts))
            this._hosts = this.outgoing.filter(it => it.isHostedOn()).map(it => it.target)
        return this._hosts
    }

    get hasHost() {
        return !utils.isEmpty(this.hosts)
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

    getTypeSilent() {
        // Conditional types are not supported
        if (this.types.length === 1) return this.types[0]
    }

    getType() {
        if (this.types.length > 1) throw new Error(`${this.Display} has more than one type`)
        return this.types[0]
    }

    getTypeSpecificConditionWrapper() {
        const type = this.getTypeSilent()
        if (check.isUndefined(type)) return
        return this.graph.getTypeSpecificConditions()?.node_types?.[type.name]
    }

    getElementGenericCondition() {
        const conditions: LogicExpression[] = []

        const mode = this.getDefaultMode
        mode.split('-').forEach(it => {
            if (
                ![
                    'host',
                    'source',
                    'incoming',
                    'incomingnaive',
                    'outgoing',
                    'outgoingnaive',
                    'artifact',
                    'artifactnaive',
                ].includes(it)
            )
                throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)

            if (it === 'host' && this.hasHost) {
                return conditions.push({host_presence: 'SELF', _cached_element: this})
            }

            if (it === 'source' && this.isSource) {
                return conditions.push({has_source: this.toscaId, _cached_element: this})
            }

            if (it === 'incoming' && this.isTarget) {
                return conditions.push({has_incoming_relation: this.toscaId, _cached_element: this})
            }

            if (it === 'incomingnaive' && this.isTarget) {
                return conditions.push({has_incoming_relation_naive: this.toscaId, _cached_element: this})
            }

            if (it === 'outgoing' && this.isSource) {
                return conditions.push({has_outgoing_relation: this.toscaId, _cached_element: this})
            }

            if (it === 'outgoingnaive' && this.isSource) {
                return conditions.push({has_outgoing_relation_naive: this.toscaId, _cached_element: this})
            }

            if (it === 'artifact' && this.hasArtifact) {
                return conditions.push({has_artifact: this.toscaId, _cached_element: this})
            }

            if (it === 'artifactnaive' && this.hasArtifact) {
                return conditions.push({has_artifact_naive: this.toscaId, _cached_element: this})
            }
        })

        return {conditions: {and: conditions}, consistency: false, semantic: true}
    }

    get defaultConsistencyCondition() {
        return (
            this.raw.default_consistency_condition ??
            this.raw.default_condition ??
            this.graph.options.default.nodeDefaultConsistencyCondition
        )
    }

    get defaultSemanticCondition() {
        return (
            this.raw.default_semantic_condition ??
            this.raw.default_condition ??
            this.graph.options.default.nodeDefaultSemanticCondition
        )
    }

    get consistencyPruning() {
        return this.raw.consistency_pruning ?? this.raw.pruning ?? this.graph.options.pruning.nodeConsistencyPruning
    }

    get semanticPruning() {
        return this.raw.semantic_pruning ?? this.raw.pruning ?? this.graph.options.pruning.nodeSemanticPruning
    }

    constructPresenceCondition() {
        return {node_presence: this.toscaId, _cached_element: this}
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
