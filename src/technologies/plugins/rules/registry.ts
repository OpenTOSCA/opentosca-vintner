import * as assert from '#assert'
import * as check from '#check'
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
                    })
                )
            }

            list.sort((x, y) => {
                assert.isDefined(x.hosting)
                assert.isDefined(y.hosting)

                // Sort by component
                const c = x.component.localeCompare(y.component)
                if (c !== 0) return c

                // Sort by artifact
                let a = 0
                if (check.isDefined(x.artifact) && check.isDefined(y.artifact)) {
                    a = x.artifact.localeCompare(y.artifact)
                }
                if (a !== 0) return a

                // Sort by hosting stack
                const h = x.hosting.join().localeCompare(y.hosting.join())
                if (h !== 0) return h

                // Sort by technology
                return x.component.localeCompare(y.component)
            })

            this._rules = list
        }

        return this._rules
    }
}

export default new Registry()
