import {Artifact, ConditionalElement, Graph, Group, Input, Node, Policy, Property, Relation} from '#/resolver/graph'
import {InputAssignmentMap, InputAssignmentValue} from '#spec/topology-template'
import * as utils from '#utils'
import * as validator from '#validator'
import {
    InputAssignmentPreset,
    LogicExpression,
    ValueExpression,
    VariabilityDefinition,
    VariabilityExpression,
} from '#spec/variability'
import _ from 'lodash'
import stats from 'stats-lite'
import {ensureArray, ensureDefined} from '#validator'
import regression from 'regression'
import day from '#utils/day'
import * as LS from 'logic-solver'
import Logic from 'logic-solver'

// TODO: value expressions in presence conditions
// TODO: logic expression in value expressions

type ExpressionContext = {
    element?: ConditionalElement
}

export default class Solver {
    private readonly graph: Graph
    private readonly options?: VariabilityDefinition

    private readonly solver = new LS.Solver()
    private result?: Record<string, boolean>

    private inputs: InputAssignmentMap = {}
    private weekday = utils.weekday()

    constructor(graph: Graph) {
        this.graph = graph
        this.options = graph.serviceTemplate.topology_template?.variability
    }

    run() {
        /**
         * Add logical conditions
         */
        for (const element of this.graph.elements) this.addConditions(element)

        /**
         * Get initial solution
         */
        const solution = this.solver.solve()
        if (validator.isUndefined(solution)) throw new Error(`Could not solve`)

        /**
         * Get optimized solution by minimizing the numbers of nodes
         */
        const optimized = this.solver.minimizeWeightedSum(
            solution,
            this.graph.nodes.map(it => it.id),
            1
        )
        if (validator.isUndefined(optimized)) throw new Error(`Could not optimize`)

        this.result = optimized.getMap()

        /**
         * Assign presence to elements
         */
        for (const element of this.graph.elements) this.assignPresence(element)

        /**
         * Evaluate value expressions
         */
        for (const property of this.graph.properties.filter(it => it.present)) this.evaluateProperty(property)

        /**
         * Return result
         */
        return this.result
    }

    evaluateProperty(property: Property) {
        if (validator.isDefined(property.expression))
            property.value = this.evaluateValueExpression(property.expression, {
                element: property,
            })

        if (validator.isUndefined(property.value)) throw new Error(`${property.Display} has no value`)
        return property.value
    }

    assignPresence(element: ConditionalElement) {
        if (validator.isUndefined(this.result)) throw new Error(`Not solved yet`)

        const present = this.result[element.id]
        if (validator.isUndefined(present)) throw new Error(`${element.Display} is not part of the result`)

        element.present = present
    }

    addConditions(element: ConditionalElement) {
        // Variability group are never present
        if (element.isGroup() && element.variability) return this.solver.require(Logic.not(element.id))

        // Collect assigned conditions
        let conditions = [...element.conditions]
        if (element.isNode() || element.isRelation()) {
            element.groups.filter(group => group.variability).forEach(group => conditions.push(...group.conditions))
        }
        conditions = utils.filterNotNull<LogicExpression>(conditions)

        // If artifact is default, then check if no other artifact having the same name is present
        if (element.isArtifact() && element.default) {
            const bratans = element.container.artifactsMap.get(element.name)!.filter(it => it !== element)
            conditions = [
                {
                    not: {
                        or: bratans.map(it => it.condition),
                    },
                },
            ]
        }

        // If relation is default, then check if no other relation having the same name is present
        if (element.isRelation() && element.default) {
            const node = element.source
            const bratans = node.outgoingMap.get(element.name)!.filter(it => it !== element)
            conditions = [{not: {or: bratans.map(it => it.condition)}}]
        }

        // If property is default, then check if no other property having the same name is present
        if (element.isProperty() && element.default) {
            const bratans = element.container.propertiesMap.get(element.name)!.filter(it => it !== element)
            conditions = [{not: {or: bratans.map(it => it.condition)}}]
        }

        // Relation Default Condition: Assign default condition to relation that checks if source and target are present
        if (
            element.isRelation() &&
            this.getResolvingOptions().enable_relation_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{and: [element.source.condition, element.target.condition]}]
        }

        // Prune Relations: Additionally check that source and target are present
        if (element.isRelation() && this.getResolvingOptions().enable_relation_pruning) {
            conditions.unshift({
                and: [element.source.condition, element.target.condition],
            })
        }

        // Policy Default Condition: Assign default condition to node that checks if any target is present
        if (
            element.isPolicy() &&
            this.getResolvingOptions().enable_policy_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{has_present_targets: element.toscaId}]
        }

        // Prune Policy: Additionally check if any target is present
        if (element.isPolicy() && this.getResolvingOptions().enable_policy_pruning) {
            conditions.unshift({has_present_targets: element.toscaId})
        }

        // Group Default Condition: Assign default condition to node that checks if any member is present
        if (
            element.isGroup() &&
            this.getResolvingOptions().enable_group_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [{has_present_members: element.toscaId}]
        }

        // Prune Group: Additionally check if any member is present
        if (element.isGroup() && this.getResolvingOptions().enable_group_pruning) {
            conditions.unshift({has_present_members: element.toscaId})
        }

        // Artifact Default Condition: Assign default condition to artifact that checks if corresponding node is present
        if (
            element.isArtifact() &&
            this.getResolvingOptions().enable_artifact_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [element.container.condition]
        }

        // Prune Artifact: Additionally check if node is present
        if (element.isArtifact() && this.getResolvingOptions().enable_artifact_pruning) {
            conditions.unshift(element.container.condition)
        }

        // Property Default Condition: Assign default condition to property that checks if corresponding parent is present
        if (
            element.isProperty() &&
            this.getResolvingOptions().enable_property_default_condition &&
            utils.isEmpty(conditions)
        ) {
            conditions = [element.container.condition]
        }

        // Prune Artifact: Additionally check if corresponding parent is present
        if (element.isProperty() && this.getResolvingOptions().enable_property_pruning) {
            conditions.unshift(element.container.condition)
        }

        // Normalize conditions to one 'and' condition
        const condition = conditions.reduce<{and: LogicExpression[]}>(
            (acc, curr) => {
                acc.and.push(curr)
                return acc
            },
            {and: []}
        )

        const operand = this.translate(condition, {element})
        this.solver.require(Logic.equiv(element.id, operand))
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
        value = this.evaluateValueExpression(definition.default_expression, {})
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

    private translate(condition: LogicExpression, context: ExpressionContext): LS.Operand {
        if (validator.isString(condition)) return condition
        if (validator.isBoolean(condition)) return condition ? LS.TRUE : LS.FALSE

        // TODO: get_variability_expression
        // TODO: get_variability_input
        // TODO: get_variability_condition

        /**
         * and
         */
        if (validator.isDefined(condition.and)) {
            return Logic.and(condition.and.map(it => this.translate(it, context)))
        }

        /**
         * or
         */
        if (validator.isDefined(condition.or)) {
            return Logic.or(condition.or.map(it => this.translate(it, context)))
        }

        /**
         * not
         */
        if (validator.isDefined(condition.not)) {
            return Logic.not(this.translate(condition.not, context))
        }

        /**
         * xor
         */
        if (validator.isDefined(condition.xor)) {
            // TODO: our definition is different than Logic.xor
            return Logic.exactlyOne(condition.xor.map(it => this.translate(it, context)))
        }

        /**
         * implies
         */
        if (validator.isDefined(condition.implies)) {
            return Logic.implies(
                this.translate(condition.implies[0], context),
                this.translate(condition.implies[1], context)
            )
        }

        /**
         * get_node_presence
         */
        if (validator.isDefined(condition.get_node_presence)) {
            let node: Node | undefined
            if (validator.isDefined(condition._cached_element)) {
                const element = condition._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (validator.isUndefined(node)) {
                const name = condition.get_node_presence
                validator.ensureStringOrNumber(name)
                node = this.graph.getNode(name)
            }

            return node.id
        }

        /**
         * get_relation_presence
         */
        if (validator.isDefined(condition.get_relation_presence)) {
            let relation: Relation | undefined

            if (validator.isDefined(condition._cached_element)) {
                const element = condition._cached_element
                if (!element.isRelation()) throw new Error(`${element.Display} is not a relation`)
                relation = element
            }

            if (validator.isUndefined(relation)) {
                const node = condition.get_relation_presence[0]
                validator.ensureString(node)

                const id = condition.get_relation_presence[1]
                validator.ensureStringOrNumber(id)

                relation = this.graph.getRelation([node, id])
            }

            return relation.id
        }

        /**
         * get_source_presence
         */
        if (validator.isDefined(condition.get_source_presence)) {
            const element = condition.get_source_presence
            validator.ensureString(element)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "get_source_presence" but received "${element}"`)
            if (validator.isUndefined(context.element))
                throw new Error(`Context of condition ${utils.prettyJSON(condition)} does not hold an element`)
            if (!context.element.isRelation()) throw new Error(`"get_source_presence" is only valid inside a relation`)

            return context.element.source.id
        }

        /**
         * get_target_presence
         */
        if (validator.isDefined(condition.get_target_presence)) {
            const element = condition.get_target_presence
            validator.ensureString(element)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "get_target_presence" but received "${element}"`)
            if (validator.isUndefined(context.element))
                throw new Error(`Context of condition ${utils.prettyJSON(condition)} does not hold an element`)
            if (!context.element.isRelation()) throw new Error(`"get_target_presence" is only valid inside a relation`)

            return context.element.target.id
        }

        /**
         * get_policy_presence
         */
        if (validator.isDefined(condition.get_policy_presence)) {
            let policy: Policy | undefined
            if (validator.isDefined(condition._cached_element)) {
                const element = condition._cached_element
                if (!element.isPolicy()) throw new Error(`${element.Display} is not a policy`)
                policy = element
            }

            if (validator.isUndefined(policy)) {
                const name = condition.get_policy_presence
                validator.ensureStringOrNumber(name)
                policy = this.graph.getPolicy(name)
            }

            return policy.id
        }

        /**
         * has_present_targets
         */
        if (validator.isDefined(condition.has_present_targets)) {
            let policy: Policy | undefined
            if (validator.isDefined(condition._cached_element)) {
                const element = condition._cached_element
                if (!element.isPolicy()) throw new Error(`${element.Display} is not a policy`)
                policy = element
            }

            if (validator.isUndefined(policy)) {
                const name = condition.has_present_targets
                validator.ensureStringOrNumber(name)
                policy = this.graph.getPolicy(name)
            }

            return Logic.or(
                policy.targets.map(it => {
                    // Node
                    if (it.isNode()) return it.id

                    // Group
                    return Logic.or(it.members.map(it => it.id))
                })
            )
        }

        /**
         * get_group_presence
         */
        if (validator.isDefined(condition.get_group_presence)) {
            let group: Group | undefined
            if (validator.isDefined(condition._cached_element)) {
                const element = condition._cached_element
                if (!element.isGroup()) throw new Error(`${element.Display} is not a group`)
                group = element
            }

            if (validator.isUndefined(group)) {
                const name = condition.get_group_presence
                validator.ensureString(name)
                group = this.graph.getGroup(name)
            }

            return group.id
        }

        /**
         * has_present_member
         */
        if (validator.isDefined(condition.has_present_members)) {
            let group: Group | undefined
            if (validator.isDefined(condition._cached_element)) {
                const element = condition._cached_element
                if (!element.isGroup()) throw new Error(`${element.Display} is not a group`)
                group = element
            }

            if (validator.isUndefined(group)) {
                const name = condition.has_present_members
                validator.ensureString(name)
                group = this.graph.getGroup(name)
            }

            return Logic.or(group.members.map(it => it.id))
        }

        /**
         * get_artifact_presence
         */
        if (validator.isDefined(condition.get_artifact_presence)) {
            let artifact: Artifact | undefined
            if (validator.isDefined(condition._cached_element)) {
                const element = condition._cached_element
                if (!element.isArtifact()) throw new Error(`${element.Display} is not an artifact`)
                artifact = element
            }

            if (validator.isUndefined(artifact)) {
                validator.ensureString(condition.get_artifact_presence[0])
                validator.ensureStringOrNumber(condition.get_artifact_presence[1])
                artifact = this.graph.getArtifact(condition.get_artifact_presence)
            }

            return artifact.id
        }

        /**
         * get_property_presence
         */
        if (validator.isDefined(condition.get_property_presence)) {
            let property: Property | undefined
            if (validator.isDefined(condition._cached_element)) {
                const element = condition._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (validator.isUndefined(property)) {
                validator.ensureString(condition.get_property_presence[0])
                validator.ensureStringOrNumber(condition.get_property_presence[1])
                property = this.graph.getProperty(condition.get_property_presence)
            }

            return property.id
        }

        /**
         * get_input_presence
         */
        if (validator.isDefined(condition.get_input_presence)) {
            let input: Input | undefined
            if (validator.isDefined(condition._cached_element)) {
                const element = condition._cached_element
                if (!element.isInput()) throw new Error(`${element.Display} is not an input`)
                input = element
            }

            if (validator.isUndefined(input)) {
                const name = condition.get_input_presence
                validator.ensureString(name)
                input = this.graph.getInput(name)
            }

            return input.id
        }

        throw new Error(`Unknown logic expression "${utils.prettyJSON(condition)}"`)
    }

    evaluateValueExpression(condition: ValueExpression, context: ExpressionContext): InputAssignmentValue {
        if (validator.isObject(condition) && !validator.isArray(condition)) {
            if (validator.isDefined(condition._cached_result)) return condition._cached_result
            const result = this.evaluateValueExpressionRunner(condition, context)
            condition._cached_result = result
            return result
        }

        return this.evaluateValueExpressionRunner(condition, context)
    }

    private evaluateValueExpressionRunner(
        condition: ValueExpression,
        context: ExpressionContext
    ): InputAssignmentValue {
        validator.ensureDefined(condition, `Received undefined condition`)

        if (validator.isString(condition)) return condition
        if (validator.isBoolean(condition)) return condition
        if (validator.isNumber(condition)) return condition
        if (validator.isArray(condition)) return condition

        /**
         * add
         */
        if (validator.isDefined(condition.add)) {
            return condition.add.reduce<number>((sum, element) => {
                const value = this.evaluateValueExpression(element, context)
                validator.ensureNumber(value)
                return sum + value
            }, 0)
        }

        /**
         * sub
         */
        if (validator.isDefined(condition.sub)) {
            const first = this.evaluateValueExpression(condition.sub[0], context)
            validator.ensureNumber(first)

            return condition.sub.slice(1).reduce<number>((difference, element) => {
                const value = this.evaluateValueExpression(element, context)
                validator.ensureNumber(value)
                return difference - value
            }, first)
        }

        /**
         * mul
         */
        if (validator.isDefined(condition.mul)) {
            return condition.mul.reduce<number>((product, element) => {
                const value = this.evaluateValueExpression(element, context)
                validator.ensureNumber(value)
                return product * value
            }, 1)
        }

        /**
         * div
         */
        if (validator.isDefined(condition.div)) {
            const first = this.evaluateValueExpression(condition.div[0], context)
            validator.ensureNumber(first)

            return condition.div.slice(1).reduce<number>((quotient, element) => {
                const value = this.evaluateValueExpression(element, context)
                validator.ensureNumber(value)
                return quotient / value
            }, first)
        }

        /**
         * mod
         */
        if (validator.isDefined(condition.mod)) {
            const first = this.evaluateValueExpression(condition.mod[0], context)
            validator.ensureNumber(first)

            const second = this.evaluateValueExpression(condition.mod[1], context)
            validator.ensureNumber(second)

            return first % second
        }

        /**
         * get_variability_input
         */
        if (validator.isDefined(condition.get_variability_input)) {
            validator.ensureString(condition.get_variability_input)
            return this.evaluateValueExpression(this.getInput(condition.get_variability_input), context)
        }

        /**
         * get_variability_expression
         */
        if (validator.isDefined(condition.get_variability_expression)) {
            validator.ensureString(condition.get_variability_expression)
            return this.evaluateValueExpression(
                this.getExpression(condition.get_variability_expression) as ValueExpression,
                context
            )
        }

        /**
         * concat
         */
        if (validator.isDefined(condition.concat)) {
            return condition.concat.map(c => this.evaluateValueExpression(c, context)).join('')
        }

        /**
         * join
         */
        if (validator.isDefined(condition.join)) {
            return condition.join[0].map(c => this.evaluateValueExpression(c, context)).join(condition.join[1])
        }

        /**
         * token
         */
        if (validator.isDefined(condition.token)) {
            const element = this.evaluateValueExpression(condition.token[0], context)
            validator.ensureString(element)
            const token = condition.token[1]
            const index = condition.token[2]
            return element.split(token)[index]
        }

        /**
         * equal
         */
        if (validator.isDefined(condition.equal)) {
            const first = this.evaluateValueExpression(condition.equal[0], context)
            return condition.equal.every(element => {
                const value = this.evaluateValueExpression(element, context)
                return value === first
            })
        }

        /**
         * greater
         */
        if (validator.isDefined(condition.greater)) {
            return (
                this.evaluateValueExpression(condition.greater[0], context) >
                this.evaluateValueExpression(condition.greater[1], context)
            )
        }

        /**
         * greater_or_equal
         */
        if (validator.isDefined(condition.greater_or_equal)) {
            return (
                this.evaluateValueExpression(condition.greater_or_equal[0], context) >=
                this.evaluateValueExpression(condition.greater_or_equal[1], context)
            )
        }

        /**
         * less
         */
        if (validator.isDefined(condition.less)) {
            return (
                this.evaluateValueExpression(condition.less[0], context) <
                this.evaluateValueExpression(condition.less[1], context)
            )
        }

        /**
         * less_or_equal
         */
        if (validator.isDefined(condition.less_or_equal)) {
            return (
                this.evaluateValueExpression(condition.less_or_equal[0], context) <=
                this.evaluateValueExpression(condition.less_or_equal[1], context)
            )
        }

        /**
         * in_range
         */
        if (validator.isDefined(condition.in_range)) {
            const element = this.evaluateValueExpression(condition.in_range[0], context)
            const lower = condition.in_range[1][0]
            const upper = condition.in_range[1][1]
            return lower <= element && element <= upper
        }

        /**
         * valid_values
         */
        if (validator.isDefined(condition.valid_values)) {
            const element = this.evaluateValueExpression(condition.valid_values[0], context)
            const valid = condition.valid_values[1].map(c => this.evaluateValueExpression(c, context))
            return valid.includes(element)
        }

        /**
         * length
         */
        if (validator.isDefined(condition.length)) {
            const element = this.evaluateValueExpression(condition.length[0], context)
            validator.ensureString(element)

            const length = this.evaluateValueExpression(condition.length[1], context)
            validator.ensureNumber(length)

            return element.length === length
        }

        /**
         * min_length
         */
        if (validator.isDefined(condition.min_length)) {
            const element = this.evaluateValueExpression(condition.min_length[0], context)
            validator.ensureString(element)

            const length = this.evaluateValueExpression(condition.min_length[1], context)
            validator.ensureNumber(length)

            return element.length >= length
        }

        /**
         * max_length
         */
        if (validator.isDefined(condition.max_length)) {
            const element = this.evaluateValueExpression(condition.max_length[0], context)
            validator.ensureString(element)

            const length = this.evaluateValueExpression(condition.max_length[1], context)
            validator.ensureNumber(length)

            return element.length <= length
        }

        /**
         * sum
         */
        if (validator.isDefined(condition.sum)) {
            const elements = condition.sum
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.sum(elements))
        }

        /**
         * count
         */
        if (validator.isDefined(condition.count)) {
            const elements = condition.count
            validator.ensureNumbers(elements)
            return elements.length
        }

        /**
         * min
         */
        if (validator.isDefined(condition.min)) {
            const elements = condition.min
            validator.ensureNumbers(elements)
            const min = _.min(elements)
            ensureDefined(min, `Minimum of "${JSON.stringify(elements)}" does not exist`)
            return min
        }

        /**
         * max
         */
        if (validator.isDefined(condition.max)) {
            const elements = condition.max
            validator.ensureNumbers(elements)
            const max = _.max(elements)
            ensureDefined(max, `Maximum of "${JSON.stringify(elements)}" does not exist`)
            return max
        }

        /**
         * median
         */
        if (validator.isDefined(condition.median)) {
            const elements = condition.median
            validator.ensureNumbers(elements)
            return stats.median(elements)
        }

        /**
         * mean
         */
        if (validator.isDefined(condition.mean)) {
            const elements = condition.mean
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.mean(elements))
        }

        /**
         * variance
         */
        if (validator.isDefined(condition.variance)) {
            const elements = condition.variance
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.variance(elements))
        }

        /**
         * standard_deviation
         */
        if (validator.isDefined(condition.standard_deviation)) {
            const elements = condition.standard_deviation
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.stdev(elements))
        }

        /**
         * linear_regression
         */
        if (validator.isDefined(condition.linear_regression)) {
            ensureArray(condition.linear_regression)
            const elements = condition.linear_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const prediction = condition.linear_regression[1]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.linear(elements).predict(prediction)[1])
        }

        /**
         * polynomial_regression
         */
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

        /**
         * logarithmic_regression
         */
        if (validator.isDefined(condition.logarithmic_regression)) {
            ensureArray(condition.logarithmic_regression)
            const elements = condition.logarithmic_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const prediction = condition.logarithmic_regression[1]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.logarithmic(elements).predict(prediction)[1])
        }

        /**
         * exponential_regression
         */
        if (validator.isDefined(condition.exponential_regression)) {
            ensureArray(condition.exponential_regression)
            const elements = condition.exponential_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const prediction = condition.exponential_regression[1]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.exponential(elements).predict(prediction)[1])
        }

        /**
         * weekday
         */
        if (validator.isDefined(condition.weekday)) {
            return this.weekday
        }

        /**
         * same
         */
        if (validator.isDefined(condition.same)) {
            validator.ensureArray(condition.same)

            const first = day(condition.same[0])
            validator.ensureDate(first)

            const second = day(condition.same[1])
            validator.ensureDate(second)

            return first.isSame(second)
        }

        /**
         * before
         */
        if (validator.isDefined(condition.before)) {
            validator.ensureArray(condition.before)

            const first = day(condition.before[0])
            validator.ensureDate(first)

            const second = day(condition.before[1])
            validator.ensureDate(second)

            return first.isBefore(second)
        }

        /**
         * before_or_same
         */
        if (validator.isDefined(condition.before_or_same)) {
            validator.ensureArray(condition.before_or_same)

            const first = day(condition.before_or_same[0])
            validator.ensureDate(first)

            const second = day(condition.before_or_same[1])
            validator.ensureDate(second)

            return first.isSameOrBefore(second)
        }

        /**
         * after
         */
        if (validator.isDefined(condition.after)) {
            validator.ensureArray(condition.after)

            const first = day(condition.after[0])
            validator.ensureDate(first)

            const second = day(condition.after[1])
            validator.ensureDate(second)

            return first.isAfter(second)
        }

        /**
         * after_or_same
         */
        if (validator.isDefined(condition.after_or_same)) {
            validator.ensureArray(condition.after_or_same)

            const first = day(condition.after_or_same[0])
            validator.ensureDate(first)

            const second = day(condition.after_or_same[1])
            validator.ensureDate(second)

            return first.isSameOrAfter(second)
        }

        /**
         * within
         */
        if (validator.isDefined(condition.within)) {
            validator.ensureArray(condition.within)
            validator.ensureArray(condition.within[1])

            const element = day(condition.within[0])
            validator.ensureDate(element)

            const lower = day(condition.within[1][0])
            validator.ensureDate(lower)

            const upper = day(condition.within[1][1])
            validator.ensureDate(upper)

            return element.isBetween(lower, upper)
        }

        throw new Error(`Unknown value expression "${utils.prettyJSON(condition)}"`)
    }
}
