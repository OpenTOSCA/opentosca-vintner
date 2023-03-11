import {InputAssignmentMap, InputAssignmentValue, InputDefinitionMap} from './topology-template'
import {ConditionalElement} from '#/resolver/graph'

export type VariabilityDefinition = {
    inputs: InputDefinitionMap
    presets?: InputAssignmentPresetMap
    expressions?: VariabilityExpressionMap
    options?: VariabilityResolvingOptions
}

export type VariabilityResolvingOptions = {
    enable_relation_default_condition?: boolean
    enable_policy_default_condition?: boolean
    enable_group_default_condition?: boolean
    enable_artifact_default_condition?: boolean
    enable_property_default_condition?: boolean
} & {
    enable_relation_pruning?: boolean
    enable_policy_pruning?: boolean
    enable_group_pruning?: boolean
    enable_artifact_pruning?: boolean
    enable_property_pruning?: boolean
} & ConsistencyOptions

export type ConsistencyOptions = {
    disable_consistency_checks?: boolean
    disable_relation_source_consistency_check?: boolean
    disable_relation_target_consistency_check?: boolean
    disable_ambiguous_hosting_consistency_check?: boolean
    disable_expected_hosting_consistency_check?: boolean
    disable_missing_artifact_parent_consistency_check?: boolean
    disable_ambiguous_artifact_consistency_check?: boolean
    disable_missing_property_parent_consistency_check?: boolean
    disable_ambiguous_property_consistency_check?: boolean
}

export type InputAssignmentPresetMap = {[key: string]: InputAssignmentPreset}
export type InputAssignmentPreset = {
    name?: string
    description?: string
    inputs: InputAssignmentMap
}

export type VariabilityExpressionMap = {[key: string]: VariabilityExpression}

export type VariabilityPointMap<T> =
    | {[name: string]: T}
    | {
          [name: string]: T
      }[]

export type VariabilityPointList<T> = {[name: string]: T}[]

export type VariabilityAlternative = {
    conditions?: VariabilityExpression | VariabilityExpression[]
    default_alternative?: boolean
}

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

          // Variability functions
          get_variability_expression?: string
          get_variability_input?: string
          get_variability_condition?: string

          // Node functions
          get_node_presence?: string

          // Relation functions
          get_relation_presence?: [string, string | number]
          get_source_presence?: 'SELF'
          get_target_presence?: 'SELF'

          // Property functions
          get_property_presence?: [string, string | number]
          // TODO: implement
          // TODO: document
          // TODO: write tests
          get_property_value?: [string, string | number]

          // Artifact functions
          get_artifact_presence?: [string, string | number]

          // Policy functions
          get_policy_presence?: string | number
          has_present_targets?: string | number

          // Group functions
          get_group_presence?: string
          has_present_members?: string

          // Input functions
          get_input_presence?: string

          // Intrinsic functions
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

          // Analytical operators
          sum?: number[]
          count?: number[]
          min?: number[]
          max?: number[]
          mean?: number[]
          median?: number[]
          variance?: number[]
          standard_deviation?: number[]
          linear_regression?: [[number, number][], number]
          polynomial_regression?: [[number, number][], number, number]
          logarithmic_regression?: [[number, number][], number]
          exponential_regression?: [[number, number][], number]

          // Date operators
          weekday?: []

          // Cache
          _cached_result?: InputAssignmentValue
          _cached_element?: ConditionalElement
      }
    | InputAssignmentValue
