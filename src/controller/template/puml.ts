import {PUML} from '#/puml/puml'
import * as files from '#files'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'
import * as validator from '#validator'

export type TemplatePUMLOptions = {
    path: string
    output?: string
}

export default async function(options: TemplatePUMLOptions) {
    validator.ensureDefined(options.path, 'Inputs not defined')
    files.assertFile(options.path)

    const output = options.output ?? options.path.replace('.yaml', '.puml').replace('.yml', '.puml')
    if (!output.endsWith('.puml')) throw new Error(`Output path "${output}" does not end with '.puml'`)

    const graph = new Graph(files.loadYAML<ServiceTemplate>(options.path))
    const puml = await new PUML(graph).plot()

    files.storeFile(output, puml)
}
