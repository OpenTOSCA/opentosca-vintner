import Graph from '#graph/graph'
import Node from '#graph/node'
import {TechnologyTemplateMap} from '#spec/technology-template'

export type TechnologyPluginBuilder = {
    build(graph: Graph): TechnologyPlugin
}

export type TechnologyPlugin = {
    assign: (node: Node) => TechnologyTemplateMap[]
}
