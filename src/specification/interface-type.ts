/**
 * Interface Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_INTERFACE_TYPE}
 */
import {EntityType} from '#spec/entity-type'
import {OperationDefinitionMap} from '#spec/operation-definitions'

export const INTERFACE_TYPE_ROOT = 'tosca.interfaces.Root'

export type InterfaceType = EntityType & {
    operations?: OperationDefinitionMap
}

export type InterfaceTypeMap = {[key: string]: InterfaceType}
