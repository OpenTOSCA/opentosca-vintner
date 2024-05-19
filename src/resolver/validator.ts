import Graph from '#/graph/graph'
import * as assert from '#assert'
import * as check from '#check'
import {InputAssignmentMap} from '#spec/topology-template'
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
                check.isDefined(it.implies) ||
                check.isDefined(it.excludes) ||
                check.isDefined(it.alternatives) ||
                check.isDefined(it.choices)
        )
    }

    private transform() {
        if (this.transformed) return
        this.transformed = true

        if (!this.required()) return

        /**
         * Add constraints
         * Note, inputs not part of any constraints are not required to be part of the SAT problem.
         */
        for (const [name, input] of Object.entries(
            this.graph.serviceTemplate.topology_template?.variability?.inputs || {}
        )) {
            if (check.isDefined(input.implies)) {
                if (check.isString(input.implies)) input.implies = [input.implies]
                assert.isArray(input.implies)

                for (const right of input.implies) {
                    assert.isString(right)
                    const constraint = MiniSat.implies(name, right)
                    this.minisat.require(constraint)
                }
            }

            if (check.isDefined(input.excludes)) {
                if (check.isString(input.excludes)) input.excludes = [input.excludes]
                assert.isArray(input.excludes)

                for (const right of input.excludes) {
                    assert.isString(right)
                    const constraint = MiniSat.implies(name, MiniSat.not(input.excludes))
                    this.minisat.require(constraint)
                }
            }

            if (check.isDefined(input.alternatives)) {
                assert.isArray(input.alternatives)
                input.alternatives.forEach(it => assert.isString(it))
                const constraint = MiniSat.implies(name, MiniSat.exactlyOne(input.alternatives))
                this.minisat.require(constraint)
            }

            if (check.isDefined(input.choices)) {
                assert.isArray(input.choices)
                input.choices.forEach(it => assert.isString(it))
                const constraint = MiniSat.implies(name, MiniSat.or(input.choices))
                this.minisat.require(constraint)
            }
        }

        /**
         * Add input assignments
         */
        for (const [name, definition] of Object.entries(
            this.graph.serviceTemplate.topology_template?.variability?.inputs || {}
        )) {
            // TODO: support default expressions of variability inputs
            // TODO: support non-boolean variability inputs

            const value = this.inputs[name] ?? definition.default
            assert.isBoolean(value, `Variability input ${name} is not a Boolean`)

            if (check.isTrue(value)) this.minisat.require(name)
            if (check.isFalse(value)) this.minisat.require(MiniSat.not(name))
        }
    }

    private valid() {
        return check.isDefined(this.minisat.solve())
    }
}
