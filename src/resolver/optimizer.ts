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

        /**
         * Check if there are multiple optimal topologies
         */
        if (this.graph.options.solver.topology.unique) this.ensureTopologyUniqueness()

        /**
         * Optimize technologies
         */
        if (this.graph.options.solver.technologies.optimize) this.optimizeTechnologies()

        /**
         * Check if there are multiple optimal technologies
         */
        if (this.graph.options.solver.technologies.unique) this.ensureTechnologiesUniqueness()

        return this.current
    }

    /**
     * Optimize topology
     */
    private optimizeTopology() {
        const formulas = this.graph.nodes.map(it => it.id)
        let weights: number | number[]

        switch (this.graph.options.solver.topology.mode) {
            /**
             * Weight
             */
            case 'weight': {
                weights = this.graph.nodes.map(it => it.weight * 100)
                break
            }

            /**
             * Count
             */
            case 'count': {
                weights = 1
                break
            }

            /**
             * Abort
             */
            default:
                throw new Error(`Topology optimization mode "${this.graph.options.solver.topology.mode}" not supported`)
        }

        /**
         * Optimize
         */
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

        const topology = MiniSat.and(MiniSat.and(present), MiniSat.not(MiniSat.or(absent)))
        const another = this.minisat.solveAssuming(MiniSat.not(topology))

        if (check.isDefined(another)) {
            const mode = this.graph.options.solver.topology.optimize ? 'besides' : 'without'
            throw new Error(`The result is ambiguous considering nodes (${mode} optimization)`)
        }
    }

    // TODO: this is so messy!

    /**
     * Optimize technologies
     */
    private optimizeTechnologies() {
        /**
         * Weight
         */
        const weight_formulas = this.graph.technologies.map(it => it.id)
        const weight_weights = this.graph.technologies.map(it => it.weight * 100)
        if (this.graph.options.solver.technologies.mode === 'weight') {
            return this.optimize({
                min: this.graph.options.solver.technologies.min,
                formulas: weight_formulas,
                weights: weight_weights,
            })
        }

        /**
         * Count
         */
        const count_groups = utils.groupBy(this.graph.technologies, it => it.name)
        const count_formulas = Object.entries(count_groups).map(([name, group]) => MiniSat.or(group.map(it => it.id)))
        const count_weights = 1
        if (this.graph.options.solver.technologies.mode === 'count') {
            return this.optimize({
                min: this.graph.options.solver.technologies.min,
                formulas: count_formulas,
                weights: count_weights,
            })
        }

        /**
         * Weight-Count
         */
        if (this.graph.options.solver.technologies.mode === 'weight-count') {
            this.optimize({min: false, formulas: weight_formulas, weights: weight_weights})
            return this.optimize({min: true, formulas: count_formulas, weights: count_weights})
        }

        throw new Error(`Technology optimization mode "${this.graph.options.solver.technologies.mode}" not supported`)
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
     */
    private optimize(options: {min: boolean; formulas: MiniSat.Operand[]; weights: number | number[]}) {
        if (options.min) {
            this.current = this.minisat.minimizeWeightedSum(this.current, options.formulas, options.weights)
        } else {
            this.current = this.minisat.maximizeWeightedSum(this.current, options.formulas, options.weights)
        }
    }
}
