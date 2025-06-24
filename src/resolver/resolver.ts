import {PERFORMANCE_RESOLVER_EDM} from '#controller/study/performance'
import Graph from '#graph/graph'
import Checker from '#resolver/checker'
import Solver from '#resolver/solver'
import Transformer, {TransformerOptions} from '#resolver/transformer'
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

    run(options: TransformerOptions) {
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
        performance.start(PERFORMANCE_RESOLVER_EDM)
        new Transformer(this.graph, {edmm: options.edmm}).run()
        performance.stop(PERFORMANCE_RESOLVER_EDM)
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
