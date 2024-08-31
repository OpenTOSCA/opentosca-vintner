import {MetadataNormative} from '#normative/types/utils'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import artifacts from './artifacts'
import nodes from './nodes'

const template: ServiceTemplate = {
    tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
    description: 'OpenTOSCA Vintner - Normative Extended Types',
    metadata: {
        ...MetadataNormative(),
    },
    imports: ['tosca-vintner-profile-core.yaml'],
    artifact_types: artifacts,
    node_types: nodes,
}

export default template
