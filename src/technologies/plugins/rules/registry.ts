import * as check from '#check'
import * as files from '#files'
import {TechnologyAssignmentRulesMap} from '#spec/technology-template'
import std from '#std'
import {constructRuleName} from '#technologies/utils'
import * as utils from '#utils'
import path from 'path'
import {ImplementationGenerator} from './types'

class Registry {
    readonly generators = new Map<string, ImplementationGenerator>()

    get(id: string) {
        return this.generators.get(id)
    }

    add(generator: ImplementationGenerator) {
        const id = constructRuleName(generator)
        std.log(`Adding generator "${id}"`)

        if (this.generators.has(id)) throw new Error(`Generator "${id}" already registered`)
        this.generators.set(id, generator)
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

let registry: Registry | undefined

function loadRegistry() {
    if (check.isUndefined(registry)) {
        std.log('Loading generators ...')
        registry = new Registry()
        for (const file of files.walkDirectory(path.join(__dirname, 'generators'))) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const generator: ImplementationGenerator = require(file).default
            registry.add(generator)
        }
        std.log(`${registry.generators.size} generators loaded ...`)
    }

    return registry
}

export default loadRegistry