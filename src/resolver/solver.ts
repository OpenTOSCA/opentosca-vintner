import * as assert from '#assert'
import * as check from '#check'
import Artifact from '#graph/artifact'
import Element from '#graph/element'
import Graph from '#graph/graph'
import Group from '#graph/group'
import Import from '#graph/import'
import Input from '#graph/input'
import Node from '#graph/node'
import Policy from '#graph/policy'
import Property from '#graph/property'
import Relation from '#graph/relation'
import Type from '#graph/type'
import {InputAssignmentMap, InputAssignmentValue} from '#spec/topology-template'
import {
    InputAssignmentPreset,
    LogicExpression,
    ValueExpression,
    VariabilityDefinition,
    VariabilityExpression,
} from '#spec/variability'
import * as utils from '#utils'
import day from '#utils/day'
import _ from 'lodash'
import MiniSat from 'logic-solver'
import regression from 'regression'
import stats from 'stats-lite'

type ExpressionContext = {
    element?: Element
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
        if (check.isUndefined(solution)) throw new Error(`Could not solve`)

        /**
         * Get optimized solution
         */
        if (this.graph.options.solver.optimization === true || check.isString(this.graph.options.solver.optimization)) {
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

            if (check.isUndefined(optimized)) throw new Error(`Could not optimize`)
            this.result = optimized.getMap()
        } else {
            this.result = solution.getMap()
        }

        /**
         * Assign presence to elements
         */
        for (const element of this.graph.elements) {
            const present = this.result[element.id]
            if (check.isUndefined(present)) throw new Error(`${element.Display} is not part of the result`)
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
        if (check.isDefined(property.expression))
            property.value = this.evaluateValueExpression(property.expression, {
                element: property,
            })

        if (check.isUndefined(property.value)) throw new Error(`${property.Display} has no value`)
        return property.value
    }

    transformConditions(element: Element) {
        // Variability group are never present
        if (element.isGroup() && element.variability) return this.minisat.require(MiniSat.not(element.id))

        // TODO: drop this
        // Collect assigned conditions
        const conditions: LogicExpression[] = [...element.conditions]

        // Add explicit conditions of a relation separately as own variable into the sat solver.
        // Explicit conditions are referenced by has_incoming_relation and has_artifact.
        if (element.isRelation() || element.isArtifact()) {
            // Optimization if explicit conditions are empty, thus, "true" is fallback
            if (utils.isEmpty(conditions)) {
                this.minisat.require(element.explicitId)
            } else {
                this.minisat.require(
                    MiniSat.equiv(
                        element.explicitId,
                        this.transformLogicExpression(this.reduceConditions(conditions), {element})
                    )
                )
            }
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
        if (check.isUndefined(name)) return this
        this.setInputs(this.getPreset(name).inputs)
        return this
    }

    setInputs(inputs?: InputAssignmentMap) {
        if (check.isUndefined(inputs)) return this
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
        assert.isDefined(definition, `Variability input "${name}" is not defined`)

        // Return assigned value
        value = this.inputs[name]
        if (check.isDefined(value)) return value

        // Return default value
        if (check.isDefined(definition.default)) {
            this.setInput(name, definition.default)
            return definition.default
        }

        // Return default expression
        assert.isDefined(
            definition.default_expression,
            `Variability input "${name}" has no value nor default (expression) assigned`
        )
        value = this.evaluateValueExpression(definition.default_expression, {})
        assert.isDefined(value, `Did not find variability input "${name}"`)
        this.setInput(name, value)
        return value
    }

    getInputs() {
        return this.inputs
    }

    getPreset(name: string) {
        const set: InputAssignmentPreset | undefined = (this.options?.presets || {})[name]
        assert.isDefined(set, `Did not find variability set "${name}"`)
        return set
    }

    getLogicExpression(name: string) {
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
         * logic_expression
         * The expression is first transformed and then added as a separate clause, thus, can be referenced by its name
         */
        if (check.isDefined(expression.logic_expression)) {
            // Find referenced expression
            const name = expression.logic_expression
            assert.isString(name)
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
            return MiniSat.exactlyOne(expression.xor.map(it => this.transformLogicExpression(it, context)))
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
            let node: Node | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (check.isUndefined(node)) {
                const name = expression.node_presence
                assert.isString(name)
                node = this.graph.getNode(name)
            }

            return node.id
        }

        /**
         * host_presence
         */
        if (check.isDefined(expression.host_presence)) {
            let node: Node | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (check.isUndefined(node)) {
                const name = expression.host_presence
                assert.isString(name)

                if (name === 'SELF') {
                    if (check.isUndefined(context.element))
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
         * has_source
         */
        if (check.isDefined(expression.has_source)) {
            let node: Node | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (check.isUndefined(node)) {
                const name = expression.has_source
                assert.isString(name)
                node = this.graph.getNode(name)
            }

            return MiniSat.or(node.ingoing.map(it => it.source.id))
        }

        /**
         * has_incoming_relation
         */
        if (check.isDefined(expression.has_incoming_relation)) {
            let node: Node | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (check.isUndefined(node)) {
                const name = expression.has_incoming_relation
                assert.isString(name)
                node = this.graph.getNode(name)
            }

            return MiniSat.or(node.ingoing.map(it => MiniSat.and(it.explicitId, it.source.id)))
        }

        /**
         * has_incoming_relation_naive
         */
        if (check.isDefined(expression.has_incoming_relation_naive)) {
            let node: Node | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (check.isUndefined(node)) {
                const name = expression.has_incoming_relation
                assert.isString(name)
                node = this.graph.getNode(name)
            }

            return MiniSat.or(node.ingoing.map(it => it.id))
        }

        /**
         * has_artifact
         */
        if (check.isDefined(expression.has_artifact)) {
            let node: Node | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (check.isUndefined(node)) {
                const name = expression.has_artifact
                assert.isString(name)
                node = this.graph.getNode(name)
            }

            return MiniSat.or(node.artifacts.map(it => it.explicitId))
        }

        /**
         * has_artifact_naive
         */
        if (check.isDefined(expression.has_artifact_naive)) {
            let node: Node | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
                node = element
            }

            if (check.isUndefined(node)) {
                const name = expression.has_artifact_naive
                assert.isString(name)
                node = this.graph.getNode(name)
            }

            return MiniSat.or(node.artifacts.map(it => it.id))
        }

        /**
         * relation_presence
         */
        if (check.isDefined(expression.relation_presence)) {
            let relation: Relation | undefined

            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isRelation()) throw new Error(`${element.Display} is not a relation`)
                relation = element
            }

            if (check.isUndefined(relation)) {
                const node = expression.relation_presence[0]
                assert.isString(node)

                const id = expression.relation_presence[1]
                assert.isStringOrNumber(id)

                relation = this.graph.getRelation([node, id])
            }

            return relation.id
        }

        /**
         * source_presence
         */
        if (check.isDefined(expression.source_presence)) {
            const element = expression.source_presence
            assert.isString(element)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "source_presence" but received "${element}"`)
            if (check.isUndefined(context.element))
                throw new Error(`Context of condition "${utils.pretty(expression)}" does not hold an element`)
            if (!context.element.isRelation()) throw new Error(`"source_presence" is only valid inside a relation`)

            return context.element.source.id
        }

        /**
         * target_presence
         */
        if (check.isDefined(expression.target_presence)) {
            const element = expression.target_presence
            assert.isString(element)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "target_presence" but received "${element}"`)
            if (check.isUndefined(context.element))
                throw new Error(`Context of condition "${utils.pretty(expression)}" does not hold an element`)
            if (!context.element.isRelation()) throw new Error(`"target_presence" is only valid inside a relation`)

            return context.element.target.id
        }

        /**
         * container_presence
         */
        if (check.isDefined(expression.container_presence)) {
            const element = expression.container_presence
            assert.isString(element)
            if (element !== 'SELF')
                throw new Error(`"SELF" is the only valid value for "container_presence" but received "${element}"`)
            if (check.isUndefined(context.element))
                throw new Error(`Context of condition "${utils.pretty(expression)}" does not hold an element`)
            if (!context.element.isProperty() && !context.element.isArtifact())
                throw new Error(`"container_presence" is only valid inside a property or artifact`)

            return context.element.container.id
        }

        /**
         * policy_presence
         */
        if (check.isDefined(expression.policy_presence)) {
            let policy: Policy | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isPolicy()) throw new Error(`${element.Display} is not a policy`)
                policy = element
            }

            if (check.isUndefined(policy)) {
                const name = expression.policy_presence
                assert.isStringOrNumber(name)
                policy = this.graph.getPolicy(name)
            }

            return policy.id
        }

        /**
         * has_present_target
         */
        if (check.isDefined(expression.has_present_target)) {
            let policy: Policy | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isPolicy()) throw new Error(`${element.Display} is not a policy`)
                policy = element
            }

            if (check.isUndefined(policy)) {
                const name = expression.has_present_target
                assert.isStringOrNumber(name)
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
        if (check.isDefined(expression.group_presence)) {
            let group: Group | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isGroup()) throw new Error(`${element.Display} is not a group`)
                group = element
            }

            if (check.isUndefined(group)) {
                const name = expression.group_presence
                assert.isString(name)
                group = this.graph.getGroup(name)
            }

            return group.id
        }

        /**
         * has_present_member
         */
        if (check.isDefined(expression.has_present_member)) {
            let group: Group | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isGroup()) throw new Error(`${element.Display} is not a group`)
                group = element
            }

            if (check.isUndefined(group)) {
                const name = expression.has_present_member
                assert.isString(name)
                group = this.graph.getGroup(name)
            }

            return MiniSat.or(group.members.map(it => it.id))
        }

        /**
         * artifact_presence
         */
        if (check.isDefined(expression.artifact_presence)) {
            let artifact: Artifact | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isArtifact()) throw new Error(`${element.Display} is not an artifact`)
                artifact = element
            }

            if (check.isUndefined(artifact)) {
                assert.isString(expression.artifact_presence[0])
                assert.isStringOrNumber(expression.artifact_presence[1])
                artifact = this.graph.getArtifact(expression.artifact_presence)
            }

            return artifact.id
        }

        /**
         * node_property_presence
         */
        if (check.isDefined(expression.node_property_presence)) {
            let property: Property | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (check.isUndefined(property)) {
                assert.isString(expression.node_property_presence[0])
                assert.isStringOrNumber(expression.node_property_presence[1])
                property = this.graph.getNodeProperty(expression.node_property_presence)
            }

            return property.id
        }

        /**
         * relation_property_presence
         */
        if (check.isDefined(expression.relation_property_presence)) {
            let property: Property | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (check.isUndefined(property)) {
                assert.isString(expression.relation_property_presence[0])
                assert.isStringOrNumber(expression.relation_property_presence[1])
                assert.isStringOrNumber(expression.relation_property_presence[2])
                property = this.graph.getRelationProperty(expression.relation_property_presence)
            }

            return property.id
        }

        /**
         * group_property_presence
         */
        if (check.isDefined(expression.group_property_presence)) {
            let property: Property | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (check.isUndefined(property)) {
                assert.isString(expression.group_property_presence[0])
                assert.isStringOrNumber(expression.group_property_presence[1])
                property = this.graph.getGroupProperty(expression.group_property_presence)
            }

            return property.id
        }

        /**
         * policy_property_presence
         */
        if (check.isDefined(expression.policy_property_presence)) {
            let property: Property | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (check.isUndefined(property)) {
                assert.isStringOrNumber(expression.policy_property_presence[0])
                assert.isStringOrNumber(expression.policy_property_presence[1])
                property = this.graph.getPolicyProperty(expression.policy_property_presence)
            }

            return property.id
        }

        /**
         * artifact_property_presence
         */
        if (check.isDefined(expression.artifact_property_presence)) {
            let property: Property | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
                property = element
            }

            if (check.isUndefined(property)) {
                assert.isString(expression.artifact_property_presence[0])
                assert.isStringOrNumber(expression.artifact_property_presence[1])
                assert.isStringOrNumber(expression.artifact_property_presence[2])
                property = this.graph.getArtifactProperty(expression.artifact_property_presence)
            }

            return property.id
        }

        /**
         * input_presence
         */
        if (check.isDefined(expression.input_presence)) {
            let input: Input | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isInput()) throw new Error(`${element.Display} is not an input`)
                input = element
            }

            if (check.isUndefined(input)) {
                const name = expression.input_presence
                assert.isString(name)
                input = this.graph.getInput(name)
            }

            return input.id
        }

        /**
         * import_presence
         */
        if (check.isDefined(expression.import_presence)) {
            let imp: Import | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isImport()) throw new Error(`${element.Display} is not an import`)
                imp = element
            }

            if (check.isUndefined(imp)) {
                const index = expression.import_presence
                assert.isNumber(index)
                imp = this.graph.getImport(index)
            }

            return imp.id
        }

        /**
         * node_type_presence
         */
        if (check.isDefined(expression.node_type_presence)) {
            let type: Type | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isType()) throw new Error(`${element.Display} is not a type`)
                type = element
            }

            if (check.isUndefined(type)) {
                assert.isString(expression.node_type_presence[0])
                assert.isStringOrNumber(expression.node_type_presence[1])
                type = this.graph.getNodeType(expression.node_type_presence)
            }

            return type.id
        }

        /**
         * relation_type_presence
         */
        if (check.isDefined(expression.relation_type_presence)) {
            let type: Type | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isType()) throw new Error(`${element.Display} is not a type`)
                type = element
            }

            if (check.isUndefined(type)) {
                assert.isString(expression.relation_type_presence[0])
                assert.isStringOrNumber(expression.relation_type_presence[1])
                type = this.graph.getRelationType(expression.relation_type_presence)
            }

            return type.id
        }

        /**
         * group_type_presence
         */
        if (check.isDefined(expression.group_type_presence)) {
            let type: Type | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isType()) throw new Error(`${element.Display} is not a type`)
                type = element
            }

            if (check.isUndefined(type)) {
                assert.isString(expression.group_type_presence[0])
                assert.isStringOrNumber(expression.group_type_presence[1])
                type = this.graph.getGroupType(expression.group_type_presence)
            }

            return type.id
        }

        /**
         * policy_type_presence
         */
        if (check.isDefined(expression.policy_type_presence)) {
            let type: Type | undefined
            if (check.isDefined(expression._cached_element)) {
                const element = expression._cached_element
                if (!element.isType()) throw new Error(`${element.Display} is not a type`)
                type = element
            }

            if (check.isUndefined(type)) {
                assert.isString(expression.policy_type_presence[0])
                assert.isStringOrNumber(expression.policy_type_presence[1])
                type = this.graph.getPolicyType(expression.policy_type_presence)
            }

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
