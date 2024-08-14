import * as check from '#check'
import * as files from '#files'
import std from '#std'
import path from 'path'
import {ImplementationGenerator} from './types'

class Registry {
    readonly generators = new Map<string, ImplementationGenerator>()

    get(id: string) {
        return this.generators.get(id)
    }

    add(generator: ImplementationGenerator) {
        if (this.generators.has(generator.id)) throw new Error(`Generator "${generator.id}" already registered`)
        this.generators.set(generator.id, generator)
    }
}

let GeneratorRegistry: Registry | undefined

function loadRegistry() {
    if (check.isUndefined(GeneratorRegistry)) {
        std.log('Loading generators ...')
        GeneratorRegistry = new Registry()
        for (const file of files.walkDirectory(path.join(__dirname, 'generators'))) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const generator: ImplementationGenerator = require(file).default
            std.log(`Adding generator "${generator.id}"`)
            GeneratorRegistry.add(generator)
        }
        std.log('Generators loaded ...')
    }

    return GeneratorRegistry
}

export default loadRegistry
