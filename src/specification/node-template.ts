/**
 * Node Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_NODE_TEMPLATE}
 */
import {
    NodeDefaultConditionMode,
    RelationDefaultConditionMode,
    VariabilityAlternative,
    VariabilityPointList,
    VariabilityPointMap,
} from './variability'
import {ArtifactDefinition} from '#spec/artifact-definitions'
import {PropertyAssignmentList, PropertyAssignmentMap} from '#spec/property-assignments'

export type NodeTemplate = {
    type: string
    // TODO: wrap properties as variability point
    properties?: PropertyAssignmentMap | PropertyAssignmentList
    attributes?: AttributeAssignmentMap
    requirements?: VariabilityPointList<RequirementAssignment>
    capabilities?: CapabilityAssignmentMap
    artifacts?: VariabilityPointMap<ArtifactDefinition>
    weight?: number | boolean
} & VariabilityAlternative & {
        default_condition_mode?: NodeDefaultConditionMode
    }

export type NodeTemplateMap = {[key: string]: NodeTemplate}

export type AttributeAssignmentMap = {[key: string]: AttributeAssignment}
export type AttributeAssignment = string

export type RequirementAssignmentList = RequirementAssignmentMap[]
export type RequirementAssignmentMap = {[key: string]: RequirementAssignment}
export type RequirementAssignment =
    | string
    | ({
          node: string
          relationship?: string
      } & VariabilityAlternative & {default_condition_mode?: RelationDefaultConditionMode})

export type CapabilityAssignmentMap = {[key: string]: string}
