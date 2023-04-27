import {InputAssignmentMap, InputAssignmentValue, InputDefinitionMap} from './topology-template'
import {ConditionalElement} from '#/resolver/graph'

export type VariabilityDefinition = {
    inputs: InputDefinitionMap
    presets?: InputAssignmentPresetMap
    expressions?: VariabilityExpressionMap
    options?: VariabilityResolvingOptions
}

export type VariabilityResolvingOptions = {
    mode?: ResolvingMode
} & DefaultOptions &
    PruningOptions &
    ConsistencyOptions &
    SolverOptions

export type ResolvingMode = 'strict' | 'consistent-strict' | 'consistent-loose' | 'default' | 'loose'

export type SolverOptions = {
    optimization?: boolean | 'min' | 'max'
}

export type NodeDefaultConditionMode = 'source' | 'incoming' | 'host' | 'source-host' | 'relation-host'
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

export const ResolverModes = {
    strict: {
        default: {
            node_default_condition: false,
            relation_default_condition: false,
            policy_default_condition: false,
            group_default_condition: false,
            artifact_default_condition: false,
            property_default_condition: false,
            type_default_condition: false,
        },
        pruning: {
            node_pruning: false,
            relation_pruning: false,
            policy_pruning: false,
            group_pruning: false,
            artifact_pruning: false,
            property_pruning: false,
            type_pruning: false,
        },
    },
    'consistent-strict': {
        default: {
            node_default_condition: false,
            relation_default_condition: true,
            policy_default_condition: false,
            group_default_condition: false,
            artifact_default_condition: true,
            property_default_condition: true,
            type_default_condition: true,
        },
        pruning: {
            node_pruning: false,
            relation_pruning: false,
            policy_pruning: false,
            group_pruning: false,
            artifact_pruning: false,
            property_pruning: false,
            type_pruning: false,
        },
    },
    'consistent-loose': {
        default: {
            node_default_condition: false,
            relation_default_condition: true,
            policy_default_condition: false,
            group_default_condition: false,
            artifact_default_condition: true,
            property_default_condition: true,
            type_default_condition: true,
        },
        pruning: {
            node_pruning: false,
            relation_pruning: true,
            policy_pruning: false,
            group_pruning: false,
            artifact_pruning: true,
            property_pruning: true,
            type_pruning: false,
        },
    },
    default: {
        default: {
            node_default_condition: true,
            relation_default_condition: true,
            policy_default_condition: true,
            group_default_condition: true,
            artifact_default_condition: true,
            property_default_condition: true,
            type_default_condition: true,
        },
        pruning: {
            node_pruning: false,
            relation_pruning: false,
            policy_pruning: false,
            group_pruning: false,
            artifact_pruning: false,
            property_pruning: false,
            type_pruning: false,
        },
    },
    loose: {
        default: {
            default_condition: true,
            node_default_condition: true,
            relation_default_condition: true,
            policy_default_condition: true,
            group_default_condition: true,
            artifact_default_condition: true,
            property_default_condition: true,
            type_default_condition: true,
        },
        pruning: {
            pruning: true,
            node_pruning: true,
            relation_pruning: true,
            policy_pruning: true,
            group_pruning: true,
            artifact_pruning: true,
            property_pruning: true,
            type_pruning: true,
        },
    },
    base: {
        default: {
            default_condition: false,
            node_default_condition: false,
            relation_default_condition: false,
            policy_default_condition: false,
            group_default_condition: false,
            artifact_default_condition: false,
            property_default_condition: false,
            type_default_condition: false,
        },
        pruning: {
            pruning: false,
            node_pruning: false,
            relation_pruning: false,
            policy_pruning: false,
            group_pruning: false,
            artifact_pruning: false,
            property_pruning: false,
            type_pruning: false,
        },
    },
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

export type NodeTypePresenceArguments = [node: string, type: string | number]
export type RelationTypePresenceArguments = [node: string, relation: string | number, type: string | number]
export type GroupTypePresenceArguments = [group: string, type: string | number]
export type PolicyTypePresenceArguments = [policy: string | number, type: string | number]

export type NodePropertyPresenceArguments = [node: string, property: string | number]
export type RelationPropertyPresenceArguments = [node: string, relation: string | number, property: string | number]
export type GroupPropertyPresenceArguments = [group: string, property: string | number]
export type PolicyPropertyPresenceArguments = [policy: string | number, property: string | number]
export type ArtifactPropertyPresenceArguments = [node: string, artifact: string | number, property: string | number]

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
          node_type_presence?: NodeTypePresenceArguments
          relation_type_presence?: RelationTypePresenceArguments
          group_type_presence?: GroupTypePresenceArguments
          policy_type_presence?: PolicyTypePresenceArguments

          // Node functions
          node_presence?: string
          host_presence?: string
          has_sources?: string
          has_incoming_relations?: string
          has_incoming_relations_naive?: string

          // Relation functions
          relation_presence?: [node: string, relation: string | number]
          source_presence?: 'SELF'
          target_presence?: 'SELF'

          // Property functions
          node_property_presence?: NodePropertyPresenceArguments
          relation_property_presence?: RelationPropertyPresenceArguments
          group_property_presence?: GroupPropertyPresenceArguments
          policy_property_presence?: PolicyPropertyPresenceArguments
          artifact_property_presence?: ArtifactPropertyPresenceArguments

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

          // Some more functions
          container_presence?: 'SELF'

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
