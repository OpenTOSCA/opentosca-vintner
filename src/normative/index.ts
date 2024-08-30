import * as check from '#check'
import * as utils from '#utils'
import * as _ from 'lodash'
import unfurlCore from 'src/normative/dialects/unfurl/core'
import unfurlExtended from 'src/normative/dialects/unfurl/extended'
import normativeCore from 'src/normative/types/core'
import normativeExtended from 'src/normative/types/extended'

/**
 * Normative Types
 *
 * Inspired by
 * - https://github.com/UST-EDMM/edmm/blob/7f550a19155a702474f512e54ff2ddb148c003dd/docs/types.yml
 * - https://github.com/OpenTOSCA/opentosca-vintner/blob/838a5f3896aff309a0e89786fd2d7997503e1e17/docs/docs/sofdcar/tosca-simple-profile.yaml
 */

export function NormativeTypes(orchestrator?: string) {
    const core = utils.copy(normativeCore)
    const extended = utils.copy(normativeExtended)

    if (check.isDefined(orchestrator)) {
        switch (orchestrator) {
            case 'unfurl':
                _.merge(core, utils.copy(unfurlCore))
                _.merge(extended, utils.copy(unfurlExtended))

                // TODO: unfurl does not support metadata at artifact types, https://github.com/onecommons/unfurl/issues/340
                Object.values(core.artifact_types ?? {}).forEach(it => delete it.metadata)
                Object.values(extended.artifact_types ?? {}).forEach(it => delete it.metadata)
                break

            default:
                throw new Error(`Orchestrator "${orchestrator}" not supported. Currently we only support "unfurl".`)
        }
    }

    return {
        core: {
            id: 'tosca-vintner-profile-core',
            yaml: 'tosca-vintner-profile-core.yaml',
            short: 'Core',
            name: 'TOSCA Vintner Core',
            template: core,
        },
        extended: {
            id: 'tosca-vintner-profile-extended',
            yaml: 'tosca-vintner-profile-extended.yaml',
            short: 'Extended',
            name: 'TOSCA Vintner Extended',
            template: extended,
        },
    }
}
