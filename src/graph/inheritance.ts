import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import {ARTIFACT_DEFINITION_DEFAULT_TYPE} from '#spec/artifact-definitions'
import {ARTIFACT_TYPE_ROOT, ArtifactType} from '#spec/artifact-type'
import {CAPABILITY_TYPE_ROOT, CapabilityType} from '#spec/capability-type'
import {DATA_TYPE_ROOT, DataType} from '#spec/data-type'
import {ENTITY_TYPE_ROOT, EntityType} from '#spec/entity-type'
import {GROUP_TYPE_ROOT, GroupType} from '#spec/group-type'
import {INTERFACE_TYPE_ROOT, InterfaceType} from '#spec/interface-type'
import {NODE_TYPE_ROOT, NodeType} from '#spec/node-type'
import {POLICY_TYPE_ROOT, PolicyType} from '#spec/policy-type'
import {RELATIONSHIP_TYPE_ROOT, RelationshipType} from '#spec/relationship-type'
import {EntityTypes} from '#spec/service-template'

/**
 * Note, there is a difference between an {@link EntityType} and {@link Type}, which represents the assigment of an entity type to an element.
 */
export default class Inheritance {
    private readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    hasArtifactDefinition(node: string, artifact: string) {
        const walker = this.Walker<NodeType>(node, 'node_types', NODE_TYPE_ROOT)

        while (walker.has()) {
            const next = walker.walk()

            for (const [artifactName, artifactDefinition] of Object.entries(next.type.artifacts ?? {})) {
                if (
                    this.isArtifactType(
                        check.isString(artifactDefinition) ? ARTIFACT_DEFINITION_DEFAULT_TYPE : artifactDefinition.type,
                        artifact
                    )
                ) {
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

    isArtifactType(is: string, question: string) {
        return this.isType(is, question, 'artifact_types', ARTIFACT_TYPE_ROOT)
    }

    getArtifactType(name: string): ArtifactType | undefined {
        return this.getTypes<ArtifactType>('artifact_types')[name]
    }

    isCapabilityType(is: string, question: string) {
        return this.isType(is, question, 'capability_types', CAPABILITY_TYPE_ROOT)
    }

    getCapabilityType(name: string): CapabilityType | undefined {
        return this.getTypes<CapabilityType>('capability_types')[name]
    }

    isDataType(is: string, question: string) {
        return this.isType(is, question, 'data_types', DATA_TYPE_ROOT)
    }

    getDataType(name: string): DataType | undefined {
        return this.getTypes<DataType>('data_types')[name]
    }

    isGroupType(is: string, question: string) {
        return this.isType(is, question, 'group_types', GROUP_TYPE_ROOT)
    }

    getGroupType(name: string): GroupType | undefined {
        return this.getTypes<GroupType>('group_types')[name]
    }

    isInterfaceType(is: string, question: string) {
        return this.isType(is, question, 'interface_types', INTERFACE_TYPE_ROOT)
    }

    getInterfaceType(name: string): InterfaceType | undefined {
        return this.getTypes<InterfaceType>('interface_types')[name]
    }

    isNodeType(is: string, question: string) {
        return this.isType(is, question, 'node_types', NODE_TYPE_ROOT)
    }

    getNodeType(name: string): NodeType | undefined {
        return this.getTypes<NodeType>('node_types')[name]
    }

    isPolicyType(is: string, question: string) {
        return this.isType(is, question, 'policy_types', POLICY_TYPE_ROOT)
    }

    getPolicyType(name: string): PolicyType | undefined {
        return this.getTypes<PolicyType>('policy_types')[name]
    }

    isRelationshipType(is: string, question: string) {
        return this.isType(is, question, 'relationship_types', RELATIONSHIP_TYPE_ROOT)
    }

    getRelationshipType(name: string): RelationshipType | undefined {
        return this.getTypes<RelationshipType>('relationship_types')[name]
    }

    private getTypes<T extends EntityType>(key: keyof EntityTypes) {
        return (this.graph.serviceTemplate[key] ?? {}) as {[key: string]: T}
    }

    private getType<T extends EntityType>(name: string, key: keyof EntityTypes) {
        return this.getTypes<T>(key)[name]
    }

    private isType(is: string, question: string, key: keyof EntityTypes, fallback: string) {
        const walker = this.Walker(is, key, fallback)
        while (walker.has()) {
            const next = walker.walk()
            if (next.name === question) return true
        }
        return false
    }

    private Walker<T extends EntityType>(start: string, key: keyof EntityTypes, fallback: string) {
        const types = Object.entries(this.getTypes<T>(key)).map(([name, type]) => ({
            name,
            type: type as T,
        }))

        let current: {name: string; type: T} | undefined

        const has = () => {
            if (check.isDefined(current) && current.type.derived_from === ENTITY_TYPE_ROOT) return false
            const next = peek()
            return check.isDefined(next)
        }

        const peek = () => {
            if (check.isUndefined(current)) return types.find(it => it.name === start)
            if (check.isUndefined(current.type.derived_from)) return types.find(it => it.name === fallback)
            return types.find(it => it.name === current!.type.derived_from)
        }

        const walk = () => {
            const next = peek()
            assert.isDefined(
                next,
                `${key} "${check.isDefined(current) ? current.type.derived_from : start}" has no definition`
            )
            current = next
            return next
        }

        return {
            peek,
            has,
            walk,
        }
    }
}
