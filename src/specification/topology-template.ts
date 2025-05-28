/**
 * Topology Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc26969450}
 */
import {SubstitutionMappings} from '#spec/substitution-mappings'
import {GroupTemplate} from './group-template'
import {NodeTemplate} from './node-template'
import {PolicyTemplate} from './policy-template'
import {RelationshipTemplateMap} from './relationship-template'
import {
    ValueExpression,
    VariabilityAlternative,
    VariabilityDefinition,
    VariabilityPointList,
    VariabilityPointObject,
} from './variability'

export type TopologyTemplate = {
    description?: string
    inputs?: VariabilityPointObject<InputDefinition>
    outputs?: VariabilityPointObject<OutputDefinition>
    node_templates?: VariabilityPointObject<NodeTemplate>
    relationship_templates?: RelationshipTemplateMap
    variability?: VariabilityDefinition
    groups?: VariabilityPointObject<GroupTemplate>
    policies?: VariabilityPointList<PolicyTemplate>
    substitution_mappings?: SubstitutionMappings
}

export type InputDefinitionMap = {[key: string]: InputDefinition}
export type InputDefinition = {
    type: string
    description?: string
    default?: InputAssignmentValue
    default_expression?: ValueExpression
} & VariabilityAlternative

export type InputAssignmentMap = {[key: string]: InputAssignmentValue}

// TODO: allow hash map and use PropertyAssignmentValue instead
export type InputAssignmentValue = string | number | boolean | InputAssignmentValue[]
// | {[key: string]: InputAssignmentValue}

export type OutputDefinitionMap = {[key: string]: OutputDefinition}
export type OutputDefinition = {
    value: any
} & VariabilityAlternative
