import {MetadataNormative} from '#normative/types/utils'
import {ArtifactTypeMap} from '#spec/artifact-type'

const artifacts: ArtifactTypeMap = {
    artifact: {
        derived_from: 'tosca.artifacts.Root',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'source.archive': {
        derived_from: 'artifact',
        description: 'application packaged as archive',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            extra_opts: {
                type: 'list',
                entry_schema: {
                    type: 'string',
                },
                required: false,
            },
        },
    },
    'system.package': {
        derived_from: 'artifact',
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
    'container.image': {
        derived_from: 'artifact',
        description: 'expects image reference in "file"',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'machine.image': {
        derived_from: 'artifact',
        description: 'expects image reference in "file"',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'dbms.image': {
        derived_from: 'artifact',
        description: 'expects image reference in "file"',
        metadata: {
            ...MetadataNormative(),
        },
    },
}

export default artifacts
