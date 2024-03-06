import Graph from '#graph/graph'
import Checker from '#resolver/checker'
import Solver from '#resolver/solver'
import Transformer from '#resolver/transformer'
import {InputAssignmentMap} from '#spec/topology-template'

export default class Resolver {
    private readonly graph: Graph
    private readonly inputs: InputAssignmentMap

    constructor(graph: Graph, inputs: InputAssignmentMap) {
        this.graph = graph
        this.inputs = inputs
    }

    run() {
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
    }
}
