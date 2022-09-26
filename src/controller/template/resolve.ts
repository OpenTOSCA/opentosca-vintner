import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '../../specification/service-template'
import {InputAssignmentMap} from '../../specification/topology-template'
import {Instance} from '../../repository/instances'
import * as files from '../../utils/files'
import {VariabilityExpression} from '../../specification/variability'
import * as utils from '../../utils/utils'
import * as validator from '../../utils/validator'
import {GroupMember, TOSCA_GROUP_TYPES} from '../../specification/group-type'
import {listIsEmpty} from '../../utils/utils'

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
    disableConsistencyCheck?: boolean
    disableRelationSourceConsistencyCheck?: boolean
    disableRelationTargetConsistencyCheck?: boolean
    disableMaximumHostingConsistencyCheck?: boolean
    disableExpectedHostingConsistencyCheck?: boolean
}

export default function (options: TemplateResolveArguments) {
    let instance: Instance | undefined
    if (options.instance) instance = new Instance(options.instance)

    let template = options.template
    if (instance) template = instance.getVariableServiceTemplatePath()
    if (!template) throw new Error('Either instance or template must be set')

    let output = options.output
    if (instance) output = instance.generateServiceTemplatePath()
    if (!output) throw new Error('Either instance or output must be set')

    // Load service template
    const serviceTemplate = files.loadFile<ServiceTemplate>(template)
    const resolver = new VariabilityResolver(serviceTemplate)
        .setVariabilityPreset(options.preset)
        .setVariabilityInputs(options.inputs ? files.loadFile<InputAssignmentMap>(options.inputs) : {})
        .setOptions(options)

    // Ensure correct TOSCA definitions version
    resolver.ensureCompatibility()

    // Resolve variability
    resolver.resolve()

    // Check consistency
    if (!options.disableConsistencyCheck) resolver.checkConsistency()

    // Transform to TOSCA compliant format
    resolver.transformInPlace()

    files.storeFile(output, serviceTemplate)
}

type ConditionalElementBase = {
    name: string
    present?: boolean
    conditions: VariabilityExpression[]
    groups: Group[]
}

type Input = ConditionalElementBase

type Node = ConditionalElementBase & {
    relations: Relation[]
}

type Relation = ConditionalElementBase & {
    source: string
    target: string
}

type Group = {
    name: string
    conditions: VariabilityExpression[]
}

type ConditionalElement = Input | Node | Relation

export class VariabilityResolver {
    private readonly _serviceTemplate: ServiceTemplate

    private _variabilityInputs?: InputAssignmentMap
    private options: ResolvingOptions = {}

    private nodes: Node[] = []
    private nodesMap: {[name: string]: Node} = {}

    private relations: Relation[] = []
    private relationships: {[name: string]: Relation[]} = {}

    private inputs: Input[] = []
    private inputsMap: {[name: string]: Input} = {}

    constructor(serviceTemplate: ServiceTemplate) {
        this._serviceTemplate = serviceTemplate

        Object.entries(serviceTemplate?.topology_template?.inputs || {}).forEach(([name, definition]) => {
            const input: Input = {
                name,
                conditions: utils.toList(definition.conditions),
                groups: [],
            }
            this.inputs.push(input)
            this.inputsMap[name] = input
        })

        Object.keys(serviceTemplate.topology_template?.relationship_templates || {}).forEach(
            name => (this.relationships[name] = [])
        )

        Object.entries(serviceTemplate.topology_template?.node_templates || {}).forEach(([nodeName, nodeTemplate]) => {
            const node: Node = {
                name: nodeName,
                conditions: utils.toList(nodeTemplate.conditions),
                relations: [],
                groups: [],
            }
            this.nodes.push(node)
            this.nodesMap[nodeName] = node

            nodeTemplate.requirements?.forEach(map => {
                const relationName = utils.firstKey(map)
                const assignment = utils.firstValue(map)
                const target = validator.isString(assignment) ? assignment : assignment.node
                const conditions = validator.isString(assignment) ? [] : utils.toList(assignment.conditions)

                const relation: Relation = {
                    name: relationName,
                    source: nodeName,
                    target,
                    conditions,
                    groups: [],
                }
                this.relations.push(relation)
                node.relations.push(relation)

                if (!validator.isString(assignment)) {
                    if (validator.isString(assignment.relationship)) {
                        const relationship = this.relationships[assignment.relationship]
                        if (validator.isUndefined(relationship))
                            throw new Error(
                                `Relationship "${assignment.relationship}" of relation "${relationName}" of node "${nodeName}" does not exist!`
                            )

                        relationship.push(relation)
                    }
                }
            })
        })

        // Ensure that each relationship is at least used in one relation
        for (const relationship of Object.entries(this.relationships)) {
            if (relationship[1].length === 0) throw new Error(`Relationship "${relationship[0]}" is never used`)
        }

        Object.entries(serviceTemplate.topology_template?.groups || {}).forEach(([groupName, groupTemplate]) => {
            if (groupTemplate.conditions === undefined) return

            const group: Group = {
                name: groupName,
                conditions: utils.toList(groupTemplate.conditions),
            }

            groupTemplate.members.forEach(member => {
                if (validator.isString(member)) {
                    this.nodesMap[member]?.groups.push(group)
                } else {
                    if (validator.isString(member[1])) {
                        this.nodesMap[member[0]]?.relations.forEach(relation => {
                            if (relation.name === member[1]) relation.groups.push(group)
                        })
                    }

                    if (validator.isNumber(member[1])) {
                        this.nodesMap[member[0]]?.relations[member[1]]?.groups.push(group)
                    }
                }
            })
        })
    }

    getElement(member: GroupMember) {
        if (validator.isString(member)) return this.nodesMap[member]
        return this.nodesMap[member[0]].relations[member[1]]
    }

    resolve() {
        for (const node of this.nodes) this.checkPresence(node)
        for (const relation of this.relations) this.checkPresence(relation)
        for (const input of this.inputs) this.checkPresence(input)
        return this
    }

    checkPresence(element: ConditionalElement) {
        // Check if presence already has been evaluated
        if (validator.hasProperty(element, 'present')) return element.present

        // Collect assigned conditions
        let conditions = element.conditions
        element.groups.forEach(group => conditions.push(...group.conditions))
        conditions = utils.filterNotNull<VariabilityExpression>(conditions)

        // Prune Relation: Assign default condition to relation that checks if source is present
        if (this.options.pruneRelations && listIsEmpty(conditions) && validator.hasProperty(element, 'source')) {
            conditions = [{get_element_presence: element.source}]
        }

        // Force Prune Relation: Override any assigned conditions if relation should be pruned along with the source
        if (this.options.forcePruneRelations && validator.hasProperty(element, 'source')) {
            conditions = [{get_element_presence: element.source}]
        }

        // Evaluate assigned conditions
        const present = conditions.every(condition => this.evaluateVariabilityCondition(condition))
        element.present = present

        return present
    }

    checkConsistency() {
        const relations = this.relations.filter(relation => relation.present)
        const nodes = this.nodes.filter(node => node.present)

        // Ensure that each relation source exists
        if (!this.options.disableRelationSourceConsistencyCheck) {
            for (const relation of relations) {
                if (!this.nodesMap[relation.source]?.present)
                    throw new Error(
                        `Relation source "${relation.source}" of relation "${relation.name}" does not exist`
                    )
            }
        }

        // Ensure that each relation target exists
        if (!this.options.disableRelationTargetConsistencyCheck) {
            for (const relation of relations) {
                if (!this.nodesMap[relation.target]?.present)
                    throw new Error(
                        `Relation target "${relation.target}" of relation "${relation.name}" does not exist`
                    )
            }
        }

        // Ensure that every component has at maximum one hosting relation
        if (!this.options.disableMaximumHostingConsistencyCheck) {
            for (const node of nodes) {
                const relations = node.relations.filter(
                    relation => relation.source === node.name && relation.name === 'host' && relation.present
                )
                if (relations.length > 1) throw new Error(`Node "${node.name}" has more than one hosting relations`)
            }
        }

        // Ensure that every component that had a hosting relation previously still has one
        if (!this.options.disableExpectedHostingConsistencyCheck) {
            for (const node of nodes) {
                const relations = node.relations.filter(
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
                const node = this.nodesMap[nodeName]
                if (node.present) {
                    delete this._serviceTemplate.topology_template.node_templates[nodeName].conditions
                } else {
                    delete this._serviceTemplate.topology_template.node_templates[nodeName]
                }

                // Delete requirement assignment which are not present
                nodeTemplate.requirements = nodeTemplate.requirements?.filter((map, index) => {
                    const assignment = utils.firstValue(map)
                    if (!validator.isString(assignment)) delete assignment.conditions
                    return node.relations[index].present
                })
            }
        )

        // Delete all relationship templates which have no present relations
        Object.keys(this._serviceTemplate.topology_template?.relationship_templates || {}).forEach(name => {
            if (this.relationships[name].every(relation => !relation.present))
                delete this._serviceTemplate.topology_template.relationship_templates[name]
        })

        // Delete all variability groups
        Object.entries(this._serviceTemplate.topology_template?.groups || {}).forEach(([name, template]) => {
            if (
                [TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_ROOT, TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_CONDITIONAL].includes(
                    template.type
                )
            )
                delete this._serviceTemplate.topology_template?.groups[name]
        })

        // Delete all topology template inputs which are not present
        this.inputs.forEach(input => {
            if (input.present) {
                delete this._serviceTemplate.topology_template.inputs[input.name].conditions
            } else {
                delete this._serviceTemplate.topology_template.inputs[input.name]
            }
        })

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
        if (validator.isUndefined(input)) throw new Error(`Did not find variability input ${name}`)
        return input
    }

    getVariabilityPreset(name: string) {
        const set = this._serviceTemplate.topology_template?.variability?.presets[name]
        if (validator.isUndefined(set)) throw new Error(`Did not find variability set ${name}`)
        return set
    }

    getVariabilityExpression(name: string) {
        const condition = this._serviceTemplate.topology_template?.variability?.expressions[name]
        if (validator.isUndefined(condition)) throw new Error(`Did not find variability expression ${name}`)
        return condition
    }

    evaluateVariabilityCondition(condition: VariabilityExpression): boolean {
        const result = this.evaluateVariabilityExpression(condition)
        validator.ensureBoolean(result)
        return result
    }

    evaluateVariabilityExpression(condition: VariabilityExpression): boolean | string | number {
        if (validator.isObject(condition)) {
            if (validator.hasProperty(condition, 'cached_result')) return condition.cached_result
            const result = this.evaluateVariabilityExpressionRunner(condition)
            condition.cached_result = result
            return result
        }

        return this.evaluateVariabilityExpressionRunner(condition)
    }

    evaluateVariabilityExpressionRunner(condition: VariabilityExpression): boolean | string | number {
        if (validator.isUndefined(condition)) throw new Error(`Received condition that is undefined or null`)
        if (validator.isString(condition)) return condition
        if (validator.isBoolean(condition)) return condition
        if (validator.isNumber(condition)) return condition

        if (validator.hasProperty(condition, 'and')) {
            return condition.and.every(element => {
                const value = this.evaluateVariabilityExpression(element)
                validator.ensureBoolean(value)
                return value
            })
        }

        if (validator.hasProperty(condition, 'or')) {
            return condition.or.some(element => {
                const value = this.evaluateVariabilityExpression(element)
                validator.ensureBoolean(value)
                return value
            })
        }

        if (validator.hasProperty(condition, 'not')) {
            const value = this.evaluateVariabilityExpression(condition.not)
            validator.ensureBoolean(value)
            return !value
        }

        if (validator.hasProperty(condition, 'xor')) {
            return (
                condition.xor.reduce((count: number, element) => {
                    const value = this.evaluateVariabilityExpression(element)
                    validator.ensureBoolean(value)
                    if (value) count++
                    return count
                }, 0) === 1
            )
        }

        if (validator.hasProperty(condition, 'implies')) {
            const first = this.evaluateVariabilityExpression(condition.implies[0])
            validator.ensureBoolean(first)

            const second = this.evaluateVariabilityExpression(condition.implies[1])
            validator.ensureBoolean(first)

            return first ? second : true
        }

        if (validator.hasProperty(condition, 'add')) {
            return condition.add.reduce<number>((sum, element) => {
                const value = this.evaluateVariabilityExpression(element)
                validator.ensureNumber(value)
                return sum + value
            }, 0)
        }

        if (validator.hasProperty(condition, 'sub')) {
            const first = this.evaluateVariabilityExpression(condition.sub[0])
            validator.ensureNumber(first)

            return condition.sub.slice(1).reduce<number>((difference, element) => {
                const value = this.evaluateVariabilityExpression(element)
                validator.ensureNumber(value)
                return difference - value
            }, first)
        }

        if (validator.hasProperty(condition, 'mul')) {
            return condition.mul.reduce<number>((product, element) => {
                const value = this.evaluateVariabilityExpression(element)
                validator.ensureNumber(value)
                return product * value
            }, 1)
        }

        if (validator.hasProperty(condition, 'div')) {
            const first = this.evaluateVariabilityExpression(condition.div[0])
            validator.ensureNumber(first)

            return condition.div.slice(1).reduce<number>((quotient, element) => {
                const value = this.evaluateVariabilityExpression(element)
                validator.ensureNumber(value)
                return quotient / value
            }, first)
        }

        if (validator.hasProperty(condition, 'mod')) {
            const first = this.evaluateVariabilityExpression(condition.mod[0])
            validator.ensureNumber(first)

            const second = this.evaluateVariabilityExpression(condition.mod[1])
            validator.ensureNumber(second)

            return first % second
        }

        if (validator.hasProperty(condition, 'get_variability_input')) {
            validator.ensureString(condition.get_variability_input)
            return this.evaluateVariabilityExpression(this.getVariabilityInput(condition.get_variability_input))
        }

        if (validator.hasProperty(condition, 'get_variability_expression')) {
            validator.ensureString(condition.get_variability_expression)
            return this.evaluateVariabilityExpression(
                this.getVariabilityExpression(condition.get_variability_expression)
            )
        }

        if (validator.hasProperty(condition, 'get_variability_condition')) {
            validator.ensureString(condition.get_variability_condition)
            return this.evaluateVariabilityCondition(this.getVariabilityExpression(condition.get_variability_condition))
        }

        if (validator.hasProperty(condition, 'get_element_presence')) {
            let element
            if (validator.isArray(condition.get_element_presence)) {
                const first = this.evaluateVariabilityExpression(condition.get_element_presence[0])
                validator.ensureString(first)

                const second = this.evaluateVariabilityExpression(condition.get_element_presence[1])
                validator.ensureStringOrNumber(second)

                element = [first, second]
            } else {
                element = this.evaluateVariabilityExpression(condition.get_element_presence)
                validator.ensureString(element)
            }

            return this.checkPresence(this.getElement(element))
        }

        if (validator.hasProperty(condition, 'concat')) {
            return condition.concat.map(c => this.evaluateVariabilityExpression(c)).join('')
        }

        if (validator.hasProperty(condition, 'join')) {
            return condition.join[0].map(c => this.evaluateVariabilityExpression(c)).join(condition.join[1])
        }

        if (validator.hasProperty(condition, 'token')) {
            const element = this.evaluateVariabilityExpression(condition.token[0])
            validator.ensureString(element)
            const token = condition.token[1]
            const index = condition.token[2]
            return element.split(token)[index]
        }

        if (validator.hasProperty(condition, 'equal')) {
            const first = this.evaluateVariabilityExpression(condition.equal[0])
            return condition.equal.every(element => {
                const value = this.evaluateVariabilityExpression(element)
                return value === first
            })
        }

        if (validator.hasProperty(condition, 'greater_than')) {
            return (
                this.evaluateVariabilityExpression(condition.greater_than[0]) >
                this.evaluateVariabilityExpression(condition.greater_than[1])
            )
        }

        if (validator.hasProperty(condition, 'greater_or_equal')) {
            return (
                this.evaluateVariabilityExpression(condition.greater_or_equal[0]) >=
                this.evaluateVariabilityExpression(condition.greater_or_equal[1])
            )
        }

        if (validator.hasProperty(condition, 'less_than')) {
            return (
                this.evaluateVariabilityExpression(condition.less_than[0]) <
                this.evaluateVariabilityExpression(condition.less_than[1])
            )
        }

        if (validator.hasProperty(condition, 'less_or_equal')) {
            return (
                this.evaluateVariabilityExpression(condition.less_or_equal[0]) <=
                this.evaluateVariabilityExpression(condition.less_or_equal[1])
            )
        }

        if (validator.hasProperty(condition, 'in_range')) {
            const element = this.evaluateVariabilityExpression(condition.in_range[0])
            const lower = condition.in_range[1][0]
            const upper = condition.in_range[1][1]
            return lower <= element && element <= upper
        }

        if (validator.hasProperty(condition, 'valid_values')) {
            const element = this.evaluateVariabilityExpression(condition.valid_values[0])
            const valid = condition.valid_values[1].map(c => this.evaluateVariabilityExpression(c))
            return valid.includes(element)
        }

        if (validator.hasProperty(condition, 'length')) {
            const element = this.evaluateVariabilityExpression(condition.length[0])
            validator.ensureString(element)

            const length = this.evaluateVariabilityExpression(condition.length[1])
            validator.ensureNumber(length)

            return element.length === length
        }

        if (validator.hasProperty(condition, 'min_length')) {
            const element = this.evaluateVariabilityExpression(condition.min_length[0])
            validator.ensureString(element)

            const length = this.evaluateVariabilityExpression(condition.min_length[1])
            validator.ensureNumber(length)

            return element.length >= length
        }

        if (validator.hasProperty(condition, 'max_length')) {
            const element = this.evaluateVariabilityExpression(condition.max_length[0])
            validator.ensureString(element)

            const length = this.evaluateVariabilityExpression(condition.max_length[1])
            validator.ensureNumber(length)

            return element.length <= length
        }

        throw new Error(`Unknown variability condition ${condition}`)
    }
}
