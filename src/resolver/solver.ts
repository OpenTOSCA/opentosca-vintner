import * as assert from '#assert'
import * as check from '#check'
import Element from '#graph/element'
import Graph from '#graph/graph'
import Property from '#graph/property'
import {andify} from '#graph/utils'
import Optimizer from '#resolver/optimizer'
import {Result, ResultMap} from '#resolver/result'
import {InputAssignmentMap, InputAssignmentValue} from '#spec/topology-template'
import {LogicExpression, ValueExpression, VariabilityDefinition, VariabilityExpression} from '#spec/variability'
import {destructImplementationName} from '#technologies/utils'
import * as utils from '#utils'
import day from '#utils/day'
import {UnexpectedError} from '#utils/error'
import _ from 'lodash'
import MiniSat from 'logic-solver'
import regression from 'regression'
import stats from 'stats-lite'

type ExpressionContext = {
    element: Element
}

// TODO: make element optional in ExpressionContext?
const BadContext: ExpressionContext = {
    // TODO: this is bad
    element: undefined as any,
}

export default class Solver {
    private readonly graph: Graph
    private readonly options?: VariabilityDefinition

    readonly minisat = new MiniSat.Solver()

    // Some operations on MiniSat cannot be undone
    private solved = false
    private transformed = false

    private inputs: InputAssignmentMap = {}
    private weekday = utils.weekday()

    constructor(graph: Graph, inputs: InputAssignmentMap) {
        this.graph = graph
        this.options = graph.serviceTemplate.topology_template?.variability
        this.inputs = inputs

        // TODO: do not allow pruning

        // Variability groups are not allowed since they must be resolved by the Conditions Enricher
        if (check.isDefined(this.graph.groups.find(it => it.variability)))
            throw new Error('Variability groups are not allowed')
    }

    run(): ResultMap {
        if (this.solved) throw new Error('Has been already solved')
        this.solved = true

        this.transform()

        /**
         * Get initial solution
         */
        const solution = this.minisat.solve()
        if (check.isUndefined(solution)) throw new Error('Could not solve')

        /**
         * Optimize
         */
        const optimized = new Optimizer(this.graph, solution, this.minisat).run()

        /**
         * Result
         */
        const result = new Result(this.graph, optimized)

        /**
         * Assign presence to elements
         */
        for (const element of this.graph.elements) {
            element.present = result.isPresent(element)
        }

        /**
         * Evaluate value expressions
         */
        for (const property of this.graph.properties.filter(it => it.present)) {
            this.evaluateProperty(property)
        }

        /**
         * Note, input default expressions are evaluated on-demand in {@link getInput}
         */

        /**
         * Return result
         */
        return result.map
    }

    optimize(options: {all?: boolean} = {}) {
        /**
         * Default options
         */
        options.all = options.all ?? false

        /**
         * Ensure that not already solved
         */
        if (this.solved) throw new Error('Has been already solved')
        this.solved = true

        /**
         * Transform
         */
        this.transform()

        /**
         * Get initial solution
         */
        const solution = this.minisat.solve()
        if (check.isUndefined(solution)) throw new Error('Could not solve')

        /**
         * Optimize
         */
        const optimized = new Optimizer(this.graph, solution, this.minisat).run()

        /**
         * Result
         */
        const result = new Result(this.graph, optimized)

        /**
         * Return
         */
        if (options.all) {
            // This actually also contains the current result since we did not forbid it
            return this.solveAll()
        }
        return [result]
    }

    runAll(): ResultMap[] {
        if (this.solved) throw new Error(`Has been already solved`)
        this.solved = true

        this.transform()

        return this.solveAll().map(it => it.map)
    }

    private solveAll() {
        const results: Result[] = []

        let result: MiniSat.Solution | null
        while ((result = this.minisat.solve())) {
            results.push(new Result(this.graph, result))
            this.minisat.forbid(result.getFormula())
        }

        return results
    }

    /**
     * Transform assigned conditions to MiniSat clauses
     * Note, this also evaluates value expressions if they are part of logic expressions
     */
    transform() {
        if (this.transformed) return
        this.transformed = true

        /**
         * Transform conditions
         */
        for (const element of this.graph.elements) this.transformConditions(element)

        /**
         * Transform constraints
         */
        for (const constraint of this.graph.serviceTemplate.topology_template?.variability?.constraints ?? []) {
            this.minisat.require(this.transformLogicExpression(constraint, BadContext))
        }

        /**
         * Transform element.implies
         */
        // TODO: should this be part of the enricher? but transformLogicExpression is used ... therefore, introduce _context_element: string or something
        // This is not used in any publication, thus, its fine ...
        for (const element of this.graph.elements) {
            const impliesList = element.raw.implies
            if (check.isUndefined(impliesList)) continue
            assert.isArray(impliesList)

            for (const implies of impliesList) {
                if (implies.length > 2) throw new Error(`${element.Display} has an implies with more than 2 elements`)

                const [target, condition] = implies
                if (check.isUndefined(target)) throw new Error(`${element.Display} has an implies without an target`)

                const left = check.isDefined(condition)
                    ? this.transformLogicExpression({and: [element.id, condition]}, {element})
                    : element.id

                const right = this.transformLogicExpression(target, {element})

                this.minisat.require(MiniSat.implies(left, right))
            }
        }
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
        if (check.isDefined(property.expression))
            property.value = this.evaluateValueExpression(property.expression, {
                element: property,
            })

        if (check.isUndefined(property.value)) throw new Error(`${property.Display} has no value`)
        return property.value
    }

    transformConditions(element: Element) {
        // Collect assigned conditions
        const conditions: LogicExpression[] = utils.toList(element.conditions)

        // Add manual conditions of a relation separately as own variable into the sat solver.
        // Manual conditions are referenced by has_incoming_relation and has_artifact as well as by implied relations.
        // Also, they are used to prevent pruning input-consuming properties
        // Optimization if manual conditions are empty, thus, "true" is fallback
        if (utils.isEmpty(conditions)) {
            this.minisat.require(element.manualId)
        } else {
            this.minisat.require(
                MiniSat.equiv(
                    element.manualId,
                    this.transformLogicExpression(
                        andify(
                            conditions.filter(it => {
                                // This also includes _bratan
                                if (check.isObject(it)) return !it._generated
                                return true
                            })
                        ),
                        {element}
                    )
                )
            )
        }

        // If there are no conditions assigned, then the element is present
        if (utils.isEmpty(conditions)) return this.minisat.require(element.id)

        // Optimization if there is only one condition assigned
        // TODO: optimize wrt relations having manual conditions variable assigned
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
        const condition = andify(conditions)

        // Add conditions to MiniSat
        this.minisat.require(MiniSat.equiv(element.id, this.transformLogicExpression(condition, {element})))
    }

    private getInput(name: string) {
        let value

        // Get variability input definition
        const definition = (this.options?.inputs || {})[name]
        assert.isDefined(definition, `Variability input "${name}" is not defined`)

        // Return assigned value
        value = this.inputs[name]
        if (check.isDefined(value)) return value

        // Return default value
        if (check.isDefined(definition.default)) {
            this.inputs[name] = definition.default
            return definition.default
        }

        // Return default expression
        assert.isDefined(
            definition.default_expression,
            `Variability input "${name}" has no value nor default (expression) assigned`
        )
        value = this.evaluateValueExpression(definition.default_expression, BadContext)
        assert.isDefined(value, `Did not find variability input "${name}"`)
        this.inputs[name] = value
        return value
    }

    getLogicExpression(name: string) {
        assert.isString(name)
        const condition: VariabilityExpression | undefined = (this.options?.expressions || {})[name]
        assert.isDefined(condition, `Did not find logic expression "${name}"`)
        return condition as LogicExpression
    }

    getValueExpression(name: string) {
        const condition: VariabilityExpression | undefined = (this.options?.expressions || {})[name]
        assert.isDefined(condition, `Did not find value expression "${name}"`)
        return condition as ValueExpression
    }

    private transformLogicExpression(expression: LogicExpression, context: ExpressionContext): MiniSat.Operand {
        if (check.isString(expression)) return expression
        if (check.isBoolean(expression)) return expression ? MiniSat.TRUE : MiniSat.FALSE

        /**
         * Just for easier access
         */
        const element = context.element
        const cached = expression._cached_element

        /**
         * logic_expression
         * The expression is first transformed and then added as a separate clause, thus, can be referenced by its name
         */
        if (check.isDefined(expression.logic_expression)) {
            // Find referenced expression
            const name = expression.logic_expression
            const found = this.getLogicExpression(name)

            // Found expression is in this case actually a value expression
            if (check.isString(found))
                throw new Error(`Logic expression "${utils.pretty(expression)}" must not be a string`)

            // If the found expression is a boolean then just return the boolean (which requires transformation first)
            if (check.isBoolean(found)) return this.transformLogicExpression(found, context)

            // Assign id to expression which can be reused by other logic expressions
            if (check.isUndefined(found._id)) found._id = 'expression.' + name

            // Transform found expression and add it to MiniSat
            if (check.isUndefined(found._visited)) {
                this.minisat.require(MiniSat.equiv(found._id, this.transformLogicExpression(found, context)))
                found._visited = true
            }

            // Return id
            return found._id
        }

        /**
         * and
         */
        if (check.isDefined(expression.and)) {
            return MiniSat.and(expression.and.map(it => this.transformLogicExpression(it, context)))
        }

        /**
         * or
         */
        if (check.isDefined(expression.or)) {
            return MiniSat.or(expression.or.map(it => this.transformLogicExpression(it, context)))
        }

        /**
         * not
         */
        if (check.isDefined(expression.not)) {
            return MiniSat.not(this.transformLogicExpression(expression.not, context))
        }

        /**
         * xor
         */
        if (check.isDefined(expression.xor)) {
            return MiniSat.xor(expression.xor.map(it => this.transformLogicExpression(it, context)))
        }

        /**
         * exo
         */
        if (check.isDefined(expression.exo)) {
            return MiniSat.exactlyOne(expression.exo.map(it => this.transformLogicExpression(it, context)))
        }

        /**
         * implies
         */
        if (check.isDefined(expression.implies)) {
            return MiniSat.implies(
                this.transformLogicExpression(expression.implies[0], context),
                this.transformLogicExpression(expression.implies[1], context)
            )
        }

        /**
         * amo
         */
        if (check.isDefined(expression.amo)) {
            return MiniSat.atMostOne(expression.amo.map(it => this.transformLogicExpression(it, context)))
        }

        /**
         * node_presence
         */
        if (check.isDefined(expression.node_presence)) {
            const node = this.graph.getNode(expression.node_presence, {
                element,
                cached,
            })
            return node.id
        }

        /**
         * host_presence
         * This is actually accessing the hosting relations
         */
        if (check.isDefined(expression.host_presence)) {
            const node = this.graph.getNode(expression.host_presence, {
                element,
                cached,
            })
            return MiniSat.or(node.outgoing.filter(it => it.isHostedOn()).map(it => it.target.id))
        }

        /**
         * has_source
         */
        if (check.isDefined(expression.has_source)) {
            const node = this.graph.getNode(expression.has_source, {
                element,
                cached,
            })
            return MiniSat.or(node.ingoing.map(it => it.source.id))
        }

        /**
         * has_incoming_relation
         */
        if (check.isDefined(expression.has_incoming_relation)) {
            const node = this.graph.getNode(expression.has_incoming_relation, {
                element,
                cached,
            })
            return MiniSat.or(node.ingoing.map(it => MiniSat.and(it.manualId, it.source.id)))
        }

        /**
         * has_incoming_relation_naive
         */
        if (check.isDefined(expression.has_incoming_relation_naive)) {
            const node = this.graph.getNode(expression.has_incoming_relation_naive, {
                element,
                cached,
            })
            return MiniSat.or(node.ingoing.map(it => it.id))
        }

        /**
         * has_outgoing_relation
         */
        if (check.isDefined(expression.has_outgoing_relation)) {
            const node = this.graph.getNode(expression.has_outgoing_relation, {
                element,
                cached,
            })
            return MiniSat.or(node.outgoing.map(it => MiniSat.and(it.manualId, it.target.id)))
        }

        /**
         * has_outgoing_relation_naive
         */
        if (check.isDefined(expression.has_outgoing_relation_naive)) {
            const node = this.graph.getNode(expression.has_outgoing_relation_naive, {
                element,
                cached,
            })
            return MiniSat.or(node.outgoing.map(it => it.id))
        }

        /**
         * has_artifact
         */
        if (check.isDefined(expression.has_artifact)) {
            const node = this.graph.getNode(expression.has_artifact, {
                element,
                cached,
            })
            return MiniSat.or(node.artifacts.map(it => it.manualId))
        }

        /**
         * has_artifact_naive
         */
        if (check.isDefined(expression.has_artifact_naive)) {
            const node = this.graph.getNode(expression.has_artifact_naive, {
                element,
                cached,
            })
            return MiniSat.or(node.artifacts.map(it => it.id))
        }

        /**
         * relation_presence
         */
        if (check.isDefined(expression.relation_presence)) {
            const relation = this.graph.getRelation(expression.relation_presence, {element, cached})
            return relation.id
        }

        /**
         * source_presence
         */
        if (check.isDefined(expression.source_presence)) {
            const relation = this.graph.getRelation(expression.source_presence, {element, cached})
            return relation.source.id
        }

        /**
         * target_presence
         */
        if (check.isDefined(expression.target_presence)) {
            const relation = this.graph.getRelation(expression.target_presence, {element, cached})
            return relation.target.id
        }

        /**
         * container_presence
         */
        if (check.isDefined(expression.container_presence)) {
            if (expression.container_presence === 'SELF') {
                const container = this.graph.getContainer(context.element)
                return container.id
            }

            if (expression.container_presence === 'CONTAINER') {
                const container = this.graph.getContainer(context.element)
                const containerContainer = this.graph.getContainer(container)
                return containerContainer.id
            }

            throw new UnexpectedError()
        }

        /**
         * policy_presence
         */
        if (check.isDefined(expression.policy_presence)) {
            const policy = this.graph.getPolicy(expression.policy_presence, {element, cached})
            return policy.id
        }

        /**
         * has_present_target
         */
        if (check.isDefined(expression.has_present_target)) {
            const policy = this.graph.getPolicy(expression.has_present_target, {element, cached})

            return MiniSat.or(
                policy.targets.map(it => {
                    // Node
                    if (it.isNode()) return it.id

                    // Group
                    return MiniSat.or(it.members.map(iu => iu.id))
                })
            )
        }

        /**
         * group_presence
         */
        if (check.isDefined(expression.group_presence)) {
            const group = this.graph.getGroup(expression.group_presence, {element, cached})
            return group.id
        }

        /**
         * has_present_member
         */
        if (check.isDefined(expression.has_present_member)) {
            const group = this.graph.getGroup(expression.has_present_member, {element, cached})
            return MiniSat.or(group.members.map(it => it.id))
        }

        /**
         * artifact_presence
         */
        if (check.isDefined(expression.artifact_presence)) {
            const artifact = this.graph.getArtifact(expression.artifact_presence, {element, cached})
            return artifact.id
        }

        /**
         * is_managed
         */
        if (check.isDefined(expression.is_managed)) {
            const artifact = this.graph.getArtifact(expression.is_managed, {element, cached})
            const technologies = artifact.container.technologies.filter(it => {
                const deconstructed = destructImplementationName(it.assign)
                if (check.isUndefined(deconstructed.artifact)) return false
                return artifact.getType().isA(deconstructed.artifact)
            })
            return MiniSat.or(technologies.map(it => it.id))
        }

        /**
         * node_property_presence
         */
        if (check.isDefined(expression.node_property_presence)) {
            const property = this.graph.getNodeProperty(expression.node_property_presence, {element, cached})
            return property.id
        }

        /**
         * relation_property_presence
         */
        if (check.isDefined(expression.relation_property_presence)) {
            const property = this.graph.getRelationProperty(expression.relation_property_presence, {element, cached})
            return property.id
        }

        /**
         * group_property_presence
         */
        if (check.isDefined(expression.group_property_presence)) {
            const property = this.graph.getGroupProperty(expression.group_property_presence, {element, cached})
            return property.id
        }

        /**
         * policy_property_presence
         */
        if (check.isDefined(expression.policy_property_presence)) {
            const property = this.graph.getPolicyProperty(expression.policy_property_presence, {element, cached})
            return property.id
        }

        /**
         * artifact_property_presence
         */
        if (check.isDefined(expression.artifact_property_presence)) {
            const property = this.graph.getArtifactProperty(expression.artifact_property_presence, {element, cached})
            return property.id
        }

        /**
         * input_presence
         */
        if (check.isDefined(expression.input_presence)) {
            const input = this.graph.getInput(expression.input_presence, {element, cached})
            return input.id
        }

        /**
         * is_consumed
         */
        if (check.isDefined(expression.is_consumed)) {
            const input = this.graph.getInput(expression.is_consumed, {element, cached})
            return MiniSat.or(input.consumers.map(it => it.id))
        }

        /**
         * output_presence
         */
        if (check.isDefined(expression.output_presence)) {
            const output = this.graph.getOutput(expression.output_presence, {element, cached})
            return output.id
        }

        /**
         * is_produced
         */
        if (check.isDefined(expression.is_produced)) {
            const output = this.graph.getOutput(expression.is_produced, {element, cached})
            return MiniSat.or(output.producers.map(it => it.id))
        }

        /**
         * import_presence
         */
        if (check.isDefined(expression.import_presence)) {
            const imp = this.graph.getImport(expression.import_presence, {element, cached})
            return imp.id
        }

        /**
         * technology_presence
         */
        if (check.isDefined(expression.technology_presence)) {
            const technology = this.graph.getTechnology(expression.technology_presence, {element, cached})
            return technology.id
        }

        /**
         * node_type_presence
         */
        if (check.isDefined(expression.node_type_presence)) {
            const type = this.graph.getNodeType(expression.node_type_presence, {element, cached})
            return type.id
        }

        /**
         * relation_type_presence
         */
        if (check.isDefined(expression.relation_type_presence)) {
            const type = this.graph.getRelationType(expression.relation_type_presence, {element, cached})
            return type.id
        }

        /**
         * group_type_presence
         */
        if (check.isDefined(expression.group_type_presence)) {
            const type = this.graph.getGroupType(expression.group_type_presence, {element, cached})
            return type.id
        }

        /**
         * policy_type_presence
         */
        if (check.isDefined(expression.policy_type_presence)) {
            const type = this.graph.getPolicyType(expression.policy_type_presence, {element, cached})
            return type.id
        }

        /**
         * artifact_type_presence
         */
        if (check.isDefined(expression.artifact_type_presence)) {
            const type = this.graph.getArtifactType(expression.artifact_type_presence, {element, cached})
            return type.id
        }

        /**
         * Assume that expression is a value expression that returns a boolean
         * Thus, {@param expression} can be in reality also of type {@link ValueExpression}
         */
        const result = this.evaluateValueExpression(expression, context)
        assert.isBoolean(result)
        return this.transformLogicExpression(result, context)
    }

    evaluateValueExpression(expression: ValueExpression, context: ExpressionContext): InputAssignmentValue {
        if (check.isObject(expression) && !check.isArray(expression)) {
            if (check.isDefined(expression._cached_result)) return expression._cached_result
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
        assert.isDefined(expression, `Received undefined condition`)

        if (check.isString(expression)) return expression
        if (check.isBoolean(expression)) return expression
        if (check.isNumber(expression)) return expression
        if (check.isArray(expression)) return expression

        /**
         * add
         */
        if (check.isDefined(expression.add)) {
            return expression.add.reduce<number>((sum, element) => {
                const value = this.evaluateValueExpression(element, context)
                assert.isNumber(value)
                return sum + value
            }, 0)
        }

        /**
         * sub
         */
        if (check.isDefined(expression.sub)) {
            const first = this.evaluateValueExpression(expression.sub[0], context)
            assert.isNumber(first)

            return expression.sub.slice(1).reduce<number>((difference, element) => {
                const value = this.evaluateValueExpression(element, context)
                assert.isNumber(value)
                return difference - value
            }, first)
        }

        /**
         * mul
         */
        if (check.isDefined(expression.mul)) {
            return expression.mul.reduce<number>((product, element) => {
                const value = this.evaluateValueExpression(element, context)
                assert.isNumber(value)
                return product * value
            }, 1)
        }

        /**
         * div
         */
        if (check.isDefined(expression.div)) {
            const first = this.evaluateValueExpression(expression.div[0], context)
            assert.isNumber(first)

            return expression.div.slice(1).reduce<number>((quotient, element) => {
                const value = this.evaluateValueExpression(element, context)
                assert.isNumber(value)
                return quotient / value
            }, first)
        }

        /**
         * mod
         */
        if (check.isDefined(expression.mod)) {
            const first = this.evaluateValueExpression(expression.mod[0], context)
            assert.isNumber(first)

            const second = this.evaluateValueExpression(expression.mod[1], context)
            assert.isNumber(second)

            return first % second
        }

        /**
         * variability_input
         */
        if (check.isDefined(expression.variability_input)) {
            assert.isString(expression.variability_input)
            return this.evaluateValueExpression(this.getInput(expression.variability_input), context)
        }

        /**
         * value_expression
         */
        if (check.isDefined(expression.value_expression)) {
            assert.isString(expression.value_expression)
            return this.evaluateValueExpression(this.getValueExpression(expression.value_expression), context)
        }

        /**
         * concat
         */
        if (check.isDefined(expression.concat)) {
            return expression.concat.map(c => this.evaluateValueExpression(c, context)).join('')
        }

        /**
         * join
         */
        if (check.isDefined(expression.join)) {
            return expression.join[0].map(c => this.evaluateValueExpression(c, context)).join(expression.join[1])
        }

        /**
         * token
         */
        if (check.isDefined(expression.token)) {
            const element = this.evaluateValueExpression(expression.token[0], context)
            assert.isString(element)
            const token = expression.token[1]
            const index = expression.token[2]
            return element.split(token)[index]
        }

        /**
         * equal
         */
        if (check.isDefined(expression.equal)) {
            const first = this.evaluateValueExpression(expression.equal[0], context)
            return expression.equal.every(element => {
                const value = this.evaluateValueExpression(element, context)
                return value === first
            })
        }

        /**
         * greater
         */
        if (check.isDefined(expression.greater)) {
            return (
                this.evaluateValueExpression(expression.greater[0], context) >
                this.evaluateValueExpression(expression.greater[1], context)
            )
        }

        /**
         * greater_or_equal
         */
        if (check.isDefined(expression.greater_or_equal)) {
            return (
                this.evaluateValueExpression(expression.greater_or_equal[0], context) >=
                this.evaluateValueExpression(expression.greater_or_equal[1], context)
            )
        }

        /**
         * less
         */
        if (check.isDefined(expression.less)) {
            return (
                this.evaluateValueExpression(expression.less[0], context) <
                this.evaluateValueExpression(expression.less[1], context)
            )
        }

        /**
         * less_or_equal
         */
        if (check.isDefined(expression.less_or_equal)) {
            return (
                this.evaluateValueExpression(expression.less_or_equal[0], context) <=
                this.evaluateValueExpression(expression.less_or_equal[1], context)
            )
        }

        /**
         * in_range
         */
        if (check.isDefined(expression.in_range)) {
            const element = this.evaluateValueExpression(expression.in_range[0], context)
            const lower = expression.in_range[1][0]
            const upper = expression.in_range[1][1]
            return lower <= element && element <= upper
        }

        /**
         * valid_values
         */
        if (check.isDefined(expression.valid_values)) {
            const element = this.evaluateValueExpression(expression.valid_values[0], context)
            const valid = expression.valid_values[1].map(c => this.evaluateValueExpression(c, context))
            return valid.includes(element)
        }

        /**
         * length
         */
        if (check.isDefined(expression.length)) {
            const element = this.evaluateValueExpression(expression.length[0], context)
            assert.isString(element)

            const length = this.evaluateValueExpression(expression.length[1], context)
            assert.isNumber(length)

            return element.length === length
        }

        /**
         * min_length
         */
        if (check.isDefined(expression.min_length)) {
            const element = this.evaluateValueExpression(expression.min_length[0], context)
            assert.isString(element)

            const length = this.evaluateValueExpression(expression.min_length[1], context)
            assert.isNumber(length)

            return element.length >= length
        }

        /**
         * max_length
         */
        if (check.isDefined(expression.max_length)) {
            const element = this.evaluateValueExpression(expression.max_length[0], context)
            assert.isString(element)

            const length = this.evaluateValueExpression(expression.max_length[1], context)
            assert.isNumber(length)

            return element.length <= length
        }

        /**
         * sum
         */
        if (check.isDefined(expression.sum)) {
            const elements = expression.sum
            assert.isNumbers(elements)
            return utils.toFixed(stats.sum(elements))
        }

        /**
         * count
         */
        if (check.isDefined(expression.count)) {
            const elements = expression.count
            assert.isNumbers(elements)
            return elements.length
        }

        /**
         * min
         */
        if (check.isDefined(expression.min)) {
            const elements = expression.min
            assert.isNumbers(elements)
            const min = _.min(elements)
            assert.isDefined(min, `Minimum of "${utils.stringify(elements)}" does not exist`)
            return min
        }

        /**
         * max
         */
        if (check.isDefined(expression.max)) {
            const elements = expression.max
            assert.isNumbers(elements)
            const max = _.max(elements)
            assert.isDefined(max, `Maximum of "${utils.stringify(elements)}" does not exist`)
            return max
        }

        /**
         * median
         */
        if (check.isDefined(expression.median)) {
            const elements = expression.median
            assert.isNumbers(elements)
            return stats.median(elements)
        }

        /**
         * mean
         */
        if (check.isDefined(expression.mean)) {
            const elements = expression.mean
            assert.isNumbers(elements)
            return utils.toFixed(stats.mean(elements))
        }

        /**
         * variance
         */
        if (check.isDefined(expression.variance)) {
            const elements = expression.variance
            assert.isNumbers(elements)
            return utils.toFixed(stats.variance(elements))
        }

        /**
         * standard_deviation
         */
        if (check.isDefined(expression.standard_deviation)) {
            const elements = expression.standard_deviation
            assert.isNumbers(elements)
            return utils.toFixed(stats.stdev(elements))
        }

        /**
         * linear_regression
         */
        if (check.isDefined(expression.linear_regression)) {
            assert.isArray(expression.linear_regression)
            const elements = expression.linear_regression[0]
            assert.isArray(elements)
            elements.forEach(it => assert.isNumbers(it))

            const prediction = expression.linear_regression[1]
            assert.isNumber(prediction)

            return utils.toFixed(regression.linear(elements).predict(prediction)[1])
        }

        /**
         * polynomial_regression
         */
        if (check.isDefined(expression.polynomial_regression)) {
            assert.isArray(expression.polynomial_regression)
            const elements = expression.polynomial_regression[0]
            assert.isArray(elements)
            elements.forEach(it => assert.isNumbers(it))

            const order = expression.polynomial_regression[1]
            assert.isNumber(order)

            const prediction = expression.polynomial_regression[2]
            assert.isNumber(prediction)

            return utils.toFixed(regression.polynomial(elements, {order}).predict(prediction)[1])
        }

        /**
         * logarithmic_regression
         */
        if (check.isDefined(expression.logarithmic_regression)) {
            assert.isArray(expression.logarithmic_regression)
            const elements = expression.logarithmic_regression[0]
            assert.isArray(elements)
            elements.forEach(it => assert.isNumbers(it))

            const prediction = expression.logarithmic_regression[1]
            assert.isNumber(prediction)

            return utils.toFixed(regression.logarithmic(elements).predict(prediction)[1])
        }

        /**
         * exponential_regression
         */
        if (check.isDefined(expression.exponential_regression)) {
            assert.isArray(expression.exponential_regression)
            const elements = expression.exponential_regression[0]
            assert.isArray(elements)
            elements.forEach(it => assert.isNumbers(it))

            const prediction = expression.exponential_regression[1]
            assert.isNumber(prediction)

            return utils.toFixed(regression.exponential(elements).predict(prediction)[1])
        }

        /**
         * weekday
         */
        if (check.isDefined(expression.weekday)) {
            return this.weekday
        }

        /**
         * same
         */
        if (check.isDefined(expression.same)) {
            assert.isArray(expression.same)

            const first = day(expression.same[0])
            assert.isDate(first)

            const second = day(expression.same[1])
            assert.isDate(second)

            return first.isSame(second)
        }

        /**
         * before
         */
        if (check.isDefined(expression.before)) {
            assert.isArray(expression.before)

            const first = day(expression.before[0])
            assert.isDate(first)

            const second = day(expression.before[1])
            assert.isDate(second)

            return first.isBefore(second)
        }

        /**
         * before_or_same
         */
        if (check.isDefined(expression.before_or_same)) {
            assert.isArray(expression.before_or_same)

            const first = day(expression.before_or_same[0])
            assert.isDate(first)

            const second = day(expression.before_or_same[1])
            assert.isDate(second)

            return first.isSameOrBefore(second)
        }

        /**
         * after
         */
        if (check.isDefined(expression.after)) {
            assert.isArray(expression.after)

            const first = day(expression.after[0])
            assert.isDate(first)

            const second = day(expression.after[1])
            assert.isDate(second)

            return first.isAfter(second)
        }

        /**
         * after_or_same
         */
        if (check.isDefined(expression.after_or_same)) {
            assert.isArray(expression.after_or_same)

            const first = day(expression.after_or_same[0])
            assert.isDate(first)

            const second = day(expression.after_or_same[1])
            assert.isDate(second)

            return first.isSameOrAfter(second)
        }

        /**
         * within
         */
        if (check.isDefined(expression.within)) {
            assert.isArray(expression.within)
            assert.isArray(expression.within[1])

            const element = day(expression.within[0])
            assert.isDate(element)

            const lower = day(expression.within[1][0])
            assert.isDate(lower)

            const upper = day(expression.within[1][1])
            assert.isDate(upper)

            return element.isBetween(lower, upper)
        }

        throw new Error(`Unknown value expression "${utils.pretty(expression)}"`)
    }
}
