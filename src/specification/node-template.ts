/**
 * Node Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_NODE_TEMPLATE}
 */
import {VariabilityExpression} from './variability'
import {RelationshipTemplate} from './relationship-template'
import {InterfaceDefinition} from './interface-definition'

export type NodeTemplate = {
    type: string
    properties?: PropertyAssignmentMap
    attributes?: {[key: string]: string}
    requirements?: RequirementAssignmentList
    capabilities?: CapabilityAssignmentMap
    conditions?: VariabilityExpression | VariabilityExpression[]
}

export type NodeTemplateMap = {[key: string]: NodeTemplate}

export type PropertyAssignmentMap = {[key: string]: PropertyAssignment}
export type PropertyAssignment = string

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

export type NodeFilter = {}
