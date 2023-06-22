import {PUML} from '#/puml/puml'
import * as files from '#files'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'
import * as validator from '#validator'

export type TemplatePUMLTopologyOptions = {
    path: string
    output?: string
}

export default async function (options: TemplatePUMLTopologyOptions) {
    validator.ensureDefined(options.path, 'Path not defined')

    const output = options.output ?? options.path.replace(/(\.yaml|\.yml)/, '.topology.puml')
    if (!output.endsWith('.puml')) throw new Error(`Output path "${output}" does not end with '.puml'`)

    const graph = new Graph(files.loadYAML<ServiceTemplate>(options.path))
    const puml = new PUML(graph)
    const plot = await puml.plotTopology()

    files.storeFile(output, plot)
}
