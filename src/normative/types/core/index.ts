import {MetadataNormative} from '#normative/types/utils'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import artifacts from './artifacts'
import interfaces from './interfaces'
import nodes from './nodes'

const template: ServiceTemplate = {
    tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
    description: 'OpenTOSCA Vintner - Normative Core Types',
    metadata: {
        ...MetadataNormative(),
    },
    artifact_types: artifacts,
    interface_types: interfaces,
    node_types: nodes,
}

export default template
