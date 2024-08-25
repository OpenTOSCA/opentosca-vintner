/**
 * Data Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_DATA_TYPE}
 */
import {EntityType} from '#spec/entity-type'

export const DATA_TYPE_ROOT = 'tosca.datatypes.Root'

export type DataType = EntityType

export type DataTypeMap = {[key: string]: DataType}
