import * as check from '#check'
import unfurlCore from '#normative/dialects/unfurl/core'
import unfurlExtended from '#normative/dialects/unfurl/extended'
import normativeCore from '#normative/types/core'
import normativeExtended from '#normative/types/extended'
import {MetadataNormative} from '#normative/types/utils'
import {TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import * as utils from '#utils'
import * as _ from 'lodash'

/**
 * Normative Types
 *
 * Inspired by
 * - https://github.com/UST-EDMM/edmm/blob/7f550a19155a702474f512e54ff2ddb148c003dd/docs/types.yml
 * - https://github.com/OpenTOSCA/opentosca-vintner/blob/838a5f3896aff309a0e89786fd2d7997503e1e17/docs/docs/sofdcar/tosca-simple-profile.yaml
 */

export function NormativeTypes(orchestrator?: string) {
    const coreTemplate = utils.copy(normativeCore)
    const extendedTemplate = utils.copy(normativeExtended)

    if (check.isDefined(orchestrator)) {
        switch (orchestrator) {
            case 'unfurl':
                _.merge(coreTemplate, utils.copy(unfurlCore))
                _.merge(extendedTemplate, utils.copy(unfurlExtended))

                // TODO: unfurl does not support metadata at artifact types, https://github.com/onecommons/unfurl/issues/340
                Object.values(coreTemplate.artifact_types ?? {}).forEach(it => delete it.metadata)
                Object.values(extendedTemplate.artifact_types ?? {}).forEach(it => delete it.metadata)
                break

            default:
                throw new Error(`Orchestrator "${orchestrator}" not supported. Currently we only support "unfurl".`)
        }
    }

    const core = {
        id: 'tosca-vintner-profile-core',
        yaml: 'tosca-vintner-profile-core.yaml',
        name: 'TOSCA Vintner Core',
        short: 'Core',
        template: coreTemplate,
    }

    const extended = {
        id: 'tosca-vintner-profile-extended',
        yaml: 'tosca-vintner-profile-extended.yaml',
        name: 'TOSCA Vintner Extended',
        short: 'Extended',
        template: extendedTemplate,
    }

    const profile = {
        id: 'tosca-vintner-profile',
        yaml: 'tosca-vintner-profile.yaml',
        name: 'TOSCA Vintner Profile',
        short: 'Profile',
        template: {
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
            description: 'TOSCA Profile for OpenTOSCA Vintner',
            metadata: {
                ...MetadataNormative(),
                template_name: 'TOSCA Vintner Profile',
                template_author: 'Miles Stötzner',
                template_contact: 'miles.stoetzner@iste.uni-stuttgart.de',
                template_link: 'https://vintner.opentosca.org',
                template_version: '1.0.0-draft',
                template_id: 'tosca-vintner-profile',
                template_license: 'https://www.apache.org/licenses/LICENSE-2.0',
                acknowledgments:
                    'Partially funded by the [German Federal Ministry for Economic Affairs and Climate Action (BMWK)](https://www.bmwk.de) as part of the research project [SofDCar (19S21002)](https://sofdcar.de).',
            },
            imports: [`./${core.yaml}`, `./${extended.yaml}`],
        },
    }

    return {core, extended, profile}
}
