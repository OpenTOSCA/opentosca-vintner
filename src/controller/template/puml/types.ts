import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import * as puml from '#puml'
import {EntityTypes, EntityTypesKeys} from '#spec/service-template'
import std from '#std'
import path from 'path'

export type TemplatePUMLTypesOptions = {
    path: string
    output?: string
    types?: (keyof EntityTypes)[]
}

export default async function (options: TemplatePUMLTypesOptions) {
    assert.isDefined(options.path, 'Path not defined')
    std.log(`Handling file "${path.resolve(options.path)}"`)

    const outputDir = options.output ?? files.getDirectory(options.path)
    files.assertDirectory(outputDir)

    const graph = new Graph(new Loader(options.path).raw())

    const keys = options.types ?? EntityTypesKeys

    const result: {[key: string]: string} = {}
    for (const key of keys) {
        if (check.isUndefined(graph.serviceTemplate[key])) continue
        result[key] = await puml.renderTypes(graph, key)
    }

    for (const [key, plot] of Object.entries(result)) {
        const output = path.join(
            outputDir,
            files.getBase(options.path).replace(/(\.yaml|\.yml)/, '.' + key.replace('_', '-') + '.puml')
        )
        if (!output.endsWith('.puml')) throw new Error(`Output path "${output}" does not end with '.puml'`)

        std.log(`Writing file "${output}" if changed`)
        files.storeFile(output, plot, {onlyIfChanged: true})
    }
}
