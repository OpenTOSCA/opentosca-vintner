import * as check from '#check'
import Graph from '#graph/graph'
import {Result} from '#resolver/result'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'
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

        // TODO: additionally minimize number of different technologies?

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
         * Minimize
         */
        if (this.graph.options.solver.topology.min) {
            this.current = this.minisat.minimizeWeightedSum(this.current, formulas, weights)
            return
        }

        /**
         * Maximize
         */
        if (this.graph.options.solver.topology.max) {
            this.current = this.minisat.maximizeWeightedSum(this.current, formulas, weights)
            return
        }

        throw new UnexpectedError()
    }

    /**
     * Unique topology check
     *
     * Ensure that there is not another solution that has the same nodes enabled and disabled.
     * Note, we use solveAssuming to keep the problem solvable.
     */
    private ensureTopologyUniqueness() {
        const result = new Result(this.graph, this.current)
        const present = result.getPresentElements('node')
        const absent = result.getAbsentElements('node')

        const topology = MiniSat.and(MiniSat.and(present), MiniSat.not(MiniSat.or(absent)))
        const another = this.minisat.solveAssuming(MiniSat.not(topology))

        if (check.isDefined(another)) {
            const mode = this.graph.options.solver.topology.optimize ? 'besides' : 'without'
            throw new Error(`The result is ambiguous considering nodes (${mode} optimization)`)
        }
    }

    /**
     * Optimize technologies
     */
    private optimizeTechnologies() {
        let formulas: MiniSat.Operands[]
        let weights: number | number[]

        switch (this.graph.options.solver.technologies.mode) {
            /**
             * Weight
             */
            case 'weight': {
                formulas = this.graph.technologies.map(it => it.id)
                weights = this.graph.technologies.map(it => it.weight * 100)
                break
            }

            /**
             * Count
             */
            case 'count': {
                const groups = utils.groupBy(this.graph.technologies, it => it.name)
                formulas = Object.entries(groups).map(([name, group]) => MiniSat.or(group.map(it => it.id)))
                weights = 1
                break
            }

            /**
             * Abort
             */
            default:
                throw new Error(
                    `Technology optimization mode "${this.graph.options.solver.technologies.mode}" not supported`
                )
        }

        /**
         * Minimize
         */
        if (this.graph.options.solver.technologies.min) {
            this.current = this.minisat.minimizeWeightedSum(this.current, formulas, weights)
            return
        }

        /**
         * Maximize
         */
        if (this.graph.options.solver.technologies.max) {
            this.current = this.minisat.maximizeWeightedSum(this.current, formulas, weights)
            return
        }

        throw new UnexpectedError()
    }

    /**
     * Unique technologies check
     *
     * Ensure that there is not another solution that has the same technologies enabled and disabled.
     * Note, we use solveAssuming to keep the problem solvable.
     */
    private ensureTechnologiesUniqueness() {
        const result = new Result(this.graph, this.current)
        const present = result.getPresentElements('technology')
        const absent = result.getAbsentElements('technology')

        const technologies = MiniSat.and(MiniSat.and(present), MiniSat.not(MiniSat.or(absent)))
        const another = this.minisat.solveAssuming(MiniSat.not(MiniSat.and(technologies)))

        if (check.isDefined(another)) {
            const mode = this.graph.options.solver.technologies.optimize ? 'besides' : 'without'
            throw new Error(`The result is ambiguous considering technologies (${mode} optimization)`)
        }
    }
}
