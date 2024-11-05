import * as assert from '#assert'
import * as check from '#check'
import Import from '#graph/import'
import Inheritance from '#graph/inheritance'
import {Options} from '#graph/options'
import Output from '#graph/output'
import {Populator} from '#graph/populator'
import Technology from '#graph/technology'
import {andify, generatify, simplify} from '#graph/utils'
import Normalizer from '#normalizer'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {TechnologyTemplateMap} from '#spec/technology-template'
import {
    ArtifactPropertyPresenceArguments,
    ArtifactTypePresenceArguments,
    GroupPropertyPresenceArguments,
    GroupTypePresenceArguments,
    LogicExpression,
    NodePropertyPresenceArguments,
    NodeTypePresenceArguments,
    PolicyPropertyPresenceArguments,
    PolicyTypePresenceArguments,
    RelationPropertyPresenceArguments,
    RelationTypePresenceArguments,
    TechnologyPresenceArguments,
} from '#spec/variability'
import {TechnologyPlugin} from '#technologies/types'
import * as utils from '#utils'
import Artifact from './artifact'
import Element from './element'
import Group from './group'
import Input from './input'
import Node from './node'
import Policy from './policy'
import Property from './property'
import Relation, {Relationship} from './relation'
import Type from './type'

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

    _options?: Options
    set options(options: Options) {
        assert.isUndefined(this._options, 'Options already defined')
        this._options = options
    }

    get options() {
        assert.isDefined(this._options, 'Options not defined')
        return this._options
    }

    elements: Element[] = []

    types: Type[] = []
    inheritance: Inheritance

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
    inputsMap = new Map<string, Input[]>()

    outputs: Output[] = []
    outputsMap = new Map<string, Output[]>()

    artifacts: Artifact[] = []

    imports: Import[] = []

    technologies: Technology[] = []

    constraints: LogicExpression[] = []

    plugins: {technology: TechnologyPlugin[]} = {technology: []}

    constructor(serviceTemplate: ServiceTemplate, options: {nope: boolean} = {nope: false}) {
        this.serviceTemplate = serviceTemplate

        /**
         * Ensure supported TOSCA version
         */
        if (
            ![
                TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
                TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
                TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0_RC_1,
                TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0_RC_2,
                TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0_RC_3,
            ].includes(this.serviceTemplate.tosca_definitions_version)
        )
            throw new Error('Unsupported TOSCA definitions version')

        /**
         * Inheritance
         */
        this.inheritance = new Inheritance(this)

        /**
         * Normalizer
         */
        new Normalizer(this.serviceTemplate).run()

        /**
         * Populator
         */
        new Populator(this, options).run()
    }

    getNode(name: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET', context: Context = {}): Node {
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

        if (name === 'TARGET') {
            const relation = context.element
            assert.isRelation(relation)
            return relation.target
        }

        if (name === 'SOURCE') {
            const relation = context.element
            assert.isRelation(relation)
            return relation.source
        }

        const node = this.nodesMap.get(name)
        assert.isDefined(node, `Node "${name}" not found`)
        return node
    }

    getNodeType(data: NodeTypePresenceArguments, context: Context = {}): Type {
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

    getRelationType(data: RelationTypePresenceArguments, context: Context = {}): Type {
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

    getGroupType(data: GroupTypePresenceArguments, context: Context = {}): Type {
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

    getPolicyType(data: PolicyTypePresenceArguments, context: Context = {}): Type {
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

    getArtifactType(data: ArtifactTypePresenceArguments, context: Context = {}): Type {
        assert.isString(data[0])
        assert.isStringOrNumber(data[1])
        assert.isStringOrNumber(data[2])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isType(element)
            return element
        }

        const artifact = this.getArtifact([data[0], data[1]], {element: context.element})
        return this.getType(artifact, data)
    }

    private getType(container: Node | Relation | Group | Policy | Artifact, data: (string | number)[]): Type {
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

    getContainer(element?: Element): Element {
        assert.isDefined(element, `Element is not defined`)
        const container = element.container
        assert.isDefined(container, `${element.Display} has no container`)
        return container
    }

    getRelation(member: [string, string | number] | 'SELF' | 'CONTAINER', context: Context = {}): Relation {
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
        const node = this.getNode(member[0], context)

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

    getGroup(name: string | 'SELF' | 'CONTAINER', context: Context = {}): Group {
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

    getPolicy(element: string | number | 'SELF' | 'CONTAINER', context: Context = {}): Policy {
        assert.isStringOrNumber(element)

        if (check.isDefined(context.cached)) {
            const cached = context.cached
            assert.isPolicy(cached)
            return cached
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

    getArtifact(member: [string, string | number] | 'SELF' | 'CONTAINER', context: Context = {}): Artifact {
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

    getImport(index: number | 'SELF' | 'CONTAINER', context: Context = {}): Import {
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

    getNodeProperty(data: NodePropertyPresenceArguments, context: Context = {}): Property {
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

    getRelationProperty(data: RelationPropertyPresenceArguments, context: Context = {}): Property {
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

    getGroupProperty(data: GroupPropertyPresenceArguments, context: Context = {}): Property {
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

    getPolicyProperty(data: PolicyPropertyPresenceArguments, context: Context = {}): Property {
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

    getArtifactProperty(data: ArtifactPropertyPresenceArguments, context: Context = {}): Property {
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

    getInput(name: string | number, context: Context = {}): Input {
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

        assert.isStringOrNumber(name)

        let input

        if (check.isString(name)) {
            const inputs = this.inputsMap.get(name) || []
            if (inputs.length > 1) throw new Error(`Input "${name}" is ambiguous`)
            input = inputs[0]
        }

        if (check.isNumber(name)) input = this.inputs[name]

        assert.isDefined(input, `Input "${name}" not found`)
        return input
    }

    getOutput(name: string | number, context: Context = {}): Output {
        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isOutput(element)
            return element
        }

        if (name === 'SELF') {
            assert.isOutput(context.element)
            return context.element
        }

        if (name === 'CONTAINER') {
            const container = this.getContainer(context.element)
            assert.isOutput(container)
            return container
        }

        assert.isStringOrNumber(name)

        let output

        if (check.isString(name)) {
            const outputs = this.outputsMap.get(name) || []
            if (outputs.length > 1) throw new Error(`Output "${name}" is ambiguous`)
            output = outputs[0]
        }

        if (check.isNumber(name)) output = this.outputs[name]

        assert.isDefined(output, `Output "${name}" not found`)
        return output
    }

    getTechnology(data: TechnologyPresenceArguments, context: Context = {}): Technology {
        assert.isArray(data)
        assert.isString(data[0])
        assert.isStringOrNumber(data[1])

        if (check.isDefined(context.cached)) {
            const element = context.cached
            assert.isTechnology(element)
            return element
        }

        const node = this.getNode(data[0], context)

        let technology

        // [string, string]
        if (check.isString(data[1])) {
            const technologies = node.technologies.filter(it => it.name === data[1])
            if (technologies.length > 1) throw new Error(`Technology "${utils.pretty(data)}" is ambiguous`)
            technology = technologies[0]
        }

        // [string, number]
        if (check.isNumber(data[1])) {
            technology = node.technologies[data[1]]
        }

        assert.isDefined(technology, `Technology "${utils.pretty(data)} not found`)
        return technology
    }

    getTypeSpecificConditions() {
        const conditions = this.serviceTemplate.topology_template?.variability?.type_specific_conditions
        if (check.isString(conditions)) throw new Error(`Type-specific definitions not loaded`)
        return conditions
    }

    addConstraint(constraint: LogicExpression) {
        assert.isDefined(this.serviceTemplate.topology_template, 'Service template has no topology template')

        if (check.isUndefined(this.serviceTemplate.topology_template.variability))
            this.serviceTemplate.topology_template.variability = {}

        if (check.isUndefined(this.serviceTemplate.topology_template.variability.constraints))
            this.serviceTemplate.topology_template.variability.constraints = []

        this.serviceTemplate.topology_template.variability.constraints.push(constraint)
    }

    addTechnology(node: Node, map: TechnologyTemplateMap) {
        if (check.isUndefined(node.raw.technology)) node.raw.technology = []
        assert.isArray(node.raw.technology, `Technology of ${node.display} not normalized`)

        const [technology, template] = utils.firstEntry(map)

        // Normalize
        template.conditions = check.isArray(template.conditions)
            ? simplify(andify(template.conditions))
            : template.conditions

        // Generatify
        template.conditions = check.isDefined(template.conditions) ? generatify(template.conditions) : undefined

        node.raw.technology.push({
            [technology]: {conditions: template.conditions, weight: template.weight, assign: template.assign},
        })
    }

    replaceTechnologies(node: Node, maps: TechnologyTemplateMap[]) {
        node.raw.technology = maps
    }

    regenerate() {
        return new Graph(this.serviceTemplate)
    }
}
