/**
 * Artifact Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_ARTIFACT_TYPE}
 */

export const ARTIFACT_TYPE_ROOT = 'tosca.artifacts.Root'

export type ArtifactType = {
    derived_from?: string
    _loaded?: boolean
    _file?: string
}
