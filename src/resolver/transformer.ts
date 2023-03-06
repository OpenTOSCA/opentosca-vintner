import {NodeTemplate, NodeTemplateMap, RequirementAssignmentMap} from '#spec/node-template'
import {RelationshipTemplate} from '#spec/relationship-template'
import {GroupTemplate, GroupTemplateMap} from '#spec/group-template'
import {PolicyAssignmentMap, PolicyTemplate} from '#spec/policy-template'
import {ArtifactDefinition, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import * as validator from '#validator'
import {PropertyAssignmentMap} from '#spec/property-assignments'
import * as utils from '#utils'
import {InputDefinitionMap, TopologyTemplate} from '#spec/topology-template'
import {TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {Artifact, Graph, Group, Node, Policy, Relation} from './graph'
import {ensureDefined} from '#validator'
import {GroupMember} from '#spec/group-type'

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

        // Set TOSCA definitions version
        this.graph.serviceTemplate.tosca_definitions_version = TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3

        // Delete variability definition
        delete this.topology.variability

        // Delete empty topology template
        if (utils.isEmpty(this.topology)) {
            delete this.graph.serviceTemplate.topology_template
        }
    }

    private transformNodes() {
        // Delete node templates which are not present
        if (validator.isDefined(this.topology.node_templates)) {
            this.topology.node_templates = this.graph.nodes
                .filter(node => node.present)
                .reduce<NodeTemplateMap>((map, node) => {
                    const template = node.raw

                    // Select present properties
                    this.transformProperties(node, template)

                    // Delete requirement assignment which are not present
                    template.requirements = node.outgoing
                        .filter(it => it.present)
                        .map(relation => {
                            const assignment = relation.raw
                            if (!validator.isString(assignment)) {
                                delete assignment.conditions
                                delete assignment.default_alternative
                            }

                            const map: RequirementAssignmentMap = {}
                            map[relation.name] = assignment
                            return map
                        })
                    if (utils.isEmpty(template.requirements)) delete template.requirements

                    // Delete all artifacts which are not present
                    template.artifacts = node.artifacts
                        .filter(it => it.present)
                        .reduce<ArtifactDefinitionMap>((map, artifact) => {
                            if (!validator.isString(artifact.raw)) {
                                delete artifact.raw.conditions
                                delete artifact.raw.default_alternative
                            }

                            this.transformProperties(artifact, artifact.raw)

                            map[artifact.name] = artifact.raw
                            return map
                        }, {})
                    if (utils.isEmpty(template.artifacts)) delete template.artifacts

                    delete template.conditions
                    delete template.default_alternative
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
        if (validator.isDefined(this.topology.relationship_templates)) {
            this.graph.relations.forEach(relation => {
                if (validator.isDefined(relation.relationship)) {
                    if (!relation.present) delete this.topology.relationship_templates![relation.relationship.name]

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
        if (validator.isDefined(this.topology.groups)) {
            this.topology.groups = this.graph.groups
                .filter(group => group.present)
                .reduce<GroupTemplateMap>((map, group) => {
                    const template = group.raw

                    template.members = template.members.reduce<GroupMember[]>((acc, it) => {
                        let element: Node | Relation | undefined

                        if (validator.isString(it)) element = this.graph.getNode(it)
                        if (validator.isArray(it)) element = this.graph.getRelation(it)
                        ensureDefined(element, `Member "${utils.prettyJSON(it)}" has bad format`)

                        if (element.present) acc.push(it)
                        return acc
                    }, [])

                    this.transformProperties(group, template)

                    delete template.conditions
                    delete template.default_alternative
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
        if (validator.isDefined(this.topology.policies)) {
            this.topology.policies = this.graph.policies
                .filter(policy => policy.present)
                .map(policy => {
                    const template = policy.raw
                    delete template.conditions
                    delete template.default_alternative

                    this.transformProperties(policy, template)

                    template.targets = template.targets?.filter(target => {
                        const node = this.graph.nodesMap.get(target)
                        if (validator.isDefined(node)) return node.present

                        const group = this.graph.groupsMap.get(target)
                        if (validator.isDefined(group)) return group.present

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
        if (validator.isDefined(this.topology.inputs)) {
            this.topology.inputs = this.graph.inputs
                .filter(input => input.present)
                .reduce<InputDefinitionMap>((map, input) => {
                    const template = input.raw
                    delete template.conditions
                    delete template.default_alternative
                    map[input.name] = template
                    return map
                }, {})

            if (utils.isEmpty(this.topology.inputs)) {
                delete this.topology.inputs
            }
        }
    }

    private transformProperties(
        element: Node | Relation | Group | Policy | Artifact,
        template: NodeTemplate | RelationshipTemplate | GroupTemplate | PolicyTemplate | ArtifactDefinition
    ) {
        if (validator.isString(template)) return

        template.properties = element.properties
            .filter(it => it.present)
            .reduce<PropertyAssignmentMap>((map, property) => {
                if (validator.isDefined(property)) {
                    if (validator.isUndefined(property.value)) throw new Error(`${property.Display} has no value`)
                    map[property.name] = property.value
                }
                return map
            }, {})

        if (utils.isEmpty(template.properties)) delete template.properties
    }
}
