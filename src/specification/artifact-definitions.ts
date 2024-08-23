/**
 * Artifact Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_ARTIFACT_DEF}
 */
import {PropertyAssignmentList, PropertyAssignmentMap} from '#spec/property-assignments'
import {ArtifactDefaultConditionMode, VariabilityAlternative} from '#spec/variability'

export const ARTIFACT_DEFINITION_DEFAULT_TYPE = 'tosca.artifacts.File'

export type ArtifactDefinition = string | ExtendedArtifactDefinition

export type ExtendedArtifactDefinition = {
    type: string
    file: string
    properties?: PropertyAssignmentMap | PropertyAssignmentList
    default_condition_mode?: ArtifactDefaultConditionMode
} & VariabilityAlternative

export type ArtifactDefinitionMap = {[key: string]: ArtifactDefinition}

export type ArtifactDefinitionList = ArtifactDefinitionMap[]
