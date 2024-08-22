import artifacts from '#normative/specific/artifacts'
import nodes from '#normative/specific/nodes'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'

const template: ServiceTemplate = {
    tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
    description: 'OpenTOSCA Vintner - Normative Specific Types (Unfurl)',
    metadata: {
        vintner_orchestrator: 'unfurl',
    },
    artifact_types: artifacts,
    node_types: nodes,
}

const NormativeSpecificTypes = {
    filename: 'specific.yaml',
    template,
}

export default NormativeSpecificTypes
