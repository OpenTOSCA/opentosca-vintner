import Element from '#/graph/element'
import {TechnologyRule} from '#spec/technology-template'
import {TechnologyPluginBuilder} from '#technologies/types'
import {InputAssignmentMap, InputAssignmentValue} from './topology-template'

export const VINTNER_UNDEFINED = 'VINTNER_UNDEFINED'

export type VariabilityDefinition = {
    inputs?: VariabilityInputDefinitionMap
    presets?: InputAssignmentPresetMap
    expressions?: VariabilityExpressionMap
    constraints?: LogicExpression[]
    options?: VariabilityOptions
    type_specific_conditions?: string | TypeSpecificLogicExpressions
    qualities?: string | TechnologyRule[]
    plugins?: PluginDefinitionMap
}

export type VariabilityInputDefinitionMap = {[key: string]: VariabilityInputDefinition}
export type VariabilityInputDefinition = {
    type: string
    description?: string
    default?: InputAssignmentValue
    default_expression?: ValueExpression
    mandatory?: string | string[]
    optional?: string | string[]
    requires?: string | string[]
    excludes?: string | string[]
    alternatives?: string[]
    choices?: string[]
}

export type VariabilityOptions = {
    mode?: PruningMode
} & DefaultOptions &
    PruningOptions &
    ChecksOptions &
    SolverOptions &
    ConstraintsOptions &
    NormalizationOptions &
    EnricherOptions

export type PruningMode = 'manual' | 'consistent-strict' | 'consistent-loose' | 'default' | 'default-loose' | 'loose'

export type SolverOptions = {
    // Topology
    optimization_topology?: boolean | 'min' | 'max'
    optimization_topology_unique?: boolean
    optimization_topology_unique_backward?: boolean
    optimization_topology_mode?: 'weight' | 'count'

    // Technologies
    optimization_technologies?: boolean | 'min' | 'max'
    optimization_technologies_unique?: boolean
    optimization_technologies_mode?: 'weight' | 'count' | 'weight-count'

    // Scenarios
    optimization_scenarios?: boolean
    optimization_scenarios_unique?: boolean
}

export type NormalizationOptions = {
    automatic_default_alternatives?: boolean
    fallback_property_default_alternative?: boolean
}

export type EnricherOptions = {
    enrich_input_condition?: boolean
    enrich_technologies?: boolean
    enrich_technologies_best_only?: boolean
    enrich_implementations?: boolean
}

export type ConstraintsOptions = {
    constraints?: boolean
    relation_source_constraint?: boolean
    relation_target_constraint?: boolean
    relation_enhanced_implication_mode?: boolean
    artifact_container_constraint?: boolean
    property_container_constraint?: boolean
    type_container_constraint?: boolean
    required_hosting_constraint?: boolean
    single_hosting_constraint?: boolean
    required_technology_constraint?: boolean

    unique_property_constraint?: boolean
    unique_artifact_constraint?: boolean
    unique_input_constraint?: boolean
    unique_output_constraint?: boolean
    unique_relation_constraint?: boolean
    unique_technology_constraint?: boolean

    unique_scenario_constraint?: boolean

    required_artifact_constraint?: boolean
    required_incoming_relation_constraint?: boolean
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
    | 'outgoing'
    | 'outgoingnaive'
    | 'incomingnaive-artifact-host'
    | 'incomingnaive-artifactnaive-host'
    | 'artifact-host'
export type RelationDefaultConditionMode = 'source-target-default' | 'source-target' | 'source' | 'target' | 'default'
export type TechnologyDefaultConditionMode =
    | 'container'
    | 'other'
    | 'container-other'
    | 'scenario'
    | 'container-other-scenario'
    | 'container-other-scenario-default'
    | 'default'
export type ArtifactDefaultConditionMode = 'container' | 'managed' | 'default' | 'container-managed-default'

export type PropertyDefaultConditionModes = 'container' | 'consuming' | 'default'
export type PropertyDefaultConditionMode =
    | PropertyDefaultConditionModes
    | `${PropertyDefaultConditionModes}-${PropertyDefaultConditionModes}`
    | `${PropertyDefaultConditionModes}-${PropertyDefaultConditionModes}-${PropertyDefaultConditionModes}`

export type OutputDefaultConditionMode = 'produced' | 'default' | 'produced-default'

export type DefaultOptions = {
    default_condition?: boolean

    input_default_condition?: boolean
    input_default_consistency_condition?: boolean
    input_default_semantic_condition?: boolean

    node_default_condition?: boolean
    node_default_condition_mode?: NodeDefaultConditionMode
    node_default_consistency_condition?: boolean
    node_default_semantic_condition?: boolean

    output_default_condition?: boolean
    output_default_condition_mode?: OutputDefaultConditionMode
    output_default_consistency_condition?: boolean
    output_default_semantic_condition?: boolean

    relation_default_condition?: boolean
    relation_default_condition_mode?: RelationDefaultConditionMode
    relation_default_consistency_condition?: boolean
    relation_default_semantic_condition?: boolean
    relation_default_implied?: boolean

    policy_default_condition?: boolean
    policy_default_consistency_condition?: boolean
    policy_default_semantic_condition?: boolean

    group_default_condition?: boolean
    group_default_consistency_condition?: boolean
    group_default_semantic_condition?: boolean

    artifact_default_condition?: boolean
    artifact_default_condition_mode?: ArtifactDefaultConditionMode
    artifact_default_consistency_condition?: boolean
    artifact_default_semantic_condition?: boolean

    property_default_condition?: boolean
    property_default_condition_mode?: PropertyDefaultConditionMode
    property_default_consistency_condition?: boolean
    property_default_semantic_condition?: boolean

    type_default_condition?: boolean
    type_default_consistency_condition?: boolean
    type_default_semantic_condition?: boolean

    technology_default_condition?: boolean
    technology_default_condition_mode?: TechnologyDefaultConditionMode
    technology_default_consistency_condition?: boolean
    technology_default_semantic_condition?: boolean
}

export type PruningOptions = {
    pruning?: boolean
    consistency_pruning?: boolean
    semantic_pruning?: boolean

    input_pruning?: boolean
    input_consistency_pruning?: boolean
    input_semantic_pruning?: boolean

    node_pruning?: boolean
    node_consistency_pruning?: boolean
    node_semantic_pruning?: boolean

    output_pruning?: boolean
    output_consistency_pruning?: boolean
    output_semantic_pruning?: boolean

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

    technology_pruning?: boolean
    technology_consistency_pruning?: boolean
    technology_semantic_pruning?: boolean
}

export type ChecksOptions = {
    checks?: boolean

    consistency_checks?: boolean
    relation_source_check?: boolean
    relation_target_check?: boolean

    ambiguous_hosting_check?: boolean
    missing_artifact_container_check?: boolean
    ambiguous_artifact_check?: boolean
    missing_property_container_check?: boolean
    ambiguous_property_check?: boolean
    missing_type_container_check?: boolean
    ambiguous_type_check?: boolean

    semantic_checks?: boolean
    expected_hosting_check?: boolean
    expected_incoming_relation_check?: boolean
    expected_artifact_check?: boolean

    anchor_check?: boolean
    bratans_unknown?: boolean

    expected_technology_check?: boolean
    missing_technology_container_check?: boolean
    ambiguous_technology_check?: boolean
    required_technology_check?: boolean

    ambiguous_relation_check?: boolean
    ambiguous_input_check?: boolean
    ambiguous_output_check?: boolean

    unconsumed_input_check?: boolean
    unproduced_output_check?: boolean
}

export type InputAssignmentPresetMap = {[key: string]: InputAssignmentPreset}
export type InputAssignmentPreset = {
    name?: string
    description?: string
    inputs: InputAssignmentMap
}

export type VariabilityExpressionList = VariabilityExpression[]
export type VariabilityExpressionMap = {[key: string]: VariabilityExpression}

export type VariabilityPointObject<T> = VariabilityPoint<T> | VariabilityPointList<T>
export type VariabilityPointList<T> = VariabilityPoint<T>[]
export type VariabilityPoint<T> = {[name: string]: T}

export type VariabilityAlternative = {
    conditions?: LogicExpression | LogicExpression[]
    implies?: [target: LogicExpression, condition?: LogicExpression][]
    implied?: boolean | 'SOURCE' | 'TARGET' | 'CONTAINER'
    default_alternative?: boolean
    default_condition?: boolean
    default_consistency_condition?: boolean
    default_semantic_condition?: boolean
    pruning?: boolean
    consistency_pruning?: boolean
    semantic_pruning?: boolean
}

export type NodeTypePresenceArguments = [
    node: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET',
    type: string | number
]

export type RelationTypePresenceArguments = [
    node: string | 'SELF' | 'CONTAINER',
    relation: string | number,
    type: string | number
]

export type GroupTypePresenceArguments = [group: string | 'SELF' | 'CONTAINER', type: string | number]

export type PolicyTypePresenceArguments = [policy: string | number | 'SELF' | 'CONTAINER', type: string | number]

export type ArtifactTypePresenceArguments = [
    node: string | number | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET',
    artifact: string | number,
    type: string | number
]

export type NodePropertyPresenceArguments = [
    node: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET',
    property: string | number
]

export type RelationPropertyPresenceArguments = [
    node: string | 'SELF' | 'CONTAINER',
    relation: string | number,
    property: string | number
]

export type GroupPropertyPresenceArguments = [group: string | 'SELF' | 'CONTAINER', property: string | number]

export type PolicyPropertyPresenceArguments = [
    policy: string | number | 'SELF' | 'CONTAINER',
    property: string | number
]

export type ArtifactPropertyPresenceArguments = [
    node: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET',
    artifact: string | number,
    property: string | number
]

export type TechnologyPresenceArguments = [
    node: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET',
    technology: string | number
]

// TODO: artifact_type_presence

export type LogicExpression =
    | {
          // Boolean operators
          and?: LogicExpression[]
          or?: LogicExpression[]
          not?: LogicExpression
          xor?: LogicExpression[]
          exo?: LogicExpression[]
          implies?: [LogicExpression, LogicExpression]
          amo?: LogicExpression[]

          // Type functions
          node_type_presence?: NodeTypePresenceArguments
          relation_type_presence?: RelationTypePresenceArguments
          group_type_presence?: GroupTypePresenceArguments
          policy_type_presence?: PolicyTypePresenceArguments
          artifact_type_presence?: ArtifactTypePresenceArguments

          // Node functions
          node_presence?: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET'
          host_presence?: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET'
          has_source?: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET'
          has_incoming_relation?: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET'
          has_incoming_relation_naive?: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET'
          has_outgoing_relation?: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET'
          has_outgoing_relation_naive?: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET'
          has_artifact?: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET'
          has_artifact_naive?: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET'

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
          artifact_presence?: [node: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET', artifact: string | number]
          is_managed?: 'SELF' | [node: string | 'SELF' | 'CONTAINER' | 'SOURCE' | 'TARGET', artifact: string | number]

          // Policy functions
          policy_presence?: string | number | 'SELF' | 'CONTAINER'
          has_present_target?: string | number | 'SELF' | 'CONTAINER'

          // Group functions
          group_presence?: string | 'SELF' | 'CONTAINER'
          has_present_member?: string | 'SELF' | 'CONTAINER'

          // Input functions
          input_presence?: string | number
          is_consumed?: string | number

          // Output functions
          output_presence?: string | number
          is_produced?: string | number

          // Import functions
          import_presence?: number

          // Technology functions
          technology_presence?: TechnologyPresenceArguments

          // Intrinsic functions
          logic_expression?: string
          variability_input?: string

          // Some more functions
          container_presence?: 'SELF' | 'CONTAINER'

          // Cache
          _cached_element?: Element
          _visited?: boolean
          _id?: string

          // Generated
          _generated?: boolean
          _bratan?: boolean

          _lost?: string
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
    conditions: LogicExpression
    consistency: boolean
    semantic: boolean
}

export type TypeSpecificLogicExpressions = {
    artifact_types?: {[key: string]: ConditionsWrapper}
    data_types?: {[key: string]: ConditionsWrapper}
    relationship_types?: {[key: string]: ConditionsWrapper}
    node_types?: {[key: string]: ConditionsWrapper}
    group_types?: {[key: string]: ConditionsWrapper}
    policy_types?: {[key: string]: ConditionsWrapper}
}

export type PluginDefinitionMap = {
    technology?: (string | TechnologyPluginBuilder)[]
}
