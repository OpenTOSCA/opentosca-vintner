/**
 * Artifact Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_ARTIFACT_DEF}
 */
import {VariabilityAlternative} from '#spec/variability'

export type ArtifactDefinition =
    | string
    | ({
          type: string
      } & VariabilityAlternative)

export type ArtifactDefinitionMap = {[key: string]: ArtifactDefinition}

export type ArtifactDefinitionList = ArtifactDefinitionMap[]
