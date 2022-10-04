/**
 * Topology Template Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc26969450}
 */
import {NodeTemplateMap} from './node-template'
import {VariabilityDefinition, VariabilityExpression} from './variability'
import {GroupTemplateMap} from './group-template'
import {RelationshipTemplateMap} from './relationship-template'
import {PolicyTemplateList} from './policy-template'

export type TopologyTemplate = {
    description?: string
    inputs?: InputDefinitionMap
    node_templates?: NodeTemplateMap
    relationship_templates?: RelationshipTemplateMap
    variability?: VariabilityDefinition
    groups?: GroupTemplateMap
    policies?: PolicyTemplateList
}

export type InputDefinitionMap = {[key: string]: InputDefinition}
export type InputDefinition = {
    type: string
    description?: string
    required?: boolean
    conditions?: VariabilityExpression | VariabilityExpression[]
}
export type InputAssignmentMap = {[key: string]: string | boolean | number}
