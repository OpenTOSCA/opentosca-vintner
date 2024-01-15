import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import Node from '#graph/node'
import Property from '#graph/property'
import Relation from '#graph/relation'
import Type from '#graph/type'
import {ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {GroupTemplateMap} from '#spec/group-template'
import {GroupMember} from '#spec/group-type'
import {NodeTemplateMap, RequirementAssignmentMap} from '#spec/node-template'
import {PolicyAssignmentMap} from '#spec/policy-template'
import {PropertyAssignmentList, PropertyAssignmentMap} from '#spec/property-assignments'
import {TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {InputDefinitionMap, TopologyTemplate} from '#spec/topology-template'
import {ElementType} from '#spec/type-assignment'
import * as utils from '#utils'

export default class Transformer {
    private readonly graph: Graph
    private readonly topology: TopologyTemplate

    constructor(graph: Graph) {
        this.graph = graph
        this.topology = graph.serviceTemplate.topology_template || {}
    }

    run() {
        // Transform nodes, artifacts, and requirement assignment
        this.transformNodes()

        // Transform relations
        this.transformRelations()

        // Transform groups
        this.transformGroups()

        // Transform policies
        this.transformPolicies()

        // Transform inputs
        this.transformInputs()

        // Transform imports
        this.transformImports()

        // Set TOSCA definitions version
        this.graph.serviceTemplate.tosca_definitions_version = TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3

        // Delete variability definition
        delete this.topology.variability

        // Delete empty topology template
        if (utils.isEmpty(this.topology)) {
            delete this.graph.serviceTemplate.topology_template
        }
    }

    private clean(raw: any) {
        delete raw.conditions
        delete raw.weight
        delete raw.implies
    }

    private transformNodes() {
        // Delete node templates which are not present
        if (check.isDefined(this.topology.node_templates)) {
            this.topology.node_templates = this.graph.nodes
                .filter(node => node.present)
                .reduce<NodeTemplateMap>((map, node) => {
                    const template = node.raw

                    // Select present type
                    this.transformType(node, template)

                    // Select present properties
                    this.transformProperties(node, template)

                    // Delete requirement assignment which are not present
                    template.requirements = node.outgoing
                        .filter(it => it.present)
                        .map(relation => {
                            const assignment = relation.raw
                            if (!check.isString(assignment)) this.clean(assignment)

                            const map: RequirementAssignmentMap = {}

                            // Minimize
                            // TODO: is this dirty?
                            map[relation.name] =
                                !check.isString(assignment) &&
                                Object.keys(assignment).length === 1 &&
                                Object.keys(assignment)[0] === 'node'
                                    ? assignment.node
                                    : assignment
                            return map
                        })
                    if (utils.isEmpty(template.requirements)) delete template.requirements

                    // Delete all artifacts which are not present
                    template.artifacts = node.artifacts
                        .filter(it => it.present)
                        .reduce<ArtifactDefinitionMap>((map, artifact) => {
                            if (!check.isString(artifact.raw)) this.clean(artifact.raw)

                            this.transformProperties(artifact, artifact.raw)

                            map[artifact.name] = artifact.raw
                            return map
                        }, {})
                    if (utils.isEmpty(template.artifacts)) delete template.artifacts

                    this.clean(template)
                    map[node.name] = template
                    return map
                }, {})

            if (utils.isEmpty(this.topology.node_templates)) {
                delete this.topology.node_templates
            }
        }
    }

    private transformRelations() {
        // Delete all relationship templates which have no present relations
        if (check.isDefined(this.topology.relationship_templates)) {
            this.graph.relations.forEach(relation => {
                if (relation.hasRelationship()) {
                    if (!relation.present)
                        return delete this.topology.relationship_templates![relation.relationship.name]

                    this.transformType(relation, relation.relationship.raw)
                    this.transformProperties(relation, relation.relationship.raw)
                }
            })

            if (utils.isEmpty(this.topology.relationship_templates)) {
                delete this.topology.relationship_templates
            }
        }
    }

    private transformGroups() {
        // Delete all groups which are not present and remove all members which are not present
        if (check.isDefined(this.topology.groups)) {
            this.topology.groups = this.graph.groups
                .filter(group => group.present)
                .reduce<GroupTemplateMap>((map, group) => {
                    const template = group.raw

                    template.members = template.members.reduce<GroupMember[]>((acc, it) => {
                        let element: Node | Relation | undefined

                        if (check.isString(it)) element = this.graph.getNode(it)
                        if (check.isArray(it)) element = this.graph.getRelation(it)
                        assert.isDefined(element, `Member "${utils.pretty(it)}" has bad format`)

                        if (element.present) acc.push(it)
                        return acc
                    }, [])

                    this.transformType(group, template)

                    this.transformProperties(group, template)

                    this.clean(template)
                    map[group.name] = template
                    return map
                }, {})

            if (utils.isEmpty(this.topology.groups)) {
                delete this.topology.groups
            }
        }
    }

    private transformPolicies() {
        // Delete all policy templates which are not present and remove all targets which are not present
        if (check.isDefined(this.topology.policies)) {
            this.topology.policies = this.graph.policies
                .filter(policy => policy.present)
                .map(policy => {
                    const template = policy.raw
                    this.clean(template)
                    this.transformType(policy, template)
                    this.transformProperties(policy, template)

                    template.targets = template.targets?.filter(target => {
                        const node = this.graph.nodesMap.get(target)
                        if (check.isDefined(node)) return node.present

                        const group = this.graph.groupsMap.get(target)
                        if (check.isDefined(group)) return group.present

                        throw new Error(
                            `Policy target "${target}" of "${policy.display}" is neither a node template nor a group template`
                        )
                    })

                    const map: PolicyAssignmentMap = {}
                    map[policy.name] = template
                    return map
                })

            if (utils.isEmpty(this.topology.policies)) {
                delete this.topology.policies
            }
        }
    }

    private transformInputs() {
        // Delete all topology template inputs which are not present
        if (check.isDefined(this.topology.inputs)) {
            this.topology.inputs = this.graph.inputs
                .filter(input => input.present)
                .reduce<InputDefinitionMap>((map, input) => {
                    const template = input.raw
                    this.clean(template)
                    map[input.name] = template
                    return map
                }, {})

            if (utils.isEmpty(this.topology.inputs)) {
                delete this.topology.inputs
            }
        }
    }

    private transformType(element: {types: Type[]; Display: string}, template: {type: ElementType}) {
        const type = element.types.find(it => it.present)
        if (check.isUndefined(type)) throw new Error(`${element.Display} has no present type`)
        template.type = type.name
    }

    private transformProperties(
        element: {properties: Property[]},
        template: {properties?: PropertyAssignmentMap | PropertyAssignmentList} | string
    ) {
        if (check.isString(template)) return

        template.properties = element.properties
            .filter(it => it.present)
            .reduce<PropertyAssignmentMap>((map, property) => {
                if (check.isDefined(property)) {
                    if (check.isUndefined(property.value)) throw new Error(`${property.Display} has no value`)
                    map[property.name] = property.value
                }
                return map
            }, {})

        if (utils.isEmpty(template.properties)) delete template.properties
    }

    private transformImports() {
        // Delete all imports which are not present
        if (check.isDefined(this.graph.serviceTemplate.imports)) {
            this.graph.serviceTemplate.imports = this.graph.imports
                .filter(it => it.present)
                .map(it => {
                    const definition = it.raw
                    this.clean(definition)

                    // Minimize
                    // TODO: is this dirty?
                    if (
                        !check.isString(definition) &&
                        Object.keys(definition).length === 1 &&
                        Object.keys(definition)[0] === 'file'
                    )
                        return definition.file

                    return definition
                })

            if (utils.isEmpty(this.graph.serviceTemplate.imports)) {
                delete this.graph.serviceTemplate.imports
            }
        }
    }
}
