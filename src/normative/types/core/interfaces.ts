import {MetadataNormative} from '#normative/types/utils'
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
            create: {
                description: 'management lifecycle create operation.',
            },
            configure: {
                description: 'management lifecycle configure operation.',
            },
            start: {
                description: 'management lifecycle start operation.',
            },
            stop: {
                description: 'management lifecycle stop operation.',
            },
            delete: {
                description: 'management lifecycle delete operation.',
            },
        },
    },
}

export default interfaces
