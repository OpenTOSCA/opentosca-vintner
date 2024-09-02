import * as assert from '#assert'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import * as puml from '#puml'
import {RenderOptions} from '#puml'
import std from '#std'
import path from 'path'

export type TemplatePUMLTopologyOptions = {
    path: string
    output?: string
} & RenderOptions

export default async function (options: TemplatePUMLTopologyOptions) {
    options.format = options.format ?? 'puml'

    assert.isDefined(options.path, 'Path not defined')
    std.log(`Handling file "${path.resolve(options.path)}"`)

    const output = options.output ?? options.path.replace(/(\.yaml|\.yml)/, '.topology.' + options.format)
    const graph = new Graph(new Loader(options.path).raw())
    const plot = await puml.renderTopology(graph, {format: options.format})

    std.log(`Writing file "${path.resolve(output)}"`)
    files.storeFile(output, plot)
}
