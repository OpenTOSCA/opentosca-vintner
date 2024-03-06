import * as assert from '#assert'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import std from '#std'
import * as utils from '#utils'
import path from 'path'

export type TemplatePUMLTypesOptions = {
    path: string
    output?: string
    types?: string[]
}

export default async function (options: TemplatePUMLTypesOptions) {
    assert.isDefined(options.path, 'Path not defined')
    std.log(`Handling file "${path.resolve(options.path)}"`)

    const outputDir = options.output ?? files.getDirectory(options.path)
    files.assertDirectory(outputDir)

    const graph = new Graph(new Loader(options.path).raw())

    const types = options.types ?? Object.keys(graph.serviceTemplate).filter(it => it.endsWith('_types'))

    const result: {[key: string]: string} = {}
    for (const type of types) {
        result[type] = await files.renderFile(path.join(files.TEMPLATES_DIR, 'puml', 'types', 'types.template.ejs'), {
            graph,
            utils,
            type,
        })
    }

    for (const [type, plot] of Object.entries(result)) {
        const output = path.join(
            outputDir,
            files.getFilename(options.path).replace(/(\.yaml|\.yml)/, '.' + type.replace('_', '-') + '.puml')
        )
        if (!output.endsWith('.puml')) throw new Error(`Output path "${output}" does not end with '.puml'`)

        std.log(`Writing file "${output}" if changed`)
        files.storeFile(output, plot, {onlyIfChanged: true})
    }
}
