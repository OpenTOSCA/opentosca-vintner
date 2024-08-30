import {ArtifactTypeMap} from '#spec/artifact-type'
import {RecursivePartial} from '#utils/types'

const artifacts: RecursivePartial<ArtifactTypeMap> = {
    'apt.package': {
        properties: {
            env: {
                default: '',
            },
        },
    },
}

export default artifacts
