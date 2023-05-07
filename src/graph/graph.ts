import {
    ArtifactPropertyPresenceArguments,
    ConsistencyOptions,
    DefaultOptions,
    GroupPropertyPresenceArguments,
    GroupTypePresenceArguments,
    NodePropertyPresenceArguments,
    NodeTypePresenceArguments,
    PolicyPropertyPresenceArguments,
    PolicyTypePresenceArguments,
    PruningOptions,
    RelationPropertyPresenceArguments,
    RelationTypePresenceArguments,
    ResolverModes,
    SolverOptions,
    VariabilityPointList,
    VariabilityPointMap,
} from '#spec/variability'
import {NodeTemplate} from '#spec/node-template'
import {PropertyAssignmentValue} from '#spec/property-assignments'
import {RelationshipTemplate} from '#spec/relationship-template'
import {PolicyTemplate} from '#spec/policy-template'
import {GroupTemplate} from '#spec/group-template'
import {ArtifactDefinition, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import * as utils from '#utils'
import * as validator from '#validator'
import {ensureDefined} from '#validator'
import {TypeAssignment} from '#spec/type-assignment'
import Input from './input'
import Node from './node'
import Relation, {Relationship} from './relation'
import Property, {PropertyContainer, PropertyContainerTemplate} from './property'
import Policy from './policy'
import Group from './group'
import Artifact from './artifact'
import Type, {TypeContainer, TypeContainerTemplate} from './type'
import Element from './element'

/**
 * Not documented since preparation for future work
 *
 * - inputs might be a list
 * - node templates might be a list
 * - groups might be a list (consider variability groups ...)
 */

export default class Graph {
    serviceTemplate: ServiceTemplate
    options: {
        default: DefaultOptions
        pruning: PruningOptions
        solver: SolverOptions
        consistency: ConsistencyOptions
    } = {default: {}, pruning: {}, solver: {}, consistency: {}}

    elements: Element[] = []

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

        // Elements
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
                consistency_checks: true,
                relation_source_consistency_check: true,
                relation_target_consistency_check: true,
                ambiguous_hosting_consistency_check: true,
                expected_hosting_consistency_check: true,
                missing_artifact_parent_consistency_check: true,
                ambiguous_artifact_consistency_check: true,
                missing_property_parent_consistency_check: true,
                ambiguous_property_consistency_check: true,
                missing_type_container_consistency_check: true,
                ambiguous_type_consistency_check: true,
            },
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

    private buildTypes(element: TypeContainer, template: TypeContainerTemplate) {
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

    private buildProperties(element: PropertyContainer, template: PropertyContainerTemplate) {
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
