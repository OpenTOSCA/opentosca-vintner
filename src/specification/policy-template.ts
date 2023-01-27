import {VariabilityAlternative} from './variability'

/**
 * Policy Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_POLICY_DEF}
 */

export type PolicyTemplate = {
    type: string
    targets?: string[]
} & VariabilityAlternative

export type PolicyAssignmentMap = {[name: string]: PolicyTemplate}

export type PolicyTemplateList = PolicyAssignmentMap[]
