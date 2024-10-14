import {MetadataNormative} from '#normative/types/utils'
import {ArtifactTypeMap} from '#spec/artifact-type'

const artifacts: ArtifactTypeMap = {
    'docker.image': {
        derived_from: 'container.image',
        description:
            'The "docker.image" artifact type describes a concrete Docker Image. It expects the Docker Image reference in the "file" key.',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'zip.archive': {
        derived_from: 'source.archive',
        description:
            'The "zip.archive" artifact type describes a ZIP archive, which contains the distribution files of a component.',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'tar.archive': {
        derived_from: 'source.archive',
        description:
            'The "tar.archive" artifact type describes a TAR archive, which contains the distribution files of a component',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'apt.package': {
        derived_from: 'system.package',
        description: 'The "apt.package" artifact type defines a package that is installed via the apt package manager.',
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
