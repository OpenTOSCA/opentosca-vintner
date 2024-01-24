import * as check from '#check'
import Element from '#graph/element'
import Graph from '#graph/graph'
import MiniSat from 'logic-solver'

export type ResultMap = Record<string, boolean>

export class Result {
    private readonly graph: Graph

    private readonly result: MiniSat.Solution
    readonly weight: number
    readonly technologies: number

    constructor(graph: Graph, result: MiniSat.Solution) {
        this.graph = graph
        this.result = result

        this.weight = this.weightResult()
        this.technologies = this.countTechnologies()
    }

    private _map?: ResultMap
    get map() {
        if (check.isUndefined(this._map)) this._map = this.result.getMap()
        return this._map
    }

    getPresence(element: Element) {
        const present = this.map[element.id]
        if (check.isUndefined(present)) throw new Error(`${element.Display} is not part of the result`)
        return present
    }

    private weightResult() {
        let sum = 0
        for (const node of this.graph.nodes) {
            if (this.map[node.id]) sum += node.weight
        }
        return sum
    }

    private countTechnologies() {
        const counts: {[key: string]: number} = {}
        for (const technology of this.graph.technologies) {
            if (check.isUndefined(counts[technology.name])) counts[technology.name] = 0
            if (this.map[technology.id]) counts[technology.name]++
        }
        return Object.keys(counts).length
    }

    equals(result: Result): boolean {
        if (Object.keys(this.map).length !== Object.keys(result.map).length) return false

        for (const key of Object.keys(this.map).filter(it => !it.startsWith('technology'))) {
            if (this.map[key] !== result.map[key]) return false
        }

        return true
    }
}
