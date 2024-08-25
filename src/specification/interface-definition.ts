/**
 * Interface Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_INTERFACE_DEF}
 */
import {OperationDefinitionMap} from '#spec/operation-definitions'

export type InterfaceDefinition = {
    type?: string
    operations?: OperationDefinitionMap
    inputs?: {[key: string]: any}
}

export type InterfaceDefinitionMap = {[key: string]: InterfaceDefinition}

export const MANAGEMENT_INTERFACE = 'management'

export enum MANAGEMENT_OPERATIONS {
    CREATE = 'create',
    CONFIGURE = 'configure',
    START = 'start',
    STOP = 'stop',
    DELETE = 'delete',
}
