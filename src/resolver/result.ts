import * as check from '#check'
import Element from '#graph/element'
import Graph from '#graph/graph'
import * as utils from '#utils'
import MiniSat from 'logic-solver'

export type ResultMap = Record<string, boolean>

export class Result {
    private readonly graph: Graph

    private readonly result: MiniSat.Solution
    readonly elements: {count: number; weight: number}
    readonly technologies: {count: number; weight: number}

    constructor(graph: Graph, result: MiniSat.Solution) {
        this.graph = graph
        this.result = result

        this.elements = this.weightResult()
        this.technologies = this.weightTechnologies()
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
        let weight = 0
        for (const node of this.graph.nodes) {
            if (check.isTrue(this.map[node.id])) weight += node.weight
        }
        return {count: this.graph.nodes.length, weight}
    }

    private weightTechnologies() {
        const weights: {[key: string]: number} = {}
        for (const technology of this.graph.technologies) {
            if (check.isUndefined(weights[technology.name])) weights[technology.name] = 0
            if (check.isTrue(this.map[technology.id])) weights[technology.name] += technology.weight
        }
        return {
            count: Object.values(weights).filter(it => it !== 0).length,
            weight: utils.sum(Object.values(weights)),
        }
    }

    equals(result: Result): boolean {
        if (Object.keys(this.map).length !== Object.keys(result.map).length) return false

        for (const key of Object.keys(this.map).filter(it => !it.startsWith('technology'))) {
            if (this.map[key] !== result.map[key]) return false
        }

        return true
    }
}
