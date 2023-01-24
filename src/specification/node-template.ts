/**
 * Node Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_NODE_TEMPLATE}
 */
import {VariabilityExpression} from './variability'
import {ArtifactDefinitionList, ArtifactDefinitionMap} from '#spec/artifact-definitions'
import {PropertyAssignmentList, PropertyAssignmentMap} from '#spec/property-assignments'

export type NodeTemplate = {
    type: string
    properties?: PropertyAssignmentMap | PropertyAssignmentList
    attributes?: AttributeAssignmentMap
    requirements?: RequirementAssignmentList
    capabilities?: CapabilityAssignmentMap
    conditions?: VariabilityExpression | VariabilityExpression[]
    artifacts?: ArtifactDefinitionMap | ArtifactDefinitionList
}

export type NodeTemplateMap = {[key: string]: NodeTemplate}

export type AttributeAssignmentMap = {[key: string]: AttributeAssignment}
export type AttributeAssignment = string

export type RequirementAssignmentList = RequirementAssignmentMap[]
export type RequirementAssignmentMap = {[key: string]: RequirementAssignment}
export type RequirementAssignment =
    | string
    | {
          node: string
          conditions?: VariabilityExpression | VariabilityExpression[]
          relationship?: string
      }

export type CapabilityAssignmentMap = {[key: string]: string}
