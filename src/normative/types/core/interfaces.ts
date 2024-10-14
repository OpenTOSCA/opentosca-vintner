import {MetadataNormative} from '#normative/types/utils'
import {InterfaceTypeMap} from '#spec/interface-type'

const interfaces: InterfaceTypeMap = {
    interface: {
        derived_from: 'tosca.interfaces.Root',
        description:
            'The "interface" interface type defines the root interface type all other interface types inherit from.',
        metadata: {
            ...MetadataNormative(),
        },
    },
    management: {
        derived_from: 'interface',
        description: 'The "management" interface type defines the standard lifecycle management of components.',
        metadata: {
            ...MetadataNormative(),
        },
        operations: {
            create: {
                description: 'create lifecycle management operation, i.e., an inline-bash script',
            },
            configure: {
                description: 'configure lifecycle management operation, i.e., an inline-bash script',
            },
            start: {
                description: 'start lifecycle management operation, i.e., an inline-bash script',
            },
            stop: {
                description: 'stop lifecycle management operation, i.e., an inline-bash script',
            },
            delete: {
                description: 'delete lifecycle management operation, i.e., an inline-bash script',
            },
        },
    },
}

export default interfaces
