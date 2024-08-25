import {ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {CapabilityDefinitionMap} from '#spec/capability-definitions'
import {EntityType} from '#spec/entity-type'
import {InterfaceDefinitionMap} from './interface-definition'

/**
 * Node Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_NODE_TYPE}
 */

export const NODE_TYPE_ROOT = 'tosca.nodes.Root'

export type NodeTypeMap = {[key: string]: NodeType}

export type NodeType = EntityType & {
    properties?: PropertyDefinitionMap
    attributes?: AttributeDefinitionMap
    capabilities?: CapabilityDefinitionMap
    requirements?: RequirementDefinitionMap[]
    interfaces?: InterfaceDefinitionMap
    artifacts?: ArtifactDefinitionMap
}

export type PropertyDefinition = {
    type?: string
    default?: any
    metadata?: {[key: string]: string | boolean}
    required?: boolean
    description?: string
    entry_schema?: EntrySchema
}

export type EntrySchema = {
    type: string
    description?: string
}

export type PropertyDefinitionMap = {[key: string]: PropertyDefinition}

export type AttributeDefinition = {}

export type AttributeDefinitionMap = {[key: string]: AttributeDefinition}

export type RequirementDefinition = {
    capability: string
    relationship: string
    occurrences?: [number, number]
}

export type RequirementDefinitionMap = {[key: string]: RequirementDefinition}
