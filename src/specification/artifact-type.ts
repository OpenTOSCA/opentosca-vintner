/**
 * Artifact Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_ARTIFACT_TYPE}
 */
import {EntityType} from '#spec/entity-type'

export const ARTIFACT_TYPE_ROOT = 'tosca.artifacts.Root'

export type ArtifactType = EntityType

export type ArtifactTypeMap = {[key: string]: ArtifactType}
