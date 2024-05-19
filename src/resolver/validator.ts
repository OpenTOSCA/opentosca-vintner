import Graph from '#/graph/graph'
import * as check from '#check'
import {InputAssignmentMap} from '#spec/topology-template'
import MiniSat from 'logic-solver'

// TODO: this does not work with default values of variability inputs
// TODO: this does not work with of variability inputs
// TODO: this does not work with non-boolean variability inputs

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

    private transform() {
        if (this.transformed) return
        this.transformed = true

        // TODO: mapping
    }

    private valid() {
        return check.isDefined(this.minisat.solve())
    }
}
