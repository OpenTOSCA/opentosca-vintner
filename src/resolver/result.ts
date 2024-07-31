import * as assert from '#assert'
import * as check from '#check'
import Element from '#graph/element'
import Graph from '#graph/graph'
import * as utils from '#utils'
import MiniSat from 'logic-solver'

export type ResultMap = Record<string, boolean>

export class Result {
    private readonly graph: Graph

    private readonly result: MiniSat.Solution

    constructor(graph: Graph, result: MiniSat.Solution) {
        this.graph = graph
        this.result = result
    }

    private _map?: ResultMap
    get map() {
        if (check.isUndefined(this._map)) this._map = this.result.getMap()
        return this._map
    }

    /**
     * Note, we cannot use element.present yet since we are currently selecting the result!
     */
    isPresent(element: Element) {
        const present = this.map[element.id]
        if (check.isUndefined(present)) throw new Error(`${element.Display} is not part of the result`)
        return check.isTrue(present)
    }

    getPresentElements(prefix: string) {
        return Object.entries(this.map)
            .filter(([name, value]) => name.startsWith(prefix) && check.isTrue(value))
            .map(([name, _]) => name)
    }

    getAbsentElements(prefix: string) {
        return Object.entries(this.map)
            .filter(([name, value]) => name.startsWith(prefix) && check.isFalse(value))
            .map(([name, _]) => name)
    }

    get topology(): {count: number; weight: number} {
        let count = 0
        let weight = 0
        for (const node of this.graph.nodes.filter(it => this.isPresent(it))) {
            count++
            weight += node.weight
        }
        return {count, weight}
    }

    get technologies(): {count: number; weight: number; weights: {[key: string]: number}} {
        /**
         * Weight
         */
        const weights: {[key: string]: number} = {}
        for (const technology of this.graph.technologies.filter(it => this.isPresent(it))) {
            if (check.isUndefined(weights[technology.name])) weights[technology.name] = 0
            weights[technology.name] += technology.weight
        }

        /**
         * Count
         */
        const count = Object.values(weights).length

        /**
         * Weight
         */
        const weight = utils.sum(Object.values(weights))

        /**
         * Result
         */
        return {count, weight, weights}
    }

    get quality(): {count: number; weight: number; average: number} {
        assert.isDefined(this.technologies)

        /**
         * Count (total number of present technologies assignments)
         */
        const count = this.graph.technologies.filter(it => this.isPresent(it)).length
        assert.isNumber(count)
        if (count === 0) throw new Error(`Technology count is 0`)

        /**
         * Weight (total weight of technology assignments)
         */
        const weight = this.technologies.weight

        /**
         * Average (average weight per technology assignment)
         */
        const average = this.technologies.weight / count

        /**
         * Result
         */
        return {count, weight, average}
    }
}
