import {PUML} from '#/puml/puml'
import * as files from '#files'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'
import * as validator from '#validator'
import path from 'path'

export type TemplatePUMLTypesOptions = {
    path: string
    output?: string
    types?: string[]
}

export default async function (options: TemplatePUMLTypesOptions) {
    validator.ensureDefined(options.path, 'Path not defined')

    const outputDir = options.output ?? files.getDirectory(options.path)
    files.assertDirectory(outputDir)

    const graph = new Graph(files.loadYAML<ServiceTemplate>(options.path))
    const plotter = new PUML(graph)
    const result = await plotter.plotTypes(options.types)

    for (const [type, plot] of Object.entries(result)) {
        const outputFile = path.join(
            outputDir,
            files.getFilename(options.path).replace(/(\.yaml|\.yml)/, '.' + type.replace('_', '-') + '.puml')
        )
        if (!outputFile.endsWith('.puml')) throw new Error(`Output path "${outputFile}" does not end with '.puml'`)

        files.storeFile(outputFile, plot)
    }
}
