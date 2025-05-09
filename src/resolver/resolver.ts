import Graph from '#graph/graph'
import Checker from '#resolver/checker'
import Solver from '#resolver/solver'
import Transformer from '#resolver/transformer'
import Validator from '#resolver/validator'
import {InputAssignmentMap} from '#spec/topology-template'
import performance from '#utils/performance'

export default class Resolver {
    private readonly graph: Graph
    private readonly inputs: InputAssignmentMap

    constructor(graph: Graph, inputs: InputAssignmentMap) {
        this.graph = graph
        this.inputs = inputs
    }

    run() {
        performance.start('resolver_run')

        /**
         * Validator
         */
        new Validator(this.graph, this.inputs).run()

        /**
         * Solver
         */
        new Solver(this.graph, this.inputs).run()

        /**
         * Checker
         */
        new Checker(this.graph).run()

        /**
         * Transformer
         */
        new Transformer(this.graph).run()

        performance.stop('resolver_run')
    }

    optimize(options?: {all: boolean}) {
        /**
         * Validator
         */
        new Validator(this.graph, this.inputs).run()

        /**
         * Solver
         */
        return new Solver(this.graph, this.inputs).optimize(options)
    }
}
