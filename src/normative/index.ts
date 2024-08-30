import * as check from '#check'
import unfurlBase from '#normative/dialects/unfurl/base'
import unfurlSpecific from '#normative/dialects/unfurl/specific'
import normativeBase from '#normative/types/base'
import normativeSpecific from '#normative/types/specific'
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
    const base = utils.copy(normativeBase)
    const specific = utils.copy(normativeSpecific)

    if (check.isDefined(orchestrator)) {
        switch (orchestrator) {
            case 'unfurl':
                _.merge(base, unfurlBase)
                _.merge(specific, unfurlSpecific)

                // TODO: unfurl does not support metadata at artifact types, https://github.com/onecommons/unfurl/issues/340
                Object.values(base.artifact_types || {}).forEach(it => delete it.metadata)
                Object.values(specific.artifact_types || {}).forEach(it => delete it.metadata)
                break

            default:
                throw new Error(`Orchestrator "${orchestrator}" not supported. Currently we only support "unfurl".`)
        }
    }

    return {
        base: {
            filename: 'base.yaml',
            template: base,
        },
        specific: {
            filename: 'specific.yaml',
            template: specific,
        },
    }
}
