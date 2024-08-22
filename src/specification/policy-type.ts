/**
 * Data Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_DATA_TYPE}
 */
import {EntityType} from '#spec/entity-type'

export const POLICY_TYPE_ROOT = 'tosca.policies.Root'

export type PolicyType = EntityType

export type PolicyTypeMap = {[key: string]: PolicyType}
