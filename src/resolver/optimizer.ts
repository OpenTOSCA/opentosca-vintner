import * as assert from '#assert'
import Graph from '#graph/graph'
import {Result} from '#resolver/result'

export default class Optimizer {
    private readonly graph: Graph
    private results: Result[]
    private transformed = false

    constructor(graph: Graph, results: Result[]) {
        this.graph = graph
        this.results = results
    }

    run() {
        this.optimize()

        return this.first()
    }

    optimize() {
        if (this.transformed) return this.results
        this.transformed = true

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

        return this.results
    }

    private optimizeTopology() {
        /**
         * Minimize
         */
        if (this.graph.options.solver.topology.min) {
            this.results.sort(this.compare('asc', it => it.topology[this.graph.options.solver.topology.mode]))
        }

        /**
         * Maximize
         */
        if (this.graph.options.solver.topology.max) {
            this.results.sort(this.compare('desc', it => it.topology[this.graph.options.solver.topology.mode]))
        }
    }

    private ensureTopologyUniqueness() {
        if (this.results.length > 1 && !this.first().equals(this.second())) {
            if (this.graph.options.solver.topology.optimize) {
                if (this.first().topology.weight === this.second().topology.weight)
                    throw new Error(`The result is ambiguous considering nodes (besides optimization)`)
            } else {
                throw new Error(`The result is ambiguous considering nodes (without optimization)`)
            }
        }
    }

    private optimizeTechnologies() {
        /**
         * Get subset of result (this simplifies unique check and does not sort in-place considering weight)
         * If optimized, then the best results.
         * If optimized and unique, then only the first.
         * If not optimized, then not further defined/ any/ just chose the first one/ might be a list or just the first one
         */
        this.results = this.results.filter(
            it =>
                it.topology[this.graph.options.solver.topology.mode] ===
                this.first().topology[this.graph.options.solver.topology.mode]
        )

        /**
         * Minimize
         */
        if (this.graph.options.solver.technologies.min) {
            this.results.sort(this.compare('asc', it => it.technologies[this.graph.options.solver.technologies.mode]))
        }

        /**
         * Maximize
         */
        if (this.graph.options.solver.technologies.max) {
            this.results.sort(this.compare('desc', it => it.technologies[this.graph.options.solver.technologies.mode]))
        }
    }

    private ensureTechnologiesUniqueness() {
        if (this.results.length > 1) {
            if (this.graph.options.solver.technologies.optimize) {
                if (
                    this.first().technologies[this.graph.options.solver.technologies.mode] ===
                    this.second().technologies[this.graph.options.solver.technologies.mode]
                )
                    throw new Error(`The result is ambiguous considering technologies (besides optimization)`)
            } else {
                throw new Error(`The result is ambiguous considering technologies (without optimization)`)
            }
        }
    }

    private first() {
        const result = this.results[0]
        assert.isDefined(result)
        return result
    }

    private second() {
        const result = this.results[1]
        assert.isDefined(result)
        return result
    }

    private last() {
        const result = this.results[this.results.length - 1]
        assert.isDefined(result)
        return result
    }

    private compare<T>(order: 'asc' | 'desc', value: (element: T) => number) {
        return (a: T, b: T) => {
            if (order === 'asc') return value(a) - value(b)
            return value(b) - value(a)
        }
    }
}
