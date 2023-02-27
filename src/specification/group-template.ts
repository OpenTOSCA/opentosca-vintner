import {VariabilityAlternative, VariabilityExpression} from './variability'
import {GroupMember, TOSCA_GROUP_TYPES} from './group-type'
import {PropertyAssignmentList, PropertyAssignmentMap} from '#spec/property-assignments'

/**
 * Group Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_GROUP_DEF}
 **/

export type GroupTemplate = {
    type: TOSCA_GROUP_TYPES
    members: GroupMember[]
    properties?: PropertyAssignmentMap | PropertyAssignmentList
} & VariabilityAlternative

export type GroupTemplateMap = {[key: string]: GroupTemplate}
