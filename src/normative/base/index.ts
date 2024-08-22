import artifacts from '#/normative/base/artifacts'
import interfaces from '#/normative/base/interfaces'
import nodes from '#/normative/base/nodes'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'

/**
 * Normative Base Types
 *
 * See also https://github.com/UST-EDMM/edmm/blob/7f550a19155a702474f512e54ff2ddb148c003dd/docs/types.yml
 * and https://github.com/OpenTOSCA/opentosca-vintner/blob/838a5f3896aff309a0e89786fd2d7997503e1e17/docs/docs/sofdcar/tosca-simple-profile.yaml
 */

const template: ServiceTemplate = {
    tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
    description: 'OpenTOSCA Vintner - Normative Base Types (Unfurl)',
    metadata: {
        vintner_orchestrator: 'unfurl',
    },
    artifact_types: artifacts,
    interface_types: interfaces,
    node_types: nodes,
}

const NormativeBaseTypes = {
    filename: 'base.yaml',
    template,
}

export default NormativeBaseTypes
