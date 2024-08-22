import {ArtifactTypeMap} from '#spec/artifact-type'

const artifacts: ArtifactTypeMap = {
    'docker.image': {
        derived_from: 'root',
        description: 'expects image reference in "file"',
        metadata: {
            vintner_normative: 'true',
        },
    },
}

export default artifacts
