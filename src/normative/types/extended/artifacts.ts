import {MetadataNormative} from '#normative/types/utils'
import {ArtifactTypeMap} from '#spec/artifact-type'

const artifacts: ArtifactTypeMap = {
    'docker.image': {
        derived_from: 'container.image',
        description: 'expects image reference in "file"',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'zip.archive': {
        derived_from: 'source.archive',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'tar.archive': {
        derived_from: 'source.archive',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'apt.package': {
        derived_from: 'system.package',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            script: {
                type: 'string',
                required: false,
                description: 'URL of an installation script',
            },
            repository: {
                type: 'string',
                required: false,
                description: 'name of the repository (required if source is set)',
            },
            key: {
                type: 'string',
                required: false,
                description: 'URL of the apt key which signs the apt repository (required if source is set)',
            },
            source: {
                type: 'string',
                required: false,
                description: 'source of the repository',
            },
            dependencies: {
                type: 'string',
                required: false,
                description: 'Comma separated list of apt packages that are additionally installed',
            },
            env: {
                type: 'string',
                required: false,
                description: 'Space separated env variables',
            },
        },
    },
}

export default artifacts
