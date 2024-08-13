import * as assert from '#assert'
import Graph from '#graph/graph'
import Type from '#graph/type'
import {NODE_TYPE_ROOT, NodeType} from '#spec/node-type'

/**
 * Note, there is a difference between a node type and {@link Type}, which represents the assigment of a node type to an element.
 */
export default class Inheritance {
    private readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    hasNodeType(name: string) {
        return Object.keys(this.graph.serviceTemplate.node_types ?? {}).includes(name)
    }

    isNodeType(is: string, question: string) {
        const types = Object.entries(this.graph.serviceTemplate.node_types ?? {}).map(([name, type]) => ({
            name,
            type,
        }))

        let current: {name: string; type: NodeType} | undefined = types.find(it => it.name === is)
        assert.isDefined(current, `"Node type ${is}" has no definition`)

        do {
            if (current.name === question) return true
            const next = types.find(it => it.name === current!.type.derived_from)
            assert.isDefined(next, `Node type "${current.type.derived_from}" has no definition`)
            current = next
        } while (current.name !== NODE_TYPE_ROOT && is !== NODE_TYPE_ROOT)

        return false
    }
}
