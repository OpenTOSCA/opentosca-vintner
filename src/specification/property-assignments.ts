/**
 * Property Assignment
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_PROPERTY_VALUE_ASSIGNMENT}
 */

import {VariabilityAlternative, VariabilityExpression} from '#spec/variability'

export type PropertyAssignmentMap = {
    [key: string]: PropertyAssignmentValue
}
export type PropertyAssignmentValue = string | number | boolean

/** TODO: Allow complex data types as property value
 | PropertyAssignmentValue[]
 | {[key: string]: PropertyAssignmentValue}
 **/

export type PropertyAssignmentList = {
    [key: string]:
        | PropertyAssignmentValue
        | ({
              value: PropertyAssignmentValue
          } & VariabilityAlternative)
}[]
