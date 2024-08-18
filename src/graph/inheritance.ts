import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import {ARTIFACT_TYPE_ROOT, ArtifactType} from '#spec/artifact-type'
import {NODE_TYPE_ROOT, NodeType} from '#spec/node-type'

/**
 * Note, there is a difference between a node type and {@link Type}, which represents the assigment of a node type to an element.
 */
export default class Inheritance {
    private readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    hasArtifact(node: string, artifact: string) {
        const walker = this.NodeTypeWalker(node)

        while (walker.has()) {
            const next = walker.get()

            for (const [artifactName, artifactDefinition] of Object.entries(next.type.artifacts ?? {})) {
                // If definition is a string, then its type is "tosca.artifacts.File"
                if (check.isString(artifactDefinition)) continue

                if (this.isArtifactType(artifactDefinition.type, artifact)) {
                    // Sanity check
                    const expectedArtifactName = artifact.replace('.', '_')
                    if (artifactName !== expectedArtifactName)
                        throw new Error(
                            `Node type "${node}" has artifact "${artifactName}" of type "${artifact}" but must be named "${expectedArtifactName}" per convention.`
                        )

                    return true
                }
            }
        }

        return false
    }

    getNodeType(name: string): NodeType | undefined {
        return (this.graph.serviceTemplate.node_types ?? {})[name]
    }

    hasNodeType(name: string) {
        return Object.keys(this.graph.serviceTemplate.node_types ?? {}).includes(name)
    }

    isArtifactType(is: string, question: string) {
        const walker = this.ArtifactTypeWalker(is)

        while (walker.has()) {
            const next = walker.get()
            if (next.name === question) return true
        }

        return false
    }

    // TODO: use Walker once tested
    isNodeType(is: string, question: string) {
        const types = Object.entries(this.graph.serviceTemplate.node_types ?? {}).map(([name, type]) => ({
            name,
            type,
        }))

        let current: {name: string; type: NodeType} | undefined = types.find(it => it.name === is)
        assert.isDefined(current, `Node type "${is}" has no definition`)

        do {
            if (current.name === question) return true
            const next = types.find(it => it.name === current!.type.derived_from)
            assert.isDefined(next, `Node type "${current.type.derived_from}" has no definition`)
            if (current.name === next.name) throw new Error(`Node type "${current.name}" is derived from itself ...`)
            current = next
        } while (current.name !== NODE_TYPE_ROOT && is !== NODE_TYPE_ROOT)

        return false
    }

    private NodeTypeWalker(start: string) {
        const types = Object.entries(this.graph.serviceTemplate.node_types ?? {}).map(([name, type]) => ({
            name,
            type,
        }))

        let current: {name: string; type: NodeType} | undefined

        const has = () => {
            if (check.isDefined(current) && [NODE_TYPE_ROOT, ARTIFACT_TYPE_ROOT].includes(current.name)) return false
            const next = peek()
            return check.isDefined(next)
        }

        const peek = () => {
            if (check.isUndefined(current)) return types.find(it => it.name === start)
            return types.find(it => it.name === current!.type.derived_from)
        }

        const get = () => {
            const next = peek()
            assert.isDefined(
                next,
                `Node type "${check.isDefined(current) ? current.type.derived_from : start}" has no definition`
            )
            current = next
            return next
        }

        return {
            peek,
            has,
            get,
        }
    }

    // TODO: DRY
    private ArtifactTypeWalker(start: string) {
        const types = Object.entries(this.graph.serviceTemplate.artifact_types ?? {}).map(([name, type]) => ({
            name,
            type,
        }))

        let current: {name: string; type: ArtifactType} | undefined

        const has = () => {
            if (check.isDefined(current) && [ARTIFACT_TYPE_ROOT].includes(current.name)) return false
            const next = peek()
            return check.isDefined(next)
        }

        const peek = () => {
            if (check.isUndefined(current)) return types.find(it => it.name === start)
            return types.find(it => it.name === current!.type.derived_from)
        }

        const get = () => {
            const next = peek()
            assert.isDefined(
                next,
                `Artifact type "${check.isDefined(current) ? current.type.derived_from : start}" has no definition`
            )
            current = next
            return next
        }

        return {
            peek,
            has,
            get,
        }
    }
}
