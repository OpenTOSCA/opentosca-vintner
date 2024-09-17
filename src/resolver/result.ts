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

    getPresences(prefix: string) {
        return Object.entries(this.map)
            .filter(([name, value]) => name.startsWith(prefix) && check.isTrue(value))
            .map(([name, _]) => name)
    }

    getAbsences(prefix: string) {
        return Object.entries(this.map)
            .filter(([name, value]) => name.startsWith(prefix) && check.isFalse(value))
            .map(([name, _]) => name)
    }

    get topology(): {count: number; weight: number; components: string[]} {
        /**
         * Present nodes
         */
        const present = this.graph.nodes.filter(it => this.isPresent(it))

        /**
         * Count (number of present nodes)
         */
        const count = present.length

        /**
         * Weight (sum of all weights of present nodes)
         */
        const weight = present.reduce((sum, it) => sum + it.weight, 0)

        /**
         * Components (names of present components)
         */
        const components = present.map(it => it.name)

        /**
         * Result
         */
        return {count, weight, components}
    }

    get technologies(): {
        count_groups: number
        count_total: number
        count_each: {[technology: string]: number}
        weight: number
        weight_each: {[technology: string]: number}
        weight_average: number
        assignments: string[]
    } {
        /**
         * Present technologies
         */
        const present = this.graph.technologies.filter(it => this.isPresent(it))
        const groups = utils.groupBy(present, it => it.name)

        /**
         * Count (total number of different technologies, i.e., number of groups by name)
         */
        const count_groups = Object.values(groups).length

        /**
         * Count Total (total number of all present technologies)
         */
        const count_total = present.length
        assert.isNumber(count_total)
        if (count_total === 0) throw new Error(`Technology count is 0`)

        /**
         * Count Each (number of technologies per group)
         */
        const count_each = Object.entries(groups).reduce<{[key: string]: number}>((output, [name, group]) => {
            output[name] = group.length
            return output
        }, {})

        /**
         * Weight (sum of all weights of all present technologies)
         */
        const weight = utils.sum(present.map(it => it.weight))

        /**
         * Weight Each (sum of all weight in a group of present technology)
         */
        const weight_each = Object.entries(groups).reduce<{[key: string]: number}>((output, [name, group]) => {
            output[name] = utils.sum(group.map(it => it.weight))
            return output
        }, {})

        /**
         * Weight Average (average weight per technology
         */
        const weight_average = weight / count_total

        /**
         * Presences
         */
        const assignments = this.getPresences('technology')

        /**
         * Result
         */
        return {count_groups, count_total, count_each, weight, weight_each, weight_average, assignments}
    }
}
