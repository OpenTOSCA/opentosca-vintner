import {VariabilityExpression} from './variability'

/**
 * Policy Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_POLICY_DEF}
 */

export type PolicyTemplate = {
    type: string
    conditions?: VariabilityExpression | VariabilityExpression[]
    targets?: string[]
}

export type PolicyTemplateList = PolicyAssignmentMap[]
export type PolicyAssignmentMap = {[name: string]: PolicyTemplate}
