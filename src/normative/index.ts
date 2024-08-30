import * as check from '#check'
import unfurlBase from '#normative/dialects/unfurl/base'
import unfurlSpecific from '#normative/dialects/unfurl/specific'
import interfaces from '#normative/types/base/interfaces'
import artifacts from '#normative/types/specific/artifacts'
import nodes from '#normative/types/specific/nodes'
import {MetadataNormative} from '#normative/types/utils'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import * as _ from 'lodash'

/**
 * Normative Types
 *
 * See also https://github.com/UST-EDMM/edmm/blob/7f550a19155a702474f512e54ff2ddb148c003dd/docs/types.yml
 * and https://github.com/OpenTOSCA/opentosca-vintner/blob/838a5f3896aff309a0e89786fd2d7997503e1e17/docs/docs/sofdcar/tosca-simple-profile.yaml
 */

export function NormativeTypes(orchestrator?: string) {
    const baseFilename = 'base.yaml'
    const baseTemplate: ServiceTemplate = {
        tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
        description: 'OpenTOSCA Vintner - Normative Base Types',
        metadata: {
            ...MetadataNormative(),
        },
        artifact_types: artifacts,
        interface_types: interfaces,
        node_types: nodes,
    }

    const specificFilename = 'specific.yaml'
    const specificTemplate: ServiceTemplate = {
        tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
        description: 'OpenTOSCA Vintner - Normative Specific Types',
        metadata: {
            ...MetadataNormative(),
        },
        imports: [baseFilename],
        artifact_types: artifacts,
        node_types: nodes,
    }

    if (check.isDefined(orchestrator)) {
        const dialect = getDialect(orchestrator)
        _.merge(baseTemplate, dialect.base)
        _.merge(specificTemplate, dialect.specific)
    }

    return {
        base: {
            filename: baseFilename,
            template: baseTemplate,
        },
        specific: {
            filename: specificFilename,
            template: specificTemplate,
        },
    }
}

function getDialect(orchestrator: string) {
    switch (orchestrator) {
        case 'unfurl':
            return {base: unfurlBase, specific: unfurlSpecific}

        default:
            throw new Error(`Orchestrator "${orchestrator}" not supported. Currently we only support "unfurl".`)
    }
}
