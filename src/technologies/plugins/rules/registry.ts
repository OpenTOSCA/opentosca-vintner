import {TechnologyRule} from '#spec/technology-template'
import generators from '#technologies/plugins/rules/generators'
import {constructRuleName} from '#technologies/utils'
import * as utils from '#utils'
import {ImplementationGenerator} from './types'

class Registry {
    readonly map = new Map<string, ImplementationGenerator>()

    constructor() {
        this.init()
    }

    get(id: string) {
        return this.map.get(id)
    }

    private init() {
        for (const generator of generators.flat(Infinity) as ImplementationGenerator[]) {
            const id = constructRuleName(generator)
            if (this.map.has(id)) throw new Error(`Generator "${id}" already registered`)
            this.map.set(id, generator)
        }
    }

    get rules(): TechnologyRule[] {
        const list: TechnologyRule[] = []

        for (const generator of this.map.values()) {
            list.push(
                utils.copy({
                    technology: generator.technology,
                    component: generator.component,
                    artifact: generator.artifact,
                    hosting: generator.hosting,
                    weight: generator.weight,
                    reason: generator.reason,
                    details: generator.details,
                })
            )
        }

        return list
    }
}

export default new Registry()
