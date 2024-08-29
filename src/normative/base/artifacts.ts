import {ArtifactTypeMap} from '#spec/artifact-type'

// TODO: unfurl does not support metadata at artifact types, https://github.com/onecommons/unfurl/issues/340

const artifacts: ArtifactTypeMap = {
    artifact: {
        derived_from: 'tosca.artifacts.Root',
        /*
        metadata: {
            ...MetadataNormative(),
        },
        */
    },
    'source.archive': {
        derived_from: 'artifact',
        description: 'application packaged as archive',
        /*
        metadata: {
            ...MetadataNormative(),
        },
        */
        properties: {
            extra_opts: {
                type: 'list',
                entry_schema: {
                    type: 'string',
                },
                default: [],
            },
        },
    },
    'system.package': {
        derived_from: 'artifact',
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
                default: '',
            },
            repository: {
                type: 'string',
                required: false,
                description: 'name of the repository (required if source is set)',
                default: '',
            },
            key: {
                type: 'string',
                required: false,
                description: 'URL of the apt key which signs the apt repository (required if source is set)',
                default: '',
            },
            source: {
                type: 'string',
                required: false,
                description: 'source of the repository',
                default: '',
            },
            dependencies: {
                type: 'string',
                required: false,
                description: 'Comma separated list of apt packages that are additionally installed',
                default: '',
            },
            env: {
                type: 'string',
                required: false,
                description: 'Space separated env variables',
                default: '',
            },
        },
    },
    'container.image': {
        derived_from: 'artifact',
        description: 'expects image reference in "file"',
        /*
        metadata: {
            ...MetadataNormative(),
        },
        */
    },
    'virtual.machine.image': {
        derived_from: 'artifact',
        description: 'expects image reference in "file"',
        /*
        metadata: {
            ...MetadataNormative(),
        },
        */
    },
}

export default artifacts
