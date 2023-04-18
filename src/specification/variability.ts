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
    optimization?: boolean | 'min' | 'max'
}

export type NodeDefaultConditionMode = 'source' | 'relation' | 'host' | 'source-host' | 'relation-host'
export type RelationDefaultConditionMode = 'source-target' | 'source' | 'target'

export type DefaultOptions = {
    default_condition?: boolean
    node_default_condition?: boolean
    node_default_condition_mode?: NodeDefaultConditionMode
    relation_default_condition?: boolean
    relation_default_condition_mode?: RelationDefaultConditionMode
    policy_default_condition?: boolean
    group_default_condition?: boolean
    artifact_default_condition?: boolean
    property_default_condition?: boolean
    type_default_condition?: boolean
}

export type PruningOptions = {
    pruning?: boolean
    node_pruning?: boolean
    relation_pruning?: boolean
    policy_pruning?: boolean
    group_pruning?: boolean
    artifact_pruning?: boolean
    property_pruning?: boolean
    type_pruning?: boolean
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
    missing_type_container_consistency_check?: boolean
    ambiguous_type_consistency_check?: boolean
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
          amo?: LogicExpression[]

          // Type functions
          // TODO: remove this
          type_presence?: [string, string | number]
          // TODO
          node_type_presence?: [node: string, type: string | number]
          // TODO
          relation_type_presence?: [node: string, relation: string | number, type: string | number]
          // TODO
          group_type_presence?: [group: string, type: string | number]
          // TODO
          policy_type_presence?: [policy: string | number, type: string | number]

          // Node functions
          node_presence?: string
          host_presence?: string
          has_sources?: string
          has_incoming_relations?: string

          // Relation functions
          relation_presence?: [node: string, relation: string | number]
          source_presence?: 'SELF'
          target_presence?: 'SELF'

          // Property functions
          // TODO: remove this
          property_presence?: [node: string, property: string | number]
          // TODO
          node_property_presence?: [node: string, property: string | number]
          // TODO
          relation_property_presence?: [node: string, relation: string | number, property: string | number]
          // TODO
          group_property_presence?: [group: string, property: string | number]
          // TODO
          policy_property_presence?: [policy: string, property: string | number]
          // TODO
          artifact_property_presence?: [node: string, artifact: string | number, property: string | number]

          // Artifact functions
          artifact_presence?: [node: string, artifact: string | number]

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
          join?: [expression: ValueExpression[], delimiter: string]
          token?: [expression: ValueExpression, token: string, index: number]

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
          same?: [date: string | number, date: string | number]
          before?: [date: string | number, date: string | number]
          before_or_same?: [date: string | number, date: string | number]
          after?: [date: string | number, date: string | number]
          after_or_same?: [date: string | number, date: string | number]
          within?: [date: string | number, interval: [date: string | number, date: string | number]]

          // Cache
          _cached_result?: InputAssignmentValue
      }

export type VariabilityExpression = LogicExpression | ValueExpression
