import Element from '#/graph/element'
import {InputAssignmentMap, InputAssignmentValue, InputDefinitionMap} from './topology-template'

export type VariabilityDefinition = {
    inputs: InputDefinitionMap
    presets?: InputAssignmentPresetMap
    expressions?: VariabilityExpressionMap
    options?: VariabilityOptions
    type_specific_conditions?: TypeSpecificLogicExpressions
}

export type VariabilityOptions = {
    mode?: ResolvingMode
} & DefaultOptions &
    PruningOptions &
    ChecksOptions &
    SolverOptions

export type ResolvingMode = 'strict' | 'consistent-strict' | 'consistent-loose' | 'default' | 'default-loose' | 'loose'

export type SolverOptions = {
    optimization?: boolean | 'min' | 'max'
}

// In reality, this is "NodeDefaultConditionMode(-NodeDefaultConditionMode)*" tho
export type NodeDefaultConditionMode =
    | 'source'
    | 'incoming'
    | 'incomingnaive'
    | 'host'
    | 'artifact'
    | 'artifactnaive'
    | 'incoming-artifact'
export type RelationDefaultConditionMode = 'source-target' | 'source' | 'target'

export type DefaultOptions = {
    default_condition?: boolean
    default_consistency_condition?: boolean
    default_semantic_condition?: boolean

    node_default_condition?: boolean
    node_default_condition_mode?: NodeDefaultConditionMode
    node_default_consistency_condition?: boolean
    node_default_semantic_condition?: boolean

    relation_default_condition?: boolean
    relation_default_condition_mode?: RelationDefaultConditionMode
    relation_default_consistency_condition?: boolean
    relation_default_semantic_condition?: boolean

    policy_default_condition?: boolean
    policy_default_consistency_condition?: boolean
    policy_default_semantic_condition?: boolean

    group_default_condition?: boolean
    group_default_consistency_condition?: boolean
    group_default_semantic_condition?: boolean

    artifact_default_condition?: boolean
    artifact_default_consistency_condition?: boolean
    artifact_default_semantic_condition?: boolean

    property_default_condition?: boolean
    property_default_consistency_condition?: boolean
    property_default_semantic_condition?: boolean

    type_default_condition?: boolean
    type_default_consistency_condition?: boolean
    type_default_semantic_condition?: boolean
}

export type PruningOptions = {
    pruning?: boolean
    consistency_pruning?: boolean
    semantic_pruning?: boolean

    node_pruning?: boolean
    node_consistency_pruning?: boolean
    node_semantic_pruning?: boolean

    relation_pruning?: boolean
    relation_consistency_pruning?: boolean
    relation_semantic_pruning?: boolean

    policy_pruning?: boolean
    policy_consistency_pruning?: boolean
    policy_semantic_pruning?: boolean

    group_pruning?: boolean
    group_consistency_pruning?: boolean
    group_semantic_pruning?: boolean

    artifact_pruning?: boolean
    artifact_consistency_pruning?: boolean
    artifact_semantic_pruning?: boolean

    property_pruning?: boolean
    property_consistency_pruning?: boolean
    property_semantic_pruning?: boolean

    type_pruning?: boolean
    type_consistency_pruning?: boolean
    type_semantic_pruning?: boolean
}

export type ChecksOptions = {
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
    strict: {},
    'consistent-strict': {
        default_condition: true,
        default_consistency_condition: true,
        default_semantic_condition: false,
    },
    'consistent-loose': {
        pruning: true,
        consistency_pruning: true,
        semantic_pruning: false,
    },
    default: {
        default_condition: true,
    },
    'default-loose': {
        pruning: true,
        consistency_pruning: true,
        semantic_pruning: false,
    },
    loose: {
        pruning: true,
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
          node_presence?: string | 'CONTAINER'
          host_presence?: string | 'SELF' | 'CONTAINER'
          has_source?: string | 'SELF' | 'CONTAINER'
          has_incoming_relation?: string | 'SELF' | 'CONTAINER'
          has_incoming_relation_naive?: string | 'SELF' | 'CONTAINER'
          has_artifact?: string | 'SELF' | 'CONTAINER'
          has_artifact_naive?: string | 'SELF' | 'CONTAINER'

          // Relation functions
          relation_presence?: [node: string | 'SELF' | 'CONTAINER', relation: string | number]
          source_presence?: 'SELF' | 'CONTAINER'
          target_presence?: 'SELF' | 'CONTAINER'

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
          group_presence?: string | 'SELF' | 'CONTAINER'
          has_present_member?: string | 'SELF' | 'CONTAINER'

          // Input functions
          input_presence?: string

          // Import functions
          import_presence?: number

          // Intrinsic functions
          logic_expression?: string
          variability_input?: string

          // Some more functions
          container_presence?: 'SELF'

          // Cache
          _cached_element?: Element
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

export type ConditionsWrapper = {
    conditions: LogicExpression | LogicExpression[]
    consistency?: boolean
    semantic?: boolean
}

export type TypeSpecificLogicExpressionMap = {
    [key: string]: ConditionsWrapper
}
export type TypeSpecificLogicExpressions = {
    artifact_types?: TypeSpecificLogicExpressionMap
    data_types?: TypeSpecificLogicExpressionMap
    relationship_types?: TypeSpecificLogicExpressionMap
    node_types?: TypeSpecificLogicExpressionMap
    group_types?: TypeSpecificLogicExpressionMap
    policy_types?: TypeSpecificLogicExpressionMap
}
