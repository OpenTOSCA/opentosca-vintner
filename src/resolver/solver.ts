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
import console from 'console'

/**
 * TODO
 * - value expressions in presence conditions
 * - value expressions in property value
 * - logic expression in value expressions
 */

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
         * Return result
         */
        return this.result
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
        conditions = utils.filterNotNull<VariabilityExpression>(conditions)

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
        const condition = conditions.reduce<{and: VariabilityExpression[]}>(
            (acc, curr) => {
                acc.and.push(curr)
                return acc
            },
            {and: []}
        )

        const formula = this.translate(condition, {element})
        // TODO: if (!LS.isFormula(formula)) throw new Error(`"${formula}" is not a formula`) ?!
        this.solver.require(Logic.equiv(element.id, formula))
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
        value = 'TODO' // TODO: this.handleLogicExpression(definition.default_expression, {})
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
}
