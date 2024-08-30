import {ArtifactTypeMap} from '#spec/artifact-type'
import {RecursivePartial} from '#utils/types'

// TODO: unfurl does not support metadata at artifact types, https://github.com/onecommons/unfurl/issues/340

const artifacts: RecursivePartial<ArtifactTypeMap> = {
    'docker.image': {
        metadata: undefined,
    },
    'zip.archive': {
        metadata: undefined,
    },
    'tar.archive': {
        metadata: undefined,
    },
    'apt.package': {
        metadata: undefined,
        properties: {
            env: {
                default: '',
            },
        },
    },
}

export default artifacts
