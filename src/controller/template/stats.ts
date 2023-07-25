import * as assert from '#assert'
import * as files from '#files'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'
import * as utils from '#utils'

export type TemplateStatsOptions = {
    template: string[]
}

export type TemplateStats = {
    nodes: number
    relations: number
    properties: number
    types: number
    policies: number
    groups: number
    inputs: number
    artifacts: number
    imports: number
    elements: number
    // Nodes + Relations + Properties + Artifacts
    nrpa: number
}

export default async function (options: TemplateStatsOptions) {
    assert.isDefined(options.template, 'Template not defined')

    return utils.sumObjects(
        options.template.map(it => {
            const graph = new Graph(files.loadYAML<ServiceTemplate>(it))
            const stats: TemplateStats = {
                nodes: graph.nodes.length,
                relations: graph.relations.length,
                properties: graph.properties.length,
                types: graph.types.length,
                policies: graph.policies.length,
                groups: graph.groups.length,
                inputs: graph.inputs.length,
                artifacts: graph.artifacts.length,
                imports: graph.imports.length,
                elements: graph.elements.length,
                nrpa: graph.nodes.length + graph.relations.length + graph.properties.length + graph.artifacts.length,
            }
            return stats
        })
    )
}
