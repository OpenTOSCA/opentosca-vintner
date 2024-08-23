import Graph from '#/graph/graph'
import * as utils from '#utils'

export default class Checker {
    private readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    run() {
        const relations = this.graph.relations.filter(it => it.present)
        const nodes = this.graph.nodes.filter(it => it.present)
        const artifacts = this.graph.artifacts.filter(it => it.present)
        const properties = this.graph.properties.filter(it => it.present)
        const types = this.graph.types.filter(it => it.present)
        const technologies = this.graph.technologies.filter(it => it.present)
        const inputs = this.graph.inputs.filter(it => it.present)
        const outputs = this.graph.outputs.filter(it => it.present)
        const groups = this.graph.groups.filter(it => it.present)
        const policies = this.graph.policies.filter(it => it.present)

        // Ensure that each relation source exists
        if (this.graph.options.checks.relationSource) {
            for (const relation of relations) {
                if (!relation.source.present)
                    throw new Error(`Relation source "${relation.source.name}" of ${relation.display} does not exist`)
            }
        }

        // Ensure that each relation target exists
        if (this.graph.options.checks.relationTarget) {
            for (const relation of relations) {
                if (!relation.target.present)
                    throw new Error(`Relation target "${relation.target.name}" of ${relation.display} does not exist`)
            }
        }

        // Ensure that node of each artifact exists
        if (this.graph.options.checks.missingArtifactContainer) {
            for (const artifact of artifacts) {
                if (!artifact.container.present) throw new Error(`Container of ${artifact.display} does not exist`)
            }
        }

        // Ensure that artifacts are unique within their node (also considering non-present nodes)
        if (this.graph.options.checks.ambiguousArtifact) {
            for (const node of nodes) {
                const names = new Set()
                for (const artifact of node.artifacts.filter(it => it.present)) {
                    if (names.has(artifact.name)) throw new Error(`${artifact.Display} is ambiguous`)
                    names.add(artifact.name)
                }
            }
        }

        // Ensure that node of each present property exists
        if (this.graph.options.checks.missingPropertyContainer) {
            for (const property of properties) {
                if (!property.container.present) {
                    throw new Error(`Container of ${property.display} does not exist`)
                }
            }
        }

        // Ensure that each property has maximum one value (also considering non-present nodes)
        if (this.graph.options.checks.ambiguousProperty) {
            for (const node of nodes) {
                const names = new Set()
                for (const property of node.properties.filter(it => it.present)) {
                    if (names.has(property.name)) throw new Error(`${property.Display} is ambiguous`)
                    names.add(property.name)
                }
            }
        }

        // Ensure that container of each type exists
        if (this.graph.options.checks.missingTypeContainer) {
            for (const type of types) {
                if (!type.container.present) throw new Error(`Container of ${type.display} does not exist`)
            }
        }

        // Ensure that each type container has exactly one type
        if (this.graph.options.checks.ambiguousType) {
            // TODO: relations (but this would currently require relationship templates with type declarations)
            for (const list of [nodes, groups, policies, artifacts]) {
                for (const element of list) {
                    const names = new Set()
                    const elementTypes = element.types.filter(it => it.present)
                    if (utils.isEmpty(elementTypes)) throw new Error(`${element.Display} has no type`)
                    for (const type of elementTypes) {
                        if (names.has(type.name)) throw new Error(`${type.Display} is ambiguous`)
                        names.add(type.name)
                    }
                }
            }
        }

        // Ensure that every component has at maximum one hosting relation
        if (this.graph.options.checks.ambiguousHosting) {
            for (const node of nodes) {
                const hostings = node.outgoing.filter(it => it.isHostedOn()).filter(it => it.present)
                if (hostings.length > 1) throw new Error(`${node.Display} has more than one hosting relations`)
            }
        }

        // Ensure that every component that had a hosting relation previously still has one
        if (this.graph.options.checks.expectedHosting) {
            for (const node of nodes) {
                const hosting = node.outgoing.filter(
                    relation => relation.source.name === node.name && relation.isHostedOn()
                )

                if (hosting.length !== 0 && !hosting.some(it => it.present))
                    throw new Error(`${node.Display} expected to have a hosting relation`)
            }
        }

        // Ensure that every component that had an incoming relation previously still has one
        if (this.graph.options.checks.expectedIncomingRelation) {
            for (const node of nodes) {
                if (node.ingoing.length !== 0 && !node.ingoing.some(it => it.present))
                    throw new Error(`${node.Display} expected to have an incoming relation`)
            }
        }

        // Ensure that every component that had a deployment artifact previously still has one
        if (this.graph.options.checks.expectedArtifact) {
            for (const node of nodes) {
                if (node.artifacts.length !== 0 && !node.artifacts.some(it => it.present))
                    throw new Error(`${node.Display} expected to have an deployment artifact`)
            }
        }

        // Ensure that every component that had a technology previously still has one
        if (this.graph.options.checks.expectedTechnology) {
            for (const node of nodes) {
                if (node.technologies.length !== 0 && !node.technologies.some(it => it.present))
                    throw new Error(`${node.Display} expected to have a technology`)
            }
        }

        // Ensure that container of each technology exists
        if (this.graph.options.checks.missingTechnologyContainer) {
            for (const technology of technologies) {
                if (!technology.container.present) throw new Error(`Container of ${technology.display} does not exist`)
            }
        }

        // Ensure that every component has at maximum technology
        if (this.graph.options.checks.ambiguousTechnology) {
            for (const node of nodes) {
                if (node.technologies.filter(it => it.present).length > 1)
                    throw new Error(`${node.Display} has more than one technology`)
            }
        }

        // Ensure that inputs are unique per name
        if (this.graph.options.checks.ambiguousInput) {
            const names = new Set()
            for (const input of inputs) {
                if (names.has(input.name)) throw new Error(`${input.Display} is ambiguous`)
                names.add(input.name)
            }
        }

        // Ensure that inputs are consumed
        if (this.graph.options.checks.unproducedOutput) {
            for (const input of inputs) {
                if (input.consumers.every(it => !it.present)) throw new Error(`${input.Display} is not consumed`)
            }
        }

        // Ensure that outputs are unique per name
        if (this.graph.options.checks.ambiguousOutput) {
            const names = new Set()
            for (const output of outputs) {
                if (names.has(output.name)) throw new Error(`${output.Display} is ambiguous`)
                names.add(output.name)
            }
        }

        // Ensure that outputs are produced
        if (this.graph.options.checks.unproducedOutput) {
            for (const output of outputs) {
                if (output.producers.some(it => !it.present)) throw new Error(`${output.Display} is not produced`)
            }
        }

        // Ensure that relations are unique per name
        if (this.graph.options.checks.ambiguousRelation) {
            for (const node of nodes) {
                const names = new Set()
                for (const relation of node.outgoing.filter(it => it.present)) {
                    if (names.has(relation.name)) throw new Error(`${relation.Display} is ambiguous`)
                    names.add(relation.name)
                }
            }
        }
    }
}
