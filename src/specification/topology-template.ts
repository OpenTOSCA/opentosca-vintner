/**
 * Topology Template Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc26969450}
 */
import {NodeTemplate} from './node-template'
import {VariabilityDefinition, VariabilityExpression, VariabilityPointList, VariabilityPointMap} from './variability'
import {GroupTemplate} from './group-template'
import {RelationshipTemplateMap} from './relationship-template'
import {PolicyTemplate} from './policy-template'

export type TopologyTemplate = {
    description?: string
    inputs?: InputDefinitionMap
    node_templates?: VariabilityPointMap<NodeTemplate>
    relationship_templates?: RelationshipTemplateMap
    variability?: VariabilityDefinition
    groups?: VariabilityPointMap<GroupTemplate>
    policies?: VariabilityPointList<PolicyTemplate>
}

export type InputDefinitionMap = {[key: string]: InputDefinition}
export type InputDefinition = {
    type: string
    description?: string
    required?: boolean
    conditions?: VariabilityExpression | VariabilityExpression[]
}
export type InputAssignmentMap = {[key: string]: string | boolean | number}
