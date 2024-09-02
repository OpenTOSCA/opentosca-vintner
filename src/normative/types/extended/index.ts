import {MetadataNormative} from '#normative/types/utils'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import artifacts from './artifacts'
import nodes from './nodes'

const template: ServiceTemplate = {
    tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
    description: 'TOSCA Profile for OpenTOSCA Vintner (Extended)',
    metadata: {
        ...MetadataNormative(),
        template_name: 'TOSCA Vintner Profile (Extended)',
        template_author: 'Miles Stötzner',
        template_contact: 'miles.stoetzner@iste.uni-stuttgart.de',
        template_link: 'https://vintner.opentosca.org',
        template_version: '1.0.0-draft',
        template_id: 'tosca-vintner-profile',
        template_license: 'https://www.apache.org/licenses/LICENSE-2.0',
        acknowledgments:
            'Partially funded by the [German Federal Ministry for Economic Affairs and Climate Action (BMWK)](https://www.bmwk.de) as part of the research project [SofDCar (19S21002)](https://sofdcar.de).',
    },
    imports: ['tosca-vintner-profile-core.yaml'],
    artifact_types: artifacts,
    node_types: nodes,
}

export default template
