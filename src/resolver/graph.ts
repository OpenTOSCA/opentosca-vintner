import {VariabilityExpression, VariabilityPointMap} from '#spec/variability'
import {InputDefinition} from '#spec/topology-template'
import {NodeTemplate, RequirementAssignment} from '#spec/node-template'
import {PropertyAssignmentValue} from '#spec/property-assignments'
import {RelationshipTemplate} from '#spec/relationship-template'
import {PolicyTemplate} from '#spec/policy-template'
import {GroupTemplate} from '#spec/group-template'
import {ArtifactDefinition, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import * as utils from '#utils'
import * as validator from '#validator'
import {GroupMember, TOSCA_GROUP_TYPES} from '#spec/group-type'
import {mem} from 'systeminformation'
import {ensureDefined} from '#validator'

/**
 * Not documented since preparation for future work
 *
 * - node templates might be a list
 * - groups might be a list
 */

export type ConditionalElementBase = {
    type: 'node' | 'relation' | 'input' | 'policy' | 'group' | 'artifact' | 'property'
    name: string
    display: string
    present?: boolean
    conditions: VariabilityExpression[]
}

export type Input = ConditionalElementBase & {
    type: 'input'
    _raw: InputDefinition
}

export type Node = ConditionalElementBase & {
    type: 'node'
    relations: Relation[]
    ingoing: Relation[]
    outgoing: Relation[]
    outgoingMap: Map<String, Relation[]>
    groups: Group[]
    artifacts: Artifact[]
    artifactsMap: Map<String, Artifact[]>
    properties: Property[]
    propertiesMap: Map<String, Property[]>
    _raw: NodeTemplate
    _id: string
}

export type Property = ConditionalElementBase & {
    type: 'property'
    parent: Node | Relation | Policy | Group | Artifact
    index?: number
    default: boolean
    value?: PropertyAssignmentValue
    expression?: VariabilityExpression
}

export type Relation = ConditionalElementBase & {
    type: 'relation'
    source: string
    target: string
    groups: Group[]
    properties: Property[]
    propertiesMap: Map<String, Property[]>
    relationship?: Relationship
    default: boolean
    _raw: RequirementAssignment
    _id: [string, string]
}

export type Relationship = {
    name: string
    relation: Relation
    _raw: RelationshipTemplate
}

export type Policy = ConditionalElementBase & {
    type: 'policy'
    targets: (Node | Group)[]
    properties: Property[]
    propertiesMap: Map<String, Property[]>
    _raw: PolicyTemplate
}

export type Group = ConditionalElementBase & {
    type: 'group'
    variability: boolean
    members: (Node | Relation)[]
    properties: Property[]
    propertiesMap: Map<String, Property[]>
    _raw: GroupTemplate
}

export type Artifact = ConditionalElementBase & {
    type: 'artifact'
    index?: number
    node: Node
    properties: Property[]
    propertiesMap: Map<String, Property[]>
    _raw: ArtifactDefinition
    default: boolean
}

export type ConditionalElement = Input | Node | Relation | Policy | Group | Artifact | Property

export class Graph {
    serviceTemplate: ServiceTemplate

    nodes: Node[] = []
    nodesMap = new Map<string, Node>()

    relations: Relation[] = []
    relationshipsMap = new Map<string, Relationship>()

    properties: Property[] = []

    policies: Policy[] = []

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

        // Inputs
        this.populateInputs()

        // Nodes and relations
        this.populateNodesAndRelations()

        // Groups
        this.populateGroups()

        // Policies
        this.populatePolicies()
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

    private populateArtifact(node: Node, map: ArtifactDefinitionMap, index?: number) {
        const [artifactName, artifactDefinition] = utils.firstEntry(map)

        const artifact: Artifact = {
            type: 'artifact',
            name: artifactName,
            index: index,
            display: validator.isDefined(index) ? `${artifactName}@${index}` : artifactName,
            conditions: validator.isString(artifactDefinition)
                ? []
                : validator.isDefined(artifactDefinition.default_alternative)
                ? [false]
                : utils.toList(artifactDefinition.conditions),
            node,
            _raw: artifactDefinition,
            default: (validator.isString(artifactDefinition) ? false : artifactDefinition.default_alternative) || false,
            properties: [],
            propertiesMap: new Map(),
        }

        this.populateProperties(artifact, artifactDefinition)

        if (!node.artifactsMap.has(artifact.name)) node.artifactsMap.set(artifact.name, [])
        node.artifactsMap.get(artifact.name)!.push(artifact)
        node.artifacts.push(artifact)
        this.artifacts.push(artifact)
    }

    private populateProperties(
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
                        property = {
                            type: 'property',
                            name: propertyName,
                            display: `${propertyName}@${propertyIndex}`,
                            conditions: [],
                            parent: element,
                            // This just works since we do not allow "value" as a keyword in a property assignment value
                            value: propertyAssignment as PropertyAssignmentValue,
                            default: false,
                        }
                    } else {
                        // Property is conditional
                        property = {
                            type: 'property',
                            name: propertyName,
                            display: `${propertyName}@${propertyIndex}`,
                            conditions: validator.isDefined(propertyAssignment.default_alternative)
                                ? [false]
                                : utils.toList(propertyAssignment.conditions),
                            default: propertyAssignment.default_alternative || false,
                            parent: element,
                            value: propertyAssignment.value,
                            expression: propertyAssignment.expression,
                        }
                    }

                    if (!element.propertiesMap.has(propertyName)) element.propertiesMap.set(propertyName, [])
                    element.propertiesMap.get(propertyName)!.push(property)
                    element.properties.push(property)
                    this.properties.push(property)
                }
            } else {
                // Properties is a Property Assignment Map
                for (const [propertyName, propertyAssignment] of Object.entries(template.properties || {})) {
                    const property: Property = {
                        type: 'property',
                        name: propertyName,
                        display: propertyName,
                        conditions: [],
                        parent: element,
                        value: propertyAssignment,
                        default: false,
                    }

                    if (!element.propertiesMap.has(propertyName)) element.propertiesMap.set(propertyName, [])
                    element.propertiesMap.get(propertyName)!.push(property)
                    element.properties.push(property)
                    this.properties.push(property)
                }
            }
        }

        element.propertiesMap.forEach((properties, propertyName) => {
            const candidates = properties.filter(it => it.default)
            if (candidates.length > 1) {
                if (element.type === 'node')
                    throw new Error(`Property "${propertyName}" of node "${element.display}" has multiple defaults`)

                if (element.type === 'group')
                    throw new Error(`Property "${propertyName}" of group "${element.display}" has multiple defaults`)

                if (element.type === 'policy')
                    throw new Error(`Property "${propertyName}" of policy "${element.display}" has multiple defaults`)

                if (element.type === 'artifact')
                    throw new Error(
                        `Property "${propertyName}" of artifact "${element.display}" of node "${element.node.display}" has multiple defaults`
                    )

                if (element.type === 'relation')
                    throw new Error(
                        `Property "${propertyName}" of relation "${element.relationship!.name}" has multiple defaults`
                    )

                throw new Error('Unexpected')
            }
        })

        element.properties.forEach(property => {
            if (validator.isUndefined(property.value) && validator.isUndefined(property.expression)) {
                if (element.type === 'node')
                    throw new Error(
                        `Property "${property.display}" of node "${element.display}" has no value or expression defined`
                    )

                if (element.type === 'relation')
                    throw new Error(
                        `Property "${property.display}" of relation "${
                            element.relationship!.name
                        }" has no value or expression defined`
                    )

                if (element.type === 'group')
                    throw new Error(
                        `Property "${property.display}" of group "${element.display}" has multiple defaults`
                    )

                if (element.type === 'policy')
                    throw new Error(
                        `Property "${property.display}" of policy "${element.display}" has multiple defaults`
                    )

                if (element.type === 'artifact')
                    throw new Error(
                        `Property "${property.display}" of artifact "${element.display}" of node "${element.node.display}" has multiple defaults`
                    )

                throw new Error('Unexpected')
            }
        })
    }

    private populateInputs() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.inputs).forEach(map => {
            const [name, definition] = utils.firstEntry(map)
            if (this.inputsMap.has(name)) throw new Error(`Input "${name}" defined multiple times`)

            const input: Input = {
                type: 'input',
                name,
                display: name,
                conditions: utils.toList(definition.conditions),
                _raw: definition,
            }
            this.inputs.push(input)
            this.inputsMap.set(name, input)
        })
    }

    private populateNodesAndRelations() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.node_templates).forEach(map => {
            const [nodeName, nodeTemplate] = utils.firstEntry(map)
            if (this.nodesMap.has(nodeName)) throw new Error(`Node "${nodeName}" defined multiple times`)

            const node: Node = {
                type: 'node',
                name: nodeName,
                display: nodeName,
                conditions: utils.toList(nodeTemplate.conditions),
                relations: [],
                ingoing: [],
                outgoing: [],
                outgoingMap: new Map(),
                groups: [],
                artifacts: [],
                artifactsMap: new Map(),
                properties: [],
                propertiesMap: new Map(),
                _raw: nodeTemplate,
                _id: nodeName,
            }
            this.nodes.push(node)
            this.nodesMap.set(nodeName, node)

            // Properties
            this.populateProperties(node, nodeTemplate)

            // Relations
            nodeTemplate.requirements?.forEach(map => {
                const [relationName, assignment] = utils.firstEntry(map)
                const target = validator.isString(assignment) ? assignment : assignment.node

                const relation: Relation = {
                    type: 'relation',
                    name: relationName,
                    display: `${nodeName}.${relationName}`,
                    source: nodeName,
                    target,
                    conditions: validator.isString(assignment)
                        ? []
                        : validator.isDefined(assignment.default_alternative)
                        ? [false]
                        : utils.toList(assignment.conditions),
                    groups: [],
                    properties: [],
                    propertiesMap: new Map(),
                    default: validator.isString(assignment) ? false : assignment.default_alternative || false,
                    _raw: assignment,
                    _id: [nodeName, relationName],
                }
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

                        const relationship: Relationship = {
                            name: assignment.relationship,
                            relation,
                            _raw: relationshipTemplate,
                        }

                        this.relationshipsMap.set(assignment.relationship, relationship)
                        relation.relationship = relationship

                        // Properties
                        this.populateProperties(relation, relationshipTemplate)
                    }

                    if (validator.isObject(assignment.relationship)) {
                        throw new Error(
                            `Relation "${relationName}" of node "${nodeName}" contains a relationship template`
                        )
                    }
                }
            })

            // Ensure that there are no multiple outgoing defaults
            node.outgoingMap.forEach((relations, relationName) => {
                const candidates = relations.filter(it => it.default)
                if (candidates.length > 1) {
                    throw new Error(`Relation "${relationName}" of node "${node.display}" has multiple defaults`)
                }
            })

            // Artifacts
            if (validator.isDefined(nodeTemplate.artifacts)) {
                if (validator.isArray(nodeTemplate.artifacts)) {
                    for (const [artifactIndex, artifactMap] of nodeTemplate.artifacts.entries()) {
                        this.populateArtifact(node, artifactMap, artifactIndex)
                    }
                } else {
                    for (const [artifactName, artifactDefinition] of Object.entries(nodeTemplate.artifacts)) {
                        const map: ArtifactDefinitionMap = {}
                        map[artifactName] = artifactDefinition
                        this.populateArtifact(node, map)
                    }
                }
                // Ensure that there is only one default artifact
                node.artifactsMap.forEach((artifacts, artifactName) => {
                    const candidates = artifacts.filter(it => it.default)
                    if (candidates.length > 1) {
                        throw new Error(`Artifact "${artifactName}" of node "${node.display}" has multiple defaults`)
                    }
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

        // Assign ingoing relations to nodes
        this.relations.forEach(relation => {
            const node = this.nodesMap.get(relation.target)
            validator.ensureDefined(node, `Target "${relation.target}" of "${relation.display}" does not exist`)
            node.ingoing.push(relation)
            node.relations.push(relation)
        })
    }

    private populateGroups() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.groups).forEach(map => {
            const [name, template] = utils.firstEntry(map)
            if (this.groupsMap.has(name)) throw new Error(`Group "${name}" defined multiple times`)

            const group: Group = {
                type: 'group',
                name,
                display: name,
                conditions: utils.toList(template.conditions),
                variability: [
                    TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_ROOT,
                    TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_CONDITIONAL_MEMBERS,
                ].includes(template.type),
                members: [],
                _raw: template,
                properties: [],
                propertiesMap: new Map(),
            }
            this.groups.push(group)
            this.groupsMap.set(name, group)

            template.members.forEach(member => {
                let element: Node | Relation | undefined

                if (validator.isString(member)) element = this.getNode(member)
                if (validator.isArray(member)) element = this.getRelation(member)
                ensureDefined(element, `Member "${utils.prettyJSON(member)}" has bad format`)

                element.groups.push(group)
                group.members.push(element)
            })

            this.populateProperties(group, template)
        })
    }

    private populatePolicies() {
        if (
            validator.isDefined(this.serviceTemplate.topology_template?.policies) &&
            !validator.isArray(this.serviceTemplate.topology_template?.policies)
        )
            throw new Error(`Policies must be an array`)
        this.serviceTemplate.topology_template?.policies?.forEach(map => {
            const [name, template] = utils.firstEntry(map)
            const policy: Policy = {
                type: 'policy',
                name,
                display: name,
                conditions: utils.toList(template.conditions),
                targets: [],
                _raw: template,
                properties: [],
                propertiesMap: new Map(),
            }
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

                throw new Error(`Policy target "${target}" of policy "${policy.display} does not exist`)
            })

            this.populateProperties(policy, template)
        })
    }

    getNode(member: string) {
        const node = this.nodesMap.get(member)
        validator.ensureDefined(node, `Node "${utils.prettyJSON(member)}" not found`)
        return node
    }

    getRelation(member: [string, string] | [string, number]) {
        let relation
        const node = this.getNode(member[0])

        // Element is [node name, relation name]
        if (validator.isString(member[1])) {
            const relations = node.outgoing.filter(relation => relation.name === member[1])
            if (relations.length > 1) throw new Error(`Relation "${utils.prettyJSON(member)}" is ambiguous`)
            relation = relations[0]
        }

        // Element is [node name, relation index]
        if (validator.isNumber(member[1])) relation = node.outgoing[member[1]]

        validator.ensureDefined(relation, `Relation "${utils.prettyJSON(member)}" not found`)
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
            const policies = this.policies.filter(policy => policy.name === element)
            if (policies.length > 1) throw new Error(`Policy name "${element}" is ambiguous`)
            policy = policies[0]
        }

        if (validator.isNumber(element)) {
            policy = this.policies[element]
        }

        if (validator.isUndefined(policy)) throw new Error(`Policy "${element}" not found`)
        return policy
    }
}

export default Graph
