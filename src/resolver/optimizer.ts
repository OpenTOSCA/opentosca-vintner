import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import {Result} from '#resolver/result'
import * as utils from '#utils'
import MiniSat from 'logic-solver'

export default class Optimizer {
    private readonly graph: Graph
    private optimized = false

    private minisat: MiniSat.Solver
    private current: MiniSat.Solution

    constructor(graph: Graph, solution: MiniSat.Solution, minisat: MiniSat.Solver) {
        this.graph = graph
        this.current = solution
        this.minisat = minisat
    }

    run(): MiniSat.Solution {
        if (this.optimized) return this.current
        this.optimized = true

        /**
         * Optimize topology
         */
        if (this.graph.options.solver.topology.optimize) this.optimizeTopology()
        if (this.graph.options.solver.topology.unique) this.ensureTopologyUniqueness()

        /**
         * Optimize scenarios
         */
        if (this.graph.options.solver.scenarios.optimize) this.optimizeScenarios()
        if (this.graph.options.solver.scenarios.unique) this.ensureScenariosUniqueness()

        /**
         * Optimize technologies
         */
        if (this.graph.options.solver.technologies.optimize) this.optimizeTechnologies()
        if (this.graph.options.solver.technologies.unique) this.ensureTechnologiesUniqueness()

        return this.current
    }

    /**
     * Optimize topology
     */
    private optimizeTopology() {
        const formulas = this.graph.nodes.map(it => it.id)
        let weights: number | number[] | undefined

        /**
         * Weight
         */
        if (this.graph.options.solver.topology.mode === 'weight') {
            weights = this.graph.nodes.map(it => it.weight * 100)
        }

        /**
         * Count
         */
        if (this.graph.options.solver.topology.mode === 'count') {
            weights = 1
        }

        /**
         * Optimize
         */
        assert.isDefined(weights)
        this.optimize({min: this.graph.options.solver.topology.min, formulas, weights})
    }

    /**
     * Unique topology check
     *
     * Ensure that there is not another solution that has the same nodes enabled and disabled.
     * Note, we use solveAssuming to keep the problem solvable.
     */
    private ensureTopologyUniqueness() {
        const result = new Result(this.graph, this.current)
        const present = result.getPresences('node')
        const absent = result.getAbsences('node')

        /**
         * Backwards: also check that absent components are absent. If optimization did not start before, there might be other solutions that have additional present components.
         */
        const topology = this.graph.options.solver.topology.uniqueBackward
            ? MiniSat.and(MiniSat.and(present), MiniSat.not(MiniSat.or(absent)))
            : MiniSat.and(present)
        const another = this.minisat.solveAssuming(MiniSat.not(topology))

        if (check.isDefined(another)) {
            const mode = this.graph.options.solver.topology.optimize ? 'besides' : 'without'
            throw new Error(`The result is ambiguous considering nodes (${mode} optimization)`)
        }
    }

    private optimizeScenarios() {
        /**
         * Priority
         */
        const formulas = this.graph.technologies.map(it => it.id)
        const weights = this.graph.technologies.map(it => it.prio)

        this.optimize({min: true, formulas, weights})
    }

    private ensureScenariosUniqueness() {
        /**
         * Unique Scenario Priority Check
         *
         * Ensure that there is not another solution that has the same priority for one node template.
         */
        // TODO: this check does not seem to work properly (eg when the minimization above is disable)
        const result = new Result(this.graph, this.current)
        const present = result.getPresences('technology')
        const other = this.minisat.solveAssuming(MiniSat.not(MiniSat.and(present)))
        if (check.isDefined(other)) {
            throw new Error(`There are multiple scenarios of the same priority for one node template possible`)
        }
    }

    /**
     * Optimize technologies
     */
    private optimizeTechnologies() {
        /**
         * Weight(-Count)
         */
        if (this.graph.options.solver.technologies.mode.includes('weight')) {
            const formulas = this.graph.technologies.map(it => it.id)
            const weights = this.graph.technologies.map(it => it.weight * 100)

            // We always maximize weight in weight-count
            const min = this.graph.options.solver.technologies.mode.includes('count')
                ? false
                : this.graph.options.solver.technologies.min

            this.optimize({min, formulas, weights})
        }

        /**
         * (Weight-)Count
         */
        if (this.graph.options.solver.technologies.mode.includes('count')) {
            const groups = utils.groupBy(this.graph.technologies, it => it.name)
            const formulas = Object.entries(groups).map(([name, group]) => MiniSat.or(group.map(it => it.id)))
            const weights = 1

            // We always minimize count in weight-count
            const min = this.graph.options.solver.technologies.mode.includes('weight')
                ? true
                : this.graph.options.solver.technologies.min

            this.optimize({min, formulas, weights})
        }
    }

    /**
     * Unique technologies check
     *
     * Ensure that there is not another solution that has the same technologies enabled and disabled.
     * Note, we use solveAssuming to keep the problem solvable.
     */
    private ensureTechnologiesUniqueness() {
        const result = new Result(this.graph, this.current)
        const present = result.getPresences('technology')
        const absent = result.getAbsences('technology')

        const technologies = MiniSat.and(MiniSat.and(present), MiniSat.not(MiniSat.or(absent)))
        const another = this.minisat.solveAssuming(MiniSat.not(MiniSat.and(technologies)))

        if (check.isDefined(another)) {
            const mode = this.graph.options.solver.technologies.optimize ? 'besides' : 'without'
            throw new Error(`The result is ambiguous considering technologies (${mode} optimization)`)
        }
    }

    /**
     * Optimize
     *
     * This changes the state of the SAT solver but keeps it satisfiable
     */
    private optimize(options: {min: boolean; formulas: MiniSat.Operand[]; weights: number | number[]}) {
        if (options.min) {
            this.current = this.minisat.minimizeWeightedSum(this.current, options.formulas, options.weights)
        } else {
            this.current = this.minisat.maximizeWeightedSum(this.current, options.formulas, options.weights)
        }
    }
}
