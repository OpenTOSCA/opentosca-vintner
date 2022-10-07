import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '../../specification/service-template'
import {InputAssignmentMap} from '../../specification/topology-template'
import {Instance} from '../../repository/instances'
import * as files from '../../utils/files'
import {InputAssignmentPreset, VariabilityExpression} from '../../specification/variability'
import * as utils from '../../utils/utils'
import * as validator from '../../utils/validator'
import {GroupMember, TOSCA_GROUP_TYPES} from '../../specification/group-type'
import {listIsEmpty, prettyJSON} from '../../utils/utils'

export type TemplateResolveArguments = {
    instance?: string
    template?: string
    preset?: string
    inputs?: string
    output?: string
} & ResolvingOptions

export type ResolvingOptions = {
    pruneRelations?: boolean
    forcePruneRelations?: boolean
    pruneNodes?: boolean
    forcePruneNodes?: boolean
    disableConsistencyCheck?: boolean
    disableRelationSourceConsistencyCheck?: boolean
    disableRelationTargetConsistencyCheck?: boolean
    disableMaximumHostingConsistencyCheck?: boolean
    disableExpectedHostingConsistencyCheck?: boolean
}

export default async function (options: TemplateResolveArguments) {
    let instance: Instance | undefined
    if (options.instance) instance = new Instance(options.instance)

    let template = options.template
    if (instance) template = instance.getVariableServiceTemplatePath()
    if (!template) throw new Error('Either instance or template must be set')

    let output = options.output
    if (instance) output = instance.generateServiceTemplatePath()
    if (!output) throw new Error('Either instance or output must be set')

    // Load service template
    const serviceTemplate = files.loadYAML<ServiceTemplate>(template)
    const resolver = new VariabilityResolver(serviceTemplate)
        .setVariabilityPreset(options.preset)
        .setVariabilityInputs(
            options.inputs
                ? options.inputs.endsWith('.xml')
                    ? await files.loadFeatureIDEConfiguration(options.inputs)
                    : files.loadYAML<InputAssignmentMap>(options.inputs)
                : {}
        )
        .setOptions(options)

    // Ensure correct TOSCA definitions version
    resolver.ensureCompatibility()

    // Resolve variability
    resolver.resolve()

    // Check consistency
    if (!options.disableConsistencyCheck) resolver.checkConsistency()

    // Transform to TOSCA compliant format
    resolver.transformInPlace()

    files.storeYAML(output, serviceTemplate)
}

type ConditionalElementBase = {
    type: 'node' | 'relation' | 'input' | 'policy' | 'group'
    name: string
    present?: boolean
    conditions: VariabilityExpression[]
}

type Input = ConditionalElementBase & {
    type: 'input'
}

type Node = ConditionalElementBase & {
    type: 'node'
    ingoing: Relation[]
    outgoing: Relation[]
    groups: Group[]
}

type Relation = ConditionalElementBase & {
    type: 'relation'
    source: string
    target: string
    groups: Group[]
}

type Policy = ConditionalElementBase & {
    type: 'policy'
}

type Group = ConditionalElementBase & {
    type: 'group'
    variability: boolean
}

type ConditionalElement = Input | Node | Relation | Policy | Group

type VariabilityExpressionContext = {
    element?: ConditionalElement
}

export class VariabilityResolver {
    private readonly _serviceTemplate: ServiceTemplate

    private _variabilityInputs?: InputAssignmentMap
    private options: ResolvingOptions = {}

    private nodes: Node[] = []
    private nodesMap = new Map<string, Node>()

    private relations: Relation[] = []
    private relationshipsMap = new Map<string, Relation[]>()

    private policies: Policy[] = []

    private groups: Group[] = []
    private groupsMap = new Map<string, Group>()

    private inputs: Input[] = []
    private inputsMap = new Map<string, Input>()

    constructor(serviceTemplate: ServiceTemplate) {
        this._serviceTemplate = serviceTemplate

        // Deployment inputs
        Object.entries(serviceTemplate?.topology_template?.inputs || {}).forEach(([name, definition]) => {
            const input: Input = {
                type: 'input',
                name,
                conditions: utils.toList(definition.conditions),
            }
            this.inputs.push(input)
            this.inputsMap.set(name, input)
        })

        // Relationship templates
        Object.keys(serviceTemplate.topology_template?.relationship_templates || {}).forEach(name =>
            this.relationshipsMap.set(name, [])
        )

        // Node templates
        Object.entries(serviceTemplate.topology_template?.node_templates || {}).forEach(([nodeName, nodeTemplate]) => {
            const node: Node = {
                type: 'node',
                name: nodeName,
                conditions: utils.toList(nodeTemplate.conditions),
                ingoing: [],
                outgoing: [],
                groups: [],
            }
            this.nodes.push(node)
            this.nodesMap.set(nodeName, node)

            nodeTemplate.requirements?.forEach(map => {
                const relationName = utils.firstKey(map)
                const assignment = map[relationName]
                const target = validator.isString(assignment) ? assignment : assignment.node
                const conditions = validator.isString(assignment) ? [] : utils.toList(assignment.conditions)

                const relation: Relation = {
                    type: 'relation',
                    name: relationName,
                    source: nodeName,
                    target,
                    conditions,
                    groups: [],
                }
                this.relations.push(relation)
                node.outgoing.push(relation)

                if (!validator.isString(assignment)) {
                    if (validator.isString(assignment.relationship)) {
                        const relationship = this.relationshipsMap.get(assignment.relationship)
                        validator.ensureDefined(
                            relationship,
                            `Relationship "${assignment.relationship}" of relation "${relationName}" of node "${nodeName}" does not exist!`
                        )
                        relationship.push(relation)
                    }
                }
            })
        })

        // Assign ingoing relations to nodes
        this.relations.forEach(relation => {
            const node = this.nodesMap.get(relation.target)
            validator.ensureDefined(node, `Target "${relation.target}" of "${relation.name}" does not exist`)
            node.ingoing.push(relation)
        })

        // Ensure that each relationship is at least used in one relation
        for (const relationship of this.relationshipsMap) {
            if (relationship[1].length === 0) throw new Error(`Relationship "${relationship[0]}" is never used`)
        }

        // Policies
        serviceTemplate.topology_template?.policies?.forEach(map => {
            const name = utils.firstKey(map)
            const template = map[name]
            const policy: Policy = {
                type: 'policy',
                name,
                conditions: utils.toList(template.conditions),
            }
            this.policies.push(policy)
        })

        // Groups
        Object.entries(serviceTemplate.topology_template?.groups || {}).forEach(([name, template]) => {
            const group: Group = {
                type: 'group',
                name,
                conditions: utils.toList(template.conditions),
                variability: [
                    TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_ROOT,
                    TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_CONDITIONAL_MEMBERS,
                ].includes(template.type),
            }
            this.groups.push(group)
            this.groupsMap.set(name, group)

            template.members.forEach(member => {
                const element = this.getElement(member)
                element.groups.push(group)
            })
        })
    }

    getElement(member: GroupMember): Node | Relation {
        if (validator.isString(member)) return this.getNode(member)
        if (validator.isArray(member)) return this.getRelation(member)
        throw new Error(`Member "${prettyJSON(member)}" has bad format`)
    }

    getNode(member: string) {
        const node = this.nodesMap.get(member)
        validator.ensureDefined(node, `Node "${prettyJSON(member)}" not found`)
        return node
    }

    getRelation(member: [string, string] | [string, number]) {
        let relation
        const node = this.getNode(member[0])

        // Element is [node name, relation name]
        if (validator.isString(member[1])) relation = node.outgoing.find(relation => relation.name === member[1])

        // Element is [node name, relation index]
        if (validator.isNumber(member[1])) relation = node.outgoing[member[1]]

        validator.ensureDefined(relation, `Relation "${prettyJSON(member)}" not found`)
        return relation
    }

    resolve() {
        for (const node of this.nodes) this.checkPresence(node)
        for (const relation of this.relations) this.checkPresence(relation)
        for (const input of this.inputs) this.checkPresence(input)
        for (const group of this.groups) this.checkPresence(group)
        for (const policy of this.policies) this.checkPresence(policy)
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

        // Prune Relation: Assign default condition to relation that checks if source is present
        // Force Prune Relation: Ignore any assigned conditions and assign condition to relation that checks if source is present
        if (
            element.type === 'relation' &&
            ((this.options.pruneRelations && listIsEmpty(conditions)) || this.options.forcePruneRelations)
        ) {
            conditions = [{get_element_presence: element.source}]
        }

        // Prune Node: Assign default condition to node that checks if any ingoing relation is present
        // Force Prune Node: Ignore any assigned conditions and assign condition to node that checks if any ingoing relation is present
        if (
            element.type === 'node' &&
            ((this.options.pruneNodes && listIsEmpty(conditions)) || this.options.forcePruneNodes)
        ) {
            conditions = [
                {
                    or: listIsEmpty(element.ingoing)
                        ? [true]
                        : element.ingoing.map(relation => ({get_element_presence: [relation.source, relation.name]})),
                },
            ]
        }

        // Evaluate assigned conditions
        const present = conditions.every(condition => this.evaluateVariabilityCondition(condition, {element}))
        element.present = present

        return present
    }

    checkConsistency() {
        const relations = this.relations.filter(relation => relation.present)
        const nodes = this.nodes.filter(node => node.present)

        // Ensure that each relation source exists
        if (!this.options.disableRelationSourceConsistencyCheck) {
            for (const relation of relations) {
                if (!this.nodesMap.get(relation.source)?.present)
                    throw new Error(
                        `Relation source "${relation.source}" of relation "${relation.name}" does not exist`
                    )
            }
        }

        // Ensure that each relation target exists
        if (!this.options.disableRelationTargetConsistencyCheck) {
            for (const relation of relations) {
                if (!this.nodesMap.get(relation.target)?.present)
                    throw new Error(
                        `Relation target "${relation.target}" of relation "${relation.name}" does not exist`
                    )
            }
        }

        // Ensure that every component has at maximum one hosting relation
        if (!this.options.disableMaximumHostingConsistencyCheck) {
            for (const node of nodes) {
                const relations = node.outgoing.filter(
                    relation => relation.source === node.name && relation.name === 'host' && relation.present
                )
                if (relations.length > 1) throw new Error(`Node "${node.name}" has more than one hosting relations`)
            }
        }

        // Ensure that every component that had a hosting relation previously still has one
        if (!this.options.disableExpectedHostingConsistencyCheck) {
            for (const node of nodes) {
                const relations = node.outgoing.filter(
                    relation => relation.source === node.name && relation.name === 'host'
                )

                if (relations.length !== 0 && !relations.some(relation => relation.present))
                    throw new Error(`Node "${node.name}" requires a hosting relation`)
            }
        }
        return this
    }

    transformInPlace() {
        // Set TOSCA definitions version
        this._serviceTemplate.tosca_definitions_version = TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3

        // Delete variability definition
        delete this._serviceTemplate.topology_template?.variability

        // Delete node templates which are not present
        Object.entries(this._serviceTemplate.topology_template?.node_templates || {}).forEach(
            ([nodeName, nodeTemplate]) => {
                const node = this.getNode(nodeName)
                if (node.present) {
                    delete this._serviceTemplate.topology_template!.node_templates![nodeName].conditions
                } else {
                    delete this._serviceTemplate.topology_template!.node_templates![nodeName]
                }

                // Delete requirement assignment which are not present
                nodeTemplate.requirements = nodeTemplate.requirements?.filter((map, index) => {
                    const assignment = utils.firstValue(map)
                    if (!validator.isString(assignment)) delete assignment.conditions
                    return node.outgoing[index].present
                })
            }
        )

        // Delete all relationship templates which have no present relations
        Object.keys(this._serviceTemplate.topology_template?.relationship_templates || {}).forEach(name => {
            const relationship = this.relationshipsMap.get(name)
            validator.ensureDefined(relationship, `Relationship "${name}" not found`)

            if (relationship.every(relation => !relation.present))
                delete this._serviceTemplate.topology_template!.relationship_templates![name]
        })

        // Delete all groups which are not present
        this.groups.forEach(group => {
            if (group.present) {
                const template = this._serviceTemplate.topology_template!.groups![group.name]
                template.members = template.members.filter(member => {
                    const element = this.getElement(member)
                    validator.ensureDefined(element, `Group member "${member}" of group "${group.name}" does not exist`)
                    return element.present
                })
                delete this._serviceTemplate.topology_template!.groups![group.name].conditions
            } else {
                delete this._serviceTemplate.topology_template!.groups![group.name]
            }
        })

        // Delete all topology template inputs which are not present
        this.inputs.forEach(input => {
            if (input.present) {
                delete this._serviceTemplate.topology_template!.inputs![input.name].conditions
            } else {
                delete this._serviceTemplate.topology_template!.inputs![input.name]
            }
        })

        // Delete all policy templates which are not present
        if (validator.isDefined(this._serviceTemplate?.topology_template?.policies)) {
            this._serviceTemplate.topology_template!.policies =
                this._serviceTemplate.topology_template!.policies.filter((map, index) => {
                    const name = utils.firstKey(map)
                    const policy = this.policies[index]
                    const template = map[name]
                    // Sanity check
                    if (name !== policy.name)
                        throw new Error(`Somehow index of policies do not match! ${prettyJSON({name, policy, index})}`)

                    if (policy.present) {
                        delete template.conditions
                        template.targets = template.targets?.filter(target => {
                            const node = this.nodesMap.get(target)
                            if (validator.isDefined(node)) return node.present

                            const group = this.groupsMap.get(target)
                            if (validator.isDefined(group)) return group.present

                            throw new Error(
                                `Policy target "${target}" of policy template "${policy.name}" is neither a node template nor a group template`
                            )
                        })
                    }
                    return policy.present
                })
        }

        return this._serviceTemplate
    }

    ensureCompatibility() {
        if (
            ![
                TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
                TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            ].includes(this._serviceTemplate.tosca_definitions_version)
        )
            throw new Error('Unsupported TOSCA definitions version')
    }

    setVariabilityPreset(name?: string) {
        if (validator.isUndefined(name)) return this
        this._variabilityInputs = this.getVariabilityPreset(name).inputs
        return this
    }

    setVariabilityInputs(inputs: InputAssignmentMap) {
        this._variabilityInputs = {...this._variabilityInputs, ...inputs}
        return this
    }

    setOptions(options: ResolvingOptions) {
        this.options = options
        return this
    }

    getVariabilityInput(name: string) {
        const input = this._variabilityInputs?.[name]
        validator.ensureDefined(input, `Did not find variability input "${name}"`)
        return input
    }

    getVariabilityPreset(name: string) {
        const set: InputAssignmentPreset | undefined = (this._serviceTemplate.topology_template?.variability?.presets ||
            {})[name]
        validator.ensureDefined(set, `Did not find variability set "${name}"`)
        return set
    }

    getVariabilityExpression(name: string) {
        const condition: VariabilityExpression | undefined = (this._serviceTemplate.topology_template?.variability
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

        if (validator.isDefined(condition.get_element_presence)) {
            let member: GroupMember
            if (validator.isArray(condition.get_element_presence)) {
                const first = this.evaluateVariabilityExpression(condition.get_element_presence[0], context)
                validator.ensureString(first)

                const second = this.evaluateVariabilityExpression(condition.get_element_presence[1], context)
                validator.ensureStringOrNumber(second)

                member = [first, second]
            } else {
                const result = this.evaluateVariabilityExpression(condition.get_element_presence, context)
                validator.ensureString(result)
                member = result
            }

            return this.checkPresence(this.getElement(member))
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

        throw new Error(`Unknown variability condition "${prettyJSON(condition)}"`)
    }
}
