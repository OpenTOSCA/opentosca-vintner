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
    conditions?: LogicExpression | LogicExpression[]
    default_alternative?: boolean
}

export type LogicExpression =
    | {
          // Boolean operators
          and?: LogicExpression[]
          or?: LogicExpression[]
          not?: LogicExpression
          xor?: LogicExpression[]
          implies?: [LogicExpression, LogicExpression]

          // Node functions
          get_node_presence?: string

          // Relation functions
          get_relation_presence?: [string, string | number]
          get_source_presence?: 'SELF'
          get_target_presence?: 'SELF'

          // Property functions
          get_property_presence?: [string, string | number]

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
          get_logic_expression?: string
          get_variability_input?: string

          // Cache
          _cached_element?: ConditionalElement
          _visited?: boolean
          _id?: string
      }
    | string
    | boolean

export type ValueExpression = ComplexValueExpression | InputAssignmentValue

export type ComplexValueExpression = {
    // Arithmetic operators
    add?: ValueExpression[]
    sub?: ValueExpression[]
    mul?: ValueExpression[]
    div?: ValueExpression[]
    mod?: [ValueExpression, ValueExpression]

    // Intrinsic functions
    get_value_expression?: string
    get_variability_input?: string
    concat?: ValueExpression[]
    join?: [ValueExpression[], string]
    token?: [ValueExpression, string, number]

    // Comparison operators
    equal?: ValueExpression[]
    greater?: [ValueExpression, ValueExpression]
    greater_or_equal?: [ValueExpression, ValueExpression]
    less?: [ValueExpression, ValueExpression]
    less_or_equal?: [ValueExpression, ValueExpression]
    in_range?: [ValueExpression, [ValueExpression, ValueExpression]]
    valid_values?: [ValueExpression, ValueExpression[]]
    length?: [ValueExpression, ValueExpression]
    min_length?: [ValueExpression, ValueExpression]
    max_length?: [ValueExpression, ValueExpression]

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
    same?: [string | number, string | number]
    before?: [string | number, string | number]
    before_or_same?: [string | number, string | number]
    after?: [string | number, string | number]
    after_or_same?: [string | number, string | number]
    within?: [string | number, [string | number, string | number]]

    // Cache
    _cached_result?: InputAssignmentValue
}

export type VariabilityExpression = LogicExpression | ValueExpression

// TODO: update benchmark docs
