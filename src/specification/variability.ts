import {InputAssignmentMap, InputAssignmentValue, InputDefinitionMap} from './topology-template'
import {ConditionalElement} from '#/resolver/graph'

export type VariabilityDefinition = {
    inputs: InputDefinitionMap
    presets?: InputAssignmentPresetMap
    expressions?: VariabilityExpressionMap
    options?: VariabilityResolvingOptions
}

export type VariabilityResolvingOptions = {
    strict?: boolean
} & DefaultOptions &
    PruningOptions &
    ConsistencyOptions &
    SolverOptions

export type SolverOptions = {
    optimization?: true | false | 'min' | 'max'
}

export type DefaultOptions = {
    default_condition?: boolean
    node_default_condition?: boolean
    relation_default_condition?: boolean
    policy_default_condition?: boolean
    group_default_condition?: boolean
    artifact_default_condition?: boolean
    property_default_condition?: boolean
}

export type PruningOptions = {
    pruning?: boolean
    node_pruning?: boolean
    relation_pruning?: boolean
    policy_pruning?: boolean
    group_pruning?: boolean
    artifact_pruning?: boolean
    property_pruning?: boolean
}

export type ConsistencyOptions = {
    consistency_checks?: boolean
    relation_source_consistency_check?: boolean
    relation_target_consistency_check?: boolean
    ambiguous_hosting_consistency_check?: boolean
    expected_hosting_consistency_check?: boolean
    missing_artifact_parent_consistency_check?: boolean
    ambiguous_artifact_consistency_check?: boolean
    missing_property_parent_consistency_check?: boolean
    ambiguous_property_consistency_check?: boolean
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
    default_condition?: boolean
    pruning?: boolean
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
          node_presence?: string
          host_presence?: string
          is_target?: string

          // Relation functions
          relation_presence?: [string, string | number]
          source_presence?: 'SELF'
          target_presence?: 'SELF'

          // Property functions
          property_presence?: [string, string | number]

          // Artifact functions
          artifact_presence?: [string, string | number]

          // Policy functions
          policy_presence?: string | number
          has_present_target?: string | number

          // Group functions
          group_presence?: string
          has_present_member?: string

          // Input functions
          input_presence?: string

          // Intrinsic functions
          logic_expression?: string
          variability_input?: string

          // Cache
          _cached_element?: ConditionalElement
          _visited?: boolean
          _id?: string
      }
    | string
    | boolean

export type ValueExpression =
    | InputAssignmentValue
    | {
          // Arithmetic operators
          add?: ValueExpression[]
          sub?: ValueExpression[]
          mul?: ValueExpression[]
          div?: ValueExpression[]
          mod?: [ValueExpression, ValueExpression]

          // Intrinsic functions
          value_expression?: string
          variability_input?: string
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
