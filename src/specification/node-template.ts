/**
 * Node Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_NODE_TEMPLATE}
 */
import {ArtifactDefinition} from '#spec/artifact-definitions'
import {PropertyAssignmentList, PropertyAssignmentMap} from '#spec/property-assignments'
import {ElementType} from '#spec/type-assignment'
import {
    NodeDefaultConditionMode,
    RelationDefaultConditionMode,
    VariabilityAlternative,
    VariabilityPointList,
    VariabilityPointObject,
} from './variability'

export type NodeTemplate = {
    type: ElementType
    // TODO: wrap properties as variability point
    properties?: PropertyAssignmentMap | PropertyAssignmentList
    attributes?: AttributeAssignmentMap
    requirements?: VariabilityPointList<RequirementAssignment>
    capabilities?: CapabilityAssignmentMap
    artifacts?: VariabilityPointObject<ArtifactDefinition>
    weight?: number | boolean
    persistent?: boolean
    technology?: DeploymentTechnologyAssignment
} & VariabilityAlternative & {
        default_condition_mode?: NodeDefaultConditionMode
    }

export type NodeTemplateMap = {[key: string]: NodeTemplate}

export type AttributeAssignmentMap = {[key: string]: AttributeAssignment}
export type AttributeAssignment = string

export type RequirementAssignmentList = RequirementAssignmentMap[]
export type RequirementAssignmentMap = {[key: string]: RequirementAssignment}
export type RequirementAssignment = string | ExtendedRequirementAssignment

export type ExtendedRequirementAssignment = {
    node: string
    relationship?: string
} & VariabilityAlternative & {default_condition_mode?: RelationDefaultConditionMode}

export type CapabilityAssignmentMap = {[key: string]: string}

export type DeploymentTechnologyAssignment = boolean | string | VariabilityPointObject<DeploymentTechnologyTemplate>

export type DeploymentTechnologyTemplate = VariabilityAlternative
