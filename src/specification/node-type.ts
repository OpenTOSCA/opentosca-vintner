import {InterfaceDefinition} from './interface-definition'

/**
 * Node Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_NODE_TYPE}
 */

export const NODE_TYPE_ROOT = 'tosca.nodes.Root'

export type NodeType = {
    derived_from?: string
    metadata?: {[key: string]: string}
    properties?: {[key: string]: PropertyDefinition}
    attributes?: {[key: string]: AttributeDefinition}
    capabilities?: {[key: string]: CapabilityDefinition}
    requirements?: {[key: string]: RequirementDefinition}
    interfaces?: {[key: string]: InterfaceDefinition}
    _loaded?: boolean
}

export type PropertyDefinition = {
    type?: string
    default?: any
    metadata?: {[key: string]: string | boolean}
}

export type AttributeDefinition = {}
export type CapabilityDefinition = {}

export type RequirementDefinition = {
    capability: string
    occurrences?: [number, number]
}
