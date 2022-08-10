/**
 * Topology Template Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc26969450}
 */
import {NodeTemplate} from './node-template'
import {VariabilityDefinition} from './variability'
import {GroupTemplateMap} from './group-template'
import {RelationshipTemplate} from './relationship-template'

export type TopologyTemplate = {
    description?: string
    inputs?: InputDefinitionMap
    node_templates?: {[key: string]: NodeTemplate}
    relationship_templates?: {[key: string]: RelationshipTemplate}
    variability?: VariabilityDefinition
    groups?: GroupTemplateMap
}

export type InputDefinitionMap = {[key: string]: InputDefinition}
export type InputDefinition = {
    type: string
    description?: string
    required?: boolean
}
export type InputAssignmentMap = {[key: string]: string | boolean | number}
