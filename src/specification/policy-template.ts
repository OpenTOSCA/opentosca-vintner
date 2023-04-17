import {VariabilityAlternative} from './variability'
import {PropertyAssignmentList, PropertyAssignmentMap} from '#spec/property-assignments'
import {ElementType} from '#spec/type-assignment'

/**
 * Policy Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_POLICY_DEF}
 */

export type PolicyTemplate = {
    type: ElementType
    targets?: string[]
    properties?: PropertyAssignmentMap | PropertyAssignmentList
} & VariabilityAlternative

export type PolicyAssignmentMap = {[name: string]: PolicyTemplate}

export type PolicyTemplateList = PolicyAssignmentMap[]
