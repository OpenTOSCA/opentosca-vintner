import {NORMATIVE_BASE_TYPES_FILENAME} from '#normative/base'
import artifacts from '#normative/specific/artifacts'
import nodes from '#normative/specific/nodes'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {MetadataUnfurl} from '../utils'

export const NORMATIVE_SPECIFIC_TYPES_FILENAME = 'specific.yaml'

export const NORMATIVE_SPECIFIC_TYPES: ServiceTemplate = {
    tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
    description: 'OpenTOSCA Vintner - Normative Specific Types (Unfurl)',
    metadata: {
        ...MetadataUnfurl(),
    },
    imports: [NORMATIVE_BASE_TYPES_FILENAME],
    artifact_types: artifacts,
    node_types: nodes,
}
