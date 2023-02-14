import * as validator from '#validator'
import * as files from '#files'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import * as featureIDE from '#utils/feature-ide'
import {InputAssignmentMap, InputDefinition, InputDefinitionMap} from '#spec/topology-template'
import {InputAssignmentPreset, VariabilityExpression, VariabilityPointMap} from '#spec/variability'
import {NodeTemplate, NodeTemplateMap, RequirementAssignment, RequirementAssignmentMap} from '#spec/node-template'
import {PropertyAssignmentMap, PropertyAssignmentValue} from '#spec/property-assignments'
import {RelationshipTemplate} from '#spec/relationship-template'
import {PolicyAssignmentMap, PolicyTemplate} from '#spec/policy-template'
import {GroupTemplate, GroupTemplateMap} from '#spec/group-template'
import {ArtifactDefinition, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import * as utils from '#utils'
import {GroupMember, TOSCA_GROUP_TYPES} from '#spec/group-type'
import _ from 'lodash'

/**
 * Not documented since preparation for future work
 *
 * - node templates might be a list
 * - groups might be a list
 */

export default {
    resolve,
    loadInputs,
}

export type ResolveOptions = {
    template: ServiceTemplate
    presets?: string[]
    inputs?: InputAssignmentMap
}

export type ResolveResult = {
    inputs: InputAssignmentMap
    template: ServiceTemplate
}

async function resolve(options: ResolveOptions): Promise<ResolveResult> {
    if (validator.isUndefined(options.presets)) options.presets = []
    if (!validator.isArray(options.presets)) throw new Error(`Presets must be a list`)

    // Load service template
    const resolver = new VariabilityResolver(options.template)

    // Apply variability presets
    for (const preset of options.presets) {
        resolver.setVariabilityPreset(preset)
    }

    // Apply variability inputs
    resolver.setVariabilityInputs(options.inputs)

    // Ensure correct TOSCA definitions version
    resolver.ensureCompatibility()

    // Resolve variability
    resolver.resolve()

    // Check consistency
    resolver.checkConsistency()

    // Transform to TOSCA compliant format
    resolver.transform()

    return {
        inputs: resolver.getVariabilityInputs(),
        template: options.template,
    }
}

async function loadInputs(file?: string) {
    if (validator.isUndefined(file)) return {}
    if (file.endsWith('.xml')) return featureIDE.loadConfiguration(file)
    return files.loadYAML<InputAssignmentMap>(file)
}

type ConditionalElementBase = {
    type: 'node' | 'relation' | 'input' | 'policy' | 'group' | 'artifact' | 'property'
    name: string
    display: string
    present?: boolean
    conditions: VariabilityExpression[]
}

type Input = ConditionalElementBase & {
    type: 'input'
    _raw: InputDefinition
}

type Node = ConditionalElementBase & {
    type: 'node'
    ingoing: Relation[]
    outgoing: Relation[]
    outgoingMap: Map<String, Relation[]>
    groups: Group[]
    artifacts: Artifact[]
    artifactsMap: Map<String, Artifact[]>
    properties: Property[]
    propertiesMap: Map<String, Property[]>
    _raw: NodeTemplate
}

type Property = ConditionalElementBase & {
    type: 'property'
    parent: Node | Relation | Policy | Group | Artifact
    index?: number
    default: boolean
    value?: PropertyAssignmentValue
    expression?: VariabilityExpression
}

type Relation = ConditionalElementBase & {
    type: 'relation'
    source: string
    target: string
    groups: Group[]
    properties: Property[]
    propertiesMap: Map<String, Property[]>
    relationship?: Relationship
    default: boolean
    _raw: RequirementAssignment
}

type Relationship = {
    name: string
    relation: Relation
    _raw: RelationshipTemplate
}

type Policy = ConditionalElementBase & {
    type: 'policy'
    targets: (Node | Group)[]
    properties: Property[]
    propertiesMap: Map<String, Property[]>
    _raw: PolicyTemplate
}

type Group = ConditionalElementBase & {
    type: 'group'
    variability: boolean
    members: (Node | Relation)[]
    properties: Property[]
    propertiesMap: Map<String, Property[]>
    _raw: GroupTemplate
}

type Artifact = ConditionalElementBase & {
    type: 'artifact'
    index?: number
    node: Node
    properties: Property[]
    propertiesMap: Map<String, Property[]>
    _raw: ArtifactDefinition
    default: boolean
}

type ConditionalElement = Input | Node | Relation | Policy | Group | Artifact | Property

type VariabilityExpressionContext = {
    element?: ConditionalElement
}

export class VariabilityResolver {
    private readonly serviceTemplate: ServiceTemplate

    private variabilityInputs: InputAssignmentMap = {}

    private nodes: Node[] = []
    private nodesMap = new Map<string, Node>()

    private relations: Relation[] = []
    private relationshipsMap = new Map<string, Relationship>()

    private properties: Property[] = []

    private policies: Policy[] = []

    private groups: Group[] = []
    private groupsMap = new Map<string, Group>()

    private inputs: Input[] = []
    private inputsMap = new Map<string, Input>()

    private artifacts: Artifact[] = []

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate

        // Deployment inputs
        this.getFromVariabilityPointMap(serviceTemplate.topology_template?.inputs).forEach(map => {
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

        // Node templates
        this.getFromVariabilityPointMap(serviceTemplate.topology_template?.node_templates).forEach(map => {
            const [nodeName, nodeTemplate] = utils.firstEntry(map)
            if (this.nodesMap.has(nodeName)) throw new Error(`Node "${nodeName}" defined multiple times`)

            const node: Node = {
                type: 'node',
                name: nodeName,
                display: nodeName,
                conditions: utils.toList(nodeTemplate.conditions),
                ingoing: [],
                outgoing: [],
                outgoingMap: new Map(),
                groups: [],
                artifacts: [],
                artifactsMap: new Map(),
                properties: [],
                propertiesMap: new Map(),
                _raw: nodeTemplate,
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
                }
                if (!node.outgoingMap.has(relation.name)) node.outgoingMap.set(relation.name, [])
                node.outgoingMap.get(relation.name)!.push(relation)
                node.outgoing.push(relation)
                this.relations.push(relation)

                if (!validator.isString(assignment)) {
                    if (validator.isString(assignment.relationship)) {
                        const relationshipTemplate = (serviceTemplate.topology_template?.relationship_templates || {})[
                            assignment.relationship
                        ]
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
        for (const relationshipName of Object.keys(serviceTemplate.topology_template?.relationship_templates || {})) {
            if (!this.relationshipsMap.has(relationshipName))
                throw new Error(`Relation "${relationshipName}" is never used`)
        }

        // Assign ingoing relations to nodes
        this.relations.forEach(relation => {
            const node = this.nodesMap.get(relation.target)
            validator.ensureDefined(node, `Target "${relation.target}" of "${relation.display}" does not exist`)
            node.ingoing.push(relation)
        })

        // Groups
        this.getFromVariabilityPointMap(serviceTemplate.topology_template?.groups).forEach(map => {
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
                const element = this.getElement(member)
                element.groups.push(group)
                group.members.push(element)
            })

            this.populateProperties(group, template)
        })

        // Policies
        if (
            validator.isDefined(serviceTemplate.topology_template?.policies) &&
            !validator.isArray(serviceTemplate.topology_template?.policies)
        )
            throw new Error(`Policies must be an array`)
        serviceTemplate.topology_template?.policies?.forEach(map => {
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

    getFromVariabilityPointMap<T>(data?: VariabilityPointMap<T>): {[name: string]: T}[] {
        if (validator.isUndefined(data)) return []
        if (validator.isArray(data)) return data
        return Object.entries(data).map(([name, template]) => {
            const map: {[name: string]: T} = {}
            map[name] = template
            return map
        })
    }

    populateArtifact(node: Node, map: ArtifactDefinitionMap, index?: number) {
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

    populateProperties(
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

                throw new Error(`Unexpected`)
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
            }
        })
    }

    getElement(member: GroupMember): Node | Relation {
        if (validator.isString(member)) return this.getNode(member)
        if (validator.isArray(member)) return this.getRelation(member)
        throw new Error(`Member "${utils.prettyJSON(member)}" has bad format`)
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

    resolve() {
        for (const node of this.nodes) this.checkPresence(node)
        for (const relation of this.relations) this.checkPresence(relation)
        for (const input of this.inputs) this.checkPresence(input)
        for (const group of this.groups) this.checkPresence(group)
        for (const policy of this.policies) this.checkPresence(policy)
        for (const artifact of this.artifacts) this.checkPresence(artifact)
        for (const property of this.properties) this.checkPresence(property)
        return this
    }

    checkPresence(element: ConditionalElement) {
        // Variability group are never present
        if (element.type === 'group' && element.variability) element.present = false

        // Check if presence already has been evaluated
        if (validator.isDefined(element.present)) return element.present

        // Collect assigned conditions
        let conditions = element.conditions
        if (element.type === 'node' || element.type === 'relation')
            element.groups.filter(group => group.variability).forEach(group => conditions.push(...group.conditions))
        conditions = utils.filterNotNull<VariabilityExpression>(conditions)

        // If artifact is default, then check if no other artifact having the same name is present
        if (element.type === 'artifact' && element.default) {
            const bratans = element.node.artifactsMap.get(element.name)!.filter(it => it !== element)
            conditions = [!bratans.some(it => this.checkPresence(it))]
        }

        // If relation is default, then check if no other relation having the same name is present
        if (element.type === 'relation' && element.default) {
            const node = this.getNode(element.source)
            const bratans = node.outgoingMap.get(element.name)!.filter(it => it !== element)
            conditions = [!bratans.some(it => this.checkPresence(it))]
        }

        // If property is default, then check if no other property having the same name is present
        if (element.type === 'property' && element.default) {
            const bratans = element.parent.propertiesMap.get(element.name)!.filter(it => it !== element)
            conditions = [!bratans.some(it => this.checkPresence(it))]
        }

        // Relation Default Condition: Assign default condition to relation that checks if source is present
        if (
            element.type === 'relation' &&
            this.getVariabilityResolvingOptions().enable_relation_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{get_node_presence: element.source}]
        }

        // Prune Relations: Additionally check that source is present
        if (element.type === 'relation' && this.getVariabilityResolvingOptions().enable_relation_pruning) {
            conditions = [{get_node_presence: element.source}, ...conditions]
        }

        // Policy Default Condition: Assign default condition to node that checks if any target is present
        if (
            element.type === 'policy' &&
            this.getVariabilityResolvingOptions().enable_policy_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{has_present_targets: element.name}]
        }

        // Prune Policy: Additionally check if any target is present
        if (element.type === 'policy' && this.getVariabilityResolvingOptions().enable_policy_pruning) {
            conditions = [{has_present_targets: element.name}, ...conditions]
        }

        // Group Default Condition: Assign default condition to node that checks if any member is present
        if (
            element.type === 'group' &&
            this.getVariabilityResolvingOptions().enable_group_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{has_present_members: element.name}]
        }

        // Prune Group: Additionally check if any member is present
        if (element.type === 'group' && this.getVariabilityResolvingOptions().enable_group_pruning) {
            conditions = [{has_present_members: element.name}, ...conditions]
        }

        // Artifact Default Condition: Assign default condition to artifact that checks if corresponding node is present
        if (
            element.type === 'artifact' &&
            this.getVariabilityResolvingOptions().enable_artifact_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{get_node_presence: element.node.name}]
        }

        // Prune Artifact: Additionally check if node is present
        if (element.type === 'artifact' && this.getVariabilityResolvingOptions().enable_artifact_pruning) {
            conditions = [{get_node_presence: element.node.name}, ...conditions]
        }

        // Property Default Condition: Assign default condition to property that checks if corresponding parent is present
        if (
            element.type === 'property' &&
            this.getVariabilityResolvingOptions().enable_property_default_condition &&
            utils.isEmpty(conditions)
        ) {
            if (element.parent.type === 'node') conditions = [{get_node_presence: element.parent.name}]
            if (element.parent.type === 'relation')
                conditions = [{get_relation_presence: [element.parent.source, element.parent.name]}]
        }

        // Prune Artifact: Additionally check if corresponding parent is present
        if (element.type === 'property' && this.getVariabilityResolvingOptions().enable_property_pruning) {
            if (element.parent.type === 'node') conditions = [{get_node_presence: element.parent.name}, ...conditions]
            if (element.parent.type === 'relation')
                conditions = [{get_relation_presence: [element.parent.source, element.parent.name]}, ...conditions]
        }

        // Evaluate assigned conditions
        const present = conditions.every(condition => this.evaluateVariabilityCondition(condition, {element}))
        element.present = present

        return present
    }

    getVariabilityResolvingOptions() {
        return this.serviceTemplate.topology_template?.variability?.options || {}
    }

    checkConsistency() {
        if (this.getVariabilityResolvingOptions().disable_consistency_checks) return this

        const relations = this.relations.filter(relation => relation.present)
        const nodes = this.nodes.filter(node => node.present)

        // Ensure that each relation source exists
        if (!this.getVariabilityResolvingOptions().disable_relation_source_consistency_check) {
            for (const relation of relations) {
                if (!this.nodesMap.get(relation.source)?.present)
                    throw new Error(
                        `Relation source "${relation.source}" of relation "${relation.display}" does not exist`
                    )
            }
        }

        // Ensure that each relation target exists
        if (!this.getVariabilityResolvingOptions().disable_relation_target_consistency_check) {
            for (const relation of relations) {
                if (!this.nodesMap.get(relation.target)?.present)
                    throw new Error(
                        `Relation target "${relation.target}" of relation "${relation.display}" does not exist`
                    )
            }
        }

        // Ensure that every component has at maximum one hosting relation
        if (!this.getVariabilityResolvingOptions().disable_ambiguous_hosting_consistency_check) {
            for (const node of nodes) {
                const relations = node.outgoing.filter(
                    relation => relation.source === node.name && relation.name === 'host' && relation.present
                )
                if (relations.length > 1) throw new Error(`Node "${node.display}" has more than one hosting relations`)
            }
        }

        // Ensure that every component that had a hosting relation previously still has one
        if (!this.getVariabilityResolvingOptions().disable_expected_hosting_consistency_check) {
            for (const node of nodes) {
                const relations = node.outgoing.filter(
                    relation => relation.source === node.name && relation.name === 'host'
                )

                if (relations.length !== 0 && !relations.some(relation => relation.present))
                    throw new Error(`Node "${node.display}" requires a hosting relation`)
            }
        }

        // Ensure that node of each artifact exists
        if (!this.getVariabilityResolvingOptions().disable_missing_artifact_parent_consistency_check) {
            const artifacts = this.artifacts.filter(artifact => artifact.present)
            for (const artifact of artifacts) {
                if (!artifact.node.present)
                    throw new Error(`Node "${artifact.node.display}" of artifact "${artifact.display}" does not exist`)
            }
        }

        // Ensure that artifacts are unique within their node (also considering non-present nodes)
        if (!this.getVariabilityResolvingOptions().disable_ambiguous_artifact_consistency_check) {
            for (const node of this.nodes) {
                const names = new Set()
                for (const artifact of node.artifacts.filter(artifact => artifact.present)) {
                    if (names.has(artifact.name))
                        throw new Error(`Artifact "${artifact.display}" of node "${node.display}" is ambiguous`)
                    names.add(artifact.name)
                }
            }
        }

        // Ensure that node of each present property exists
        if (!this.getVariabilityResolvingOptions().disable_missing_property_parent_consistency_check) {
            for (const property of this.properties.filter(property => property.present)) {
                if (!property.parent.present) {
                    if (property.parent.type === 'node')
                        throw new Error(
                            `Node "${property.parent.display}" of property "${property.display}" does not exist`
                        )

                    if (property.parent.type === 'relation')
                        throw new Error(
                            `Relation "${property.parent.display}" of property "${property.display}" does not exist`
                        )

                    if (property.parent.type === 'group')
                        throw new Error(
                            `Group "${property.parent.display}" of property "${property.display}" does not exist`
                        )

                    if (property.parent.type === 'policy')
                        throw new Error(
                            `Policy "${property.parent.display}" of property "${property.display}" does not exist`
                        )

                    if (property.parent.type === 'artifact')
                        throw new Error(
                            `Node "${property.parent.display}" of property "${property.display}" does not exist`
                        )
                }
            }
        }

        // Ensure that each property has maximum one value (also considering non-present nodes)
        if (!this.getVariabilityResolvingOptions().disable_ambiguous_property_consistency_check) {
            for (const node of this.nodes) {
                const names = new Set()
                for (const property of node.properties.filter(property => property.present)) {
                    if (names.has(property.name))
                        throw new Error(`Property "${property.display}" of node "${node.display}" is ambiguous`)
                    names.add(property.name)
                }
            }
        }

        return this
    }

    transformProperties(element: Node | Relation, template: NodeTemplate | RelationshipTemplate) {
        template.properties = element.properties
            .filter(it => it.present)
            .reduce<PropertyAssignmentMap>((map, property) => {
                if (validator.isDefined(property)) {
                    if (validator.isDefined(property.value)) map[property.name] = property.value
                    if (validator.isDefined(property.expression))
                        map[property.name] = this.evaluateVariabilityExpression(property.expression, {
                            element: property,
                        })
                }
                return map
            }, {})

        if (utils.isEmpty(template.properties)) delete template.properties
    }

    transform() {
        // Delete node templates which are not present
        if (validator.isDefined(this.serviceTemplate?.topology_template?.node_templates)) {
            this.serviceTemplate.topology_template!.node_templates = this.nodes
                .filter(node => node.present)
                .reduce<NodeTemplateMap>((map, node) => {
                    const template = node._raw

                    // Select present properties
                    this.transformProperties(node, template)

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
                            map[artifact.name] = artifact._raw
                            return map
                        }, {})
                    if (utils.isEmpty(template.artifacts)) delete template.artifacts

                    delete template.conditions
                    delete template.default_alternative
                    map[node.name] = template
                    return map
                }, {})

            if (utils.isEmpty(this.serviceTemplate.topology_template!.node_templates)) {
                delete this.serviceTemplate.topology_template!.node_templates
            }
        }

        // Delete all relationship templates which have no present relations
        if (validator.isDefined(this.serviceTemplate?.topology_template?.relationship_templates)) {
            this.relations.forEach(relation => {
                if (validator.isDefined(relation.relationship)) {
                    if (!relation.present)
                        delete this.serviceTemplate.topology_template!.relationship_templates![
                            relation.relationship.name
                        ]

                    this.transformProperties(relation, relation.relationship._raw)
                }
            })

            if (utils.isEmpty(this.serviceTemplate.topology_template!.relationship_templates)) {
                delete this.serviceTemplate.topology_template!.relationship_templates
            }
        }

        // Delete all groups which are not present and remove all members which are not present
        if (validator.isDefined(this.serviceTemplate?.topology_template?.groups)) {
            this.serviceTemplate.topology_template!.groups = this.groups
                .filter(group => group.present)
                .reduce<GroupTemplateMap>((map, group) => {
                    const template = group._raw

                    template.members = template.members.filter(member => {
                        const element = this.getElement(member)
                        validator.ensureDefined(
                            element,
                            `Group member "${utils.prettyJSON(member)}" of group "${group.display}" does not exist`
                        )
                        return element.present
                    })

                    delete template.conditions
                    delete template.default_alternative
                    map[group.name] = template
                    return map
                }, {})

            if (utils.isEmpty(this.serviceTemplate.topology_template!.groups)) {
                delete this.serviceTemplate.topology_template!.groups
            }
        }

        // Delete all topology template inputs which are not present
        if (validator.isDefined(this.serviceTemplate.topology_template?.inputs)) {
            this.serviceTemplate.topology_template!.inputs = this.inputs
                .filter(input => input.present)
                .reduce<InputDefinitionMap>((map, input) => {
                    const template = input._raw
                    delete template.conditions
                    delete template.default_alternative
                    map[input.name] = template
                    return map
                }, {})

            if (utils.isEmpty(this.serviceTemplate.topology_template!.inputs)) {
                delete this.serviceTemplate.topology_template!.inputs
            }
        }

        // Delete all policy templates which are not present and remove all targets which are not present
        if (validator.isDefined(this.serviceTemplate?.topology_template?.policies)) {
            this.serviceTemplate.topology_template!.policies = this.policies
                .filter(policy => policy.present)
                .map(policy => {
                    const template = policy._raw
                    delete template.conditions
                    delete template.default_alternative

                    template.targets = template.targets?.filter(target => {
                        const node = this.nodesMap.get(target)
                        if (validator.isDefined(node)) return node.present

                        const group = this.groupsMap.get(target)
                        if (validator.isDefined(group)) return group.present

                        throw new Error(
                            `Policy target "${target}" of policy template "${policy.name}" is neither a node template nor a group template`
                        )
                    })

                    const map: PolicyAssignmentMap = {}
                    map[policy.name] = template
                    return map
                })

            if (utils.isEmpty(this.serviceTemplate.topology_template!.policies)) {
                delete this.serviceTemplate.topology_template!.policies
            }
        }

        // Set TOSCA definitions version
        this.serviceTemplate.tosca_definitions_version = TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3

        // Delete variability definition
        delete this.serviceTemplate.topology_template?.variability

        if (utils.isEmpty(this.serviceTemplate.topology_template)) {
            delete this.serviceTemplate.topology_template
        }

        return this.serviceTemplate
    }

    ensureCompatibility() {
        if (
            ![
                TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
                TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            ].includes(this.serviceTemplate.tosca_definitions_version)
        )
            throw new Error('Unsupported TOSCA definitions version')
    }

    setVariabilityPreset(name?: string) {
        if (validator.isUndefined(name)) return this
        const inputs = this.getVariabilityPreset(name).inputs
        this.variabilityInputs = _.merge(this.variabilityInputs, inputs)
        return this
    }

    setVariabilityInputs(inputs?: InputAssignmentMap) {
        if (validator.isUndefined(inputs)) return this
        this.variabilityInputs = _.merge(this.variabilityInputs, inputs)
        return this
    }

    getVariabilityInput(name: string) {
        const input = this.variabilityInputs[name]
        validator.ensureDefined(input, `Did not find variability input "${name}"`)
        return input
    }

    getVariabilityInputs() {
        return this.variabilityInputs
    }

    getVariabilityPreset(name: string) {
        const set: InputAssignmentPreset | undefined = (this.serviceTemplate.topology_template?.variability?.presets ||
            {})[name]
        validator.ensureDefined(set, `Did not find variability set "${name}"`)
        return set
    }

    getVariabilityExpression(name: string) {
        const condition: VariabilityExpression | undefined = (this.serviceTemplate.topology_template?.variability
            ?.expressions || {})[name]
        validator.ensureDefined(condition, `Did not find variability expression "${name}"`)
        return condition
    }

    evaluateVariabilityCondition(condition: VariabilityExpression, context: VariabilityExpressionContext): boolean {
        const result = this.evaluateVariabilityExpression(condition, context)
        validator.ensureBoolean(result)
        return result
    }

    evaluateVariabilityExpression(
        condition: VariabilityExpression,
        context: VariabilityExpressionContext
    ): boolean | string | number {
        if (validator.isObject(condition)) {
            if (validator.isDefined(condition.cached_result)) return condition.cached_result
            const result = this.evaluateVariabilityExpressionRunner(condition, context)
            condition.cached_result = result
            return result
        }

        return this.evaluateVariabilityExpressionRunner(condition, context)
    }

    evaluateVariabilityExpressionRunner(
        condition: VariabilityExpression,
        context: VariabilityExpressionContext
    ): boolean | string | number {
        validator.ensureDefined(condition, `Received condition that is undefined or null`)

        if (validator.isString(condition)) return condition
        if (validator.isBoolean(condition)) return condition
        if (validator.isNumber(condition)) return condition

        if (validator.isDefined(condition.and)) {
            return condition.and.every(element => {
                const value = this.evaluateVariabilityExpression(element, context)
                validator.ensureBoolean(value)
                return value
            })
        }

        if (validator.isDefined(condition.or)) {
            return condition.or.some(element => {
                const value = this.evaluateVariabilityExpression(element, context)
                validator.ensureBoolean(value)
                return value
            })
        }

        if (validator.isDefined(condition.not)) {
            const value = this.evaluateVariabilityExpression(condition.not, context)
            validator.ensureBoolean(value)
            return !value
        }

        if (validator.isDefined(condition.xor)) {
            return (
                condition.xor.reduce((count: number, element) => {
                    const value = this.evaluateVariabilityExpression(element, context)
                    validator.ensureBoolean(value)
                    if (value) count++
                    return count
                }, 0) === 1
            )
        }

        if (validator.isDefined(condition.implies)) {
            const first = this.evaluateVariabilityExpression(condition.implies[0], context)
            validator.ensureBoolean(first)

            const second = this.evaluateVariabilityExpression(condition.implies[1], context)
            validator.ensureBoolean(first)

            return first ? second : true
        }

        if (validator.isDefined(condition.add)) {
            return condition.add.reduce<number>((sum, element) => {
                const value = this.evaluateVariabilityExpression(element, context)
                validator.ensureNumber(value)
                return sum + value
            }, 0)
        }

        if (validator.isDefined(condition.sub)) {
            const first = this.evaluateVariabilityExpression(condition.sub[0], context)
            validator.ensureNumber(first)

            return condition.sub.slice(1).reduce<number>((difference, element) => {
                const value = this.evaluateVariabilityExpression(element, context)
                validator.ensureNumber(value)
                return difference - value
            }, first)
        }

        if (validator.isDefined(condition.mul)) {
            return condition.mul.reduce<number>((product, element) => {
                const value = this.evaluateVariabilityExpression(element, context)
                validator.ensureNumber(value)
                return product * value
            }, 1)
        }

        if (validator.isDefined(condition.div)) {
            const first = this.evaluateVariabilityExpression(condition.div[0], context)
            validator.ensureNumber(first)

            return condition.div.slice(1).reduce<number>((quotient, element) => {
                const value = this.evaluateVariabilityExpression(element, context)
                validator.ensureNumber(value)
                return quotient / value
            }, first)
        }

        if (validator.isDefined(condition.mod)) {
            const first = this.evaluateVariabilityExpression(condition.mod[0], context)
            validator.ensureNumber(first)

            const second = this.evaluateVariabilityExpression(condition.mod[1], context)
            validator.ensureNumber(second)

            return first % second
        }

        if (validator.isDefined(condition.get_variability_input)) {
            validator.ensureString(condition.get_variability_input)
            return this.evaluateVariabilityExpression(
                this.getVariabilityInput(condition.get_variability_input),
                context
            )
        }

        if (validator.isDefined(condition.get_variability_expression)) {
            validator.ensureString(condition.get_variability_expression)
            return this.evaluateVariabilityExpression(
                this.getVariabilityExpression(condition.get_variability_expression),
                context
            )
        }

        if (validator.isDefined(condition.get_variability_condition)) {
            validator.ensureString(condition.get_variability_condition)
            return this.evaluateVariabilityCondition(
                this.getVariabilityExpression(condition.get_variability_condition),
                context
            )
        }

        if (validator.isDefined(condition.get_node_presence)) {
            const name = this.evaluateVariabilityExpression(condition.get_node_presence, context)
            validator.ensureString(name)
            return this.checkPresence(this.getElement(name))
        }

        if (validator.isDefined(condition.get_relation_presence)) {
            const node = this.evaluateVariabilityExpression(condition.get_relation_presence[0], context)
            validator.ensureString(node)

            const relation = this.evaluateVariabilityExpression(condition.get_relation_presence[1], context)
            validator.ensureStringOrNumber(relation)

            return this.checkPresence(this.getElement([node, relation]))
        }

        if (validator.isDefined(condition.get_source_presence)) {
            const element = this.evaluateVariabilityExpression(condition.get_source_presence, context)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "get_source_presence" but received "${element}"`)
            if (context?.element?.type !== 'relation')
                throw new Error(`"get_source_presence" is only valid inside a relation`)
            return this.checkPresence(this.getElement(context.element.source))
        }

        if (validator.isDefined(condition.get_target_presence)) {
            const element = this.evaluateVariabilityExpression(condition.get_target_presence, context)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "get_target_presence" but received "${element}"`)
            if (context?.element?.type !== 'relation')
                throw new Error(`"get_target_presence" is only valid inside a relation`)
            return this.checkPresence(this.getElement(context.element.target))
        }

        if (validator.isDefined(condition.has_present_targets)) {
            const element = this.evaluateVariabilityExpression(condition.has_present_targets, context)
            validator.ensureString(element)
            return this.getPolicy(element).targets.some(target => {
                if (target.type === 'node') {
                    return this.checkPresence(target)
                }

                if (target.type === 'group') {
                    return target.members.some(member => this.checkPresence(member))
                }
            })
        }

        if (validator.isDefined(condition.has_present_members)) {
            const element = this.evaluateVariabilityExpression(condition.has_present_members, context)
            validator.ensureString(element)
            return this.getGroup(element).members.some(member => this.checkPresence(member))
        }

        if (validator.isDefined(condition.concat)) {
            return condition.concat.map(c => this.evaluateVariabilityExpression(c, context)).join('')
        }

        if (validator.isDefined(condition.join)) {
            return condition.join[0].map(c => this.evaluateVariabilityExpression(c, context)).join(condition.join[1])
        }

        if (validator.isDefined(condition.token)) {
            const element = this.evaluateVariabilityExpression(condition.token[0], context)
            validator.ensureString(element)
            const token = condition.token[1]
            const index = condition.token[2]
            return element.split(token)[index]
        }

        if (validator.isDefined(condition.equal)) {
            const first = this.evaluateVariabilityExpression(condition.equal[0], context)
            return condition.equal.every(element => {
                const value = this.evaluateVariabilityExpression(element, context)
                return value === first
            })
        }

        if (validator.isDefined(condition.greater_than)) {
            return (
                this.evaluateVariabilityExpression(condition.greater_than[0], context) >
                this.evaluateVariabilityExpression(condition.greater_than[1], context)
            )
        }

        if (validator.isDefined(condition.greater_or_equal)) {
            return (
                this.evaluateVariabilityExpression(condition.greater_or_equal[0], context) >=
                this.evaluateVariabilityExpression(condition.greater_or_equal[1], context)
            )
        }

        if (validator.isDefined(condition.less_than)) {
            return (
                this.evaluateVariabilityExpression(condition.less_than[0], context) <
                this.evaluateVariabilityExpression(condition.less_than[1], context)
            )
        }

        if (validator.isDefined(condition.less_or_equal)) {
            return (
                this.evaluateVariabilityExpression(condition.less_or_equal[0], context) <=
                this.evaluateVariabilityExpression(condition.less_or_equal[1], context)
            )
        }

        if (validator.isDefined(condition.in_range)) {
            const element = this.evaluateVariabilityExpression(condition.in_range[0], context)
            const lower = condition.in_range[1][0]
            const upper = condition.in_range[1][1]
            return lower <= element && element <= upper
        }

        if (validator.isDefined(condition.valid_values)) {
            const element = this.evaluateVariabilityExpression(condition.valid_values[0], context)
            const valid = condition.valid_values[1].map(c => this.evaluateVariabilityExpression(c, context))
            return valid.includes(element)
        }

        if (validator.isDefined(condition.length)) {
            const element = this.evaluateVariabilityExpression(condition.length[0], context)
            validator.ensureString(element)

            const length = this.evaluateVariabilityExpression(condition.length[1], context)
            validator.ensureNumber(length)

            return element.length === length
        }

        if (validator.isDefined(condition.min_length)) {
            const element = this.evaluateVariabilityExpression(condition.min_length[0], context)
            validator.ensureString(element)

            const length = this.evaluateVariabilityExpression(condition.min_length[1], context)
            validator.ensureNumber(length)

            return element.length >= length
        }

        if (validator.isDefined(condition.max_length)) {
            const element = this.evaluateVariabilityExpression(condition.max_length[0], context)
            validator.ensureString(element)

            const length = this.evaluateVariabilityExpression(condition.max_length[1], context)
            validator.ensureNumber(length)

            return element.length <= length
        }

        throw new Error(`Unknown variability condition "${utils.prettyJSON(condition)}"`)
    }
}
