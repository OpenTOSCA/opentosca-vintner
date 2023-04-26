import {
    Artifact,
    ConditionalElement,
    Graph,
    Group,
    Input,
    Node,
    Policy,
    Property,
    Relation,
    Type,
} from '#/resolver/graph'
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
import MiniSat from 'logic-solver'

type ExpressionContext = {
    element?: ConditionalElement
}

export default class Solver {
    private readonly graph: Graph
    private readonly options?: VariabilityDefinition

    readonly minisat = new MiniSat.Solver()
    private result?: Record<string, boolean>

    // Some operations on MiniSat cannot be undone
    private processed = false
    private transformed = false

    private inputs: InputAssignmentMap = {}
    private weekday = utils.weekday()

    constructor(graph: Graph) {
        this.graph = graph
        this.options = graph.serviceTemplate.topology_template?.variability
    }

    /**
     * Transform assigned conditions to MiniSat clauses
     * Note, this also evaluates value expressions if they are part of logic expressions
     */
    transform() {
        if (this.transformed) return
        this.transformed = true

        for (const element of this.graph.elements) this.transformConditions(element)
    }

    run() {
        if (this.processed) throw new Error(`Has been already solved`)
        this.processed = true

        this.transform()

        /**
         * Get initial solution
         */
        const solution = this.minisat.solve()
        if (validator.isUndefined(solution)) throw new Error(`Could not solve`)

        /**
         * Get optimized solution
         */
        if (
            this.graph.options.solver.optimization === true ||
            validator.isString(this.graph.options.solver.optimization)
        ) {
            const nodes = this.graph.nodes.map(it => it.id)
            const weights = this.graph.nodes.map(it => it.weight)
            let optimized

            /**
             * Minimize weight of node templates
             */
            if (this.graph.options.solver.optimization === true || this.graph.options.solver.optimization === 'min') {
                optimized = this.minisat.minimizeWeightedSum(solution, nodes, weights)
            }

            /**
             * Maximize weight of node templates
             */
            if (this.graph.options.solver.optimization === 'max') {
                optimized = this.minisat.maximizeWeightedSum(solution, nodes, weights)
            }

            if (validator.isUndefined(optimized)) throw new Error(`Could not optimize`)
            this.result = optimized.getMap()
        } else {
            this.result = solution.getMap()
        }

        /**
         * Assign presence to elements
         */
        for (const element of this.graph.elements) {
            const present = this.result[element.id]
            if (validator.isUndefined(present)) throw new Error(`${element.Display} is not part of the result`)
            element.present = present
        }

        /**
         * Evaluate value expressions
         */
        for (const property of this.graph.properties.filter(it => it.present)) this.evaluateProperty(property)

        /**
         * Note, input default expressions are evaluated on-demand in {@link getInput}
         */

        /**
         * Return result
         */
        return this.result
    }

    solveAll() {
        if (this.processed) throw new Error(`Has been already solved`)
        this.processed = true

        this.transform()

        const results = []
        let result
        while ((result = this.minisat.solve())) {
            results.push(result.getMap())
            this.minisat.forbid(result.getFormula())
        }

        return results
    }

    /**
     * Export clauses to readable string
     * See https://people.sc.fsu.edu/~jburkardt/data/cnf/cnf.html
     */
    toCNF() {
        this.transform()

        const and: string[] = []
        for (const clause of this.minisat.clauses) {
            const or: string[] = []

            for (const term of clause.terms) {
                let name = this.minisat.getVarName(Math.abs(term))
                if (name === MiniSat.FALSE) name = 'false'
                if (name === MiniSat.TRUE) name = 'true'

                if (term < 0) {
                    or.push('not(' + name + ')')
                } else {
                    or.push(name)
                }
            }
            //and.push('(' + or.join(' or ') + ')')
            and.push(or.join(' or '))
        }
        //return and.join(' and ')
        return and.join('\n')
    }

    evaluateProperty(property: Property) {
        if (validator.isDefined(property.expression))
            property.value = this.evaluateValueExpression(property.expression, {
                element: property,
            })

        if (validator.isUndefined(property.value)) throw new Error(`${property.Display} has no value`)
        return property.value
    }

    transformConditions(element: ConditionalElement) {
        // Variability group are never present
        if (element.isGroup() && element.variability) return this.minisat.require(MiniSat.not(element.id))

        // Collect assigned conditions
        let conditions: LogicExpression[] = [...element.conditions]
        if (element.isNode() || element.isRelation()) {
            element.groups.filter(group => group.variability).forEach(group => conditions.push(...group.conditions))
        }
        conditions = utils.filterNotNull(conditions)

        // Add explicit conditions of a relation separately as own variable into the sat solver.
        // Explicit conditions are referenced by has_incoming_relations.
        if (element.isRelation()) {
            if (utils.isEmpty(conditions)) {
                this.minisat.require(MiniSat.equiv(element.explicitId, element.source.id))
            } else {
                this.minisat.require(
                    MiniSat.equiv(
                        element.explicitId,
                        this.transformLogicExpression(this.reduceConditions(conditions), {element})
                    )
                )
                conditions = [element.explicitId]
            }
        }

        // Add condition that checks if no other bratan is present
        if (element.defaultAlternative) {
            if (validator.isUndefined(element.defaultAlternativeCondition))
                throw new Error(`${element.Display} has no default alternative condition`)
            conditions = [element.defaultAlternativeCondition]
        }

        // Add default condition if requested
        if (element.pruningEnabled || (element.defaultEnabled && utils.isEmpty(conditions))) {
            conditions.unshift(element.defaultCondition)
        }

        // If there are no conditions assigned, then the element is present
        if (utils.isEmpty(conditions)) return this.minisat.require(element.id)

        // Optimization if there is only one condition assigned
        // TODO: optimize wrt relations having explicit conditions variable assigned
        if (conditions.length === 1) {
            // If the only assigned condition is "true", then the element is present
            if (conditions[0] === true) return this.minisat.require(element.id)

            // If the only assigned condition is "false", then the element is absent
            if (conditions[0] === false) return this.minisat.forbid(element.id)

            // Add the only assigned condition without "and"
            return this.minisat.require(
                MiniSat.equiv(element.id, this.transformLogicExpression(conditions[0], {element}))
            )
        }

        // Normalize conditions to a single 'and' condition
        const condition = this.reduceConditions(conditions)

        // Store effective conditions for transparency
        element.effectiveConditions = conditions

        // Add conditions to MiniSat
        this.minisat.require(MiniSat.equiv(element.id, this.transformLogicExpression(condition, {element})))
    }

    reduceConditions(conditions: LogicExpression[]) {
        return conditions.reduce<{and: LogicExpression[]}>(
            (acc, curr) => {
                acc.and.push(curr)
                return acc
            },
            {and: []}
        )
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
        validator.ensureDefined(condition, `Did not find logic expression "${name}"`)
        return condition as LogicExpression
    }

    getValueExpression(name: string) {
        const condition: VariabilityExpression | undefined = (this.options?.expressions || {})[name]
        validator.ensureDefined(condition, `Did not find value expression "${name}"`)
        return condition as ValueExpression
    }

    private transformLogicExpression(expression: LogicExpression, context: ExpressionContext): MiniSat.Operand {
        if (validator.isString(expression)) return expression
        if (validator.isBoolean(expression)) return expression ? MiniSat.TRUE : MiniSat.FALSE

        /**
         * logic_expression
         * The expression is first transformed and then added as a separate clause, thus, can be referenced by its name
         */
        if (validator.isDefined(expression.logic_expression)) {
            // Find referenced expression
            const name = expression.logic_expression
            validator.ensureString(name)
            const found = this.getLogicExpression(name)

            // Found expression is in this case actually a value expression
            if (validator.isString(found))
                throw new Error(`Logic expression "${utils.pretty(expression)}" must not be a string`)

            // If the found expression is a boolean then just return the boolean (which requires transformation first)
            if (validator.isBoolean(found)) return this.transformLogicExpression(found, context)

            // Assign id to expression which can be reused by other logic expressions
            if (validator.isUndefined(found._id)) found._id = 'expression.' + name

            // Transform found expression and add it to MiniSat
            if (validator.isUndefined(found._visited)) {
                this.minisat.require(MiniSat.equiv(found._id, this.transformLogicExpression(found, context)))
                found._visited = true
            }

            // Return id
            return found._id
        }

        /**
         * and
         */
        if (validator.isDefined(expression.and)) {
            return MiniSat.and(expression.and.map(it => this.transformLogicExpression(it, context)))
        }

        /**
         * or
         */
        if (validator.isDefined(expression.or)) {
            return MiniSat.or(expression.or.map(it => this.transformLogicExpression(it, context)))
        }

        /**
         * not
         */
        if (validator.isDefined(expression.not)) {
            return MiniSat.not(this.transformLogicExpression(expression.not, context))
        }

        /**
         * xor
         */
        if (validator.isDefined(expression.xor)) {
            return MiniSat.exactlyOne(expression.xor.map(it => this.transformLogicExpression(it, context)))
        }

        /**
         * implies
         */
        if (validator.isDefined(expression.implies)) {
            return MiniSat.implies(
                this.transformLogicExpression(expression.implies[0], context),
                this.transformLogicExpression(expression.implies[1], context)
            )
        }

        /**
         * amo
         */
        if (validator.isDefined(expression.amo)) {
            return MiniSat.atMostOne(expression.amo.map(it => this.transformLogicExpression(it, context)))
        }

        /**
         * node_presence
         */
        if (validator.isDefined(expression.node_presence)) {
            let node: Node | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (validator.isUndefined(node)) {
                const name = expression.node_presence
                validator.ensureString(name)
                node = this.graph.getNode(name)
            }

            return node.id
        }

        /**
         * host_presence
         */
        if (validator.isDefined(expression.host_presence)) {
            let node: Node | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (validator.isUndefined(node)) {
                const name = expression.host_presence
                validator.ensureString(name)

                if (name === 'SELF') {
                    if (validator.isUndefined(context.element))
                        throw new Error(`Context of condition "${utils.pretty(expression)}" does not hold an element`)

                    if (!context.element.isNode())
                        throw new Error(`Using "SELF" with "host_presence" is only valid inside a node`)

                    node = context.element
                } else {
                    node = this.graph.getNode(name)
                }
            }

            return MiniSat.or(node.outgoing.filter(it => it.isHostedOn()).map(it => it.target.id))
        }

        /**
         * has_sources
         */
        if (validator.isDefined(expression.has_sources)) {
            let node: Node | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (validator.isUndefined(node)) {
                const name = expression.has_sources
                validator.ensureString(name)
                node = this.graph.getNode(name)
            }

            return MiniSat.or(node.ingoing.map(it => it.source.id))
        }

        /**
         * has_incoming_relations
         */
        if (validator.isDefined(expression.has_incoming_relations)) {
            let node: Node | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (validator.isUndefined(node)) {
                const name = expression.has_incoming_relations
                validator.ensureString(name)
                node = this.graph.getNode(name)
            }

            return MiniSat.or(node.ingoing.map(it => MiniSat.and(it.explicitId, it.source.id)))
        }

        /**
         * has_incoming_relations_naive
         */
        if (validator.isDefined(expression.has_incoming_relations_naive)) {
            let node: Node | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (validator.isUndefined(node)) {
                const name = expression.has_incoming_relations
                validator.ensureString(name)
                node = this.graph.getNode(name)
            }

            return MiniSat.or(node.ingoing.map(it => it.id))
        }

        /**
         * relation_presence
         */
        if (validator.isDefined(expression.relation_presence)) {
            let relation: Relation | undefined

            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isRelation()) throw new Error(`${element.Display} is not a relation`)
                relation = element
            }

            if (validator.isUndefined(relation)) {
                const node = expression.relation_presence[0]
                validator.ensureString(node)

                const id = expression.relation_presence[1]
                validator.ensureStringOrNumber(id)

                relation = this.graph.getRelation([node, id])
            }

            return relation.id
        }

        /**
         * source_presence
         */
        if (validator.isDefined(expression.source_presence)) {
            const element = expression.source_presence
            validator.ensureString(element)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "source_presence" but received "${element}"`)
            if (validator.isUndefined(context.element))
                throw new Error(`Context of condition "${utils.pretty(expression)}" does not hold an element`)
            if (!context.element.isRelation()) throw new Error(`"source_presence" is only valid inside a relation`)

            return context.element.source.id
        }

        /**
         * target_presence
         */
        if (validator.isDefined(expression.target_presence)) {
            const element = expression.target_presence
            validator.ensureString(element)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "target_presence" but received "${element}"`)
            if (validator.isUndefined(context.element))
                throw new Error(`Context of condition "${utils.pretty(expression)}" does not hold an element`)
            if (!context.element.isRelation()) throw new Error(`"target_presence" is only valid inside a relation`)

            return context.element.target.id
        }

        /**
         * container_presence
         */
        if (validator.isDefined(expression.container_presence)) {
            const element = expression.container_presence
            validator.ensureString(element)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "container_presence" but received "${element}"`)
            if (validator.isUndefined(context.element))
                throw new Error(`Context of condition "${utils.pretty(expression)}" does not hold an element`)
            if (!context.element.isProperty() && !context.element.isArtifact())
                throw new Error(`"container_presence" is only valid inside a property or artifact`)

            return context.element.container.id
        }

        /**
         * policy_presence
         */
        if (validator.isDefined(expression.policy_presence)) {
            let policy: Policy | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isPolicy()) throw new Error(`${element.Display} is not a policy`)
                policy = element
            }

            if (validator.isUndefined(policy)) {
                const name = expression.policy_presence
                validator.ensureStringOrNumber(name)
                policy = this.graph.getPolicy(name)
            }

            return policy.id
        }

        /**
         * has_present_target
         */
        if (validator.isDefined(expression.has_present_target)) {
            let policy: Policy | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isPolicy()) throw new Error(`${element.Display} is not a policy`)
                policy = element
            }

            if (validator.isUndefined(policy)) {
                const name = expression.has_present_target
                validator.ensureStringOrNumber(name)
                policy = this.graph.getPolicy(name)
            }

            return MiniSat.or(
                policy.targets.map(it => {
                    // Node
                    if (it.isNode()) return it.id

                    // Group
                    return MiniSat.or(it.members.map(it => it.id))
                })
            )
        }

        /**
         * group_presence
         */
        if (validator.isDefined(expression.group_presence)) {
            let group: Group | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isGroup()) throw new Error(`${element.Display} is not a group`)
                group = element
            }

            if (validator.isUndefined(group)) {
                const name = expression.group_presence
                validator.ensureString(name)
                group = this.graph.getGroup(name)
            }

            return group.id
        }

        /**
         * has_present_member
         */
        if (validator.isDefined(expression.has_present_member)) {
            let group: Group | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isGroup()) throw new Error(`${element.Display} is not a group`)
                group = element
            }

            if (validator.isUndefined(group)) {
                const name = expression.has_present_member
                validator.ensureString(name)
                group = this.graph.getGroup(name)
            }

            return MiniSat.or(group.members.map(it => it.id))
        }

        /**
         * artifact_presence
         */
        if (validator.isDefined(expression.artifact_presence)) {
            let artifact: Artifact | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isArtifact()) throw new Error(`${element.Display} is not an artifact`)
                artifact = element
            }

            if (validator.isUndefined(artifact)) {
                validator.ensureString(expression.artifact_presence[0])
                validator.ensureStringOrNumber(expression.artifact_presence[1])
                artifact = this.graph.getArtifact(expression.artifact_presence)
            }

            return artifact.id
        }

        /**
         * node_property_presence
         */
        if (validator.isDefined(expression.node_property_presence)) {
            let property: Property | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (validator.isUndefined(property)) {
                validator.ensureString(expression.node_property_presence[0])
                validator.ensureStringOrNumber(expression.node_property_presence[1])
                property = this.graph.getNodeProperty(expression.node_property_presence)
            }

            return property.id
        }

        /**
         * relation_property_presence
         */
        if (validator.isDefined(expression.relation_property_presence)) {
            let property: Property | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (validator.isUndefined(property)) {
                validator.ensureString(expression.relation_property_presence[0])
                validator.ensureStringOrNumber(expression.relation_property_presence[1])
                validator.ensureStringOrNumber(expression.relation_property_presence[2])
                property = this.graph.getRelationProperty(expression.relation_property_presence)
            }

            return property.id
        }

        /**
         * group_property_presence
         */
        if (validator.isDefined(expression.group_property_presence)) {
            let property: Property | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (validator.isUndefined(property)) {
                validator.ensureString(expression.group_property_presence[0])
                validator.ensureStringOrNumber(expression.group_property_presence[1])
                property = this.graph.getGroupProperty(expression.group_property_presence)
            }

            return property.id
        }

        /**
         * policy_property_presence
         */
        if (validator.isDefined(expression.policy_property_presence)) {
            let property: Property | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (validator.isUndefined(property)) {
                validator.ensureStringOrNumber(expression.policy_property_presence[0])
                validator.ensureStringOrNumber(expression.policy_property_presence[1])
                property = this.graph.getPolicyProperty(expression.policy_property_presence)
            }

            return property.id
        }

        /**
         * artifact_property_presence
         */
        if (validator.isDefined(expression.artifact_property_presence)) {
            let property: Property | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (validator.isUndefined(property)) {
                validator.ensureString(expression.artifact_property_presence[0])
                validator.ensureStringOrNumber(expression.artifact_property_presence[1])
                validator.ensureStringOrNumber(expression.artifact_property_presence[2])
                property = this.graph.getArtifactProperty(expression.artifact_property_presence)
            }

            return property.id
        }

        /**
         * input_presence
         */
        if (validator.isDefined(expression.input_presence)) {
            let input: Input | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isInput()) throw new Error(`${element.Display} is not an input`)
                input = element
            }

            if (validator.isUndefined(input)) {
                const name = expression.input_presence
                validator.ensureString(name)
                input = this.graph.getInput(name)
            }

            return input.id
        }

        /**
         * node_type_presence
         */
        if (validator.isDefined(expression.node_type_presence)) {
            let type: Type | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isType()) throw new Error(`${element.Display} is not a type`)
                type = element
            }

            if (validator.isUndefined(type)) {
                validator.ensureString(expression.node_type_presence[0])
                validator.ensureStringOrNumber(expression.node_type_presence[1])
                type = this.graph.getNodeType(expression.node_type_presence)
            }

            return type.id
        }

        /**
         * relation_type_presence
         */
        if (validator.isDefined(expression.relation_type_presence)) {
            let type: Type | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isType()) throw new Error(`${element.Display} is not a type`)
                type = element
            }

            if (validator.isUndefined(type)) {
                validator.ensureString(expression.relation_type_presence[0])
                validator.ensureStringOrNumber(expression.relation_type_presence[1])
                type = this.graph.getRelationType(expression.relation_type_presence)
            }

            return type.id
        }

        /**
         * group_type_presence
         */
        if (validator.isDefined(expression.group_type_presence)) {
            let type: Type | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isType()) throw new Error(`${element.Display} is not a type`)
                type = element
            }

            if (validator.isUndefined(type)) {
                validator.ensureString(expression.group_type_presence[0])
                validator.ensureStringOrNumber(expression.group_type_presence[1])
                type = this.graph.getGroupType(expression.group_type_presence)
            }

            return type.id
        }

        /**
         * policy_type_presence
         */
        if (validator.isDefined(expression.policy_type_presence)) {
            let type: Type | undefined
            if (validator.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isType()) throw new Error(`${element.Display} is not a type`)
                type = element
            }

            if (validator.isUndefined(type)) {
                validator.ensureString(expression.policy_type_presence[0])
                validator.ensureStringOrNumber(expression.policy_type_presence[1])
                type = this.graph.getPolicyType(expression.policy_type_presence)
            }

            return type.id
        }

        /**
         * Assume that expression is a value expression that returns a boolean
         * Thus, {@param expression} can be in reality also of type {@link ValueExpression}
         */
        const result = this.evaluateValueExpression(expression, context)
        validator.ensureBoolean(result)
        return this.transformLogicExpression(result, context)
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
         * variability_input
         */
        if (validator.isDefined(expression.variability_input)) {
            validator.ensureString(expression.variability_input)
            return this.evaluateValueExpression(this.getInput(expression.variability_input), context)
        }

        /**
         * value_expression
         */
        if (validator.isDefined(expression.value_expression)) {
            validator.ensureString(expression.value_expression)
            return this.evaluateValueExpression(this.getValueExpression(expression.value_expression), context)
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
            ensureDefined(min, `Minimum of "${utils.stringify(elements)}" does not exist`)
            return min
        }

        /**
         * max
         */
        if (validator.isDefined(expression.max)) {
            const elements = expression.max
            validator.ensureNumbers(elements)
            const max = _.max(elements)
            ensureDefined(max, `Maximum of "${utils.stringify(elements)}" does not exist`)
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

        throw new Error(`Unknown value expression "${utils.pretty(expression)}"`)
    }
}
