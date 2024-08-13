import Graph from '#graph/graph'
import Node from '#graph/node'
import {NodeType} from '#spec/node-type'
import {TechnologyTemplateMap} from '#spec/technology-template'

export type TechnologyPluginBuilder = {
    build(graph: Graph): TechnologyPlugin
}

// TODO: update docs
export type TechnologyPlugin = {
    assign: (node: Node) => TechnologyTemplateMap[]
    implement: (type: NodeType) => NodeType
}
