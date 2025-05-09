import Artifact from '#graph/artifact'
import Element from '#graph/element'
import Graph from '#graph/graph'
import Node from '#graph/node'
import Technology from '#graph/technology'
import {NodeType, NodeTypeMap} from '#spec/node-type'
import {TechnologyRule, TechnologyTemplateMap} from '#spec/technology-template'
import {QUALITY_LABEL} from '#technologies/utils'

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

export type Match = {
    // TODO: should include all
    elements: Element[]
    root: Node
    artifact?: Artifact
    hosting?: Element[]
    scenario: Scenario
}

export type Scenario = {
    key: string
    component: string
    artifact?: string
    hosting: string[]
    assessments: {
        technology: string
        quality: number
        reason?: string
        _rule: TechnologyRule
    }[]
}

export type Report = {
    component: string
    technology: string
    quality: QUALITY_LABEL
    reason?: string
    scenario: string
}[]
