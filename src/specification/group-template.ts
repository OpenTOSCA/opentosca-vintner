import {PropertyAssignmentMap} from './node-template'
import {VariabilityExpression} from './variability'
import {GroupMember, TOSCA_GROUP_TYPES} from './group-type'

/**
 * Group Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_GROUP_DEF}
 **/

export type GroupTemplate = {
    type: TOSCA_GROUP_TYPES
    members: GroupMember[]
    properties?: PropertyAssignmentMap
    conditions?: VariabilityExpression | VariabilityExpression[]
}

export type GroupTemplateMap = {[key: string]: GroupTemplate}
