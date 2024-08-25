import {MetadataNormative} from '#normative/utils'
import {InterfaceTypeMap} from '#spec/interface-type'

const interfaces: InterfaceTypeMap = {
    interface: {
        derived_from: 'tosca.interfaces.Root',
        metadata: {
            ...MetadataNormative(),
        },
    },
    management: {
        derived_from: 'interface',
        metadata: {
            ...MetadataNormative(),
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
