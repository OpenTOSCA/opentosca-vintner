/**
 * Group Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_GROUP_TYPE}
 */
import {EntityType} from '#spec/entity-type'

export enum TOSCA_GROUP_TYPES {
    VARIABILITY_GROUPS_ROOT = 'variability.groups.Root',
    VARIABILITY_GROUPS_CONDITIONAL_MEMBERS = 'variability.groups.ConditionalMembers',
}

export const GROUP_TYPE_ROOT = 'tosca.groups.Root'

export type GroupType = EntityType & {members?: GroupMember[]}

export type GroupMember = string | [string, string] | [string, number]

export type GroupTypeMap = {[key: string]: GroupType}
