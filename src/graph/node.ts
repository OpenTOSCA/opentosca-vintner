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

    get hasHost() {
        return check.isDefined(this.outgoing.find(it => it.isHostedOn()))
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

    getTypeSpecificConditionWrapper() {
        // Conditional types are not supported
        if (this.types.length > 1) return
        const type = this.types[0]
        return this.graph.serviceTemplate.topology_template?.variability?.type_specific_conditions?.node_types?.[
            type.name
        ]
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
