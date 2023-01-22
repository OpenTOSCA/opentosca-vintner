/**
 * Artifact Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_ARTIFACT_DEF}
 */
import {VariabilityExpression} from '#spec/variability'

export type ArtifactDefinition = {
    type: string
    conditions?: VariabilityExpression | VariabilityExpression[]
}

export type ArtifactDefinitionMap = {[key: string]: ArtifactDefinition}

export type ArtifactDefinitionList = ArtifactDefinitionMap[]
