import * as assert from '#assert'
import * as check from '#check'
import Technology from '#graph/technology'
import {andify} from '#graph/utils'
import {MANAGEMENT_INTERFACE} from '#spec/interface-definition'
import {NodeTemplate} from '#spec/node-template'
import {LogicExpression, NodeDefaultConditionMode} from '#spec/variability'
import std from '#std'
import {isAbstract} from '#technologies/utils'
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
                throw new Error(`Weight "${data.raw.weight}" of ${this.display} is a negative number`)

            if (data.raw.weight > 1) throw new Error(`Weight "${data.raw.weight}" of ${this.display} is larger than 1`)

            this.weight = data.raw.weight
        }
    }

    get toscaId() {
        return this.name
    }

    /**
     * Checks if component is managed, i.e., requires a technology.
     */
    // TODO: write input validations in populator that ensures that raw.manged does not conflict eg with modeled technologies?
    get managed() {
        // Component is (un)managed if manually specified
        if (check.isDefined(this.raw.managed)) {
            assert.isBoolean(this.raw.managed)
            return this.raw.managed
        }

        // Component is managed, if technologies are assigned (e.g., manually)
        if (utils.isPopulated(this.technologies)) return true

        // Component is unmanaged if type is abstract
        const type = this.graph.inheritance.getNodeType(this.getType().name)
        assert.isDefined(type, `Node type "${this.getType().name}" does not exist`)
        if (isAbstract(type)) return false

        // Component is managed by default
        return true
    }

    get anchor() {
        if (check.isDefined(this.raw.anchor)) {
            assert.isBoolean(this.raw.anchor)
            return this.raw.anchor
        }

        if (check.isDefined(this.raw.persistent)) {
            std.log(`${this.Display} uses deprecated "persistent" instead of "anchor"`)
            assert.isBoolean(this.raw.persistent)
            return this.raw.persistent
        }
    }

    get getDefaultMode(): NodeDefaultConditionMode {
        return this.raw.default_condition_mode ?? this.graph.options.default.nodeDefaultConditionMode
    }

    get defaultEnabled() {
        return check.isTrue(this.anchor)
            ? false
            : this.raw.default_condition ?? this.graph.options.default.nodeDefaultCondition
    }

    get pruningEnabled() {
        return check.isTrue(this.anchor) ? false : this.raw.pruning ?? this.graph.options.pruning.nodePruning
    }

    private _hosts?: Node[]
    get hosts(): Node[] {
        if (check.isUndefined(this._hosts)) this._hosts = this.hostings.map(it => it.target)
        return this._hosts
    }

    private _hostings?: Relation[]
    get hostings(): Relation[] {
        if (check.isUndefined(this._hostings)) this._hostings = this.outgoing.filter(it => it.isHostedOn())
        return this._hostings
    }

    get hasHost() {
        return utils.isPopulated(this.hosts)
    }

    get isTarget() {
        return utils.isPopulated(this.ingoing)
    }

    get isSource() {
        return utils.isPopulated(this.outgoing)
    }

    get hasAnyArtifact() {
        return utils.isPopulated(this.artifacts)
    }

    getTypeSilent() {
        // Conditional types are not supported
        if (this.types.length === 1) return this.types[0]
    }

    private _type?: Type
    getType() {
        if (check.isUndefined(this._type)) {
            if (this.types.length > 1) throw new Error(`${this.Display} has more than one type`)
            this._type = this.types[0]
        }
        return this._type!
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

            if (it === 'artifact' && this.hasAnyArtifact) {
                return conditions.push({has_artifact: this.toscaId, _cached_element: this})
            }

            if (it === 'artifactnaive' && this.hasAnyArtifact) {
                return conditions.push({has_artifact_naive: this.toscaId, _cached_element: this})
            }
        })

        return [{conditions: andify(conditions), consistency: false, semantic: true}]
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

    isEDMM() {
        return true
    }

    private _hasOperation: {[operation: string]: boolean | undefined} = {}
    hasOperation(operation: string) {
        if (check.isUndefined(this._hasOperation[operation])) {
            const direct = check.isDefined(this.raw.interfaces?.[MANAGEMENT_INTERFACE].operations?.[operation])
            this._hasOperation[operation] = direct ? direct : this.getType().hasOperation(operation)
        }
        return this._hasOperation[operation]!
    }

    private _getArtifacts: {[type: string]: Artifact[] | undefined} = {}
    getArtifacts(type: string) {
        if (check.isUndefined(this._getArtifacts[type])) {
            this._getArtifacts[type] = this.artifacts.filter(it => it.getType().isA(type))
        }
        return this._getArtifacts[type]!
    }

    private _hasArtifact: {[type: string]: boolean | undefined} = {}
    hasArtifact(type: string) {
        if (check.isUndefined(this._hasArtifact[type])) {
            const direct = utils.isPopulated(this.getArtifacts(type))
            this._hasArtifact[type] = direct ? true : this.getType().hasArtifact(type)
        }
        return this._hasArtifact[type]!
    }
}
