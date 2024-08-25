/**
 * Capability Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_CAPABILITY_DEFN}
 */
import {PropertyDefinitionMap} from '#spec/node-type'
import {PropertyAssignmentMap} from '#spec/property-assignments'

export type CapabilityDefinition = {
    type: string

    // In the standard this is only a PropertyDefinitionMap. However, we allow PropertyAssignmentMap for hacking Unfurl.
    properties?: PropertyDefinitionMap & PropertyAssignmentMap
}

export type CapabilityDefinitionMap = {[key: string]: CapabilityDefinition}
