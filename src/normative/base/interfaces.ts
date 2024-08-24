import {InterfaceTypeMap} from '#spec/interface-type'

const interfaces: InterfaceTypeMap = {
    interface: {
        derived_from: 'tosca.interfaces.Root',
        metadata: {
            vintner_normative: 'true',
        },
    },
    management: {
        derived_from: 'interface',
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
