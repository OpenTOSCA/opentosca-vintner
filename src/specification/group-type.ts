/**
 * Group Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_GROUP_TYPE}
 */

export enum TOSCA_GROUP_TYPES {
    VARIABILITY_GROUPS_ROOT = 'variability.groups.Root',
    VARIABILITY_GROUPS_CONDITIONAL = 'variability.groups.Conditional',
}

export type GroupType = {}

export type GroupMember = string | [string, string] | [string, number]
