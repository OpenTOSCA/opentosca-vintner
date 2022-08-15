import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '../specification/service-template'
import {NodeTemplate, NodeTemplateMap, RequirementAssignmentMap} from '../specification/node-template'
import {deepCopy, filterNotNull, listIsEmpty, firstKey, firstValue} from '../utils/utils'
import {InputAssignmentMap} from '../specification/topology-template'
import {VariabilityExpression} from '../specification/variability'
import * as validator from '../utils/validator'
import {GroupMember} from '../specification/group-type'
import {GroupTemplate} from '../specification/group-template'
import {RelationshipTemplate} from '../specification/relationship-template'

export class Model {
    private readonly _serviceTemplate: ServiceTemplate
    private _variabilityInputs?: InputAssignmentMap
    private _originalServiceTemplate: ServiceTemplate

    constructor(serviceTemplate: ServiceTemplate) {
        this._serviceTemplate = deepCopy(serviceTemplate)
        this._originalServiceTemplate = deepCopy(serviceTemplate)
    }

    resolveVariability() {
        // Check presence of each node (and cleanup)
        for (const name in this.getNodeTemplates()) {
            if (!this.checkNodePresence(name, true)) this.deleteNodeTemplate(name)
            // TODO: cleanup relationship templates of this specific node?
            // TODO: conditions on relationship templates?
        }

        // Check presence of each relationship (and cleanup)
        for (const name in this.getNodeTemplates()) {
            const node = this.getNodeTemplate(name)
            if (validator.isUndefined(node.requirements)) continue
            node.requirements = node.requirements.filter(map => this.checkRelationshipPresence(name, map, true))
        }

        return this
    }

    checkNodePresence(name: string, cleanup = false) {
        const node = this.getNodeTemplate(name)
        const conditions = [node.conditions].flat()
        conditions.push(...this.getGroupConditions(name))
        delete node.conditions
        const present = filterNotNull(conditions).every(condition => this.evaluateVariabilityCondition(condition))
        if (cleanup) this.pruneMemberFromVariabilityGroups(name)
        return present
    }

    checkRelationshipPresence(node: string, map: RequirementAssignmentMap, cleanup = false) {
        const name = firstKey(map)
        const assignment = firstValue(map)
        const element: GroupMember = [node, name]

        const conditions = []
        if (!validator.isString(assignment)) {
            conditions.push(assignment.conditions)
            delete assignment.conditions
        }

        conditions.push(...this.getGroupConditions(element))
        const present = filterNotNull(conditions).every(condition => this.evaluateVariabilityCondition(condition))
        if (cleanup) this.pruneMemberFromVariabilityGroups(element)

        // Remove relationship template if not used somewhere else
        if (!present && !validator.isString(assignment) && validator.isString(assignment.relationship)) {
            const count = this.countRelationshipTemplateUsage(assignment.relationship)
            if (count === 1) this.deleteRelationshipTemplate(assignment.relationship)
        }

        return present
    }

    getGroupConditions(element: GroupMember) {
        return this.getGroups()
            .filter(group => this.isMemberOfGroup(element, group.group))
            .map(group => group.group.conditions)
            .flat()
    }

    isMemberOfGroup(element: GroupMember, group: GroupTemplate) {
        return this.findPositionInGroup(element, group) !== -1
    }

    findPositionInGroup(element: GroupMember, group: GroupTemplate) {
        return group.members.findIndex(member => this.isGroupMember(element, member))
    }

    isGroupMember(element: GroupMember, member: GroupMember) {
        if (validator.isString(member)) return member === element
        return member[0] === element[0] && member[1] === element[1]
    }

    /**
     * Remove element from all groups and remove group if group is empty
     */
    pruneMemberFromVariabilityGroups(element: GroupMember) {
        for (const {name, group} of this.getGroups()) {
            if (validator.isUndefined(group.conditions)) continue
            const index = this.findPositionInGroup(element, group)
            if (index !== -1) group.members.splice(index, 1)
            if (listIsEmpty(group.members)) this.deleteGroup(name)
        }
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

    getInputDefinitions() {
        return this._serviceTemplate.topology_template?.inputs || {}
    }

    getNodeTemplate(name: string): NodeTemplate | undefined {
        return this._serviceTemplate.topology_template?.node_templates[name]
    }

    deleteNodeTemplate(name: string) {
        delete this._serviceTemplate.topology_template?.node_templates[name]
    }

    getNodeTemplates(): NodeTemplateMap {
        const nodes = this._serviceTemplate.topology_template?.node_templates
        if (validator.isUndefined(nodes)) return {}
        return nodes
    }

    getNodeTemplatesList() {
        return Object.values(this.getNodeTemplates())
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
        const result = this.evaluateVariabilityConditionRunner(condition)
        validator.ensureBoolean(result)
        return result
    }

    evaluateVariabilityConditionRunner(
        condition: VariabilityExpression
    ): boolean | string | number | VariabilityExpression {
        if (validator.isString(condition)) return condition
        if (validator.isBoolean(condition)) return condition
        if (validator.isNumber(condition)) return condition

        if (validator.hasProperty(condition, 'and')) {
            return condition.and.every(element => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureBoolean(value)
                return value
            })
        }

        if (validator.hasProperty(condition, 'or')) {
            return condition.or.some(element => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureBoolean(value)
                return value
            })
        }

        if (validator.hasProperty(condition, 'not')) {
            const value = this.evaluateVariabilityConditionRunner(condition.not)
            validator.ensureBoolean(value)
            return !value
        }

        if (validator.hasProperty(condition, 'xor')) {
            return (
                condition.xor.reduce((count: number, element) => {
                    const value = this.evaluateVariabilityConditionRunner(element)
                    validator.ensureBoolean(value)
                    if (value) count++
                    return count
                }, 0) === 1
            )
        }

        if (validator.hasProperty(condition, 'implies')) {
            const first = this.evaluateVariabilityConditionRunner(condition.implies[0])
            validator.ensureBoolean(first)

            const second = this.evaluateVariabilityConditionRunner(condition.implies[1])
            validator.ensureBoolean(first)

            return first ? second : true
        }

        if (validator.hasProperty(condition, 'add')) {
            return condition.add.reduce((sum: number, element) => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureNumber(value)
                return sum + value
            }, 0)
        }

        if (validator.hasProperty(condition, 'sub')) {
            const first = this.evaluateVariabilityConditionRunner(condition.sub[0])
            validator.ensureNumber(first)

            return condition.sub.slice(1).reduce((difference: number, element) => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureNumber(value)
                return difference - value
            }, first)
        }

        if (validator.hasProperty(condition, 'mul')) {
            return condition.mul.reduce((product: number, element) => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureNumber(value)
                return product * value
            }, 1)
        }

        if (validator.hasProperty(condition, 'div')) {
            const first = this.evaluateVariabilityConditionRunner(condition.div[0])
            validator.ensureNumber(first)

            return condition.div.slice(1).reduce((quotient: number, element) => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureNumber(value)
                return quotient / value
            }, first)
        }

        if (validator.hasProperty(condition, 'mod')) {
            const first = this.evaluateVariabilityConditionRunner(condition.mod[0])
            validator.ensureNumber(first)

            const second = this.evaluateVariabilityConditionRunner(condition.mod[1])
            validator.ensureNumber(second)

            return first % second
        }

        if (validator.hasProperty(condition, 'get_variability_input')) {
            validator.ensureString(condition.get_variability_input)
            return this.evaluateVariabilityConditionRunner(this.getVariabilityInput(condition.get_variability_input))
        }

        if (validator.hasProperty(condition, 'get_variability_expression')) {
            validator.ensureString(condition.get_variability_expression)
            return this.evaluateVariabilityConditionRunner(
                this.getVariabilityExpression(condition.get_variability_expression)
            )
        }

        if (validator.hasProperty(condition, 'get_variability_condition')) {
            validator.ensureString(condition.get_variability_condition)
            return this.evaluateVariabilityCondition(this.getVariabilityExpression(condition.get_variability_condition))
        }

        if (validator.hasProperty(condition, 'concat')) {
            return condition.concat.map(c => this.evaluateVariabilityConditionRunner(c)).join('')
        }

        if (validator.hasProperty(condition, 'join')) {
            return condition.join[0].map(c => this.evaluateVariabilityConditionRunner(c)).join(condition.join[1])
        }

        if (validator.hasProperty(condition, 'token')) {
            const element = this.evaluateVariabilityConditionRunner(condition.token[0])
            validator.ensureString(element)
            const token = condition.token[1]
            const index = condition.token[2]
            return element.split(token)[index]
        }

        if (validator.hasProperty(condition, 'equal')) {
            const first = this.evaluateVariabilityConditionRunner(condition.equal[0])
            return condition.equal.every(element => {
                const value = this.evaluateVariabilityConditionRunner(element)
                return value === first
            })
        }

        if (validator.hasProperty(condition, 'greater_than')) {
            return (
                this.evaluateVariabilityConditionRunner(condition.greater_than[0]) >
                this.evaluateVariabilityConditionRunner(condition.greater_than[1])
            )
        }

        if (validator.hasProperty(condition, 'greater_or_equal')) {
            return (
                this.evaluateVariabilityConditionRunner(condition.greater_or_equal[0]) >=
                this.evaluateVariabilityConditionRunner(condition.greater_or_equal[1])
            )
        }

        if (validator.hasProperty(condition, 'less_than')) {
            return (
                this.evaluateVariabilityConditionRunner(condition.less_than[0]) <
                this.evaluateVariabilityConditionRunner(condition.less_than[1])
            )
        }

        if (validator.hasProperty(condition, 'less_or_equal')) {
            return (
                this.evaluateVariabilityConditionRunner(condition.less_or_equal[0]) <=
                this.evaluateVariabilityConditionRunner(condition.less_or_equal[1])
            )
        }

        if (validator.hasProperty(condition, 'in_range')) {
            const element = this.evaluateVariabilityConditionRunner(condition.in_range[0])
            const lower = condition.in_range[1][0]
            const upper = condition.in_range[1][1]
            return lower <= element && element <= upper
        }

        if (validator.hasProperty(condition, 'valid_values')) {
            const element = this.evaluateVariabilityConditionRunner(condition.valid_values[0])
            const valid = condition.valid_values[1].map(c => this.evaluateVariabilityConditionRunner(c))
            return valid.includes(element)
        }

        if (validator.hasProperty(condition, 'length')) {
            const element = this.evaluateVariabilityConditionRunner(condition.length[0])
            validator.ensureString(element)

            const length = this.evaluateVariabilityConditionRunner(condition.length[1])
            validator.ensureNumber(length)

            return element.length === length
        }

        if (validator.hasProperty(condition, 'min_length')) {
            const element = this.evaluateVariabilityConditionRunner(condition.min_length[0])
            validator.ensureString(element)

            const length = this.evaluateVariabilityConditionRunner(condition.min_length[1])
            validator.ensureNumber(length)

            return element.length >= length
        }

        if (validator.hasProperty(condition, 'max_length')) {
            const element = this.evaluateVariabilityConditionRunner(condition.max_length[0])
            validator.ensureString(element)

            const length = this.evaluateVariabilityConditionRunner(condition.max_length[1])
            validator.ensureNumber(length)

            return element.length <= length
        }

        throw new Error(`Unknown variability condition ${condition}`)
    }

    ensureCompatibility() {
        if (
            ![
                TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
                TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            ].includes(this.getTOSCADefinitionsVersion())
        )
            throw new Error('Unsupported TOSCA definitions version')
    }

    getTOSCADefinitionsVersion() {
        return this._serviceTemplate.tosca_definitions_version
    }

    setTOSCADefinitionsVersion(version: TOSCA_DEFINITIONS_VERSION) {
        this._serviceTemplate.tosca_definitions_version = version
    }

    getGroups(type?: string) {
        return Object.entries(this._serviceTemplate.topology_template?.groups || {})
            .filter(entry => (type ? entry[1].type === type : true))
            .map(entry => ({
                name: entry[0],
                group: entry[1],
            }))
    }

    deleteGroup(name: string) {
        delete (this._serviceTemplate.topology_template?.groups || {})[name]
    }

    getRelationshipTemplates() {
        return this._serviceTemplate.topology_template?.relationship_templates
    }

    getRelationshipTemplate(name: string): RelationshipTemplate | undefined {
        return this._serviceTemplate.topology_template?.relationship_templates[name]
    }

    countRelationshipTemplateUsage(name: string) {
        let count = 0
        const nodes = this.getNodeTemplatesList()
        for (const node of nodes) {
            if (validator.isUndefined(node.requirements)) continue
            for (const map of node.requirements) {
                const assignment = firstValue(map)
                if (validator.isString(assignment)) continue
                if (assignment.relationship === name) count++
            }
        }
        return count
    }

    deleteRelationshipTemplate(name: string) {
        delete this._serviceTemplate.topology_template?.relationship_templates[name]
    }

    checkConsistency() {
        const nodes = this.getNodeTemplates()

        // Ensure that each relation source exists
        for (const name in this.getRelationshipTemplates()) {
            if (this.countRelationshipTemplateUsage(name) === 0)
                throw new Error(`Source of relationship template "${name}" does not exist`)
        }

        // Ensure that each relation target exists
        for (const name in nodes) {
            const node = nodes[name]
            const requirements = node.requirements || []

            for (const map of requirements) {
                const assignment = firstValue(map)
                const target = validator.isString(assignment)
                    ? this.getNodeTemplate(assignment)
                    : this.getNodeTemplate(assignment.node)

                if (validator.isUndefined(target))
                    throw new Error(`Target of relationship "${firstKey(map)}" of node "${name}" does not exist`)
            }
        }

        // Ensure that node has at maximum one hosting relation
        for (const name in nodes) {
            const node = nodes[name]
            const requirements = node.requirements || []
            const hostingRelations = requirements.filter(this.isHostingRelation)
            if (hostingRelations.length > 1) throw new Error(`Node ${name} has more than one hosting relations`)
        }

        // Ensure that node that had a hosting relation before still has one
        for (const name in nodes) {
            const node = nodes[name]
            const requirements = node.requirements || []
            const hostingRelations = requirements.filter(this.isHostingRelation)
            if (this.requiresHostingRelation(name) && listIsEmpty(hostingRelations))
                throw new Error(`Node ${name} requires a hosting relation`)
        }

        return this
    }

    isHostingRelation(map: RequirementAssignmentMap) {
        return firstKey(map) === 'host'
    }

    requiresHostingRelation(name: string) {
        const node = this._originalServiceTemplate.topology_template?.node_templates[name]
        if (validator.isUndefined(node)) return false
        if (validator.isUndefined(node.requirements)) return false
        return !listIsEmpty(node.requirements.filter(this.isHostingRelation))
    }

    finalize() {
        // Set version
        this.setTOSCADefinitionsVersion(TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3)

        // Cleanup
        delete this._serviceTemplate.topology_template?.variability

        return this
    }

    getServiceTemplate() {
        return this._serviceTemplate
    }
}
