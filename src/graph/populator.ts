import * as assert from '#assert'
import * as check from '#check'
import Artifact from '#graph/artifact'
import Graph from '#graph/graph'
import Group from '#graph/group'
import Import from '#graph/import'
import Input from '#graph/input'
import Node from '#graph/node'
import {Options} from '#graph/options'
import Output from '#graph/output'
import Policy from '#graph/policy'
import Property, {PropertyContainer, PropertyContainerTemplate} from '#graph/property'
import Relation, {Relationship} from '#graph/relation'
import Technology from '#graph/technology'
import Type, {TypeContainer, TypeContainerTemplate} from '#graph/type'
import {NodeTemplate} from '#spec/node-template'
import {PropertyAssignmentValue} from '#spec/property-assignments'
import {VINTNER_UNDEFINED} from '#spec/variability'
import {TechnologyRulePluginBuilder} from '#technologies/plugins/rules'
import * as utils from '#utils'
import {NotImplementedError, UnexpectedError} from '#utils/error'

export class Populator {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    run() {
        // Options
        this.graph.options = new Options(this.graph.serviceTemplate)

        // Plugins
        this.populatePlugins()

        // Inputs
        this.populateInputs()

        // Outputs
        this.populateOutputs()

        // Nodes
        this.populateNodes()

        // Groups
        this.populateGroups()

        // Policies
        this.populatePolicies()

        // Imports
        this.populateImports()

        // Input Consumers
        this.populateConsumers()

        // Output Producers
        this.populateProducers()

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
            ...this.graph.technologies,
            ...this.graph.outputs,
        ]

        // Ensure that at least one node template is anchor if "incoming(naive)-host" is used
        if (this.graph.options.checks.anchor) {
            if (
                this.graph.options.default.nodeDefaultConditionMode.includes('incoming') &&
                this.graph.options.default.nodeDefaultConditionMode.includes('host')
            ) {
                if (check.isUndefined(this.graph.nodes.find(it => it.anchor || it.implied)))
                    throw new Error(
                        `Node default condition mode "incoming(naive)-host" requires at least one anchor or implied node template`
                    )
            }
        }
    }

    private populatePlugins() {
        /**
         * Technology Rule Plugin
         */
        const technologyRulePlugin = new TechnologyRulePluginBuilder().build(this.graph)
        this.graph.plugins.technology.push(technologyRulePlugin)

        /**
         * Imported plugins
         */
        const builders = this.graph.serviceTemplate.topology_template?.variability?.plugins?.technology || []
        for (const builder of builders) {
            assert.isObject(builder)
            this.graph.plugins.technology.push(builder.build(this.graph))
        }
    }

    private populateInputs() {
        const inputs = this.graph.serviceTemplate.topology_template?.inputs
        if (check.isUndefined(inputs)) return
        assert.isArray(inputs, 'Inputs not normalized')

        for (const [index, map] of inputs.entries()) {
            const [name, raw] = utils.firstEntry(map)

            const input = new Input({name, raw, index})
            input.graph = this.graph

            if (!this.graph.inputsMap.has(input.name)) this.graph.inputsMap.set(input.name, [])
            this.graph.inputsMap.get(input.name)!.push(input)
            this.graph.inputs.push(input)
        }

        // Ensure that there is only one default input per input name
        this.graph.inputsMap.forEach(list => {
            const candidates = list.filter(it => it.defaultAlternative)
            if (candidates.length > 1) throw new Error(`${list[0].Display} has multiple defaults`)
        })
    }

    private populateOutputs() {
        const outputs = this.graph.serviceTemplate.topology_template?.outputs
        if (check.isUndefined(outputs)) return
        assert.isArray(outputs, 'Outputs not normalized')

        for (const [index, map] of outputs.entries()) {
            const [name, raw] = utils.firstEntry(map)

            const output = new Output({name, raw, index})
            output.graph = this.graph

            if (!this.graph.outputsMap.has(output.name)) this.graph.outputsMap.set(output.name, [])
            this.graph.outputsMap.get(output.name)!.push(output)
            this.graph.outputs.push(output)
        }

        // Ensure that there is only one default output per output name
        this.graph.outputsMap.forEach(list => {
            const candidates = list.filter(it => it.defaultAlternative)
            if (candidates.length > 1) throw new Error(`${list[0].Display} has multiple defaults`)
        })
    }

    private populateImports() {
        const imports = this.graph.serviceTemplate.imports
        if (check.isUndefined(imports)) return
        assert.isArray(imports, 'Imports not normalized')

        for (const [index, raw] of imports.entries()) {
            assert.isObject(raw, `Import with index ${index} not normalized`)

            const imp = new Import({index, raw})
            imp.graph = this.graph
            this.graph.imports.push(imp)
        }
    }

    private populateNodes() {
        const nodes = this.graph.serviceTemplate.topology_template?.node_templates
        if (check.isUndefined(nodes)) return
        assert.isArray(nodes, 'Node templates not normalized')

        nodes.forEach(map => {
            const [name, raw] = utils.firstEntry(map)
            if (this.graph.nodesMap.has(name)) throw new Error(`Node "${name}" defined multiple times`)

            if (name === 'SELF') throw new Error(`Node must not be named "SELF"`)
            if (name === 'CONTAINER') throw new Error(`Node must not be named "CONTAINER"`)

            const node = new Node({name, raw})
            node.graph = this.graph

            this.graph.nodes.push(node)
            this.graph.nodesMap.set(name, node)

            // Type
            this.populateTypes(node, raw)

            // Properties
            this.populateProperties(node, raw)

            // Relations
            this.populateRelations(node, raw)

            // Artifacts
            this.populateArtifacts(node, raw)

            // Technologies
            this.populateTechnologies(node, raw)
        })

        // Ensure that each relationship is used
        for (const relationshipName of Object.keys(
            this.graph.serviceTemplate.topology_template?.relationship_templates || {}
        )) {
            if (!this.graph.relationshipsMap.has(relationshipName))
                throw new Error(`Relation "${relationshipName}" is never used`)
        }

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

    private populateRelations(node: Node, template: NodeTemplate) {
        if (check.isUndefined(template.requirements)) return
        assert.isArray(template.requirements, `Requirements assignments of "${node.display} must be an array`)

        for (const [index, map] of template.requirements.entries()) {
            const [name, raw] = utils.firstEntry(map)
            assert.isObject(raw, `Requirement assignment "${name}" of "${node.display}" not normalized`)

            if (check.isObject(raw.relationship)) {
                throw new Error(
                    `Relation "${name}" of "${node.display}" contains a relationship template which is currently not supported`
                )
            }

            const relation = new Relation({
                name,
                container: node,
                raw,
                index,
            })
            relation.graph = this.graph

            if (!node.outgoingMap.has(relation.name)) node.outgoingMap.set(relation.name, [])
            node.outgoingMap.get(relation.name)!.push(relation)
            node.outgoing.push(relation)
            node.relations.push(relation)
            this.graph.relations.push(relation)

            if (check.isString(raw.relationship)) {
                const relationshipTemplate = (this.graph.serviceTemplate.topology_template?.relationship_templates ||
                    {})[raw.relationship]
                assert.isDefined(
                    relationshipTemplate,
                    `Relationship "${raw.relationship}" of relation "${name}" of ${node.display} does not exist!`
                )

                if (this.graph.relationshipsMap.has(raw.relationship))
                    throw new Error(`Relation "${raw.relationship}" is used multiple times`)

                const relationship = new Relationship({
                    name: raw.relationship,
                    relation,
                    raw: relationshipTemplate,
                })
                this.graph.relationshipsMap.set(raw.relationship, relationship)
                relation.relationship = relationship

                // Type
                this.populateTypes(relation, relationshipTemplate)

                // Properties
                this.populateProperties(relation, relationshipTemplate)
            }
        }

        // Ensure that there are no multiple outgoing defaults
        node.outgoingMap.forEach(relations => {
            const candidates = relations.filter(it => it.defaultAlternative)
            if (candidates.length > 1) throw new Error(`${relations[0].Display} has multiple defaults`)
        })
    }

    private populateTypes(element: TypeContainer, template: TypeContainerTemplate) {
        assert.isDefined(template.type, `${element.Display} has no type`)
        assert.isArray(template.type, `Types of ${element.display} not normalized`)

        // Create types
        for (const [index, map] of template.type.entries()) {
            const [name, raw] = utils.firstEntry(map)

            const type = new Type({
                name,
                container: element,
                index,
                raw,
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
    }

    private populateArtifacts(node: Node, nodeTemplate: NodeTemplate) {
        if (check.isUndefined(nodeTemplate.artifacts)) return
        assert.isArray(nodeTemplate.artifacts, `Artifacts of ${node.display} not normalized`)

        for (const [index, map] of nodeTemplate.artifacts.entries()) {
            const [name, raw] = utils.firstEntry(map)
            assert.isObject(raw, `Artifact "${name}" of ${node.display} not normalized`)

            const artifact = new Artifact({
                name,
                raw,
                container: node,
                index,
            })
            artifact.graph = this.graph

            // Type
            this.populateTypes(artifact, raw)

            // Properties
            this.populateProperties(artifact, raw)

            if (!node.artifactsMap.has(artifact.name)) node.artifactsMap.set(artifact.name, [])
            node.artifactsMap.get(artifact.name)!.push(artifact)
            node.artifacts.push(artifact)
            this.graph.artifacts.push(artifact)
        }

        // Ensure that there is only one default artifact per artifact name
        node.artifactsMap.forEach(artifacts => {
            const candidates = artifacts.filter(it => it.defaultAlternative)
            if (candidates.length > 1) throw new Error(`${artifacts[0].Display} has multiple defaults`)
        })
    }

    private populateTechnologies(node: Node, nodeTemplate: NodeTemplate) {
        if (check.isUndefined(nodeTemplate.technology)) return
        assert.isArray(nodeTemplate.technology, `Technologies of ${node.display} not normalized`)

        for (const [index, map] of nodeTemplate.technology.entries()) {
            const [name, raw] = utils.firstEntry(map)

            const technology = new Technology({
                name,
                raw,
                container: node,
                index,
            })
            technology.graph = this.graph

            node.technologies.push(technology)
            this.graph.technologies.push(technology)
        }

        // Ensure that there is only one default property per property name
        const candidates = node.technologies.filter(it => it.defaultAlternative)
        if (candidates.length > 1) {
            throw new Error(`${node.Display} has multiple default technologies`)
        }
    }

    // TODO: consider attributes?
    private populateProperties(element: PropertyContainer, template: PropertyContainerTemplate) {
        assert.isObject(template, `${element.Display} not normalized`)
        if (check.isUndefined(template.properties)) return

        assert.isArray(template.properties, `Properties of ${element.display} not normalized`)

        for (const [index, entry] of template.properties.entries()) {
            const [name, raw] = utils.firstEntry(entry)

            const property = new Property({
                name,
                container: element,
                index,
                raw,
            })

            property.graph = this.graph
            if (!element.propertiesMap.has(name)) element.propertiesMap.set(name, [])
            element.propertiesMap.get(name)!.push(property)
            element.properties.push(property)
            this.graph.properties.push(property)
        }

        // TODO: move this into the normalizer?
        /**
         * NOTE: we cant use node_property_presence: [string, string] anymore since property name is always ambiguous
         * however, this also never made sense in the first place if there is only a single property variant
         */
        if (this.graph.serviceTemplate?.topology_template?.variability?.options?.bratans_unknown !== true) {
            // Ensure that there is only one default property per property name
            element.propertiesMap.forEach(properties => {
                const alternative = properties.find(it => it.defaultAlternative)
                if (check.isDefined(alternative)) return

                const some = properties[0]
                assert.isDefined(some)

                /**
                 * Could use default value as defined in property definition
                 * But we do not utilize default values in property definitions in VDMM.
                 * They are still used once deployed since we remove VINTNER_UNDEFINED later.
                 */
                const raw = {
                    value: VINTNER_UNDEFINED,
                    default_alternative: true,
                    implied: true,
                    pruning: true,
                }

                const property = new Property({
                    name: some.name,
                    container: some.container,
                    index: properties.length,
                    raw,
                })

                property.graph = this.graph
                properties.push(property)
                element.properties.push(property)
                this.graph.properties.push(property)
                // Do not add it to this.graph.elements since this will happen later

                if (element.isRelation()) {
                    assert.isArray(element.relationship.raw.properties, `${element.Display} not normalized`)
                    element.relationship.raw.properties.push({[some.name]: raw})
                } else {
                    assert.isArray(element.raw.properties, `${element.Display} not normalized`)
                    element.raw.properties.push({[some.name]: raw})
                }
            })
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
        const groups = this.graph.serviceTemplate.topology_template?.groups
        if (check.isUndefined(groups)) return
        assert.isArray(groups, 'Groups not normalized')

        groups.forEach(map => {
            const [name, raw] = utils.firstEntry(map)
            if (this.graph.groupsMap.has(name)) throw new Error(`Group "${name}" defined multiple times`)

            const group = new Group({name, raw})
            group.graph = this.graph

            this.graph.groups.push(group)
            this.graph.groupsMap.set(name, group)

            raw.members.forEach(member => {
                let element: Node | Relation | undefined

                if (check.isString(member)) element = this.graph.getNode(member)
                if (check.isArray(member)) element = this.graph.getRelation(member)
                assert.isDefined(element, `Member "${utils.pretty(member)}" has bad format`)

                element.groups.push(group)
                group.members.push(element)
            })

            // Type
            this.populateTypes(group, raw)

            // Properties
            this.populateProperties(group, raw)
        })
    }

    private populatePolicies() {
        const policies = this.graph.serviceTemplate.topology_template?.policies
        if (check.isUndefined(policies)) return
        assert.isArray(policies, 'Policies not normalized')

        for (const [index, map] of policies.entries()) {
            const [name, raw] = utils.firstEntry(map)
            const policy = new Policy({name, raw, index})
            policy.graph = this.graph

            if (!this.graph.policiesMap.has(name)) this.graph.policiesMap.set(name, [])
            this.graph.policiesMap.get(name)!.push(policy)
            this.graph.policies.push(policy)

            raw.targets?.forEach(target => {
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
            this.populateTypes(policy, raw)

            // Properties
            this.populateProperties(policy, raw)
        }
    }

    /**
     * We only support simple consumers, i.e., directly accessed by properties
     */
    private populateConsumers() {
        for (const property of this.graph.properties) {
            const value = property.value
            if (!check.isObject(value) || check.isArray(value)) continue

            /**
             * CASE: get_input
             */
            if (check.isDefined(value.get_input)) {
                assert.isStringOrNumber(value.get_input)
                const input = this.graph.getInput(value.get_input)

                input.consumers.push(property)
                property.consuming.push(input)
                continue
            }

            const parsed = parseReference(value)
            if (utils.isEmpty(parsed)) continue
            assert.isDefined(parsed.propertyContainer)

            /**
             * CASE: get_{property,arttribute} and container is node, group, or policy
             */
            if (check.isUndefined(parsed.propertyContainerContainer)) {
                const element = this.graph.guessElement(parsed.propertyContainer, {element: property.container})
                if (!element.isNode() && !element.isGroup() && !element.isPolicy()) {
                    throw new Error(`${element.Display} is not a property container`)
                }

                property.consuming.push(element)
                continue
            }

            /**
             * CASE: get_{property,arttribute} and container is relation or artifact
             */
            if (check.isDefined(parsed.propertyContainerContainer)) {
                const node = this.graph.getNode(parsed.propertyContainerContainer, {element: property.container})

                // GUESS: relation is referenced
                const relations = node.outgoing.filter(it => it.name === parsed.propertyContainer).map(it => it.target)
                if (utils.isPopulated(relations)) {
                    property.consuming.push(...relations)
                    continue
                }

                // GUESS: artifact is referenced
                const artifacts = node.artifactsMap.get(parsed.propertyContainer) ?? []
                if (utils.isPopulated(artifacts)) {
                    property.consuming.push(...artifacts)
                    continue
                }

                throw new Error(
                    `Reference "${value}" at property ${property.display} did not find any relation or artifact.`
                )
            }

            throw new UnexpectedError()
        }
    }

    /**
     * CAUTION: We only support simple producers, i.e., directly accessing the property of a node
     */
    private populateProducers() {
        for (const output of this.graph.outputs) {
            const value = output.raw.value
            assert.isDefined(value)

            const parsed = parseReference(value)
            if (utils.isEmpty(parsed)) continue
            assert.isDefined(parsed.propertyContainer)

            // TODO: support this
            if (check.isDefined(parsed.propertyContainerContainer)) throw new NotImplementedError()

            /**
             * Find producers
             */
            const node = this.graph.getNode(parsed.propertyContainer)
            output.producers.push(node)
        }
    }
}

/**
 * CAUTION: We only support simple scenarios
 */
function parseReference(reference: string[] | string | PropertyAssignmentValue): {
    propertyContainerContainer?: string
    propertyContainer?: string
    property?: string
} {
    const isHash = check.isObject(reference) && !check.isArray(reference)

    /**
     * TOSCA syntax
     *
     * CAUTION: The parsing is limited to directly accessing element properties only
     */
    if (isHash && (check.isDefined(reference.get_property) || check.isDefined(reference.get_attribute))) {
        const value = reference.get_property ?? reference.get_attribute
        assert.isDefined(value)
        assert.isArray(value)
        value.forEach(it => assert.isString(it))

        if (value.length === 2) {
            const [propertyContainer, property] = value
            assert.isString(propertyContainer)
            assert.isString(property)

            return {propertyContainer, property}
        }

        if (value.length === 3) {
            const [propertyContainerContainer, propertyContainer, property] = value
            assert.isString(propertyContainerContainer)
            assert.isString(propertyContainer)
            assert.isString(property)

            return {propertyContainerContainer, propertyContainer, property}
        }
    }

    /**
     * Unfurl eval intrinsic function
     *
     * CAUTION: The parsing is limited to directly accessing node properties only
     */
    if (isHash && check.isDefined(reference.eval)) {
        assert.isString(reference.eval)

        const split = reference.eval.split('::')

        if (split.length === 2) {
            const [propertyContainer, property] = split
            return {propertyContainer, property}
        }
    }

    /**
     * Unfurl eval jinja filter
     *
     * CAUTION: The parsing is limited to directly accessing node properties only
     */
    if (check.isString(reference)) {
        const regex = new RegExp(/\{\{ ['"]::(?<node>.*)::(?<property>.*)['"] \| eval \}\}/)
        const found = reference.match(regex)

        // Might be hardcoded value
        if (check.isUndefined(found)) return {}

        const propertyContainer = found.groups!.node

        const property = found.groups!.property

        return {propertyContainer, property}
    }

    /**
     * Assume that there is not a reference. E.g., when using "concat"
     */
    return {}
}
