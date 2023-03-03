import {NodeTemplate, NodeTemplateMap, RequirementAssignmentMap} from '#spec/node-template'
import {RelationshipTemplate} from '#spec/relationship-template'
import {GroupTemplate, GroupTemplateMap} from '#spec/group-template'
import {PolicyAssignmentMap, PolicyTemplate} from '#spec/policy-template'
import {ArtifactDefinition, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import * as validator from '#validator'
import {PropertyAssignmentMap} from '#spec/property-assignments'
import * as utils from '#utils'
import {InputDefinitionMap} from '#spec/topology-template'
import {TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {Artifact, Graph, Group, Node, Policy, Relation} from '#/resolver/graph'
import {Solver} from '#/resolver/solver'

export function transform(graph: Graph, resolver: Solver) {
    // Delete node templates which are not present
    if (validator.isDefined(graph.serviceTemplate?.topology_template?.node_templates)) {
        graph.serviceTemplate.topology_template!.node_templates = graph.nodes
            .filter(node => node.present)
            .reduce<NodeTemplateMap>((map, node) => {
                const template = node._raw

                // Select present properties
                transformProperties(node, template, resolver)

                // Delete requirement assignment which are not present
                template.requirements = node.outgoing
                    .filter(it => it.present)
                    .map(relation => {
                        const assignment = relation._raw
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
                        if (!validator.isString(artifact._raw)) {
                            delete artifact._raw.conditions
                            delete artifact._raw.default_alternative
                        }

                        transformProperties(artifact, artifact._raw, resolver)

                        map[artifact.name] = artifact._raw
                        return map
                    }, {})
                if (utils.isEmpty(template.artifacts)) delete template.artifacts

                delete template.conditions
                delete template.default_alternative
                map[node.name] = template
                return map
            }, {})

        if (utils.isEmpty(graph.serviceTemplate.topology_template!.node_templates)) {
            delete graph.serviceTemplate.topology_template!.node_templates
        }
    }

    // Delete all relationship templates which have no present relations
    if (validator.isDefined(graph.serviceTemplate?.topology_template?.relationship_templates)) {
        graph.relations.forEach(relation => {
            if (validator.isDefined(relation.relationship)) {
                if (!relation.present)
                    delete graph.serviceTemplate.topology_template!.relationship_templates![relation.relationship.name]

                transformProperties(relation, relation.relationship._raw, resolver)
            }
        })

        if (utils.isEmpty(graph.serviceTemplate.topology_template!.relationship_templates)) {
            delete graph.serviceTemplate.topology_template!.relationship_templates
        }
    }

    // Delete all groups which are not present and remove all members which are not present
    if (validator.isDefined(graph.serviceTemplate?.topology_template?.groups)) {
        graph.serviceTemplate.topology_template!.groups = graph.groups
            .filter(group => group.present)
            .reduce<GroupTemplateMap>((map, group) => {
                const template = group._raw

                template.members = template.members.filter(member => {
                    const element = graph.getElement(member)
                    validator.ensureDefined(
                        element,
                        `Group member "${utils.prettyJSON(member)}" of group "${group.display}" does not exist`
                    )
                    return element.present
                })

                transformProperties(group, template, resolver)

                delete template.conditions
                delete template.default_alternative
                map[group.name] = template
                return map
            }, {})

        if (utils.isEmpty(graph.serviceTemplate.topology_template!.groups)) {
            delete graph.serviceTemplate.topology_template!.groups
        }
    }

    // Delete all topology template inputs which are not present
    if (validator.isDefined(graph.serviceTemplate.topology_template?.inputs)) {
        graph.serviceTemplate.topology_template!.inputs = graph.inputs
            .filter(input => input.present)
            .reduce<InputDefinitionMap>((map, input) => {
                const template = input._raw
                delete template.conditions
                delete template.default_alternative
                map[input.name] = template
                return map
            }, {})

        if (utils.isEmpty(graph.serviceTemplate.topology_template!.inputs)) {
            delete graph.serviceTemplate.topology_template!.inputs
        }
    }

    // Delete all policy templates which are not present and remove all targets which are not present
    if (validator.isDefined(graph.serviceTemplate?.topology_template?.policies)) {
        graph.serviceTemplate.topology_template!.policies = graph.policies
            .filter(policy => policy.present)
            .map(policy => {
                const template = policy._raw
                delete template.conditions
                delete template.default_alternative

                transformProperties(policy, template, resolver)

                template.targets = template.targets?.filter(target => {
                    const node = graph.nodesMap.get(target)
                    if (validator.isDefined(node)) return node.present

                    const group = graph.groupsMap.get(target)
                    if (validator.isDefined(group)) return group.present

                    throw new Error(
                        `Policy target "${target}" of policy template "${policy.name}" is neither a node template nor a group template`
                    )
                })

                const map: PolicyAssignmentMap = {}
                map[policy.name] = template
                return map
            })

        if (utils.isEmpty(graph.serviceTemplate.topology_template!.policies)) {
            delete graph.serviceTemplate.topology_template!.policies
        }
    }

    // Set TOSCA definitions version
    graph.serviceTemplate.tosca_definitions_version = TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3

    // Delete variability definition
    delete graph.serviceTemplate.topology_template?.variability

    if (utils.isEmpty(graph.serviceTemplate.topology_template)) {
        delete graph.serviceTemplate.topology_template
    }

    return graph.serviceTemplate
}

function transformProperties(
    element: Node | Relation | Group | Policy | Artifact,
    template: NodeTemplate | RelationshipTemplate | GroupTemplate | PolicyTemplate | ArtifactDefinition,
    resolver: Solver
) {
    if (validator.isString(template)) return

    template.properties = element.properties
        .filter(it => it.present)
        .reduce<PropertyAssignmentMap>((map, property) => {
            if (validator.isDefined(property)) {
                if (validator.isDefined(property.value)) map[property.name] = property.value
                if (validator.isDefined(property.expression))
                    map[property.name] = resolver.evaluateVariabilityExpression(property.expression, {
                        element: property,
                    })
            }
            return map
        }, {})

    if (utils.isEmpty(template.properties)) delete template.properties
}
