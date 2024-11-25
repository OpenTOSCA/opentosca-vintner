import Artifact from '#graph/artifact'
import Graph from '#graph/graph'
import Node from '#graph/node'
import Technology from '#graph/technology'
import {NodeType, NodeTypeMap} from '#spec/node-type'
import {TechnologyTemplateMap} from '#spec/technology-template'

export type TechnologyPluginBuilder = {
    build(graph: Graph): TechnologyPlugin
}

export type TechnologyPlugin = {
    enabled: () => Boolean

    // TODO: must assign technology.assign!
    assign: (node: Node) => TechnologyTemplateMap[]
    implement: (name: string, type: NodeType) => NodeTypeMap
    uses: (artifact: Artifact) => Technology[]
}
