import Graph from '#graph/graph'
import Node from '#graph/node'
import {NodeType, NodeTypeMap} from '#spec/node-type'
import {TechnologyTemplateMap} from '#spec/technology-template'

export type TechnologyPluginBuilder = {
    build(graph: Graph): TechnologyPlugin
}

export type TechnologyPlugin = {
    // TODO: must assign technology.assign!
    assign: (node: Node) => TechnologyTemplateMap[]
    implement: (name: string, type: NodeType) => NodeTypeMap
}
