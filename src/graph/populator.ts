import * as assert from '#assert'
import * as check from '#check'
import Artifact from '#graph/artifact'
import Graph from '#graph/graph'
import Group from '#graph/group'
import Import from '#graph/import'
import Input from '#graph/input'
import Node from '#graph/node'
import {Options} from '#graph/options'
import Policy from '#graph/policy'
import Property, {PropertyContainer, PropertyContainerTemplate} from '#graph/property'
import Relation, {Relationship} from '#graph/relation'
import Type, {TypeContainer, TypeContainerTemplate} from '#graph/type'
import {ArtifactDefinitionList, ArtifactDefinitionMap, ExtendedArtifactDefinition} from '#spec/artifact-definitions'
import {NodeTemplate} from '#spec/node-template'
import {
    ConditionalPropertyAssignmentValue,
    PropertyAssignmentListEntry,
    PropertyAssignmentValue,
} from '#spec/property-assignments'
import {TypeAssignment} from '#spec/type-assignment'
import {VariabilityPointList, VariabilityPointMap} from '#spec/variability'
import * as utils from '#utils'

export class Populator {
    graph: Graph
    normalize: boolean

    constructor(graph: Graph, normalize = true) {
        this.graph = graph
        this.normalize = normalize
    }

    run() {
        // Options
        this.graph.options = new Options(this.graph.serviceTemplate)

        // Inputs
        this.populateInputs()

        // Nodes
        this.populateNodes()

        // Groups
        this.populateGroups()

        // Policies
        this.populatePolicies()

        // Imports
        this.populateImports()

        // Elements
        this.graph.elements = [
            ...this.graph.types,
            ...this.graph.nodes,
            ...this.graph.relations,
            ...this.graph.properties,
            ...this.graph.policies,
            ...this.graph.groups,
            ...this.graph.inputs,
            ...this.graph.artifacts,
            ...this.graph.imports,
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

    private populateInputs() {
        this.getFromVariabilityPointMap(this.graph.serviceTemplate.topology_template?.inputs).forEach(map => {
            const [name, definition] = utils.firstEntry(map)
            if (this.graph.inputsMap.has(name)) throw new Error(`Input "${name}" defined multiple times`)

            const input = new Input({name, raw: definition})
            input.graph = this.graph

            this.graph.inputs.push(input)
            this.graph.inputsMap.set(name, input)
        })
    }

    private populateImports() {
        if (check.isUndefined(this.graph.serviceTemplate.imports)) return
        assert.isArray(this.graph.serviceTemplate.imports, 'Imports must be an array')

        for (const [index, definition] of this.graph.serviceTemplate.imports.entries()) {
            // Normalize
            // TODO: this is dirty
            let normalized
            if (this.normalize) {
                normalized = check.isString(definition) ? {file: definition} : definition
                this.graph.serviceTemplate.imports[index] = normalized
            }

            const imp = new Import({index, raw: normalized ?? definition})
            imp.graph = this.graph
            this.graph.imports.push(imp)
        }
    }

    private populateNodes() {
        this.getFromVariabilityPointMap(this.graph.serviceTemplate.topology_template?.node_templates).forEach(map => {
            const [nodeName, nodeTemplate] = utils.firstEntry(map)
            if (this.graph.nodesMap.has(nodeName)) throw new Error(`Node "${nodeName}" defined multiple times`)

            if (nodeName === 'SELF') throw new Error(`Node must not be named "SELF"`)
            if (nodeName === 'CONTAINER') throw new Error(`Node must not be named "CONTAINER"`)

            const node = new Node({name: nodeName, raw: nodeTemplate})
            node.graph = this.graph

            this.graph.nodes.push(node)
            this.graph.nodesMap.set(nodeName, node)

            // Type
            this.populateTypes(node, nodeTemplate)

            // Properties
            this.populateProperties(node, nodeTemplate)

            // Relations
            this.populateRelations(node, nodeTemplate)

            // Artifacts
            this.populateArtifacts(node, nodeTemplate)
        })

        // Ensure that each relationship is used
        for (const relationshipName of Object.keys(
            this.graph.serviceTemplate.topology_template?.relationship_templates || {}
        )) {
            if (!this.graph.relationshipsMap.has(relationshipName))
                throw new Error(`Relation "${relationshipName}" is never used`)
        }

        // Link relations
        this.linkRelations()
    }

    private populateRelations(node: Node, template: NodeTemplate) {
        if (check.isUndefined(template.requirements)) return

        for (const [index, map] of template.requirements.entries()) {
            const [relationName, assignment] = utils.firstEntry(map)

            // Normalize
            // TODO: this is dirty
            let normalized
            if (this.normalize) {
                normalized = check.isString(assignment) ? {node: assignment} : assignment
                map[relationName] = normalized
            }

            const relation = new Relation({
                name: relationName,
                container: node,
                raw: normalized ?? assignment,
                index,
            })
            relation.graph = this.graph

            if (!node.outgoingMap.has(relation.name)) node.outgoingMap.set(relation.name, [])
            node.outgoingMap.get(relation.name)!.push(relation)
            node.outgoing.push(relation)
            node.relations.push(relation)
            this.graph.relations.push(relation)

            if (!check.isString(assignment)) {
                if (check.isString(assignment.relationship)) {
                    const relationshipTemplate = (this.graph.serviceTemplate.topology_template
                        ?.relationship_templates || {})[assignment.relationship]
                    assert.isDefined(
                        relationshipTemplate,
                        `Relationship "${assignment.relationship}" of relation "${relationName}" of node "${node.name}" does not exist!`
                    )

                    if (this.graph.relationshipsMap.has(assignment.relationship))
                        throw new Error(`Relation "${assignment.relationship}" is used multiple times`)

                    const relationship = new Relationship({
                        name: assignment.relationship,
                        relation,
                        raw: relationshipTemplate,
                    })
                    this.graph.relationshipsMap.set(assignment.relationship, relationship)
                    relation.relationship = relationship

                    // Type
                    this.populateTypes(relation, relationshipTemplate)

                    // Properties
                    this.populateProperties(relation, relationshipTemplate)
                }

                if (check.isObject(assignment.relationship)) {
                    throw new Error(
                        `Relation "${relationName}" of node "${node.name}" contains a relationship template which is currently not supported`
                    )
                }
            }
        }

        // Ensure that there are no multiple outgoing defaults
        node.outgoingMap.forEach(relations => {
            const candidates = relations.filter(it => it.defaultAlternative)
            if (candidates.length > 1) throw new Error(`${relations[0].Display} has multiple defaults`)
        })
    }

    private linkRelations() {
        // Assign ingoing relations to nodes and assign target to relation
        this.graph.relations.forEach(relation => {
            const targetName = check.isString(relation.raw) ? relation.raw : relation.raw.node
            const target = this.graph.nodesMap.get(targetName)
            assert.isDefined(target, `Target "${targetName}" of ${relation.display} does not exist`)

            relation.target = target
            target.ingoing.push(relation)
            target.relations.push(relation)
        })
    }

    private populateTypes(element: TypeContainer, template: TypeContainerTemplate) {
        if (check.isString(template)) return
        assert.isDefined(template.type, `${element.Display} has no type`)

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
            type.graph = this.graph
            this.graph.types.push(type)

            element.types.push(type)
            if (!element.typesMap.has(name)) element.typesMap.set(name, [])
            element.typesMap.get(name)!.push(type)
        }

        // Ensure that there is only one default type
        if (element.types.filter(it => it.defaultAlternative).length > 1)
            throw new Error(`${element.Display} has multiple default types`)

        // Normalize
        // TODO: this is dirty
        if (this.normalize) {
            if (!check.isArray(template.type)) {
                template.type = types
            }
        }
    }

    private populateArtifacts(node: Node, nodeTemplate: NodeTemplate) {
        if (check.isDefined(nodeTemplate.artifacts)) {
            if (check.isArray(nodeTemplate.artifacts)) {
                for (const [artifactIndex, artifactMap] of nodeTemplate.artifacts.entries()) {
                    this.populateArtifact(node, artifactMap, artifactIndex)
                }
            } else {
                const artifacts = Object.entries(nodeTemplate.artifacts)
                for (const [artifactName, artifactDefinition] of artifacts) {
                    const map: ArtifactDefinitionMap = {}
                    map[artifactName] = artifactDefinition
                    this.populateArtifact(node, map)
                }

                // Normalize
                // TODO: this is dirty
                if (this.normalize) {
                    node.raw.artifacts = artifacts.reduce<ArtifactDefinitionList>((acc, [name, definition]) => {
                        const map: ArtifactDefinitionMap = {}
                        map[name] = definition
                        acc.push(map)
                        return acc
                    }, [])
                }
            }
            // Ensure that there is only one default artifact per artifact name
            node.artifactsMap.forEach(artifacts => {
                const candidates = artifacts.filter(it => it.defaultAlternative)
                if (candidates.length > 1) throw new Error(`${artifacts[0].Display} has multiple defaults`)
            })
        }
    }

    private populateArtifact(node: Node, map: ArtifactDefinitionMap, index?: number) {
        const [artifactName, artifactDefinition] = utils.firstEntry(map)

        if (check.isObject(artifactDefinition) && check.isUndefined(artifactDefinition.type))
            artifactDefinition.type = 'tosca.artifacts.File'

        // Normalize
        // TODO: this is dirty
        let normalized: ExtendedArtifactDefinition | undefined
        if (this.normalize) {
            normalized = check.isString(artifactDefinition)
                ? {file: artifactDefinition, type: 'tosca.artifacts.File'}
                : artifactDefinition
            map[artifactName] = normalized
        }

        const artifact = new Artifact({
            name: artifactName,
            raw: normalized ?? artifactDefinition,
            container: node,
            index,
        })
        artifact.graph = this.graph

        this.populateProperties(artifact, artifactDefinition)

        if (!node.artifactsMap.has(artifact.name)) node.artifactsMap.set(artifact.name, [])
        node.artifactsMap.get(artifact.name)!.push(artifact)
        node.artifacts.push(artifact)
        this.graph.artifacts.push(artifact)
    }

    private populateProperties(element: PropertyContainer, template: PropertyContainerTemplate) {
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
                        // This just works since we do not allow "value" as a keyword in a property assignment value
                        const value = propertyAssignment as PropertyAssignmentValue
                        // Normalize
                        // TODO: this is dirty
                        let normalized
                        if (this.normalize) {
                            normalized = {value}
                            template.properties[propertyIndex][propertyName] = normalized
                        }

                        property = new Property({
                            name: propertyName,
                            container: element,
                            value,
                            default: false,
                            index: propertyIndex,
                            raw: normalized ?? propertyAssignment,
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

                    property.graph = this.graph
                    if (!element.propertiesMap.has(propertyName)) element.propertiesMap.set(propertyName, [])
                    element.propertiesMap.get(propertyName)!.push(property)
                    element.properties.push(property)
                    this.graph.properties.push(property)
                }
            } else {
                // Properties is a Property Assignment Map
                const properties = Object.entries(template.properties || {})

                // Normalize
                // TODO: this is dirty
                if (this.normalize) {
                    template.properties = []
                }

                for (const [propertyName, propertyAssignment] of properties) {
                    // Normalize
                    // TODO: this is dirty
                    let normalized: ConditionalPropertyAssignmentValue | undefined
                    if (this.normalize) {
                        normalized = {value: propertyAssignment}

                        const map: PropertyAssignmentListEntry = {}
                        map[propertyName] = normalized
                        assert.isArray(template.properties)
                        template.properties.push(map)
                    }

                    const property = new Property({
                        name: propertyName,
                        container: element,
                        value: propertyAssignment,
                        default: false,
                        raw: normalized ?? propertyAssignment,
                    })
                    property.graph = this.graph

                    if (!element.propertiesMap.has(propertyName)) element.propertiesMap.set(propertyName, [])
                    element.propertiesMap.get(propertyName)!.push(property)
                    element.properties.push(property)
                    this.graph.properties.push(property)
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

    private populateGroups() {
        this.getFromVariabilityPointMap(this.graph.serviceTemplate.topology_template?.groups).forEach(map => {
            const [name, template] = utils.firstEntry(map)
            if (this.graph.groupsMap.has(name)) throw new Error(`Group "${name}" defined multiple times`)

            const group = new Group({name, raw: template})
            group.graph = this.graph

            this.graph.groups.push(group)
            this.graph.groupsMap.set(name, group)

            template.members.forEach(member => {
                let element: Node | Relation | undefined

                if (check.isString(member)) element = this.graph.getNode(member)
                if (check.isArray(member)) element = this.graph.getRelation(member)
                assert.isDefined(element, `Member "${utils.pretty(member)}" has bad format`)

                element.groups.push(group)
                group.members.push(element)
            })

            // Type
            this.populateTypes(group, template)

            // Properties
            this.populateProperties(group, template)
        })
    }

    private populatePolicies() {
        const policies = this.graph.serviceTemplate.topology_template?.policies
        if (check.isUndefined(policies)) return
        assert.isArray(policies, 'Policies must be an array')

        for (const [index, map] of policies.entries() || []) {
            const [name, template] = utils.firstEntry(map)
            const policy = new Policy({name, raw: template, index})
            policy.graph = this.graph

            if (!this.graph.policiesMap.has(name)) this.graph.policiesMap.set(name, [])
            this.graph.policiesMap.get(name)!.push(policy)
            this.graph.policies.push(policy)

            template.targets?.forEach(target => {
                const node = this.graph.nodesMap.get(target)
                if (check.isDefined(node)) {
                    return policy.targets.push(node)
                }

                const group = this.graph.groupsMap.get(target)
                if (check.isDefined(group)) {
                    return policy.targets.push(group)
                }

                throw new Error(`Policy target "${target}" of ${policy.display} does not exist`)
            })

            // Type
            this.populateTypes(policy, template)

            // Properties
            this.populateProperties(policy, template)
        }
    }
}
