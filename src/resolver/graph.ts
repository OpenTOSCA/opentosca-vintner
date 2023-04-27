import {
    ArtifactPropertyPresenceArguments,
    ConsistencyOptions,
    DefaultOptions,
    GroupPropertyPresenceArguments,
    GroupTypePresenceArguments,
    LogicExpression,
    NodeDefaultConditionMode,
    NodePropertyPresenceArguments,
    NodeTypePresenceArguments,
    PolicyPropertyPresenceArguments,
    PolicyTypePresenceArguments,
    PruningOptions,
    RelationDefaultConditionMode,
    RelationPropertyPresenceArguments,
    RelationTypePresenceArguments,
    ResolverModes,
    SolverOptions,
    ValueExpression,
    VariabilityPointList,
    VariabilityPointMap,
} from '#spec/variability'
import {InputDefinition} from '#spec/topology-template'
import {NodeTemplate, RequirementAssignment} from '#spec/node-template'
import {ConditionalPropertyAssignmentValue, PropertyAssignmentValue} from '#spec/property-assignments'
import {RelationshipTemplate} from '#spec/relationship-template'
import {PolicyTemplate} from '#spec/policy-template'
import {GroupTemplate} from '#spec/group-template'
import {ArtifactDefinition, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import * as utils from '#utils'
import * as validator from '#validator'
import {TOSCA_GROUP_TYPES} from '#spec/group-type'
import {ensureDefined} from '#validator'
import {UnexpectedError} from '#utils/error'
import {TypeAssignment} from '#spec/type-assignment'

/**
 * Not documented since preparation for future work
 *
 * - inputs might be a list
 * - node templates might be a list
 * - groups might be a list (consider variability groups ...)
 */

export abstract class ConditionalElement {
    readonly type: string
    readonly id: string
    readonly name: string
    readonly container?: ConditionalElement
    readonly index?: number

    readonly display: string
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

    protected constructor(type: string, data: {name: string; container?: ConditionalElement; index?: number}) {
        this.type = type
        this.name = data.name
        this.container = data.container
        this.index = data.index

        /**
         * Construct display name
         */
        this.display = this.type + ' "' + data.name
        if (validator.isDefined(data.index)) {
            this.display += '@' + data.index.toString()
        }
        this.display += '"'
        if (validator.isDefined(this.container)) {
            this.display += ' of ' + this.container.display
        }

        /**
         * Construct id
         */
        this.id = this.type + '.' + this.name
        if (validator.isDefined(this.index)) {
            this.id += '@' + this.index.toString()
        }
        if (validator.isDefined(this.container)) {
            this.id += '.' + this.container.id
        }
    }

    private _graph?: Graph

    set graph(graph) {
        this._graph = graph
    }

    get graph() {
        if (validator.isUndefined(this._graph)) throw new Error(`${this.Display} has no graph assigned`)
        return this._graph
    }

    isInput(): this is Input {
        return this instanceof Input
    }

    isNode(): this is Node {
        return this instanceof Node
    }

    isRelation(): this is Relation {
        return this instanceof Relation
    }

    isProperty(): this is Property {
        return this instanceof Property
    }

    isPolicy(): this is Policy {
        return this instanceof Policy
    }

    isGroup(): this is Group {
        return this instanceof Group
    }

    isArtifact(): this is Artifact {
        return this instanceof Artifact
    }

    isType(): this is Type {
        return this instanceof Type
    }
}

export class Input extends ConditionalElement {
    raw: InputDefinition

    constructor(data: {name: string; raw: InputDefinition}) {
        super('input', data)
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
    }

    get toscaId() {
        return this.name
    }

    defaultEnabled = true
    pruningEnabled = true
    defaultCondition = true

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = {input_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    defaultAlternativeCondition: undefined
}

export class Type extends ConditionalElement {
    raw: TypeAssignment | string
    container: Node | Relation | Policy | Group
    index: number

    constructor(data: {
        name: string
        container: Node | Relation | Policy | Group
        index: number
        raw: TypeAssignment | string
    }) {
        super('type', data)

        this.raw = data.raw
        this.index = data.index
        this.container = data.container
        this.conditions = validator.isString(data.raw)
            ? []
            : validator.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this.defaultAlternative = validator.isString(data.raw) ? false : data.raw.default_alternative || false
    }

    get toscaId() {
        if (validator.isUndefined(this.index)) throw new UnexpectedError()
        if (validator.isString(this.container.toscaId)) return [this.container.toscaId, this.index]
        if (validator.isNumber(this.container.toscaId)) return [this.container.toscaId, this.index]
        return [...this.container.toscaId, this.index]
    }

    get defaultEnabled() {
        return Boolean(
            validator.isString(this.raw)
                ? this.graph.options.default.type_default_condition
                : this.raw.default_condition ?? this.graph.options.default.type_default_condition
        )
    }

    get pruningEnabled() {
        return Boolean(
            validator.isString(this.raw)
                ? this.graph.options.pruning.type_pruning
                : this.raw.pruning ?? this.graph.options.pruning.type_pruning
        )
    }

    get defaultCondition() {
        return this.container.presenceCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = this.container.getTypeCondition(this)

        if (validator.isUndefined(this._presenceCondition)) throw new Error(`${this.Display} has no presence condition`)

        return this._presenceCondition
    }

    // Check if no other type is present
    private _defaultAlternativeCondition?: LogicExpression
    get defaultAlternativeCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultAlternativeCondition))
            this._defaultAlternativeCondition = bratanize(this.container.types.filter(it => it !== this))
        return this._defaultAlternativeCondition
    }
}

export class Node extends ConditionalElement {
    raw: NodeTemplate
    types: Type[] = []
    typesMap: Map<String, Type[]> = new Map()
    relations: Relation[] = []
    ingoing: Relation[] = []
    outgoing: Relation[] = []
    outgoingMap: Map<String, Relation[]> = new Map()
    groups: Group[] = []
    artifacts: Artifact[] = []
    artifactsMap: Map<String, Artifact[]> = new Map()
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()

    readonly weight: number = 1

    constructor(data: {name: string; raw: NodeTemplate}) {
        super('node', data)
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)

        /**
         * Get weight
         */
        if (validator.isDefined(data.raw.weight)) {
            if (validator.isBoolean(data.raw.weight)) {
                this.weight = data.raw.weight ? 1 : 0
            }

            if (validator.isNumber(data.raw.weight)) {
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
            (validator.isString(this.raw)
                ? this.graph.options.default.node_default_condition_mode
                : this.raw.default_condition_mode) ??
            this.graph.options.default.node_default_condition_mode ??
            'incoming'
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

    private _defaultCondition?: LogicExpression
    get defaultCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultCondition)) {
            const conditions: LogicExpression[] = []

            const mode = this.getDefaultMode
            mode.split('-').forEach(it => {
                if (it === 'host') {
                    return conditions.push(this.hasHost ? {host_presence: 'SELF', _cached_element: this} : true)
                }

                if (it === 'source') {
                    return conditions.push(this.isTarget ? {has_sources: this.toscaId, _cached_element: this} : true)
                }

                if (it === 'incoming') {
                    return conditions.push(
                        this.isTarget ? {has_incoming_relations: this.toscaId, _cached_element: this} : true
                    )
                }

                if (it === 'naive') {
                    return conditions.push(
                        this.isTarget ? {has_incoming_relations_naive: this.toscaId, _cached_element: this} : true
                    )
                }

                throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)
            })

            if (utils.isEmpty(conditions)) throw new Error(`${this.Display} has no default condition`)

            if (conditions.length === 1) {
                this._defaultCondition = conditions[0]
            } else {
                this._defaultCondition = {and: conditions}
            }
        }

        return this._defaultCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = {node_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    defaultAlternativeCondition: undefined

    getTypeCondition(type: Type): LogicExpression {
        return {node_type_presence: [this.toscaId, type.index], _cached_element: type}
    }

    getPropertyCondition(property: Property): LogicExpression {
        return {node_property_presence: [this.toscaId, property.index ?? property.name], _cached_element: property}
    }
}

export class Property extends ConditionalElement {
    raw: ConditionalPropertyAssignmentValue | PropertyAssignmentValue
    container: Node | Relation | Policy | Group | Artifact
    value?: PropertyAssignmentValue
    expression?: ValueExpression

    constructor(data: {
        name: string
        raw: ConditionalPropertyAssignmentValue | PropertyAssignmentValue
        container: Node | Relation | Policy | Group | Artifact
        index?: number
        value?: PropertyAssignmentValue
        expression?: ValueExpression
        default: boolean
        conditions?: LogicExpression[]
    }) {
        super('property', data)
        this.raw = data.raw
        this.value = data.value
        this.expression = data.expression
        this.container = data.container
        this.defaultAlternative = data.default
        this.conditions = data.conditions || []
    }

    get toscaId(): [string, string | number] {
        if (validator.isDefined(this.index)) return [this.container.name, this.index]
        return [this.container.name, this.name]
    }

    get defaultEnabled() {
        return Boolean(
            !validator.isObject(this.raw) || validator.isArray(this.raw)
                ? this.graph.options.default.property_default_condition
                : this.raw.default_condition ?? this.graph.options.default.property_default_condition
        )
    }

    get pruningEnabled() {
        return Boolean(
            !validator.isObject(this.raw) || validator.isArray(this.raw)
                ? this.graph.options.pruning.property_pruning
                : this.raw.pruning ?? this.graph.options.pruning.property_pruning
        )
    }

    get defaultCondition() {
        return this.container.presenceCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = this.container.getPropertyCondition(this)
        return this._presenceCondition
    }

    // Check if no other property having the same name is present
    private _defaultAlternativeCondition?: LogicExpression
    get defaultAlternativeCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultAlternativeCondition))
            this._defaultAlternativeCondition = bratanize(
                this.container.propertiesMap.get(this.name)!.filter(it => it !== this)
            )
        return this._defaultAlternativeCondition
    }
}

export class Relation extends ConditionalElement {
    raw: RequirementAssignment
    source: Node

    private _target?: Node
    set target(target: Node) {
        if (validator.isDefined(this._target)) throw new Error(`Target of ${this.display} is already set`)
        this._target = target
    }

    get target() {
        if (validator.isUndefined(this._target)) throw new Error(`Target of ${this.display} is not set`)
        return this._target
    }

    get explicitId() {
        return 'explicit.' + this.id
    }

    groups: Group[] = []
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()
    relationship?: Relationship

    types: Type[] = []
    typesMap: Map<String, Type[]> = new Map()

    constructor(data: {name: string; raw: RequirementAssignment; container: Node; index: number}) {
        super('relation', data)
        this.source = data.container
        this.raw = data.raw
        this.conditions = validator.isString(data.raw)
            ? []
            : validator.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this.defaultAlternative = validator.isString(data.raw) ? false : data.raw.default_alternative || false
    }

    get toscaId(): [string, string | number] {
        if (validator.isDefined(this.index)) return [this.source.name, this.index]
        return [this.source.name, this.name]
    }

    get getDefaultMode(): RelationDefaultConditionMode {
        return (
            (validator.isString(this.raw)
                ? this.graph.options.default.relation_default_condition_mode
                : this.raw.default_condition_mode) ??
            this.graph.options.default.relation_default_condition_mode ??
            'source-target'
        )
    }

    get defaultEnabled() {
        return Boolean(
            validator.isString(this.raw)
                ? this.graph.options.default.relation_default_condition
                : this.raw.default_condition ?? this.graph.options.default.relation_default_condition
        )
    }

    get pruningEnabled() {
        return Boolean(
            validator.isString(this.raw)
                ? this.graph.options.pruning.relation_pruning
                : this.raw.pruning ?? this.graph.options.pruning.relation_pruning
        )
    }

    private _defaultCondition?: LogicExpression
    get defaultCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultCondition)) {
            const conditions: LogicExpression[] = []

            const mode = this.getDefaultMode
            mode.split('-').forEach(it => {
                if (it === 'source') {
                    return conditions.push(this.source.presenceCondition)
                }
                if (it === 'target') {
                    return conditions.push(this.target.presenceCondition)
                }

                throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)
            })

            if (utils.isEmpty(conditions)) throw new Error(`${this.Display} has no default condition`)

            if (conditions.length === 1) {
                this._defaultCondition = conditions[0]
            } else {
                this._defaultCondition = {and: conditions}
            }
        }
        return this._defaultCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = {relation_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    // Check if no other relation having the same name is present
    private _defaultAlternativeCondition?: LogicExpression
    get defaultAlternativeCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultAlternativeCondition))
            this._defaultAlternativeCondition = bratanize(
                this.source.outgoingMap.get(this.name)!.filter(it => it !== this)
            )
        return this._defaultAlternativeCondition
    }

    getTypeCondition(type: Type): LogicExpression {
        return {relation_type_presence: [...this.toscaId, type.index], _cached_element: type}
    }

    getPropertyCondition(property: Property): LogicExpression {
        return {
            relation_property_presence: [...this.toscaId, property.index ?? property.name],
            _cached_element: property,
        }
    }

    isHostedOn() {
        return new RegExp(/^(.*_)?host(_.*)?$/).test(this.name)
    }

    isConnectsTo() {
        return new RegExp(/^(.*_)?connection(_.*)?$/).test(this.name)
    }
}

export class Relationship {
    readonly type = 'relationship'
    raw: RelationshipTemplate
    id: string
    name: string
    relation: Relation

    constructor(data: {name: string; raw: RelationshipTemplate; relation: Relation}) {
        this.name = data.name
        this.relation = data.relation
        this.raw = data.raw
        this.id = this.type + '.' + this.name
    }
}

export class Policy extends ConditionalElement {
    raw: PolicyTemplate
    targets: (Node | Group)[] = []
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()
    types: Type[] = []
    typesMap: Map<String, Type[]> = new Map()

    constructor(data: {name: string; raw: PolicyTemplate; index: number}) {
        super('policy', data)
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
    }

    get toscaId() {
        if (validator.isDefined(this.index)) return this.index
        return this.name
    }

    get defaultEnabled() {
        return Boolean(this.raw.default_condition ?? this.graph.options.default.policy_default_condition)
    }

    get pruningEnabled() {
        return Boolean(this.raw.pruning ?? this.graph.options.pruning.policy_pruning)
    }

    private _defaultCondition?: LogicExpression
    get defaultCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultCondition))
            this._defaultCondition = {has_present_target: this.toscaId, _cached_element: this}
        return this._defaultCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = {policy_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    defaultAlternativeCondition: undefined

    getTypeCondition(type: Type): LogicExpression {
        return {policy_type_presence: [this.toscaId, type.index], _cached_element: type}
    }

    getPropertyCondition(property: Property): LogicExpression {
        return {policy_property_presence: [this.toscaId, property.index ?? property.name], _cached_element: property}
    }
}

export class Group extends ConditionalElement {
    raw: GroupTemplate
    members: (Node | Relation)[] = []
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()
    variability: boolean
    types: Type[] = []
    typesMap: Map<String, Type[]> = new Map()

    constructor(data: {name: string; raw: GroupTemplate}) {
        super('group', data)
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
        this.variability =
            validator.isString(this.raw.type) &&
            (this.raw.type === TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_ROOT ||
                this.raw.type === TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_CONDITIONAL_MEMBERS)
    }

    get toscaId() {
        return this.name
    }

    get defaultEnabled() {
        return Boolean(this.raw.default_condition ?? this.graph.options.default.group_default_condition)
    }

    get pruningEnabled() {
        return Boolean(this.raw.pruning ?? this.graph.options.pruning.group_pruning)
    }

    private _defaultCondition?: LogicExpression
    get defaultCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultCondition))
            this._defaultCondition = {has_present_member: this.toscaId, _cached_element: this}
        return this._defaultCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = {group_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    defaultAlternativeCondition: undefined

    getTypeCondition(type: Type): LogicExpression {
        return {group_type_presence: [this.toscaId, type.index], _cached_element: type}
    }

    getPropertyCondition(property: Property): LogicExpression {
        return {group_property_presence: [this.toscaId, property.index ?? property.name], _cached_element: property}
    }
}

export class Artifact extends ConditionalElement {
    raw: ArtifactDefinition
    container: Node
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()

    constructor(data: {name: string; raw: ArtifactDefinition; container: Node; index?: number}) {
        super('artifact', data)
        this.raw = data.raw
        this.container = data.container
        this.conditions = validator.isString(data.raw)
            ? []
            : validator.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this.defaultAlternative = (validator.isString(data.raw) ? false : data.raw.default_alternative) || false
    }

    get toscaId(): [string, string | number] {
        if (validator.isDefined(this.index)) return [this.container.name, this.index]
        return [this.container.name, this.name]
    }

    get defaultEnabled() {
        return Boolean(
            validator.isString(this.raw)
                ? this.graph.options.default.artifact_default_condition
                : this.raw.default_condition ?? this.graph.options.default.artifact_default_condition
        )
    }

    get pruningEnabled() {
        return Boolean(
            validator.isString(this.raw)
                ? this.graph.options.pruning.artifact_pruning
                : this.raw.pruning ?? this.graph.options.pruning.artifact_pruning
        )
    }

    get defaultCondition() {
        return this.container.presenceCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = {artifact_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    // Check if no other artifact having the same name is present
    private _defaultAlternativeCondition?: LogicExpression
    get defaultAlternativeCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultAlternativeCondition))
            this._defaultAlternativeCondition = bratanize(
                this.container.artifactsMap.get(this.name)!.filter(it => it !== this)
            )
        return this._defaultAlternativeCondition
    }

    getPropertyCondition(property: Property): LogicExpression {
        return {
            artifact_property_presence: [...this.toscaId, property.index ?? property.name],
            _cached_element: property,
        }
    }
}

function bratanize(bratans: ConditionalElement[]) {
    return {
        not: {
            or: bratans.map(it => it.presenceCondition),
        },
    }
}

export class Graph {
    serviceTemplate: ServiceTemplate
    options: {
        default: DefaultOptions
        pruning: PruningOptions
        solver: SolverOptions
        consistency: ConsistencyOptions
    } = {default: {}, pruning: {}, solver: {}, consistency: {}}

    elements: ConditionalElement[] = []

    types: Type[] = []

    nodes: Node[] = []
    nodesMap = new Map<string, Node>()

    relations: Relation[] = []
    relationshipsMap = new Map<string, Relationship>()

    properties: Property[] = []

    policies: Policy[] = []
    policiesMap = new Map<string, Policy[]>()

    groups: Group[] = []
    groupsMap = new Map<string, Group>()

    inputs: Input[] = []
    inputsMap = new Map<string, Input>()

    artifacts: Artifact[] = []

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate

        if (
            ![
                TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
                TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            ].includes(this.serviceTemplate.tosca_definitions_version)
        )
            throw new Error('Unsupported TOSCA definitions version')

        // Options
        this.buildOptions()

        // Inputs
        this.buildInputs()

        // Nodes and relations
        this.buildNodesAndRelations()

        // Groups
        this.buildGroups()

        // Policies
        this.buildPolicies()

        this.elements = [
            ...this.types,
            ...this.nodes,
            ...this.relations,
            ...this.properties,
            ...this.policies,
            ...this.groups,
            ...this.inputs,
            ...this.artifacts,
        ]
    }

    private buildOptions() {
        // Get user-defined options
        const options = this.serviceTemplate.topology_template?.variability?.options || {}

        // Get resolver mode
        const mode = options.mode ?? 'strict'
        const map = ResolverModes[mode]
        if (validator.isUndefined(map)) throw new Error(`Resolving mode "${mode}" unknown`)

        // Build default options
        this.options.default = utils.propagateOptions<DefaultOptions>({
            base: ResolverModes.base.default,
            mode: map.default,
            flag: options.default_condition,
            options,
        })

        // Build pruning options
        this.options.pruning = utils.propagateOptions<PruningOptions>({
            base: ResolverModes.base.pruning,
            mode: map.pruning,
            flag: options.pruning,
            options,
        })

        // Build optimization options
        const optimization = options.optimization
        if (
            validator.isDefined(optimization) &&
            !validator.isBoolean(optimization) &&
            !['min', 'max'].includes(optimization)
        ) {
            throw new Error(`Solver option optimization "${optimization}" must be a boolean, "min", or "max"`)
        }
        this.options.solver = {optimization: optimization ?? 'min'}

        // Build consistency options
        this.options.consistency = utils.propagateOptions<ConsistencyOptions>({
            base: {
                relation_source_consistency_check: true,
                relation_target_consistency_check: true,
                ambiguous_hosting_consistency_check: true,
                expected_hosting_consistency_check: true,
                missing_artifact_parent_consistency_check: true,
                ambiguous_artifact_consistency_check: true,
                missing_property_parent_consistency_check: true,
                ambiguous_property_consistency_check: true,
            },
            mode: {},
            flag: options.consistency_checks,
            options,
        })
    }

    private getFromVariabilityPointMap<T>(data?: VariabilityPointMap<T>): {[name: string]: T}[] {
        if (validator.isUndefined(data)) return []
        if (validator.isArray(data)) return data
        return Object.entries(data).map(([name, template]) => {
            const map: {[name: string]: T} = {}
            map[name] = template
            return map
        })
    }

    private buildInputs() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.inputs).forEach(map => {
            const [name, definition] = utils.firstEntry(map)
            if (this.inputsMap.has(name)) throw new Error(`Input "${name}" defined multiple times`)

            const input = new Input({name, raw: definition})
            input.graph = this

            this.inputs.push(input)
            this.inputsMap.set(name, input)
        })
    }

    private buildNodesAndRelations() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.node_templates).forEach(map => {
            const [nodeName, nodeTemplate] = utils.firstEntry(map)
            if (this.nodesMap.has(nodeName)) throw new Error(`Node "${nodeName}" defined multiple times`)

            const node = new Node({name: nodeName, raw: nodeTemplate})
            node.graph = this

            this.nodes.push(node)
            this.nodesMap.set(nodeName, node)

            // Type
            this.buildTypes(node, nodeTemplate)

            // Properties
            this.buildProperties(node, nodeTemplate)

            // Relations
            for (const [index, map] of nodeTemplate.requirements?.entries() || []) {
                const [relationName, assignment] = utils.firstEntry(map)

                const relation = new Relation({
                    name: relationName,
                    container: node,
                    raw: assignment,
                    index,
                })
                relation.graph = this

                if (!node.outgoingMap.has(relation.name)) node.outgoingMap.set(relation.name, [])
                node.outgoingMap.get(relation.name)!.push(relation)
                node.outgoing.push(relation)
                node.relations.push(relation)
                this.relations.push(relation)

                if (!validator.isString(assignment)) {
                    if (validator.isString(assignment.relationship)) {
                        const relationshipTemplate = (this.serviceTemplate.topology_template?.relationship_templates ||
                            {})[assignment.relationship]
                        validator.ensureDefined(
                            relationshipTemplate,
                            `Relationship "${assignment.relationship}" of relation "${relationName}" of node "${nodeName}" does not exist!`
                        )

                        if (this.relationshipsMap.has(assignment.relationship))
                            throw new Error(`Relation "${assignment.relationship}" is used multiple times`)

                        const relationship = new Relationship({
                            name: assignment.relationship,
                            relation,
                            raw: relationshipTemplate,
                        })
                        this.relationshipsMap.set(assignment.relationship, relationship)
                        relation.relationship = relationship

                        // Type
                        this.buildTypes(relation, relationshipTemplate)

                        // Properties
                        this.buildProperties(relation, relationshipTemplate)
                    }

                    if (validator.isObject(assignment.relationship)) {
                        throw new Error(
                            `Relation "${relationName}" of node "${nodeName}" contains a relationship template`
                        )
                    }
                }
            }

            // Ensure that there are no multiple outgoing defaults
            node.outgoingMap.forEach(relations => {
                const candidates = relations.filter(it => it.defaultAlternative)
                if (candidates.length > 1) throw new Error(`${relations[0].Display} has multiple defaults`)
            })

            // Artifacts
            if (validator.isDefined(nodeTemplate.artifacts)) {
                if (validator.isArray(nodeTemplate.artifacts)) {
                    for (const [artifactIndex, artifactMap] of nodeTemplate.artifacts.entries()) {
                        this.buildArtifact(node, artifactMap, artifactIndex)
                    }
                } else {
                    for (const [artifactName, artifactDefinition] of Object.entries(nodeTemplate.artifacts)) {
                        const map: ArtifactDefinitionMap = {}
                        map[artifactName] = artifactDefinition
                        this.buildArtifact(node, map)
                    }
                }
                // Ensure that there is only one default artifact per artifact name
                node.artifactsMap.forEach(artifacts => {
                    const candidates = artifacts.filter(it => it.defaultAlternative)
                    if (candidates.length > 1) throw new Error(`${artifacts[0].Display} has multiple defaults`)
                })
            }
        })

        // Ensure that each relationship is used
        for (const relationshipName of Object.keys(
            this.serviceTemplate.topology_template?.relationship_templates || {}
        )) {
            if (!this.relationshipsMap.has(relationshipName))
                throw new Error(`Relation "${relationshipName}" is never used`)
        }

        // Assign ingoing relations to nodes and assign target to relation
        this.relations.forEach(relation => {
            const targetName = validator.isString(relation.raw) ? relation.raw : relation.raw.node
            const target = this.nodesMap.get(targetName)
            validator.ensureDefined(target, `Target "${targetName}" of ${relation.display} does not exist`)

            relation.target = target
            target.ingoing.push(relation)
            target.relations.push(relation)
        })
    }

    private buildTypes(
        element: Node | Relation | Policy | Group,
        template: NodeTemplate | RelationshipTemplate | PolicyTemplate | GroupTemplate
    ) {
        if (validator.isString(template)) return
        if (validator.isUndefined(template.type)) throw new Error(`${element.Display} has no type`)

        // Collect types
        const types: VariabilityPointList<TypeAssignment> = validator.isString(template.type)
            ? [
                  (() => {
                      const map: {[name: string]: TypeAssignment} = {}
                      map[template.type] = {}
                      return map
                  })(),
              ]
            : template.type

        // Create types
        for (const [index, map] of types.entries()) {
            const [name, assignment] = utils.firstEntry(map)

            const type = new Type({
                name,
                container: element,
                index: index,
                raw: assignment,
            })
            type.graph = this
            this.types.push(type)

            element.types.push(type)
            if (!element.typesMap.has(name)) element.typesMap.set(name, [])
            element.typesMap.get(name)!.push(type)
        }

        // Ensure that there is only one default type
        if (element.types.filter(it => it.defaultAlternative).length > 1)
            throw new Error(`${element.Display} has multiple default types`)
    }

    private buildArtifact(node: Node, map: ArtifactDefinitionMap, index?: number) {
        const [artifactName, artifactDefinition] = utils.firstEntry(map)

        const artifact = new Artifact({name: artifactName, raw: artifactDefinition, container: node, index})
        artifact.graph = this

        this.buildProperties(artifact, artifactDefinition)

        if (!node.artifactsMap.has(artifact.name)) node.artifactsMap.set(artifact.name, [])
        node.artifactsMap.get(artifact.name)!.push(artifact)
        node.artifacts.push(artifact)
        this.artifacts.push(artifact)
    }

    private buildProperties(
        element: Node | Relation | Policy | Group | Artifact,
        template: NodeTemplate | RelationshipTemplate | PolicyTemplate | GroupTemplate | ArtifactDefinition
    ) {
        if (validator.isString(template)) return

        if (validator.isObject(template.properties)) {
            // Properties is a Property Assignment List
            if (validator.isArray(template.properties)) {
                for (const [propertyIndex, propertyAssignmentListEntry] of template.properties.entries()) {
                    const [propertyName, propertyAssignment] = utils.firstEntry(propertyAssignmentListEntry)

                    let property: Property

                    // Property is not conditional
                    if (
                        validator.isString(propertyAssignment) ||
                        validator.isNumber(propertyAssignment) ||
                        validator.isBoolean(propertyAssignment) ||
                        validator.isArray(propertyAssignment) ||
                        (validator.isUndefined(propertyAssignment.value) &&
                            validator.isUndefined(propertyAssignment.expression))
                    ) {
                        property = new Property({
                            name: propertyName,
                            container: element,
                            // This just works since we do not allow "value" as a keyword in a property assignment value
                            value: propertyAssignment as PropertyAssignmentValue,
                            default: false,
                            index: propertyIndex,
                            raw: propertyAssignment,
                        })
                    } else {
                        // Property is conditional
                        property = new Property({
                            name: propertyName,
                            conditions: validator.isDefined(propertyAssignment.default_alternative)
                                ? [false]
                                : utils.toList(propertyAssignment.conditions),
                            default: propertyAssignment.default_alternative ?? false,
                            container: element,
                            value: propertyAssignment.value,
                            expression: propertyAssignment.expression,
                            index: propertyIndex,
                            raw: propertyAssignment,
                        })
                    }

                    property.graph = this
                    if (!element.propertiesMap.has(propertyName)) element.propertiesMap.set(propertyName, [])
                    element.propertiesMap.get(propertyName)!.push(property)
                    element.properties.push(property)
                    this.properties.push(property)
                }
            } else {
                // Properties is a Property Assignment Map
                for (const [propertyName, propertyAssignment] of Object.entries(template.properties || {})) {
                    const property = new Property({
                        name: propertyName,
                        container: element,
                        value: propertyAssignment,
                        default: false,
                        raw: propertyAssignment,
                    })
                    property.graph = this

                    if (!element.propertiesMap.has(propertyName)) element.propertiesMap.set(propertyName, [])
                    element.propertiesMap.get(propertyName)!.push(property)
                    element.properties.push(property)
                    this.properties.push(property)
                }
            }
        }

        // Ensure that there is only one default property per property name
        element.propertiesMap.forEach(properties => {
            const candidates = properties.filter(it => it.defaultAlternative)
            if (candidates.length > 1) {
                throw new Error(`${properties[0].Display} has multiple defaults`)
            }
        })

        // Ensure that every property has at least a value or a value expression assigned
        element.properties.forEach(property => {
            if (validator.isUndefined(property.value) && validator.isUndefined(property.expression)) {
                throw new Error(`${property.Display} has no value or expression defined`)
            }
        })
    }

    private buildGroups() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.groups).forEach(map => {
            const [name, template] = utils.firstEntry(map)
            if (this.groupsMap.has(name)) throw new Error(`Group "${name}" defined multiple times`)

            const group = new Group({name, raw: template})
            group.graph = this

            this.groups.push(group)
            this.groupsMap.set(name, group)

            template.members.forEach(member => {
                let element: Node | Relation | undefined

                if (validator.isString(member)) element = this.getNode(member)
                if (validator.isArray(member)) element = this.getRelation(member)
                ensureDefined(element, `Member "${utils.pretty(member)}" has bad format`)

                element.groups.push(group)
                group.members.push(element)
            })

            // Type
            this.buildTypes(group, template)

            // Properties
            this.buildProperties(group, template)
        })
    }

    private buildPolicies() {
        if (
            validator.isDefined(this.serviceTemplate.topology_template?.policies) &&
            !validator.isArray(this.serviceTemplate.topology_template?.policies)
        )
            throw new Error(`Policies must be an array`)

        for (const [index, map] of this.serviceTemplate.topology_template?.policies?.entries() || []) {
            const [name, template] = utils.firstEntry(map)
            const policy = new Policy({name, raw: template, index})
            policy.graph = this

            if (!this.policiesMap.has(name)) this.policiesMap.set(name, [])
            this.policiesMap.get(name)!.push(policy)
            this.policies.push(policy)

            template.targets?.forEach(target => {
                const node = this.nodesMap.get(target)
                if (validator.isDefined(node)) {
                    return policy.targets.push(node)
                }

                const group = this.groupsMap.get(target)
                if (validator.isDefined(group)) {
                    return policy.targets.push(group)
                }

                throw new Error(`Policy target "${target}" of ${policy.display} does not exist`)
            })

            // Type
            this.buildTypes(policy, template)

            // Properties
            this.buildProperties(policy, template)
        }
    }

    getNode(name: string) {
        const node = this.nodesMap.get(name)
        validator.ensureDefined(node, `Node "${name}" not found`)
        return node
    }

    getNodeType(data: NodeTypePresenceArguments) {
        return this.getType(this.getNode(data[0]), data)
    }

    getRelationType(data: RelationTypePresenceArguments) {
        return this.getType(this.getRelation([data[0], data[1]]), data)
    }

    getGroupType(data: GroupTypePresenceArguments) {
        return this.getType(this.getGroup(data[0]), data)
    }

    getPolicyType(data: PolicyTypePresenceArguments) {
        return this.getType(this.getPolicy(data[0]), data)
    }

    private getType(container: Node | Relation | Group | Policy, data: (string | number)[]) {
        let type
        const toscaId = utils.last(data)

        if (validator.isString(toscaId)) {
            const types = container.typesMap.get(toscaId) || []
            if (types.length > 1) throw new Error(`Type "${utils.pretty(data)}" is ambiguous`)
            type = types[0]
        }

        if (validator.isNumber(toscaId)) type = container.types[toscaId]

        validator.ensureDefined(type, `Type "${utils.pretty(data)}" not found`)
        return type
    }

    getRelation(member: [string, string | number]) {
        let relation
        const node = this.getNode(member[0])

        // Element is [node name, relation name]
        if (validator.isString(member[1])) {
            const relations = node.outgoingMap.get(member[1]) || []
            if (relations.length > 1) throw new Error(`Relation "${utils.pretty(member)}" is ambiguous`)
            relation = relations[0]
        }

        // Element is [node name, relation index]
        if (validator.isNumber(member[1])) relation = node.outgoing[member[1]]

        validator.ensureDefined(relation, `Relation "${utils.pretty(member)}" not found`)
        return relation
    }

    getGroup(name: string) {
        const group = this.groupsMap.get(name)
        validator.ensureDefined(group, `Group "${name}" not found`)
        return group
    }

    getPolicy(element: string | number) {
        let policy

        if (validator.isString(element)) {
            const policies = this.policiesMap.get(element) || []
            if (policies.length > 1) throw new Error(`Policy "${element}" is ambiguous`)
            policy = policies[0]
        }

        if (validator.isNumber(element)) {
            policy = this.policies[element]
        }

        if (validator.isUndefined(policy)) throw new Error(`Policy "${element}" not found`)
        return policy
    }

    getArtifact(member: [string, string | number]) {
        let artifact
        const node = this.getNode(member[0])

        if (validator.isString(member[1])) {
            const artifacts = node.artifactsMap.get(member[1]) || []
            if (artifacts.length > 1) throw new Error(`Artifact "${utils.pretty(member)}" is ambiguous`)
            artifact = artifacts[0]
        }

        if (validator.isNumber(member[1])) artifact = node.artifacts[member[1]]

        validator.ensureDefined(artifact, `Artifact "${utils.pretty(member)}" not found`)
        return artifact
    }

    getNodeProperty(data: NodePropertyPresenceArguments) {
        return this.getProperty(this.getNode(data[0]), data)
    }

    getRelationProperty(data: RelationPropertyPresenceArguments) {
        return this.getProperty(this.getRelation([data[0], data[1]]), data)
    }

    getGroupProperty(data: GroupPropertyPresenceArguments) {
        return this.getProperty(this.getGroup(data[0]), data)
    }

    getPolicyProperty(data: PolicyPropertyPresenceArguments) {
        return this.getProperty(this.getPolicy(data[0]), data)
    }

    getArtifactProperty(data: ArtifactPropertyPresenceArguments) {
        return this.getProperty(this.getArtifact([data[0], data[1]]), data)
    }

    private getProperty(container: Node | Relation | Group | Policy | Artifact, data: (string | number)[]) {
        let property
        const toscaId = utils.last(data)

        if (validator.isString(toscaId)) {
            const properties = container.propertiesMap.get(toscaId) || []
            if (properties.length > 1) throw new Error(`Property "${utils.pretty(data)}" is ambiguous`)
            property = properties[0]
        }

        if (validator.isNumber(toscaId)) property = container.properties[toscaId]

        validator.ensureDefined(property, `Property "${utils.pretty(data)}" not found`)
        return property
    }

    getInput(name: string) {
        const input = this.inputsMap.get(name)
        validator.ensureDefined(input, `Input "${name}" not found`)
        return input
    }
}

export default Graph
