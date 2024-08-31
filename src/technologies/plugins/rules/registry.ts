import * as check from '#check'
import {TechnologyAssignmentRulesMap} from '#spec/technology-template'
import generators from '#technologies/plugins/rules/generators'
import {constructRuleName} from '#technologies/utils'
import * as utils from '#utils'
import {ImplementationGenerator} from './types'

class Registry {
    readonly generators = new Map<string, ImplementationGenerator>()

    constructor() {
        this.init()
    }

    get(id: string) {
        return this.generators.get(id)
    }

    private init() {
        for (const generator of generators.flat(Infinity) as ImplementationGenerator[]) {
            const id = constructRuleName(generator)
            if (this.generators.has(id)) throw new Error(`Generator "${id}" already registered`)
            this.generators.set(id, generator)
        }
    }

    get rules(): TechnologyAssignmentRulesMap {
        const map: TechnologyAssignmentRulesMap = {}

        for (const generator of this.generators.values()) {
            if (check.isUndefined(map[generator.technology])) {
                map[generator.technology] = []
            }

            map[generator.technology].push(
                utils.copy({
                    component: generator.component,
                    artifact: generator.artifact,
                    hosting: generator.hosting,
                    weight: generator.weight,
                    reason: generator.reason,
                    details: generator.details,
                })
            )
        }

        return map
    }
}

export default new Registry()
