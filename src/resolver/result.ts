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
    readonly topology: {count: number; weight: number}
    readonly technologies: {count: number; weight: number; weights: {[key: string]: number}}
    readonly quality: {count: number; weight: number; average: number}

    constructor(graph: Graph, result: MiniSat.Solution) {
        this.graph = graph
        this.result = result

        this.topology = this.weightTopology()
        this.technologies = this.weightTechnologies()
        this.quality = this.assessQuality()
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

    private weightTopology() {
        let count = 0
        let weight = 0
        for (const node of this.graph.nodes.filter(it => this.isPresent(it))) {
            count++
            weight += node.weight
        }
        return {count, weight}
    }

    private weightTechnologies() {
        const weights: {[key: string]: number} = {}
        for (const technology of this.graph.technologies.filter(it => this.isPresent(it))) {
            if (check.isUndefined(weights[technology.name])) weights[technology.name] = 0
            weights[technology.name] += technology.weight
        }
        return {
            count: Object.values(weights).length,
            weight: utils.sum(Object.values(weights)),
            weights,
        }
    }

    private assessQuality() {
        assert.isDefined(this.technologies)

        const count = this.graph.technologies.filter(it => this.isPresent(it)).length
        assert.isNumber(count)

        return {
            count,
            weight: this.technologies.weight,
            average: this.technologies.weight / count,
        }
    }

    /**
     * Note, we cannot use element.present yet since we are currently selecting the result!
     */
    private isPresent(element: Element) {
        return check.isTrue(this.map[element.id])
    }

    equals(result: Result): boolean {
        if (Object.keys(this.map).length !== Object.keys(result.map).length) return false

        for (const key of Object.keys(this.map).filter(it => !it.startsWith('technology'))) {
            if (this.map[key] !== result.map[key]) return false
        }

        return true
    }
}
