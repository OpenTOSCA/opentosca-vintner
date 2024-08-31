import {ArtifactTypeMap} from '#spec/artifact-type'
import {RecursivePartial} from '#utils/types'

const artifacts: RecursivePartial<ArtifactTypeMap> = {
    'source.archive': {
        properties: {
            extra_opts: {
                default: [],
            },
        },
    },
    'system.package': {
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
}

export default artifacts
