import Graph from '#graph/graph'
import Checker from '#resolver/checker'
import Inputs from '#resolver/inputs'
import Solver from '#resolver/solver'
import Transformer from '#resolver/transformer'

export default class Resolver {
    private readonly graph: Graph
    private readonly inputs: Inputs

    constructor(graph: Graph, inputs: Inputs) {
        this.graph = graph
        this.inputs = inputs
    }

    run() {
        /**
         * Solver
         */
        new Solver(this.graph, this.inputs.inputs).run()

        /**
         * Checker
         */
        new Checker(this.graph).run()

        /**
         * Transformer
         */
        new Transformer(this.graph).run()
    }
}
