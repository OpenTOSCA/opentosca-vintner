import {ArtifactTypeMap} from '#spec/artifact-type'
import {RecursivePartial} from '#utils/types'

// TODO: unfurl does not support metadata at artifact types, https://github.com/onecommons/unfurl/issues/340

const artifacts: RecursivePartial<ArtifactTypeMap> = {
    artifact: {
        metadata: undefined,
    },
    'source.archive': {
        metadata: undefined,
    },
    'system.package': {
        metadata: undefined,
        properties: {
            script: {
                default: '',
            },
            repository: {
                default: '',
            },
            key: {
                default: '',
            },
            source: {
                default: '',
            },
            dependencies: {
                default: '',
            },
            env: {
                default: '',
            },
        },
    },
    'container.image': {
        metadata: undefined,
    },
    'virtual.machine.image': {
        metadata: undefined,
    },
}

export default artifacts
