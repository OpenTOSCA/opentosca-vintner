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

// TODO: logic expression in value expressions
// TODO: fix package minisat ... see https://github.com/vercel/pkg/issues/641#issuecomment-1372237761 and https://github.com/OpenTOSCA/opentosca-vintner/actions/runs/4399164240/jobs/7703509851

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

        const operand = this.transform(condition, {element})
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

    getLogicExpression(name: string) {
        const condition: VariabilityExpression | undefined = (this.options?.expressions || {})[name]
        validator.ensureDefined(condition, `Did not find variability expression "${name}"`)
        return condition as LogicExpression
    }

    getValueExpression(name: string) {
        const condition: VariabilityExpression | undefined = (this.options?.expressions || {})[name]
        validator.ensureDefined(condition, `Did not find variability expression "${name}"`)
        return condition as ValueExpression
    }

    private transform(expression: LogicExpression, context: ExpressionContext): LS.Operand {
        if (validator.isString(expression)) return expression
        if (validator.isBoolean(expression)) return expression ? LS.TRUE : LS.FALSE

        /**
         * get_logic_expression
         */
        if (validator.isDefined(expression.get_logic_expression)) {
            const name = expression.get_logic_expression
            validator.ensureString(name)
            const found = this.getLogicExpression(name)

            if (validator.isString(found))
                throw new Error(`Logic expression "${utils.prettyJSON(expression)}" must not be a string`)

            if (validator.isBoolean(found)) return this.transform(found, context)

            if (validator.isUndefined(found._id)) found._id = 'expression.' + name

            if (validator.isUndefined(found._visited)) {
                const operand = this.transform(found, context)
                this.solver.require(Logic.equiv(found._id, operand))
                found._visited = true
            }

            return found._id
        }

        /**
         * and
         */
        if (validator.isDefined(expression.and)) {
            return Logic.and(expression.and.map(it => this.transform(it, context)))
        }

        /**
         * or
         */
        if (validator.isDefined(expression.or)) {
            return Logic.or(expression.or.map(it => this.transform(it, context)))
        }

        /**
         * not
         */
        if (validator.isDefined(expression.not)) {
            return Logic.not(this.transform(expression.not, context))
        }

        /**
         * xor
         */
        if (validator.isDefined(expression.xor)) {
            // TODO: our definition is different than Logic.xor
            return Logic.exactlyOne(expression.xor.map(it => this.transform(it, context)))
        }

        /**
         * implies
         */
        if (validator.isDefined(expression.implies)) {
            return Logic.implies(
                this.transform(expression.implies[0], context),
                this.transform(expression.implies[1], context)
            )
        }

        /**
         * get_node_presence
         */
        if (validator.isDefined(expression.get_node_presence)) {
            let node: Node | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (validator.isUndefined(node)) {
                const name = expression.get_node_presence
                validator.ensureStringOrNumber(name)
                node = this.graph.getNode(name)
            }

            return node.id
        }

        /**
         * get_relation_presence
         */
        if (validator.isDefined(expression.get_relation_presence)) {
            let relation: Relation | undefined

            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isRelation()) throw new Error(`${element.Display} is not a relation`)
                relation = element
            }

            if (validator.isUndefined(relation)) {
                const node = expression.get_relation_presence[0]
                validator.ensureString(node)

                const id = expression.get_relation_presence[1]
                validator.ensureStringOrNumber(id)

                relation = this.graph.getRelation([node, id])
            }

            return relation.id
        }

        /**
         * get_source_presence
         */
        if (validator.isDefined(expression.get_source_presence)) {
            const element = expression.get_source_presence
            validator.ensureString(element)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "get_source_presence" but received "${element}"`)
            if (validator.isUndefined(context.element))
                throw new Error(`Context of condition ${utils.prettyJSON(expression)} does not hold an element`)
            if (!context.element.isRelation()) throw new Error(`"get_source_presence" is only valid inside a relation`)

            return context.element.source.id
        }

        /**
         * get_target_presence
         */
        if (validator.isDefined(expression.get_target_presence)) {
            const element = expression.get_target_presence
            validator.ensureString(element)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "get_target_presence" but received "${element}"`)
            if (validator.isUndefined(context.element))
                throw new Error(`Context of condition ${utils.prettyJSON(expression)} does not hold an element`)
            if (!context.element.isRelation()) throw new Error(`"get_target_presence" is only valid inside a relation`)

            return context.element.target.id
        }

        /**
         * get_policy_presence
         */
        if (validator.isDefined(expression.get_policy_presence)) {
            let policy: Policy | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isPolicy()) throw new Error(`${element.Display} is not a policy`)
                policy = element
            }

            if (validator.isUndefined(policy)) {
                const name = expression.get_policy_presence
                validator.ensureStringOrNumber(name)
                policy = this.graph.getPolicy(name)
            }

            return policy.id
        }

        /**
         * has_present_targets
         */
        if (validator.isDefined(expression.has_present_targets)) {
            let policy: Policy | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isPolicy()) throw new Error(`${element.Display} is not a policy`)
                policy = element
            }

            if (validator.isUndefined(policy)) {
                const name = expression.has_present_targets
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
        if (validator.isDefined(expression.get_group_presence)) {
            let group: Group | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isGroup()) throw new Error(`${element.Display} is not a group`)
                group = element
            }

            if (validator.isUndefined(group)) {
                const name = expression.get_group_presence
                validator.ensureString(name)
                group = this.graph.getGroup(name)
            }

            return group.id
        }

        /**
         * has_present_member
         */
        if (validator.isDefined(expression.has_present_members)) {
            let group: Group | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isGroup()) throw new Error(`${element.Display} is not a group`)
                group = element
            }

            if (validator.isUndefined(group)) {
                const name = expression.has_present_members
                validator.ensureString(name)
                group = this.graph.getGroup(name)
            }

            return Logic.or(group.members.map(it => it.id))
        }

        /**
         * get_artifact_presence
         */
        if (validator.isDefined(expression.get_artifact_presence)) {
            let artifact: Artifact | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isArtifact()) throw new Error(`${element.Display} is not an artifact`)
                artifact = element
            }

            if (validator.isUndefined(artifact)) {
                validator.ensureString(expression.get_artifact_presence[0])
                validator.ensureStringOrNumber(expression.get_artifact_presence[1])
                artifact = this.graph.getArtifact(expression.get_artifact_presence)
            }

            return artifact.id
        }

        /**
         * get_property_presence
         */
        if (validator.isDefined(expression.get_property_presence)) {
            let property: Property | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (validator.isUndefined(property)) {
                validator.ensureString(expression.get_property_presence[0])
                validator.ensureStringOrNumber(expression.get_property_presence[1])
                property = this.graph.getProperty(expression.get_property_presence)
            }

            return property.id
        }

        /**
         * get_input_presence
         */
        if (validator.isDefined(expression.get_input_presence)) {
            let input: Input | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isInput()) throw new Error(`${element.Display} is not an input`)
                input = element
            }

            if (validator.isUndefined(input)) {
                const name = expression.get_input_presence
                validator.ensureString(name)
                input = this.graph.getInput(name)
            }

            return input.id
        }

        /**
         * Assume that expression is a value expression that returns a boolean
         */
        const result = this.evaluateValueExpression(expression, context)
        validator.ensureBoolean(result)
        return this.transform(result, context)
    }

    evaluateValueExpression(expression: ValueExpression, context: ExpressionContext): InputAssignmentValue {
        if (validator.isObject(expression) && !validator.isArray(expression)) {
            if (validator.isDefined(expression._cached_result)) return expression._cached_result
            const result = this.evaluateValueExpressionRunner(expression, context)
            expression._cached_result = result
            return result
        }

        return this.evaluateValueExpressionRunner(expression, context)
    }

    private evaluateValueExpressionRunner(
        expression: ValueExpression,
        context: ExpressionContext
    ): InputAssignmentValue {
        validator.ensureDefined(expression, `Received undefined condition`)

        if (validator.isString(expression)) return expression
        if (validator.isBoolean(expression)) return expression
        if (validator.isNumber(expression)) return expression
        if (validator.isArray(expression)) return expression

        /**
         * add
         */
        if (validator.isDefined(expression.add)) {
            return expression.add.reduce<number>((sum, element) => {
                const value = this.evaluateValueExpression(element, context)
                validator.ensureNumber(value)
                return sum + value
            }, 0)
        }

        /**
         * sub
         */
        if (validator.isDefined(expression.sub)) {
            const first = this.evaluateValueExpression(expression.sub[0], context)
            validator.ensureNumber(first)

            return expression.sub.slice(1).reduce<number>((difference, element) => {
                const value = this.evaluateValueExpression(element, context)
                validator.ensureNumber(value)
                return difference - value
            }, first)
        }

        /**
         * mul
         */
        if (validator.isDefined(expression.mul)) {
            return expression.mul.reduce<number>((product, element) => {
                const value = this.evaluateValueExpression(element, context)
                validator.ensureNumber(value)
                return product * value
            }, 1)
        }

        /**
         * div
         */
        if (validator.isDefined(expression.div)) {
            const first = this.evaluateValueExpression(expression.div[0], context)
            validator.ensureNumber(first)

            return expression.div.slice(1).reduce<number>((quotient, element) => {
                const value = this.evaluateValueExpression(element, context)
                validator.ensureNumber(value)
                return quotient / value
            }, first)
        }

        /**
         * mod
         */
        if (validator.isDefined(expression.mod)) {
            const first = this.evaluateValueExpression(expression.mod[0], context)
            validator.ensureNumber(first)

            const second = this.evaluateValueExpression(expression.mod[1], context)
            validator.ensureNumber(second)

            return first % second
        }

        /**
         * get_variability_input
         */
        if (validator.isDefined(expression.get_variability_input)) {
            validator.ensureString(expression.get_variability_input)
            return this.evaluateValueExpression(this.getInput(expression.get_variability_input), context)
        }

        /**
         * get_value_expression
         */
        if (validator.isDefined(expression.get_value_expression)) {
            validator.ensureString(expression.get_value_expression)
            return this.evaluateValueExpression(this.getValueExpression(expression.get_value_expression), context)
        }

        /**
         * concat
         */
        if (validator.isDefined(expression.concat)) {
            return expression.concat.map(c => this.evaluateValueExpression(c, context)).join('')
        }

        /**
         * join
         */
        if (validator.isDefined(expression.join)) {
            return expression.join[0].map(c => this.evaluateValueExpression(c, context)).join(expression.join[1])
        }

        /**
         * token
         */
        if (validator.isDefined(expression.token)) {
            const element = this.evaluateValueExpression(expression.token[0], context)
            validator.ensureString(element)
            const token = expression.token[1]
            const index = expression.token[2]
            return element.split(token)[index]
        }

        /**
         * equal
         */
        if (validator.isDefined(expression.equal)) {
            const first = this.evaluateValueExpression(expression.equal[0], context)
            return expression.equal.every(element => {
                const value = this.evaluateValueExpression(element, context)
                return value === first
            })
        }

        /**
         * greater
         */
        if (validator.isDefined(expression.greater)) {
            return (
                this.evaluateValueExpression(expression.greater[0], context) >
                this.evaluateValueExpression(expression.greater[1], context)
            )
        }

        /**
         * greater_or_equal
         */
        if (validator.isDefined(expression.greater_or_equal)) {
            return (
                this.evaluateValueExpression(expression.greater_or_equal[0], context) >=
                this.evaluateValueExpression(expression.greater_or_equal[1], context)
            )
        }

        /**
         * less
         */
        if (validator.isDefined(expression.less)) {
            return (
                this.evaluateValueExpression(expression.less[0], context) <
                this.evaluateValueExpression(expression.less[1], context)
            )
        }

        /**
         * less_or_equal
         */
        if (validator.isDefined(expression.less_or_equal)) {
            return (
                this.evaluateValueExpression(expression.less_or_equal[0], context) <=
                this.evaluateValueExpression(expression.less_or_equal[1], context)
            )
        }

        /**
         * in_range
         */
        if (validator.isDefined(expression.in_range)) {
            const element = this.evaluateValueExpression(expression.in_range[0], context)
            const lower = expression.in_range[1][0]
            const upper = expression.in_range[1][1]
            return lower <= element && element <= upper
        }

        /**
         * valid_values
         */
        if (validator.isDefined(expression.valid_values)) {
            const element = this.evaluateValueExpression(expression.valid_values[0], context)
            const valid = expression.valid_values[1].map(c => this.evaluateValueExpression(c, context))
            return valid.includes(element)
        }

        /**
         * length
         */
        if (validator.isDefined(expression.length)) {
            const element = this.evaluateValueExpression(expression.length[0], context)
            validator.ensureString(element)

            const length = this.evaluateValueExpression(expression.length[1], context)
            validator.ensureNumber(length)

            return element.length === length
        }

        /**
         * min_length
         */
        if (validator.isDefined(expression.min_length)) {
            const element = this.evaluateValueExpression(expression.min_length[0], context)
            validator.ensureString(element)

            const length = this.evaluateValueExpression(expression.min_length[1], context)
            validator.ensureNumber(length)

            return element.length >= length
        }

        /**
         * max_length
         */
        if (validator.isDefined(expression.max_length)) {
            const element = this.evaluateValueExpression(expression.max_length[0], context)
            validator.ensureString(element)

            const length = this.evaluateValueExpression(expression.max_length[1], context)
            validator.ensureNumber(length)

            return element.length <= length
        }

        /**
         * sum
         */
        if (validator.isDefined(expression.sum)) {
            const elements = expression.sum
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.sum(elements))
        }

        /**
         * count
         */
        if (validator.isDefined(expression.count)) {
            const elements = expression.count
            validator.ensureNumbers(elements)
            return elements.length
        }

        /**
         * min
         */
        if (validator.isDefined(expression.min)) {
            const elements = expression.min
            validator.ensureNumbers(elements)
            const min = _.min(elements)
            ensureDefined(min, `Minimum of "${JSON.stringify(elements)}" does not exist`)
            return min
        }

        /**
         * max
         */
        if (validator.isDefined(expression.max)) {
            const elements = expression.max
            validator.ensureNumbers(elements)
            const max = _.max(elements)
            ensureDefined(max, `Maximum of "${JSON.stringify(elements)}" does not exist`)
            return max
        }

        /**
         * median
         */
        if (validator.isDefined(expression.median)) {
            const elements = expression.median
            validator.ensureNumbers(elements)
            return stats.median(elements)
        }

        /**
         * mean
         */
        if (validator.isDefined(expression.mean)) {
            const elements = expression.mean
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.mean(elements))
        }

        /**
         * variance
         */
        if (validator.isDefined(expression.variance)) {
            const elements = expression.variance
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.variance(elements))
        }

        /**
         * standard_deviation
         */
        if (validator.isDefined(expression.standard_deviation)) {
            const elements = expression.standard_deviation
            validator.ensureNumbers(elements)
            return utils.toFixed(stats.stdev(elements))
        }

        /**
         * linear_regression
         */
        if (validator.isDefined(expression.linear_regression)) {
            ensureArray(expression.linear_regression)
            const elements = expression.linear_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const prediction = expression.linear_regression[1]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.linear(elements).predict(prediction)[1])
        }

        /**
         * polynomial_regression
         */
        if (validator.isDefined(expression.polynomial_regression)) {
            ensureArray(expression.polynomial_regression)
            const elements = expression.polynomial_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const order = expression.polynomial_regression[1]
            validator.ensureNumber(order)

            const prediction = expression.polynomial_regression[2]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.polynomial(elements, {order}).predict(prediction)[1])
        }

        /**
         * logarithmic_regression
         */
        if (validator.isDefined(expression.logarithmic_regression)) {
            ensureArray(expression.logarithmic_regression)
            const elements = expression.logarithmic_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const prediction = expression.logarithmic_regression[1]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.logarithmic(elements).predict(prediction)[1])
        }

        /**
         * exponential_regression
         */
        if (validator.isDefined(expression.exponential_regression)) {
            ensureArray(expression.exponential_regression)
            const elements = expression.exponential_regression[0]
            validator.ensureArray(elements)
            elements.forEach(it => validator.ensureNumbers(it))

            const prediction = expression.exponential_regression[1]
            validator.ensureNumber(prediction)

            return utils.toFixed(regression.exponential(elements).predict(prediction)[1])
        }

        /**
         * weekday
         */
        if (validator.isDefined(expression.weekday)) {
            return this.weekday
        }

        /**
         * same
         */
        if (validator.isDefined(expression.same)) {
            validator.ensureArray(expression.same)

            const first = day(expression.same[0])
            validator.ensureDate(first)

            const second = day(expression.same[1])
            validator.ensureDate(second)

            return first.isSame(second)
        }

        /**
         * before
         */
        if (validator.isDefined(expression.before)) {
            validator.ensureArray(expression.before)

            const first = day(expression.before[0])
            validator.ensureDate(first)

            const second = day(expression.before[1])
            validator.ensureDate(second)

            return first.isBefore(second)
        }

        /**
         * before_or_same
         */
        if (validator.isDefined(expression.before_or_same)) {
            validator.ensureArray(expression.before_or_same)

            const first = day(expression.before_or_same[0])
            validator.ensureDate(first)

            const second = day(expression.before_or_same[1])
            validator.ensureDate(second)

            return first.isSameOrBefore(second)
        }

        /**
         * after
         */
        if (validator.isDefined(expression.after)) {
            validator.ensureArray(expression.after)

            const first = day(expression.after[0])
            validator.ensureDate(first)

            const second = day(expression.after[1])
            validator.ensureDate(second)

            return first.isAfter(second)
        }

        /**
         * after_or_same
         */
        if (validator.isDefined(expression.after_or_same)) {
            validator.ensureArray(expression.after_or_same)

            const first = day(expression.after_or_same[0])
            validator.ensureDate(first)

            const second = day(expression.after_or_same[1])
            validator.ensureDate(second)

            return first.isSameOrAfter(second)
        }

        /**
         * within
         */
        if (validator.isDefined(expression.within)) {
            validator.ensureArray(expression.within)
            validator.ensureArray(expression.within[1])

            const element = day(expression.within[0])
            validator.ensureDate(element)

            const lower = day(expression.within[1][0])
            validator.ensureDate(lower)

            const upper = day(expression.within[1][1])
            validator.ensureDate(upper)

            return element.isBetween(lower, upper)
        }

        throw new Error(`Unknown value expression "${utils.prettyJSON(expression)}"`)
    }
}
