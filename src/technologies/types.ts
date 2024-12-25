import Artifact from '#graph/artifact'
import Element from '#graph/element'
import Graph from '#graph/graph'
import Node from '#graph/node'
import Technology from '#graph/technology'
import {NodeType, NodeTypeMap} from '#spec/node-type'
import {TechnologyRule, TechnologyTemplateMap} from '#spec/technology-template'

export type TechnologyPluginBuilder = {
    build(graph: Graph): TechnologyPlugin
}

export type TechnologyPlugin = {
    // for backwards compatibility and testing purposed, continue if, e.g., no rules at all exists
    backwards: () => Boolean

    // TODO: must assign technology.assign!
    assign: (node: Node) => TechnologyTemplateMap[]
    implement: (name: string, type: NodeType) => NodeTypeMap
    uses: (artifact: Artifact) => Technology[]
}

export type DeploymentScenarioMatch = {
    elements: Element[]
    root: Node
    artifact?: Artifact
    hosting?: Element[]
    rule: TechnologyRule
    prio: number
}
