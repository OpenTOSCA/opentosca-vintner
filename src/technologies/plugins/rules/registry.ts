import * as check from '#check'
import {TechnologyRule} from '#spec/technology-template'
import generators from '#technologies/plugins/rules/generators'
import {Scenario} from '#technologies/types'
import {constructRuleName, sortRules, toScenarios} from '#technologies/utils'
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

    private _rules: TechnologyRule[] | undefined
    get rules(): TechnologyRule[] {
        if (check.isUndefined(this._rules)) {
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
                        operations: generator.operations,
                    })
                )
            }

            list.sort(sortRules)

            this._rules = list
        }

        return this._rules
    }

    get scenarios(): Scenario[] {
        return toScenarios(this.rules)
    }
}

export default new Registry()
