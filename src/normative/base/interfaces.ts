import {InterfaceTypeMap} from '#spec/interface-type'

const interfaces: InterfaceTypeMap = {
    root: {
        derived_from: 'tosca.interfaces.Root',
        metadata: {
            vintner_normative: 'true',
        },
    },
    management: {
        derived_from: 'root',
        metadata: {
            vintner_normative: 'true',
        },
        operations: {
            create: null,
            configure: null,
            start: null,
            stop: null,
            delete: null,
        },
    },
}

export default interfaces
