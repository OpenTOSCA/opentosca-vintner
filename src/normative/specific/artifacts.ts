import {ArtifactTypeMap} from '#spec/artifact-type'

// TODO: unfurl does not support metadata at artifact types, https://github.com/onecommons/unfurl/issues/340

const artifacts: ArtifactTypeMap = {
    'docker.image': {
        derived_from: 'container.image',
        description: 'expects image reference in "file"',
        /*
        metadata: {
            ...MetadataNormative(),
        },
        */
    },
    'zip.archive': {
        derived_from: 'source.archive',
        /*
        metadata: {
            ...MetadataNormative(),
        },
        */
    },
    'apt.package': {
        derived_from: 'system.package',
        /*
        metadata: {
            ...MetadataNormative(),
        },
        */
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
                default: '',
                description: 'Space separated env variables',
            },
        },
    },
}

export default artifacts
