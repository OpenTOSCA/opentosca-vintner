import {MetadataNormative} from '#normative/types/utils'
import {ArtifactTypeMap} from '#spec/artifact-type'

const artifacts: ArtifactTypeMap = {
    artifact: {
        derived_from: 'tosca.artifacts.Root',
        description: 'The "root" artifact type describes the root artifact type all other artifact types inherit from.',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'source.archive': {
        derived_from: 'artifact',
        description:
            'The "source.archive" artifact type defines a generic archive that holds distribution files of a component.',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            extra_opts: {
                type: 'list',
                description: 'extra options when extracting the archive',
                entry_schema: {
                    type: 'string',
                },
                required: false,
            },
        },
    },
    'system.package': {
        derived_from: 'artifact',
        description:
            'The "system.package" artifact type defines a package that is installed via a system package manager.',
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
        description:
            'The "container.image" artifact type defines a generic container image. It expects the image reference in the "file" key.',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'machine.image': {
        derived_from: 'artifact',
        description:
            'The "machine.image" artifact type defines a generic machine image. It expects the image reference in the "file" key.',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'dbms.image': {
        derived_from: 'artifact',
        description:
            'The "dbms.image" artifact type defines a generic DBMS image. It expects the image reference in the "file" key.',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'cache.image': {
        derived_from: 'artifact',
        description:
            'The "cache.image" artifact type defines a generic cache image. It expects the image reference in the "file" key.',
        metadata: {
            ...MetadataNormative(),
        },
    },
}

export default artifacts
