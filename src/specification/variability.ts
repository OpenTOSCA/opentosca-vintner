import {InputAssignmentMap, InputDefinitionMap} from './topology-template'

export type VariabilityDefinition = {
    inputs: InputDefinitionMap
    presets?: InputAssignmentPresetMap
    expressions?: VariabilityExpressionMap
}

export type InputAssignmentPresetMap = {[key: string]: InputAssignmentPreset}
export type InputAssignmentPreset = {
    name?: string
    description?: string
    inputs: InputAssignmentMap
}

export type VariabilityExpressionMap = {[key: string]: VariabilityExpression}

/**
 * Inspired by
 * - https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_WORKFLOW_COND_CLAUSE_DEFN
 * - https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_CONSTRAINTS_OPERATORS
 * - https://www.sciencedirect.com/topics/computer-science/arithmetic-operator
 */
export type VariabilityExpression =
    | {
          // Boolean operators
          and?: VariabilityExpression[]
          or?: VariabilityExpression[]
          not?: VariabilityExpression
          xor?: VariabilityExpression[]
          implies?: [VariabilityExpression, VariabilityExpression]

          // Arithmetic operators
          add?: VariabilityExpression[]
          sub?: VariabilityExpression[]
          mul?: VariabilityExpression[]
          div?: VariabilityExpression[]
          mod?: [VariabilityExpression, VariabilityExpression]

          // Intrinsic functions
          get_variability_expression?: VariabilityExpression
          get_variability_input?: VariabilityExpression
          get_variability_condition?: VariabilityExpression
          get_element_presence?: VariabilityExpression | [VariabilityExpression, VariabilityExpression]
          get_source_presence?: 'SELF'
          get_target_presence?: 'SELF'
          has_present_targets?: VariabilityExpression
          concat?: VariabilityExpression[]
          join?: [VariabilityExpression[], string]
          token?: [VariabilityExpression, string, number]

          // Comparison operators
          equal?: VariabilityExpression[]
          greater_than?: [VariabilityExpression, VariabilityExpression]
          greater_or_equal?: [VariabilityExpression, VariabilityExpression]
          less_than?: [VariabilityExpression, VariabilityExpression]
          less_or_equal?: [VariabilityExpression, VariabilityExpression]
          in_range?: [VariabilityExpression, [VariabilityExpression, VariabilityExpression]]
          valid_values?: [VariabilityExpression, VariabilityExpression[]]
          length?: [VariabilityExpression, VariabilityExpression]
          min_length?: [VariabilityExpression, VariabilityExpression]
          max_length?: [VariabilityExpression, VariabilityExpression]

          // Cache
          cached_result?: boolean | string | number
      }
    | string
    | number
    | boolean
