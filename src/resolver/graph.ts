import {VariabilityExpression, VariabilityPointMap} from '#spec/variability'
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

/**
 * Not documented since preparation for future work
 *
 * - node templates might be a list
 * - groups might be a list
 */

type ConditionalElementBase = {
    type: 'node' | 'relation' | 'input' | 'policy' | 'group' | 'artifact' | 'property'
    id: string
    name: string
    display: string
    Display: string
    present?: boolean
    conditions: VariabilityExpression[]
}

export class Input implements ConditionalElementBase {
    readonly type = 'input'
    raw: InputDefinition
    id: string
    name: string
    display: string
    Display: string
    present?: boolean
    conditions: VariabilityExpression[]

    constructor(data: {name: string; raw: InputDefinition}) {
        this.name = data.name
        this.display = 'input "' + data.name + '"'
        this.Display = 'Input "' + data.name + '"'
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
        this.id = this.type + ':' + data.name
    }
}

export class Node implements ConditionalElementBase {
    readonly type = 'node'
    raw: NodeTemplate
    id: string
    name: string
    display: string
    Display: string
    _id: string
    relations: Relation[] = []
    ingoing: Relation[] = []
    outgoing: Relation[] = []
    outgoingMap: Map<String, Relation[]> = new Map()
    groups: Group[] = []
    artifacts: Artifact[] = []
    artifactsMap: Map<String, Artifact[]> = new Map()
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()
    present?: boolean
    conditions: VariabilityExpression[]

    constructor(data: {name: string; raw: NodeTemplate}) {
        this.name = data.name
        this.display = 'node "' + data.name + '"'
        this.Display = utils.toFirstUpperCase(this.display)
        this._id = data.name
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
        this.id = this.type + ':' + this.name
    }
}

export class Property implements ConditionalElementBase {
    readonly type = 'property'
    raw: ConditionalPropertyAssignmentValue | PropertyAssignmentValue
    id: string
    name: string
    display: string
    Display: string
    container: Node | Relation | Policy | Group | Artifact
    index?: number
    default: boolean
    value?: PropertyAssignmentValue
    expression?: VariabilityExpression
    present?: boolean
    conditions: VariabilityExpression[]

    constructor(data: {
        name: string
        raw: ConditionalPropertyAssignmentValue | PropertyAssignmentValue
        container: Node | Relation | Policy | Group | Artifact
        index?: number
        value?: PropertyAssignmentValue
        expression?: VariabilityExpression
        default: boolean
        conditions: VariabilityExpression[] // TODO: this is stupid
    }) {
        this.raw = data.raw
        this.name = data.name
        this.display =
            'property "' +
            (validator.isDefined(data.index) ? `${data.name}@${data.index}` : data.name) +
            '" of ' +
            data.container.display
        this.Display = utils.toFirstUpperCase(this.display)
        this.value = data.value
        this.expression = data.expression
        this.container = data.container
        this.default = data.default
        this.conditions = data.conditions

        this.id = this.type + ':' + this.container.name + ':' + this.name // TODO: index of container?! // TODO: index of property?!
    }
}

export class Relation implements ConditionalElementBase {
    readonly type = 'relation'
    raw: RequirementAssignment
    id: string
    name: string
    display: string
    Display: string
    _id: [string, string]
    source: string
    target: string
    groups: Group[] = []
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()
    present?: boolean
    conditions: VariabilityExpression[]
    relationship?: Relationship
    default: boolean

    constructor(data: {name: string; raw: RequirementAssignment; source: Node; target: string; id: [string, string]}) {
        this.name = data.name
        this.display = 'relation "' + `${data.name}` + '" of ' + data.source.display
        this.Display = utils.toFirstUpperCase(this.display)

        this.source = data.source.name
        this.target = data.target
        this.raw = data.raw
        this.conditions = validator.isString(data.raw)
            ? []
            : validator.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this._id = data.id
        this.default = validator.isString(data.raw) ? false : data.raw.default_alternative || false

        this.id = this.type + ':' + this.source + ':' + this.name // TODO: index?!
    }
}

export class Relationship {
    readonly type = 'relationship'
    raw: RelationshipTemplate
    id: string
    name: string
    relation: Relation

    constructor(data: {name: string; raw: InputDefinition; relation: Relation}) {
        this.name = data.name
        this.relation = data.relation
        this.raw = data.raw

        this.id = this.type + ':' + this.name
    }
}

export class Policy implements ConditionalElementBase {
    readonly type = 'policy'
    raw: PolicyTemplate
    id: string
    name: string
    display: string
    Display: string
    targets: (Node | Group)[] = []
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()
    present?: boolean
    conditions: VariabilityExpression[]

    constructor(data: {name: string; raw: PolicyTemplate}) {
        this.name = data.name
        this.display = 'policy "' + data.name + '"'
        this.Display = utils.toFirstUpperCase(this.display)
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
        this.id = this.type + ':' + this.name
    }
}

export class Group implements ConditionalElementBase {
    readonly type = 'group'
    raw: GroupTemplate
    id: string
    name: string
    display: string
    Display: string
    members: (Node | Relation)[] = []
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()
    variability: boolean
    present?: boolean
    conditions: VariabilityExpression[]

    constructor(data: {name: string; raw: GroupTemplate}) {
        this.name = data.name
        this.display = 'group "' + data.name + '"'
        this.Display = utils.toFirstUpperCase(this.display)
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
        this.variability = [
            TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_ROOT,
            TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_CONDITIONAL_MEMBERS,
        ].includes(this.raw.type)

        this.id = this.type + ':' + this.name
    }
}

export class Artifact implements ConditionalElementBase {
    readonly type = 'artifact'
    readonly raw: ArtifactDefinition
    readonly id: string
    readonly name: string
    readonly display: string
    readonly Display: string
    readonly index?: number
    readonly container: Node
    readonly properties: Property[] = []
    readonly propertiesMap: Map<String, Property[]> = new Map()
    present?: boolean
    readonly conditions: VariabilityExpression[]
    readonly default: boolean

    constructor(data: {name: string; raw: ArtifactDefinition; container: Node; index?: number}) {
        this.name = data.name
        this.display =
            'artifact "' +
            (validator.isDefined(data.index) ? `${data.name}@${data.index}` : data.name) +
            '" of ' +
            data.container.display
        this.Display = utils.toFirstUpperCase(this.display)
        this.raw = data.raw
        this.index = data.index
        this.container = data.container
        this.conditions = validator.isString(data.raw)
            ? []
            : validator.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this.default = (validator.isString(data.raw) ? false : data.raw.default_alternative) || false

        let id = this.type + ':' + this.container.name + ':' + this.name
        if (validator.isDefined(data.index)) id += ':' + this.index
        this.id = id
    }
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

        const artifact = new Artifact({name: artifactName, raw: artifactDefinition, container: node, index})
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
                        property = new Property({
                            name: propertyName,
                            conditions: [],
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
                            default: propertyAssignment.default_alternative || false,
                            container: element,
                            value: propertyAssignment.value,
                            expression: propertyAssignment.expression,
                            index: propertyIndex,
                            raw: propertyAssignment,
                        })
                    }

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
                        conditions: [],
                        container: element,
                        value: propertyAssignment,
                        default: false,
                        raw: propertyAssignment,
                    })

                    if (!element.propertiesMap.has(propertyName)) element.propertiesMap.set(propertyName, [])
                    element.propertiesMap.get(propertyName)!.push(property)
                    element.properties.push(property)
                    this.properties.push(property)
                }
            }
        }

        element.propertiesMap.forEach(properties => {
            const candidates = properties.filter(it => it.default)
            if (candidates.length > 1) {
                throw new Error(`${properties[0].Display} has multiple defaults`)
            }
        })

        element.properties.forEach(property => {
            if (validator.isUndefined(property.value) && validator.isUndefined(property.expression)) {
                throw new Error(`${property.Display} has no value or expression defined`)
            }
        })
    }

    private populateInputs() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.inputs).forEach(map => {
            const [name, definition] = utils.firstEntry(map)
            if (this.inputsMap.has(name)) throw new Error(`Input "${name}" defined multiple times`)

            const input = new Input({name, raw: definition})
            this.inputs.push(input)
            this.inputsMap.set(name, input)
        })
    }

    private populateNodesAndRelations() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.node_templates).forEach(map => {
            const [nodeName, nodeTemplate] = utils.firstEntry(map)
            if (this.nodesMap.has(nodeName)) throw new Error(`Node "${nodeName}" defined multiple times`)

            const node = new Node({name: nodeName, raw: nodeTemplate})
            this.nodes.push(node)
            this.nodesMap.set(nodeName, node)

            // Properties
            this.populateProperties(node, nodeTemplate)

            // Relations
            nodeTemplate.requirements?.forEach(map => {
                const [relationName, assignment] = utils.firstEntry(map)
                const target = validator.isString(assignment) ? assignment : assignment.node

                const relation = new Relation({
                    name: relationName,
                    source: node,
                    target,
                    raw: assignment,
                    id: [nodeName, relationName],
                })

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
            node.outgoingMap.forEach(relations => {
                const candidates = relations.filter(it => it.default)
                if (candidates.length > 1) throw new Error(`${relations[0].Display} has multiple defaults`)
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
                node.artifactsMap.forEach(artifacts => {
                    const candidates = artifacts.filter(it => it.default)
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

        // Assign ingoing relations to nodes
        this.relations.forEach(relation => {
            const node = this.nodesMap.get(relation.target)
            validator.ensureDefined(node, `Target "${relation.target}" of ${relation.display} does not exist`)
            node.ingoing.push(relation)
            node.relations.push(relation)
        })
    }

    private populateGroups() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.groups).forEach(map => {
            const [name, template] = utils.firstEntry(map)
            if (this.groupsMap.has(name)) throw new Error(`Group "${name}" defined multiple times`)

            const group = new Group({name, raw: template})
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
            const policy = new Policy({name, raw: template})
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
            if (policies.length > 1) throw new Error(`Policy "${element}" is ambiguous`)
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
