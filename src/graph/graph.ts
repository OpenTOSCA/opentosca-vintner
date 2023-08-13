import * as assert from '#assert'
import * as check from '#check'
import Import from '#graph/import'
import {Options} from '#graph/options'
import {ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {PropertyAssignmentValue} from '#spec/property-assignments'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {TypeAssignment} from '#spec/type-assignment'
import {
    ArtifactPropertyPresenceArguments,
    GroupPropertyPresenceArguments,
    GroupTypePresenceArguments,
    NodePropertyPresenceArguments,
    NodeTypePresenceArguments,
    PolicyPropertyPresenceArguments,
    PolicyTypePresenceArguments,
    RelationPropertyPresenceArguments,
    RelationTypePresenceArguments,
    VariabilityPointList,
    VariabilityPointMap,
} from '#spec/variability'
import * as utils from '#utils'
import Artifact from './artifact'
import Element from './element'
import Group from './group'
import Input from './input'
import Node from './node'
import Policy from './policy'
import Property, {PropertyContainer, PropertyContainerTemplate} from './property'
import Relation, {Relationship} from './relation'
import Type, {TypeContainer, TypeContainerTemplate} from './type'

/**
 * Not documented since preparation for future work
 *
 * - inputs might be a list
 * - node templates might be a list
 * - groups might be a list (consider variability groups ...)
 */

type Context = {element?: Element; cached?: Element}

export default class Graph {
    serviceTemplate: ServiceTemplate
    options: Options

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

    imports: Import[] = []

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
        this.options = new Options(this.serviceTemplate)

        // Inputs
        this.buildInputs()

        // Nodes and relations
        this.buildNodesAndRelations()

        // Groups
        this.buildGroups()

        // Policies
        this.buildPolicies()

        // Imports
        this.buildImports()

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
            ...this.imports,
        ]
    }

    private getFromVariabilityPointMap<T>(data?: VariabilityPointMap<T>): {[name: string]: T}[] {
        if (check.isUndefined(data)) return []
        if (check.isArray(data)) return data
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

    private buildImports() {
        for (const [index, definition] of (this.serviceTemplate.imports || []).entries()) {
            const imp = new Import({index, raw: definition})
            imp.graph = this
            this.imports.push(imp)
        }
    }

    private buildNodesAndRelations() {
        this.getFromVariabilityPointMap(this.serviceTemplate.topology_template?.node_templates).forEach(map => {
            const [nodeName, nodeTemplate] = utils.firstEntry(map)
            if (this.nodesMap.has(nodeName)) throw new Error(`Node "${nodeName}" defined multiple times`)

            if (nodeName === 'SELF') throw new Error(`Node must not be named "SELF"`)
            if (nodeName === 'CONTAINER') throw new Error(`Node must not be named "CONTAINER"`)

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

                if (!check.isString(assignment)) {
                    if (check.isString(assignment.relationship)) {
                        const relationshipTemplate = (this.serviceTemplate.topology_template?.relationship_templates ||
                            {})[assignment.relationship]
                        assert.isDefined(
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

                    if (check.isObject(assignment.relationship)) {
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
            if (check.isDefined(nodeTemplate.artifacts)) {
                if (check.isArray(nodeTemplate.artifacts)) {
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
            const targetName = check.isString(relation.raw) ? relation.raw : relation.raw.node
            const target = this.nodesMap.get(targetName)
            assert.isDefined(target, `Target "${targetName}" of ${relation.display} does not exist`)

            relation.target = target
            target.ingoing.push(relation)
            target.relations.push(relation)
        })
    }

    private buildTypes(element: TypeContainer, template: TypeContainerTemplate) {
        if (check.isString(template)) return
        if (check.isUndefined(template.type)) throw new Error(`${element.Display} has no type`)

        // Collect types
        const types: VariabilityPointList<TypeAssignment> = check.isString(template.type)
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
        if (check.isString(template)) return

        if (check.isObject(template.properties)) {
            // Properties is a Property Assignment List
            if (check.isArray(template.properties)) {
                for (const [propertyIndex, propertyAssignmentListEntry] of template.properties.entries()) {
                    const [propertyName, propertyAssignment] = utils.firstEntry(propertyAssignmentListEntry)

                    let property: Property

                    // Property is not conditional
                    if (
                        check.isString(propertyAssignment) ||
                        check.isNumber(propertyAssignment) ||
                        check.isBoolean(propertyAssignment) ||
                        check.isArray(propertyAssignment) ||
                        (check.isUndefined(propertyAssignment.value) &&
                            check.isUndefined(propertyAssignment.expression))
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
                            conditions: check.isDefined(propertyAssignment.default_alternative)
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
            if (check.isUndefined(property.value) && check.isUndefined(property.expression)) {
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

                if (check.isString(member)) element = this.getNode(member)
                if (check.isArray(member)) element = this.getRelation(member)
                assert.isDefined(element, `Member "${utils.pretty(member)}" has bad format`)

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
            check.isDefined(this.serviceTemplate.topology_template?.policies) &&
            !check.isArray(this.serviceTemplate.topology_template?.policies)
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
                if (check.isDefined(node)) {
                    return policy.targets.push(node)
                }

                const group = this.groupsMap.get(target)
                if (check.isDefined(group)) {
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

    getNode(name: string | 'SELF' | 'CONTAINER', context: Context = {}) {
        assert.isString(name)

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isNode(element)
            return element
        }

        if (name === 'SELF') {
            assert.isNode(context.element)
            return context.element
        }

        if (name === 'CONTAINER') {
            const container = this.getContainer(context.element)
            assert.isNode(container)
            return container
        }

        const node = this.nodesMap.get(name)
        assert.isDefined(node, `Node "${name}" not found`)
        return node
    }

    getNodeType(data: NodeTypePresenceArguments, context: Context = {}) {
        assert.isString(data[0])
        assert.isStringOrNumber(data[1])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isType(element)
            return element
        }

        const node = this.getNode(data[0], {element: context.element})
        return this.getType(node, data)
    }

    getRelationType(data: RelationTypePresenceArguments, context: Context = {}) {
        assert.isString(data[0])
        assert.isStringOrNumber(data[1])
        assert.isStringOrNumber(data[2])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isType(element)
            return element
        }

        const relation = this.getRelation([data[0], data[1]], {element: context.element})
        return this.getType(relation, data)
    }

    getGroupType(data: GroupTypePresenceArguments, context: Context = {}) {
        assert.isString(data[0])
        assert.isStringOrNumber(data[1])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isType(element)
            return element
        }

        const group = this.getGroup(data[0], {element: context.element})
        return this.getType(group, data)
    }

    getPolicyType(data: PolicyTypePresenceArguments, context: Context = {}) {
        assert.isString(data[0])
        assert.isStringOrNumber(data[1])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isType(element)
            return element
        }

        const policy = this.getPolicy(data[0], {element: context.element})
        return this.getType(policy, data)
    }

    private getType(container: Node | Relation | Group | Policy, data: (string | number)[]) {
        let type
        const toscaId = utils.last(data)

        if (check.isString(toscaId)) {
            const types = container.typesMap.get(toscaId) || []
            if (types.length > 1) throw new Error(`Type "${utils.pretty(data)}" is ambiguous`)
            type = types[0]
        }

        if (check.isNumber(toscaId)) type = container.types[toscaId]

        assert.isDefined(type, `Type "${utils.pretty(data)}" not found`)
        return type
    }

    getContainer(element?: Element) {
        assert.isDefined(element, `Element is not defined`)
        const container = element.container
        assert.isDefined(container, `${element.Display} has no container`)
        return container
    }

    getRelation(member: [string, string | number] | 'SELF' | 'CONTAINER', context: Context = {}) {
        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isRelation(element)
            return element
        }

        if (member === 'SELF') {
            assert.isRelation(context.element)
            return context.element
        }

        if (member === 'CONTAINER') {
            const container = this.getContainer(context.element)
            assert.isRelation(container)
            return container
        }

        assert.isArray(member)
        assert.isString(member[0])
        assert.isStringOrNumber(member[1])

        let relation
        const node = this.getNode(member[0])

        // Element is [node name, relation name]
        if (check.isString(member[1])) {
            const relations = node.outgoingMap.get(member[1]) || []
            if (relations.length > 1) throw new Error(`Relation "${utils.pretty(member)}" is ambiguous`)
            relation = relations[0]
        }

        // Element is [node name, relation index]
        if (check.isNumber(member[1])) relation = node.outgoing[member[1]]

        assert.isDefined(relation, `Relation "${utils.pretty(member)}" not found`)
        return relation
    }

    getGroup(name: string | 'SELF' | 'CONTAINER', context: Context = {}) {
        assert.isString(name)

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isGroup(element)
            return element
        }

        if (name === 'SELF') {
            assert.isGroup(context.element)
            return context.element
        }

        if (name === 'CONTAINER') {
            const container = this.getContainer(context.element)
            assert.isGroup(container)
            return container
        }

        const group = this.groupsMap.get(name)
        assert.isDefined(group, `Group "${name}" not found`)
        return group
    }

    getPolicy(element: string | number | 'SELF' | 'CONTAINER', context: Context = {}) {
        assert.isStringOrNumber(element)

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isPolicy(element)
            return element
        }

        if (element === 'SELF') {
            assert.isPolicy(context.element)
            return context.element
        }

        if (element === 'CONTAINER') {
            const container = this.getContainer(context.element)
            assert.isPolicy(container)
            return container
        }

        let policy

        if (check.isString(element)) {
            const policies = this.policiesMap.get(element) || []
            if (policies.length > 1) throw new Error(`Policy "${element}" is ambiguous`)
            policy = policies[0]
        }

        if (check.isNumber(element)) {
            policy = this.policies[element]
        }

        if (check.isUndefined(policy)) throw new Error(`Policy "${element}" not found`)
        return policy
    }

    getArtifact(member: [string, string | number] | 'SELF' | 'CONTAINER', context: Context = {}) {
        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isArtifact(element)
            return element
        }

        if (member === 'SELF') {
            assert.isArtifact(context.element)
            return context.element
        }

        if (member === 'CONTAINER') {
            const container = this.getContainer(context.element)
            assert.isArtifact(container)
            return container
        }

        assert.isString(member[0])
        assert.isStringOrNumber(member[1])

        let artifact
        const node = this.getNode(member[0])

        if (check.isString(member[1])) {
            const artifacts = node.artifactsMap.get(member[1]) || []
            if (artifacts.length > 1) throw new Error(`Artifact "${utils.pretty(member)}" is ambiguous`)
            artifact = artifacts[0]
        }

        if (check.isNumber(member[1])) artifact = node.artifacts[member[1]]

        assert.isDefined(artifact, `Artifact "${utils.pretty(member)}" not found`)
        return artifact
    }

    getImport(index: number | 'SELF' | 'CONTAINER', context: Context = {}) {
        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isImport(element)
            return element
        }

        if (index === 'SELF') {
            assert.isImport(context.element)
            return context.element
        }

        if (index === 'CONTAINER') {
            const container = this.getContainer(context.element)
            assert.isImport(container)
            return container
        }

        assert.isNumber(index)

        const imp = this.imports[index]
        assert.isDefined(imp, `Import "${index}" not found`)
        return imp
    }

    getNodeProperty(data: NodePropertyPresenceArguments, context: Context = {}) {
        assert.isString(data[0])
        assert.isStringOrNumber(data[1])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isProperty(element)
            return element
        }

        const node = this.getNode(data[0], {element: context.element})
        return this.getProperty(node, data)
    }

    getRelationProperty(data: RelationPropertyPresenceArguments, context: Context = {}) {
        assert.isString(data[0])
        assert.isStringOrNumber(data[1])
        assert.isStringOrNumber(data[2])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isProperty(element)
            return element
        }

        const relation = this.getRelation([data[0], data[1]], {element: context.element})
        return this.getProperty(relation, data)
    }

    getGroupProperty(data: GroupPropertyPresenceArguments, context: Context = {}) {
        assert.isString(data[0])
        assert.isStringOrNumber(data[1])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isProperty(element)
            return element
        }

        const group = this.getGroup(data[0], {element: context.element})
        return this.getProperty(group, data)
    }

    getPolicyProperty(data: PolicyPropertyPresenceArguments, context: Context = {}) {
        assert.isStringOrNumber(data[0])
        assert.isStringOrNumber(data[1])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isProperty(element)
            return element
        }

        const policy = this.getPolicy(data[0], {element: context.element})
        return this.getProperty(policy, data)
    }

    getArtifactProperty(data: ArtifactPropertyPresenceArguments, context: Context = {}) {
        assert.isString(data[0])
        assert.isStringOrNumber(data[1])
        assert.isStringOrNumber(data[2])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isProperty(element)
            return element
        }

        const artifact = this.getArtifact([data[0], data[1]], {element: context.element})
        return this.getProperty(artifact, data)
    }

    private getProperty(container: Node | Relation | Group | Policy | Artifact, data: (string | number)[]) {
        let property
        const toscaId = utils.last(data)

        if (check.isString(toscaId)) {
            const properties = container.propertiesMap.get(toscaId) || []
            if (properties.length > 1) throw new Error(`Property "${utils.pretty(data)}" is ambiguous`)
            property = properties[0]
        }

        if (check.isNumber(toscaId)) property = container.properties[toscaId]

        assert.isDefined(property, `Property "${utils.pretty(data)}" not found`)
        return property
    }

    getInput(name: string, context: Context = {}) {
        assert.isString(name)

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isInput(element)
            return element
        }

        if (name === 'SELF') {
            assert.isInput(context.element)
            return context.element
        }

        if (name === 'CONTAINER') {
            const container = this.getContainer(context.element)
            assert.isInput(container)
            return container
        }

        const input = this.inputsMap.get(name)
        assert.isDefined(input, `Input "${name}" not found`)
        return input
    }
}
