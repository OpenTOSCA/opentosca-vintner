import {ArtifactTypeMap} from '#spec/artifact-type'

// TODO: unfurl does not support metadata at artifact types, https://github.com/onecommons/unfurl/issues/340

const artifacts: ArtifactTypeMap = {
    root: {
        derived_from: 'tosca.artifacts.Root',
        /*
        metadata: {
            vintner_normative: 'true',
        },
        */
    },
    'source.archive': {
        derived_from: 'root',
        description: 'application packaged as archive',
        /*
        metadata: {
            vintner_normative: 'true',
        },
        */
    },
    'system.package': {
        derived_from: 'root',
        /*
        metadata: {
            vintner_normative: 'true',
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
    'container.image': {
        derived_from: 'root',
        description: 'expects image reference in "file"',
        /*
        metadata: {
            vintner_normative: 'true',
        },
        */
    },
    'virtual.machine.image': {
        derived_from: 'root',
        description: 'expects image reference in "file"',
        /*
        metadata: {
            vintner_normative: 'true',
        },
            */
    },
}

export default artifacts
