import {PropertyAssignmentList, PropertyAssignmentMap} from '#spec/property-assignments'
import {ElementType} from '#spec/type-assignment'
import {GroupMember, TOSCA_GROUP_TYPES} from './group-type'
import {VariabilityAlternative} from './variability'

/**
 * Group Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_GROUP_DEF}
 **/

export type GroupTemplate = {
    type: ElementType | TOSCA_GROUP_TYPES
    members: GroupMember[]
    properties?: PropertyAssignmentMap | PropertyAssignmentList
} & VariabilityAlternative

export type GroupTemplateMap = {[key: string]: GroupTemplate}
