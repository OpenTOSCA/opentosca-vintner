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
    conditions: VariabilityExpression[] = []

    protected constructor(type: string, data: {name: string; container?: ConditionalElement; index?: number}) {
        this.type = type
        this.name = data.name
        this.container = data.container
        this.index = data.index

        /**
         * Construct display name
         */
        let _display = this.type + ' "' + data.name
        if (validator.isDefined(data.index)) {
            _display += '@' + data.index.toString()
        }
        _display += '"'
        if (validator.isDefined(this.container)) {
            _display += ' of ' + this.container.display
        }
        this.display = _display

        /**
         * Construct id
         */
        let _id = this.type + '.' + this.name
        if (validator.isDefined(this.index)) {
            _id += '@' + this.index.toString()
        }
        if (validator.isDefined(this.container)) {
            _id += '.' + this.container.id
        }
        this.id = _id
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
}

export class Input extends ConditionalElement {
    raw: InputDefinition

    constructor(data: {name: string; raw: InputDefinition}) {
        super('input', data)
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
    }
}

export class Node extends ConditionalElement {
    raw: NodeTemplate
    relations: Relation[] = []
    ingoing: Relation[] = []
    outgoing: Relation[] = []
    outgoingMap: Map<String, Relation[]> = new Map()
    groups: Group[] = []
    artifacts: Artifact[] = []
    artifactsMap: Map<String, Artifact[]> = new Map()
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()

    constructor(data: {name: string; raw: NodeTemplate}) {
        super('node', data)
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
    }
}

export class Property extends ConditionalElement {
    raw: ConditionalPropertyAssignmentValue | PropertyAssignmentValue
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
        conditions?: VariabilityExpression[]
    }) {
        super('property', data)
        this.raw = data.raw
        this.value = data.value
        this.expression = data.expression
        this.container = data.container
        this.default = data.default
        this.conditions = data.conditions || []
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

    groups: Group[] = []
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()
    relationship?: Relationship
    default: boolean

    constructor(data: {name: string; raw: RequirementAssignment; container: Node; index: number}) {
        super('relation', data)
        this.source = data.container
        this.raw = data.raw
        this.conditions = validator.isString(data.raw)
            ? []
            : validator.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this.default = validator.isString(data.raw) ? false : data.raw.default_alternative || false
    }

    get toscaId(): [string, string | number] {
        if (validator.isDefined(this.index)) return [this.source.name, this.index]
        return [this.source.name, this.name]
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

export class Policy extends ConditionalElement {
    raw: PolicyTemplate
    targets: (Node | Group)[] = []
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()

    constructor(data: {name: string; raw: PolicyTemplate}) {
        super('policy', data)
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
    }
}

export class Group extends ConditionalElement {
    raw: GroupTemplate
    members: (Node | Relation)[] = []
    properties: Property[] = []
    propertiesMap: Map<String, Property[]> = new Map()
    variability: boolean

    constructor(data: {name: string; raw: GroupTemplate}) {
        super('group', data)
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
        this.variability = [
            TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_ROOT,
            TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_CONDITIONAL_MEMBERS,
        ].includes(this.raw.type)
    }
}

export class Artifact extends ConditionalElement {
    readonly raw: ArtifactDefinition
    readonly container: Node
    readonly properties: Property[] = []
    readonly propertiesMap: Map<String, Property[]> = new Map()
    readonly default: boolean

    constructor(data: {name: string; raw: ArtifactDefinition; container: Node; index?: number}) {
        super('artifact', data)
        this.raw = data.raw
        this.container = data.container
        this.conditions = validator.isString(data.raw)
            ? []
            : validator.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this.default = (validator.isString(data.raw) ? false : data.raw.default_alternative) || false
    }
}

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
            for (const [index, map] of nodeTemplate.requirements?.entries() || []) {
                const [relationName, assignment] = utils.firstEntry(map)

                const relation = new Relation({
                    name: relationName,
                    container: node,
                    raw: assignment,
                    index,
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
            }

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

    getRelation(member: [string, string | number]) {
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
