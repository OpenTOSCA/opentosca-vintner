import {Artifact, ConditionalElement, Graph, Group, Node, Policy, Property, Relation} from '#/resolver/graph'
import {InputAssignmentMap, InputAssignmentValue} from '#spec/topology-template'
import * as utils from '#utils'
import * as validator from '#validator'
import {InputAssignmentPreset, VariabilityDefinition, VariabilityExpression} from '#spec/variability'
import _ from 'lodash'
import stats from 'stats-lite'
import {ensureArray, ensureDefined} from '#validator'
import regression from 'regression'

type ExpressionContext = {
    element?: ConditionalElement
}

export default class Solver {
    private readonly graph: Graph
    private readonly options?: VariabilityDefinition

    private inputs: InputAssignmentMap = {}
    private weekday = utils.weekday()

    constructor(graph: Graph) {
        this.graph = graph
        this.options = graph.serviceTemplate.topology_template?.variability
    }

    run() {
        for (const node of this.graph.nodes) this.checkPresence(node)
        for (const relation of this.graph.relations) this.checkPresence(relation)
        for (const input of this.graph.inputs) this.checkPresence(input)
        for (const group of this.graph.groups) this.checkPresence(group)
        for (const policy of this.graph.policies) this.checkPresence(policy)
        for (const artifact of this.graph.artifacts) this.checkPresence(artifact)
        for (const property of this.graph.properties) this.checkPresence(property)
        return this
    }

    checkPresence(element: ConditionalElement) {
        // Variability group are never present
        if (element.isGroup() && element.variability) element.present = false

        // Check if presence already has been evaluated
        if (validator.isDefined(element.present)) return element.present

        // Collect assigned conditions
        let conditions = [...element.conditions]
        if (element.isNode() || element.isRelation()) {
            element.groups.filter(group => group.variability).forEach(group => conditions.push(...group.conditions))
        }
        conditions = utils.filterNotNull<VariabilityExpression>(conditions)

        // If artifact is default, then check if no other artifact having the same name is present
        if (element.isArtifact() && element.default) {
            const bratans = element.container.artifactsMap.get(element.name)!.filter(it => it !== element)
            conditions = [!bratans.some(it => this.checkPresence(it))]
        }

        // If relation is default, then check if no other relation having the same name is present
        if (element.isRelation() && element.default) {
            const node = element.source
            const bratans = node.outgoingMap.get(element.name)!.filter(it => it !== element)
            conditions = [!bratans.some(it => this.checkPresence(it))]
        }

        // If property is default, then check if no other property having the same name is present
        if (element.isProperty() && element.default) {
            const bratans = element.container.propertiesMap.get(element.name)!.filter(it => it !== element)
            conditions = [!bratans.some(it => this.checkPresence(it))]
        }

        // Relation Default Condition: Assign default condition to relation that checks if source and target are present
        if (
            element.isRelation() &&
            this.getResolvingOptions().enable_relation_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{and: [{get_node_presence: element.source.name}, {get_node_presence: element.target.name}]}]
        }

        // Prune Relations: Additionally check that source and target are present
        if (element.isRelation() && this.getResolvingOptions().enable_relation_pruning) {
            conditions.unshift({
                and: [{get_node_presence: element.source.name}, {get_node_presence: element.target.name}],
            })
        }

        // Policy Default Condition: Assign default condition to node that checks if any target is present
        if (
            element.isPolicy() &&
            this.getResolvingOptions().enable_policy_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{has_present_targets: element.name}]
        }

        // Prune Policy: Additionally check if any target is present
        if (element.isPolicy() && this.getResolvingOptions().enable_policy_pruning) {
            conditions.unshift({has_present_targets: element.name})
        }

        // Group Default Condition: Assign default condition to node that checks if any member is present
        if (
            element.isGroup() &&
            this.getResolvingOptions().enable_group_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{has_present_members: element.name}]
        }

        // Prune Group: Additionally check if any member is present
        if (element.isGroup() && this.getResolvingOptions().enable_group_pruning) {
            conditions.unshift({has_present_members: element.name})
        }

        // Artifact Default Condition: Assign default condition to artifact that checks if corresponding node is present
        if (
            element.isArtifact() &&
            this.getResolvingOptions().enable_artifact_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{get_node_presence: element.container.name}]
        }

        // Prune Artifact: Additionally check if node is present
        if (element.isArtifact() && this.getResolvingOptions().enable_artifact_pruning) {
            conditions.unshift({get_node_presence: element.container.name})
        }

        // Property Default Condition: Assign default condition to property that checks if corresponding parent is present
        if (
            element.isProperty() &&
            this.getResolvingOptions().enable_property_default_condition &&
            utils.isEmpty(conditions)
        ) {
            if (element.container.isNode()) conditions = [{get_node_presence: element.container.name}]
            if (element.container.isRelation())
                conditions = [{get_relation_presence: [element.container.source.name, element.container.name]}]
        }

        // Prune Artifact: Additionally check if corresponding parent is present
        if (element.isProperty() && this.getResolvingOptions().enable_property_pruning) {
            if (element.container.isNode()) conditions.unshift({get_node_presence: element.container.name})
            if (element.container.isRelation())
                conditions.unshift({get_relation_presence: [element.container.source.name, element.container.name]})
        }

        // Evaluate assigned conditions
        const condition = conditions.reduce<{and: VariabilityExpression[]}>(
            (acc, curr) => {
                acc.and.push(curr)
                return acc
            },
            {and: []}
        )
        const present = this.evaluateCondition(condition, {element})
        element.present = present

        return present
    }

    getResolvingOptions() {
        return this.options?.options || {}
    }

    setPreset(name?: string) {
        if (validator.isUndefined(name)) return this
        this.setInputs(this.getPreset(name).inputs)
        return this
    }

    setInputs(inputs?: InputAssignmentMap) {
        if (validator.isUndefined(inputs)) return this
        this.inputs = _.merge(this.inputs, inputs)
        return this
    }

    setInput(name: string, value: InputAssignmentValue) {
        this.inputs[name] = value
    }

    getInput(name: string) {
        let value

        // Get variability input definition
        const definition = this.options?.inputs[name]
        validator.ensureDefined(definition, `Variability input "${name}" is not defined`)

        // Return assigned value
        value = this.inputs[name]
        if (validator.isDefined(value)) return value

        // Return default value
        if (validator.isDefined(definition.default)) {
            this.setInput(name, definition.default)
            return definition.default
        }

        // Return default expression
        validator.ensureDefined(
            definition.default_expression,
            `Variability input "${name}" has no value nor default (expression) assigned`
        )
        value = this.evaluateExpression(definition.default_expression, {})
        validator.ensureDefined(value, `Did not find variability input "${name}"`)
        this.setInput(name, value)
        return value
    }

    getInputs() {
        return this.inputs
    }

    getPreset(name: string) {
        const set: InputAssignmentPreset | undefined = (this.options?.presets || {})[name]
        validator.ensureDefined(set, `Did not find variability set "${name}"`)
        return set
    }

    getExpression(name: string) {
        const condition: VariabilityExpression | undefined = (this.options?.expressions || {})[name]
        validator.ensureDefined(condition, `Did not find variability expression "${name}"`)
        return condition
    }

    evaluateCondition(condition: VariabilityExpression, context: ExpressionContext): boolean {
        const result = this.evaluateExpression(condition, context)
        validator.ensureBoolean(result)
        return result
    }

    evaluateExpression(condition: VariabilityExpression, context: ExpressionContext): InputAssignmentValue {
        if (validator.isObject(condition) && !validator.isArray(condition)) {
            if (validator.isDefined(condition._cached_result)) return condition._cached_result
            const result = this.evaluateExpressionRunner(condition, context)
            condition._cached_result = result
            return result
        }

        return this.evaluateExpressionRunner(condition, context)
    }

    private evaluateExpressionRunner(
        condition: VariabilityExpression,
        context: ExpressionContext
    ): InputAssignmentValue {
        validator.ensureDefined(condition, `Received undefined condition`)

        if (validator.isString(condition)) return condition
        if (validator.isBoolean(condition)) return condition
        if (validator.isNumber(condition)) return condition
        if (validator.isArray(condition)) return condition

        if (validator.isDefined(condition.and)) {
            return condition.and.every(element => {
                const value = this.evaluateExpression(element, context)
                validator.ensureBoolean(value)
                return value
            })
        }

        if (validator.isDefined(condition.or)) {
            return condition.or.some(element => {
                const value = this.evaluateExpression(element, context)
                validator.ensureBoolean(value)
                return value
            })
        }

        if (validator.isDefined(condition.not)) {
            const value = this.evaluateExpression(condition.not, context)
            validator.ensureBoolean(value)
            return !value
        }

        if (validator.isDefined(condition.xor)) {
            return (
                condition.xor.reduce((count: number, element) => {
                    const value = this.evaluateExpression(element, context)
                    validator.ensureBoolean(value)
                    if (value) count++
                    return count
                }, 0) === 1
            )
        }

        if (validator.isDefined(condition.implies)) {
            const first = this.evaluateExpression(condition.implies[0], context)
            validator.ensureBoolean(first)

            const second = this.evaluateExpression(condition.implies[1], context)
            validator.ensureBoolean(first)

            return first ? second : true
        }

        if (validator.isDefined(condition.add)) {
            return condition.add.reduce<number>((sum, element) => {
                const value = this.evaluateExpression(element, context)
                validator.ensureNumber(value)
                return sum + value
            }, 0)
        }

        if (validator.isDefined(condition.sub)) {
            const first = this.evaluateExpression(condition.sub[0], context)
            validator.ensureNumber(first)

            return condition.sub.slice(1).reduce<number>((difference, element) => {
                const value = this.evaluateExpression(element, context)
                validator.ensureNumber(value)
                return difference - value
            }, first)
        }

        if (validator.isDefined(condition.mul)) {
            return condition.mul.reduce<number>((product, element) => {
                const value = this.evaluateExpression(element, context)
                validator.ensureNumber(value)
                return product * value
            }, 1)
        }

        if (validator.isDefined(condition.div)) {
            const first = this.evaluateExpression(condition.div[0], context)
            validator.ensureNumber(first)

            return condition.div.slice(1).reduce<number>((quotient, element) => {
                const value = this.evaluateExpression(element, context)
                validator.ensureNumber(value)
                return quotient / value
            }, first)
        }

        if (validator.isDefined(condition.mod)) {
            const first = this.evaluateExpression(condition.mod[0], context)
            validator.ensureNumber(first)

            const second = this.evaluateExpression(condition.mod[1], context)
            validator.ensureNumber(second)

            return first % second
        }

        if (validator.isDefined(condition.get_variability_input)) {
            validator.ensureString(condition.get_variability_input)
            return this.evaluateExpression(this.getInput(condition.get_variability_input), context)
        }

        if (validator.isDefined(condition.get_variability_expression)) {
            validator.ensureString(condition.get_variability_expression)
            return this.evaluateExpression(this.getExpression(condition.get_variability_expression), context)
        }

        if (validator.isDefined(condition.get_variability_condition)) {
            validator.ensureString(condition.get_variability_condition)
            return this.evaluateCondition(this.getExpression(condition.get_variability_condition), context)
        }

        if (validator.isDefined(condition.get_node_presence)) {
            const name = this.evaluateExpression(condition.get_node_presence, context)
            validator.ensureString(name)
            return this.checkPresence(this.graph.getNode(name))
        }

        if (validator.isDefined(condition.get_relation_presence)) {
            const node = this.evaluateExpression(condition.get_relation_presence[0], context)
            validator.ensureString(node)

            const relation = this.evaluateExpression(condition.get_relation_presence[1], context)
            validator.ensureStringOrNumber(relation)

            return this.checkPresence(this.graph.getRelation([node, relation]))
        }

        if (validator.isDefined(condition.get_source_presence)) {
            const element = this.evaluateExpression(condition.get_source_presence, context)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "get_source_presence" but received "${element}"`)
            if (!context?.element?.isRelation())
                throw new Error(`"get_source_presence" is only valid inside a relation`)
            return this.checkPresence(context.element.source)
        }

        if (validator.isDefined(condition.get_target_presence)) {
            const element = this.evaluateExpression(condition.get_target_presence, context)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "get_target_presence" but received "${element}"`)
            if (!context?.element?.isRelation())
                throw new Error(`"get_target_presence" is only valid inside a relation`)
            return this.checkPresence(context.element.target)
        }

        if (validator.isDefined(condition.has_present_targets)) {
            const element = this.evaluateExpression(condition.has_present_targets, context)
            validator.ensureString(element)
            return this.graph.getPolicy(element).targets.some(target => {
                if (target.isNode()) {
                    return this.checkPresence(target)
                }

                if (target.isGroup()) {
                    return target.members.some(member => this.checkPresence(member))
                }
            })
        }

        if (validator.isDefined(condition.has_present_members)) {
            const element = this.evaluateExpression(condition.has_present_members, context)
            validator.ensureString(element)
            return this.graph.getGroup(element).members.some(member => this.checkPresence(member))
        }

        if (validator.isDefined(condition.concat)) {
            return condition.concat.map(c => this.evaluateExpression(c, context)).join('')
        }

        if (validator.isDefined(condition.join)) {
            return condition.join[0].map(c => this.evaluateExpression(c, context)).join(condition.join[1])
        }

        if (validator.isDefined(condition.token)) {
            const element = this.evaluateExpression(condition.token[0], context)
            validator.ensureString(element)
            const token = condition.token[1]
            const index = condition.token[2]
            return element.split(token)[index]
        }

        if (validator.isDefined(condition.equal)) {
            const first = this.evaluateExpression(condition.equal[0], context)
            return condition.equal.every(element => {
                const value = this.evaluateExpression(element, context)
                return value === first
            })
        }

        if (validator.isDefined(condition.greater_than)) {
            return (
                this.evaluateExpression(condition.greater_than[0], context) >
                this.evaluateExpression(condition.greater_than[1], context)
            )
        }

        if (validator.isDefined(condition.greater_or_equal)) {
            return (
                this.evaluateExpression(condition.greater_or_equal[0], context) >=
                this.evaluateExpression(condition.greater_or_equal[1], context)
            )
        }

        if (validator.isDefined(condition.less_than)) {
            return (
                this.evaluateExpression(condition.less_than[0], context) <
                this.evaluateExpression(condition.less_than[1], context)
            )
        }

        if (validator.isDefined(condition.less_or_equal)) {
            return (
                this.evaluateExpression(condition.less_or_equal[0], context) <=
                this.evaluateExpression(condition.less_or_equal[1], context)
            )
        }

        if (validator.isDefined(condition.in_range)) {
            const element = this.evaluateExpression(condition.in_range[0], context)
            const lower = condition.in_range[1][0]
            const upper = condition.in_range[1][1]
            return lower <= element && element <= upper
        }

        if (validator.isDefined(condition.valid_values)) {
            const element = this.evaluateExpression(condition.valid_values[0], context)
            const valid = condition.valid_values[1].map(c => this.evaluateExpression(c, context))
            return valid.includes(element)
        }

        if (validator.isDefined(condition.length)) {
            const element = this.evaluateExpression(condition.length[0], context)
            validator.ensureString(element)

            const length = this.evaluateExpression(condition.length[1], context)
            validator.ensureNumber(length)

            return element.length === length
        }

        if (validator.isDefined(condition.min_length)) {
            const element = this.evaluateExpression(condition.min_length[0], context)
            validator.ensureString(element)

            const length = this.evaluateExpression(condition.min_length[1], context)
            validator.ensureNumber(length)

            return element.length >= length
        }

        if (validator.isDefined(condition.max_length)) {
            const element = this.evaluateExpression(condition.max_length[0], context)
            validator.ensureString(element)

            const length = this.evaluateExpression(condition.max_length[1], context)
            validator.ensureNumber(length)

            return element.length <= length
        }

        if (validator.isDefined(condition.sum)) {
            const elements = condition.sum
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.sum(elements))
        }

        if (validator.isDefined(condition.count)) {
            const elements = condition.count
            validator.ensureNumbers(elements)
            return elements.length
        }

        if (validator.isDefined(condition.min)) {
            const elements = condition.min
            validator.ensureNumbers(elements)
            const min = _.min(elements)
            ensureDefined(min, `Minimum of "${JSON.stringify(elements)}" does not exist`)
            return min
        }

        if (validator.isDefined(condition.max)) {
            const elements = condition.max
            validator.ensureNumbers(elements)
            const max = _.max(elements)
            ensureDefined(max, `Maximum of "${JSON.stringify(elements)}" does not exist`)
            return max
        }

        if (validator.isDefined(condition.median)) {
            const elements = condition.median
            validator.ensureNumbers(elements)
            return stats.median(elements)
        }

        if (validator.isDefined(condition.mean)) {
            const elements = condition.mean
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.mean(elements))
        }

        if (validator.isDefined(condition.variance)) {
            const elements = condition.variance
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.variance(elements))
        }

        if (validator.isDefined(condition.standard_deviation)) {
            const elements = condition.standard_deviation
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.stdev(elements))
        }

        if (validator.isDefined(condition.linear_regression)) {
            ensureArray(condition.linear_regression)
            const elements = condition.linear_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const prediction = condition.linear_regression[1]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.linear(elements).predict(prediction)[1])
        }

        if (validator.isDefined(condition.polynomial_regression)) {
            ensureArray(condition.polynomial_regression)
            const elements = condition.polynomial_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const order = condition.polynomial_regression[1]
            validator.ensureNumber(order)

            const prediction = condition.polynomial_regression[2]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.polynomial(elements, {order}).predict(prediction)[1])
        }

        if (validator.isDefined(condition.logarithmic_regression)) {
            ensureArray(condition.logarithmic_regression)
            const elements = condition.logarithmic_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const prediction = condition.logarithmic_regression[1]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.logarithmic(elements).predict(prediction)[1])
        }

        if (validator.isDefined(condition.exponential_regression)) {
            ensureArray(condition.exponential_regression)
            const elements = condition.exponential_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const prediction = condition.exponential_regression[1]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.exponential(elements).predict(prediction)[1])
        }

        if (validator.isDefined(condition.get_current_weekday)) {
            return this.weekday
        }

        throw new Error(`Unknown variability condition "${utils.prettyJSON(condition)}"`)
    }
}
