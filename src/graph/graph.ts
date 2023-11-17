import * as assert from '#assert'
import * as check from '#check'
import Import from '#graph/import'
import {Options} from '#graph/options'
import {Populator} from '#graph/populator'
import Normalizer from '#normalizer'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {
    ArtifactPropertyPresenceArguments,
    GroupPropertyPresenceArguments,
    GroupTypePresenceArguments,
    LogicExpression,
    NodePropertyPresenceArguments,
    NodeTypePresenceArguments,
    PolicyPropertyPresenceArguments,
    PolicyTypePresenceArguments,
    RelationPropertyPresenceArguments,
    RelationTypePresenceArguments,
} from '#spec/variability'
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

    constraints: LogicExpression[] = []

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate

        if (
            ![
                TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
                TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            ].includes(this.serviceTemplate.tosca_definitions_version)
        )
            throw new Error('Unsupported TOSCA definitions version')

        new Normalizer(serviceTemplate).run()

        new Populator(this).run()
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
