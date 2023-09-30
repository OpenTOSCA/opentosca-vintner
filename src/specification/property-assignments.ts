/**
 * Property Assignment
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_PROPERTY_VALUE_ASSIGNMENT}
 */

import {ValueExpression, VariabilityAlternative} from '#spec/variability'

export type PropertyAssignmentMap = {
    [key: string]: PropertyAssignmentValue
}
export type PropertyAssignmentValue =
    | string
    | number
    | boolean
    | PropertyAssignmentValue[]
    | {[key: string]: PropertyAssignmentValue}

export type PropertyAssignmentList = PropertyAssignmentListEntry[]
export type PropertyAssignmentListEntry = {
    [key: string]: ConditionalPropertyAssignmentValue
}

export type ConditionalPropertyAssignmentValue = {
    value?: PropertyAssignmentValue
    expression?: ValueExpression
} & VariabilityAlternative
