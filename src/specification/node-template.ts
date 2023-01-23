/**
 * Node Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_NODE_TEMPLATE}
 */
import {VariabilityExpression} from './variability'
import {RelationshipTemplate} from './relationship-template'
import {ArtifactDefinitionList, ArtifactDefinitionMap} from '#spec/artifact-definitions'

export type NodeTemplate = {
    type: string
    properties?: PropertyAssignmentMap
    attributes?: AttributeAssignmentMap
    requirements?: RequirementAssignmentList
    capabilities?: CapabilityAssignmentMap
    conditions?: VariabilityExpression | VariabilityExpression[]
    artifacts?: ArtifactDefinitionMap | ArtifactDefinitionList
}

export type NodeTemplateMap = {[key: string]: NodeTemplate}

export type PropertyAssignmentMap = {
    [key: string]: PropertyAssignmentValue | PropertyAssignmentConditional | PropertyAssignmentConditional[]
}
export type PropertyAssignmentValue = string
export type PropertyAssignmentConditional = {
    value: PropertyAssignmentValue
    conditions?: VariabilityExpression | VariabilityExpression[]
}

export type AttributeAssignmentMap = {[key: string]: AttributeAssignment}
export type AttributeAssignment = string

export type RequirementAssignmentList = RequirementAssignmentMap[]
export type RequirementAssignmentMap = {[key: string]: RequirementAssignment}
export type RequirementAssignment =
    | string
    | {
          node: string
          conditions?: VariabilityExpression | VariabilityExpression[]
          relationship?: string | RelationshipTemplate
      }

export type CapabilityAssignmentMap = {[key: string]: string}
