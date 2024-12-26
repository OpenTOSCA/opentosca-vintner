import Graph from '#/graph/graph'
import * as assert from '#assert'
import * as check from '#check'
import {InputAssignmentMap} from '#spec/topology-template'
import {VariabilityInputDefinitionMap} from '#spec/variability'
import * as utils from '#utils'
import MiniSat from 'logic-solver'

export default class Validator {
    private readonly graph: Graph
    private readonly inputs: InputAssignmentMap = {}

    private readonly minisat = new MiniSat.Solver()

    private solved = false
    private transformed = false

    constructor(graph: Graph, inputs: InputAssignmentMap) {
        this.graph = graph
        this.inputs = inputs
    }

    run() {
        if (this.solved) throw new Error('Has been already solved')
        this.solved = true

        this.transform()

        if (!this.valid()) throw new Error(`Variability inputs constraints are violated`)
    }

    /**
     * Only run if at least one variability inputs declares a constraint
     */
    private required() {
        return Object.values(this.graph.serviceTemplate.topology_template?.variability?.inputs || {}).some(
            it =>
                check.isDefined(it.mandatory) ||
                check.isDefined(it.optional) ||
                check.isDefined(it.choices) ||
                check.isDefined(it.alternatives) ||
                check.isDefined(it.requires) ||
                check.isDefined(it.excludes)
        )
    }

    /**
     * Check if input is targeted by another input dependency
     */
    private isTargeted(name: string, inputs: VariabilityInputDefinitionMap) {
        for (const [_, input] of Object.entries(inputs)) {
            const targets = utils.toList(
                input.mandatory ??
                    input.optional ??
                    input.choices ??
                    input.alternatives ??
                    input.requires ??
                    input.excludes ??
                    []
            )
            if (targets.includes(name)) return true
        }
        return false
    }

    private transform() {
        if (this.transformed) return
        this.transformed = true

        if (!this.required()) return

        /**
         * Add constraints
         * Note, inputs not part of any constraints are not required to be part of the SAT problem.
         */
        const inputs = this.graph.serviceTemplate.topology_template?.variability?.inputs ?? {}
        for (const [name, input] of Object.entries(inputs)) {
            /**
             * Required Constraint: input is required if not targeted by any dependency
             */
            if (!this.isTargeted(name, inputs)) {
                const value =
                    this.inputs[name] ??
                    this.graph.serviceTemplate.topology_template?.variability?.inputs?.[name]?.default ??
                    undefined
                assert.isDefined(value, `Variability input "${name}" is not targeted and not assigned`)
            }

            /**
             * Mandatory: Input <=> Each of Mandatory
             */
            if (check.isDefined(input.mandatory)) {
                if (check.isString(input.mandatory)) input.mandatory = [input.mandatory]
                assert.isArray(input.mandatory)
                input.mandatory.forEach(it => assert.isString(it))

                input.mandatory.forEach(it => {
                    const constraint = MiniSat.equiv(name, it)
                    this.minisat.require(constraint)
                })
            }

            /**
             * Optional: Any of Optional => Input
             */
            if (check.isDefined(input.optional)) {
                if (check.isString(input.optional)) input.mandatory = [input.optional]
                assert.isArray(input.optional)
                input.optional.forEach(it => assert.isString(it))

                input.optional.forEach(it => {
                    const constraint = MiniSat.implies(it, name)
                    this.minisat.require(constraint)
                })
            }

            /**
             * Choices: Input => At least one of Choices
             */
            if (check.isDefined(input.choices)) {
                assert.isArray(input.choices)
                input.choices.forEach(it => assert.isString(it))
                const constraint = MiniSat.implies(name, MiniSat.or(input.choices))
                this.minisat.require(constraint)
            }

            /**
             * Alternatives: Input => Exactly one of Alternatives
             */
            if (check.isDefined(input.alternatives)) {
                assert.isArray(input.alternatives)
                input.alternatives.forEach(it => assert.isString(it))
                const constraint = MiniSat.implies(name, MiniSat.exactlyOne(input.alternatives))
                this.minisat.require(constraint)
            }

            /**
             * Requires: Input => Each of Requires
             */
            if (check.isDefined(input.requires)) {
                if (check.isString(input.requires)) input.requires = [input.requires]
                assert.isArray(input.requires)

                for (const right of input.requires) {
                    assert.isString(right)
                    const constraint = MiniSat.implies(name, right)
                    this.minisat.require(constraint)
                }
            }

            /**
             * Excludes: Input => Not any of Excludes
             */
            if (check.isDefined(input.excludes)) {
                if (check.isString(input.excludes)) input.excludes = [input.excludes]
                assert.isArray(input.excludes)

                for (const right of input.excludes) {
                    assert.isString(right)
                    const constraint = MiniSat.implies(name, MiniSat.not(input.excludes))
                    this.minisat.require(constraint)
                }
            }
        }

        /**
         * Add input assignments
         */
        for (const [name, definition] of Object.entries(
            this.graph.serviceTemplate.topology_template?.variability?.inputs || {}
        )) {
            // TODO: support default expressions of variability inputs

            const value = this.inputs[name] ?? definition.default

            // Check if truthy or falsy
            if (check.isUndefined(value) || check.isFalse(value) || value === 0) {
                // Case: Falsy
                this.minisat.require(MiniSat.not(name))
            } else {
                // Case: Truthy
                this.minisat.require(name)
            }
        }
    }

    private valid() {
        return check.isDefined(this.minisat.solve())
    }
}
