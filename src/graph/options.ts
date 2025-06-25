import * as assert from '#assert'
import * as check from '#check'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {
    ArtifactDefaultConditionMode,
    NodeDefaultConditionMode,
    OutputDefaultConditionMode,
    PropertyDefaultConditionMode,
    RelationDefaultConditionMode,
    TechnologyDefaultConditionMode,
    VariabilityOptions,
} from '#spec/variability'

abstract class BaseOptions {
    readonly serviceTemplate: ServiceTemplate
    readonly raw: VariabilityOptions

    readonly v1: boolean
    readonly v2: boolean
    readonly v3: boolean

    protected constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}

        this.v1 = [
            TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0_RC_1,
            TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
        ].includes(serviceTemplate.tosca_definitions_version)

        this.v2 = serviceTemplate.tosca_definitions_version === TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0_RC_2
        this.v3 = serviceTemplate.tosca_definitions_version === TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0_RC_3
    }
}

export class Options extends BaseOptions {
    readonly default: DefaultOptions
    readonly pruning: PruningOptions
    readonly checks: ChecksOptions
    readonly solver: SolverOptions
    readonly constraints: ConstraintsOptions
    // Note, actually this is not of use since normalization does not use Graph.ts and the options are cleaned during normalization
    readonly normalization: NormalizationOptions
    readonly enricher: EnricherOptions

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        this.default = new DefaultOptions(serviceTemplate)
        this.pruning = new PruningOptions(serviceTemplate)
        this.checks = new ChecksOptions(serviceTemplate)
        this.solver = new SolverOptions(serviceTemplate)
        this.constraints = new ConstraintsOptions(serviceTemplate)
        this.normalization = new NormalizationOptions(serviceTemplate)
        this.enricher = new EnricherOptions(serviceTemplate)
    }
}

class DefaultOptions extends BaseOptions {
    readonly defaultCondition: boolean

    readonly nodeDefaultCondition: boolean
    readonly nodeDefaultConditionMode: NodeDefaultConditionMode
    readonly nodeDefaultConsistencyCondition: boolean
    readonly nodeDefaultSemanticCondition: boolean

    readonly inputDefaultCondition: boolean
    readonly inputDefaultConsistencyCondition: boolean
    readonly inputDefaultSemanticCondition: boolean

    readonly outputDefaultCondition: boolean
    readonly outputDefaultConditionMode: OutputDefaultConditionMode
    readonly outputDefaultConsistencyCondition: boolean
    readonly outputDefaultSemanticCondition: boolean

    readonly relationDefaultCondition: boolean
    readonly relationDefaultConditionMode: RelationDefaultConditionMode
    readonly relationDefaultConsistencyCondition: boolean
    readonly relationDefaultSemanticCondition: boolean
    readonly relationDefaultImplied: boolean

    readonly policyDefaultCondition: boolean
    readonly policyDefaultConsistencyCondition: boolean
    readonly policyDefaultSemanticCondition: boolean

    readonly groupDefaultCondition: boolean
    readonly groupDefaultConsistencyCondition: boolean
    readonly groupDefaultSemanticCondition: boolean

    readonly artifactDefaultCondition: boolean
    readonly artifactDefaultConditionMode: ArtifactDefaultConditionMode
    readonly artifactDefaultConsistencyCondition: boolean
    readonly artifactDefaultSemanticCondition: boolean

    readonly propertyDefaultCondition: boolean
    readonly propertyDefaultConditionMode: PropertyDefaultConditionMode
    readonly propertyDefaultConsistencyCondition: boolean
    readonly propertyDefaultSemanticCondition: boolean

    readonly typeDefaultCondition: boolean
    readonly typeDefaultConsistencyCondition: boolean
    readonly typeDefaultSemanticCondition: boolean

    readonly technologyDefaultCondition: boolean
    readonly technologyDefaultConditionMode: TechnologyDefaultConditionMode
    readonly technologyDefaultConsistencyCondition: boolean
    readonly technologyDefaultSemanticCondition: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        const mode = getPruningMode(this)

        /**
         * Default Condition
         */
        this.defaultCondition = this.raw.default_condition ?? mode.default_condition ?? false
        assert.isBoolean(this.defaultCondition)

        /**
         * Input
         */
        this.inputDefaultCondition =
            this.raw.input_default_condition ?? mode.input_default_condition ?? this.defaultCondition
        assert.isBoolean(this.inputDefaultCondition)

        this.inputDefaultConsistencyCondition =
            this.raw.input_default_consistency_condition ??
            mode.input_default_consistency_condition ??
            this.inputDefaultCondition
        assert.isBoolean(this.inputDefaultConsistencyCondition)

        this.inputDefaultSemanticCondition =
            this.raw.input_default_semantic_condition ??
            mode.input_default_semantic_condition ??
            this.inputDefaultCondition
        assert.isBoolean(this.inputDefaultSemanticCondition)

        /**
         * Node
         */
        this.nodeDefaultCondition =
            this.raw.node_default_condition ?? mode.node_default_condition ?? this.defaultCondition
        assert.isBoolean(this.nodeDefaultCondition)

        if (this.v1) {
            this.nodeDefaultConditionMode =
                this.raw.node_default_condition_mode ?? mode.node_default_condition_mode ?? 'incoming-artifact'
            assert.isString(this.nodeDefaultConditionMode)
        } else {
            this.nodeDefaultConditionMode =
                this.raw.node_default_condition_mode ??
                mode.node_default_condition_mode ??
                'incomingnaive-artifact-host'
            assert.isString(this.nodeDefaultConditionMode)
        }

        this.nodeDefaultConsistencyCondition =
            this.raw.node_default_consistency_condition ??
            mode.node_default_consistency_condition ??
            this.nodeDefaultCondition
        assert.isBoolean(this.nodeDefaultConsistencyCondition)

        this.nodeDefaultSemanticCondition =
            this.raw.node_default_semantic_condition ??
            mode.node_default_semantic_condition ??
            this.nodeDefaultCondition
        assert.isBoolean(this.nodeDefaultSemanticCondition)

        /**
         * Output
         */
        this.outputDefaultCondition =
            this.raw.output_default_condition ?? mode.output_default_condition ?? this.defaultCondition
        assert.isBoolean(this.outputDefaultCondition)

        this.outputDefaultConditionMode =
            this.raw.output_default_condition_mode ?? (this.v3 ? 'produced-default' : 'produced')
        assert.isString(this.outputDefaultConditionMode)

        this.outputDefaultConsistencyCondition =
            this.raw.output_default_consistency_condition ??
            mode.output_default_consistency_condition ??
            this.outputDefaultCondition
        assert.isBoolean(this.outputDefaultConsistencyCondition)

        this.outputDefaultSemanticCondition =
            this.raw.output_default_semantic_condition ??
            mode.output_default_semantic_condition ??
            this.outputDefaultCondition
        assert.isBoolean(this.outputDefaultSemanticCondition)

        /**
         * Relation
         */
        this.relationDefaultCondition =
            this.raw.relation_default_condition ?? mode.relation_default_condition ?? this.defaultCondition
        assert.isBoolean(this.relationDefaultCondition)

        this.relationDefaultConditionMode =
            this.raw.relation_default_condition_mode ??
            mode.relation_default_condition_mode ??
            (this.v3 ? 'source-target-default' : 'source-target')
        assert.isString(this.relationDefaultConditionMode)

        this.relationDefaultConsistencyCondition =
            this.raw.relation_default_consistency_condition ??
            mode.relation_default_consistency_condition ??
            this.relationDefaultCondition
        assert.isBoolean(this.relationDefaultConsistencyCondition)

        this.relationDefaultSemanticCondition =
            this.raw.relation_default_semantic_condition ??
            mode.relation_default_semantic_condition ??
            this.relationDefaultCondition
        assert.isBoolean(this.relationDefaultSemanticCondition)

        if (this.v1) {
            this.relationDefaultImplied = this.raw.relation_default_implied ?? false
            assert.isBoolean(this.relationDefaultImplied)
        } else {
            this.relationDefaultImplied = this.raw.relation_default_implied ?? true
            assert.isBoolean(this.relationDefaultImplied)
        }

        /**
         * Policy
         */
        this.policyDefaultCondition =
            this.raw.policy_default_condition ?? mode.policy_default_condition ?? this.defaultCondition
        assert.isBoolean(this.policyDefaultCondition)

        this.policyDefaultConsistencyCondition =
            this.raw.policy_default_consistency_condition ??
            mode.policy_default_consistency_condition ??
            this.policyDefaultCondition
        assert.isBoolean(this.policyDefaultConsistencyCondition)

        this.policyDefaultSemanticCondition =
            this.raw.policy_default_semantic_condition ??
            mode.policy_default_semantic_condition ??
            this.policyDefaultCondition
        assert.isBoolean(this.policyDefaultSemanticCondition)

        /**
         * Group
         */
        this.groupDefaultCondition =
            this.raw.group_default_condition ?? mode.group_default_condition ?? this.defaultCondition
        assert.isBoolean(this.groupDefaultCondition)

        this.groupDefaultConsistencyCondition =
            this.raw.group_default_consistency_condition ??
            mode.group_default_consistency_condition ??
            this.groupDefaultCondition
        assert.isBoolean(this.groupDefaultConsistencyCondition)

        this.groupDefaultSemanticCondition =
            this.raw.group_default_semantic_condition ??
            mode.group_default_semantic_condition ??
            this.groupDefaultCondition
        assert.isBoolean(this.groupDefaultSemanticCondition)

        /**
         * Artifact
         */
        this.artifactDefaultCondition =
            this.raw.artifact_default_condition ?? mode.artifact_default_condition ?? this.defaultCondition
        assert.isBoolean(this.artifactDefaultCondition)

        this.artifactDefaultConditionMode =
            this.raw.artifact_default_condition_mode ??
            mode.artifact_default_condition_mode ??
            (this.v3 ? 'container-managed-default' : 'container')
        assert.isString(this.artifactDefaultConditionMode)

        this.artifactDefaultConsistencyCondition =
            this.raw.artifact_default_consistency_condition ??
            mode.artifact_default_consistency_condition ??
            this.artifactDefaultCondition
        assert.isBoolean(this.artifactDefaultConsistencyCondition)

        this.artifactDefaultSemanticCondition =
            this.raw.artifact_default_semantic_condition ??
            mode.artifact_default_semantic_condition ??
            this.artifactDefaultCondition
        assert.isBoolean(this.artifactDefaultSemanticCondition)

        /**
         * Property
         */
        this.propertyDefaultCondition =
            this.raw.property_default_condition ?? mode.property_default_condition ?? this.defaultCondition
        assert.isBoolean(this.propertyDefaultCondition)

        this.propertyDefaultConditionMode =
            this.raw.property_default_condition_mode ??
            mode.property_default_condition_mode ??
            (this.v3 ? 'container-consuming-default' : 'container-consuming')
        assert.isString(this.propertyDefaultConditionMode)

        this.propertyDefaultConsistencyCondition =
            this.raw.property_default_consistency_condition ??
            mode.property_default_consistency_condition ??
            this.propertyDefaultCondition
        assert.isBoolean(this.propertyDefaultConsistencyCondition)

        this.propertyDefaultSemanticCondition =
            this.raw.property_default_semantic_condition ??
            mode.property_default_semantic_condition ??
            this.propertyDefaultCondition
        assert.isBoolean(this.propertyDefaultSemanticCondition)

        /**
         * Type
         */
        this.typeDefaultCondition =
            this.raw.type_default_condition ?? mode.type_default_condition ?? this.defaultCondition
        assert.isBoolean(this.typeDefaultCondition)

        this.typeDefaultConsistencyCondition =
            this.raw.type_default_consistency_condition ??
            mode.type_default_consistency_condition ??
            this.typeDefaultCondition
        assert.isBoolean(this.typeDefaultConsistencyCondition)

        this.typeDefaultSemanticCondition =
            this.raw.type_default_semantic_condition ??
            mode.type_default_semantic_condition ??
            this.typeDefaultCondition
        assert.isBoolean(this.typeDefaultSemanticCondition)

        /**
         * Technology
         */
        this.technologyDefaultCondition =
            this.raw.technology_default_condition ?? mode.technology_default_condition ?? this.defaultCondition
        assert.isBoolean(this.technologyDefaultCondition)

        this.technologyDefaultConditionMode =
            this.raw.technology_default_condition_mode ??
            mode.technology_default_condition_mode ??
            (this.v3 ? 'container-other-scenario-default' : 'container-other-scenario')
        assert.isString(this.technologyDefaultConditionMode)

        this.technologyDefaultConsistencyCondition =
            this.raw.technology_default_consistency_condition ??
            mode.technology_default_consistency_condition ??
            this.technologyDefaultCondition
        assert.isBoolean(this.technologyDefaultConsistencyCondition)

        this.technologyDefaultSemanticCondition =
            this.raw.technology_default_semantic_condition ??
            mode.technology_default_semantic_condition ??
            this.technologyDefaultCondition
        assert.isBoolean(this.technologyDefaultSemanticCondition)
    }
}

class PruningOptions extends BaseOptions {
    readonly pruning: boolean

    readonly inputPruning: boolean
    readonly inputConsistencyPruning: boolean
    readonly inputSemanticPruning: boolean

    readonly nodePruning: boolean
    readonly nodeConsistencyPruning: boolean
    readonly nodeSemanticPruning: boolean

    readonly outputPruning: boolean
    readonly outputConsistencyPruning: boolean
    readonly outputSemanticPruning: boolean

    readonly relationPruning: boolean
    readonly relationConsistencyPruning: boolean
    readonly relationSemanticPruning: boolean

    readonly policyPruning: boolean
    readonly policyConsistencyPruning: boolean
    readonly policySemanticPruning: boolean

    readonly groupPruning: boolean
    readonly groupConsistencyPruning: boolean
    readonly groupSemanticPruning: boolean

    readonly artifactPruning: boolean
    readonly artifactConsistencyPruning: boolean
    readonly artifactSemanticPruning: boolean

    readonly propertyPruning: boolean
    readonly propertyConsistencyPruning: boolean
    readonly propertySemanticPruning: boolean

    readonly typePruning: boolean
    readonly typeConsistencyPruning: boolean
    readonly typeSemanticPruning: boolean

    readonly technologyPruning: boolean
    readonly technologyConsistencyPruning: boolean
    readonly technologySemanticPruning: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        const mode = getPruningMode(this)

        /**
         * Pruning
         */
        this.pruning = this.raw.pruning ?? mode.pruning ?? false
        assert.isBoolean(this.pruning)

        /**
         * Input
         */
        this.inputPruning = this.raw.input_pruning ?? mode.input_pruning ?? this.pruning
        assert.isBoolean(this.inputPruning)

        this.inputConsistencyPruning =
            this.raw.input_consistency_pruning ?? mode.input_consistency_pruning ?? this.inputPruning
        assert.isBoolean(this.inputConsistencyPruning)

        this.inputSemanticPruning = this.raw.input_semantic_pruning ?? mode.input_semantic_pruning ?? this.inputPruning
        assert.isBoolean(this.inputSemanticPruning)

        /**
         * Node
         */
        this.nodePruning = this.raw.node_pruning ?? mode.node_pruning ?? this.pruning
        assert.isBoolean(this.nodePruning)

        this.nodeConsistencyPruning =
            this.raw.node_consistency_pruning ?? mode.node_consistency_pruning ?? this.nodePruning
        assert.isBoolean(this.nodeConsistencyPruning)

        this.nodeSemanticPruning = this.raw.node_semantic_pruning ?? mode.node_semantic_pruning ?? this.nodePruning
        assert.isBoolean(this.nodeSemanticPruning)

        /**
         * Output
         */
        this.outputPruning = this.raw.output_pruning ?? mode.output_pruning ?? this.pruning
        assert.isBoolean(this.outputPruning)

        this.outputConsistencyPruning =
            this.raw.output_consistency_pruning ?? mode.output_consistency_pruning ?? this.outputPruning
        assert.isBoolean(this.outputConsistencyPruning)

        this.outputSemanticPruning =
            this.raw.output_semantic_pruning ?? mode.output_semantic_pruning ?? this.outputPruning
        assert.isBoolean(this.outputSemanticPruning)

        /**
         * Relation
         */
        this.relationPruning = this.raw.relation_pruning ?? mode.relation_pruning ?? this.pruning
        assert.isBoolean(this.relationPruning)

        this.relationConsistencyPruning =
            this.raw.relation_consistency_pruning ?? mode.relation_consistency_pruning ?? this.relationPruning
        assert.isBoolean(this.relationConsistencyPruning)

        this.relationSemanticPruning =
            this.raw.relation_semantic_pruning ?? mode.relation_semantic_pruning ?? this.relationPruning
        assert.isBoolean(this.relationSemanticPruning)

        /**
         * Policy
         */
        this.policyPruning = this.raw.policy_pruning ?? mode.policy_pruning ?? this.pruning
        assert.isBoolean(this.policyPruning)

        this.policyConsistencyPruning =
            this.raw.policy_consistency_pruning ?? mode.policy_consistency_pruning ?? this.policyPruning
        assert.isBoolean(this.policyConsistencyPruning)

        this.policySemanticPruning =
            this.raw.policy_semantic_pruning ?? mode.policy_semantic_pruning ?? this.policyPruning
        assert.isBoolean(this.policySemanticPruning)

        /**
         * Group
         */
        this.groupPruning = this.raw.group_pruning ?? mode.group_pruning ?? this.pruning
        assert.isBoolean(this.groupPruning)

        this.groupConsistencyPruning =
            this.raw.group_consistency_pruning ?? mode.group_consistency_pruning ?? this.groupPruning
        assert.isBoolean(this.groupConsistencyPruning)

        this.groupSemanticPruning = this.raw.group_semantic_pruning ?? mode.group_semantic_pruning ?? this.groupPruning
        assert.isBoolean(this.groupSemanticPruning)

        /**
         * Artifact
         */
        this.artifactPruning = this.raw.artifact_pruning ?? mode.artifact_pruning ?? this.pruning
        assert.isBoolean(this.artifactPruning)

        this.artifactConsistencyPruning =
            this.raw.artifact_consistency_pruning ?? mode.artifact_consistency_pruning ?? this.artifactPruning
        assert.isBoolean(this.artifactConsistencyPruning)

        this.artifactSemanticPruning =
            this.raw.artifact_semantic_pruning ?? mode.artifact_semantic_pruning ?? this.artifactPruning
        assert.isBoolean(this.artifactSemanticPruning)

        /**
         * Property
         */
        this.propertyPruning = this.raw.property_pruning ?? mode.property_pruning ?? this.pruning
        assert.isBoolean(this.propertyPruning)

        this.propertyConsistencyPruning =
            this.raw.property_consistency_pruning ?? mode.property_consistency_pruning ?? this.propertyPruning
        assert.isBoolean(this.propertyConsistencyPruning)

        this.propertySemanticPruning =
            this.raw.property_semantic_pruning ?? mode.property_semantic_pruning ?? this.propertyPruning
        assert.isBoolean(this.propertySemanticPruning)

        /**
         * Type
         */
        this.typePruning = this.raw.type_pruning ?? mode.type_pruning ?? this.pruning
        assert.isBoolean(this.typePruning)

        this.typeConsistencyPruning =
            this.raw.type_consistency_pruning ?? mode.type_consistency_pruning ?? this.typePruning
        assert.isBoolean(this.typeConsistencyPruning)

        this.typeSemanticPruning = this.raw.type_semantic_pruning ?? mode.type_semantic_pruning ?? this.typePruning
        assert.isBoolean(this.typeSemanticPruning)

        /**
         * Technology
         */
        this.technologyPruning = this.raw.technology_pruning ?? mode.technology_pruning ?? this.pruning
        assert.isBoolean(this.technologyPruning)

        this.technologyConsistencyPruning =
            this.raw.technology_consistency_pruning ?? mode.technology_consistency_pruning ?? this.technologyPruning
        assert.isBoolean(this.technologyConsistencyPruning)

        this.technologySemanticPruning =
            this.raw.technology_semantic_pruning ?? mode.technology_semantic_pruning ?? this.technologyPruning
        assert.isBoolean(this.technologySemanticPruning)
    }
}

class ChecksOptions extends BaseOptions {
    readonly checks: boolean

    readonly consistency: boolean
    readonly relationSource: boolean
    readonly relationTarget: boolean
    readonly ambiguousRelation: boolean

    readonly ambiguousHosting: boolean

    readonly missingArtifactContainer: boolean
    readonly ambiguousArtifact: boolean

    readonly missingPropertyContainer: boolean
    readonly ambiguousProperty: boolean

    readonly missingTypeContainer: boolean
    readonly ambiguousType: boolean

    readonly semantic: boolean
    readonly expectedHosting: boolean
    readonly expectedIncomingRelation: boolean
    readonly expectedArtifact: boolean

    readonly anchor: boolean

    readonly expectedTechnology: boolean
    readonly missingTechnologyContainer: boolean
    readonly ambiguousTechnology: boolean
    readonly requiredTechnology: boolean

    readonly ambiguousInput: boolean
    readonly unconsumedInput: boolean

    readonly ambiguousOutput: boolean
    readonly unproducedOutput: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        if (this.v1 || this.v2) {
            /**
             * Case: tosca_simple_yaml_1_3, tosca_variability_1_0, tosca_variability_1_0_rc_1, tosca_variability_1_0_rc_2
             */
            this.checks = this.raw.checks ?? true
            assert.isBoolean(this.checks)
        } else {
            /**
             * Case: tosca_variability_1_0_rc_3
             */
            this.checks = this.raw.checks ?? false
            assert.isBoolean(this.checks)
        }

        this.consistency = this.raw.consistency_checks ?? this.checks
        assert.isBoolean(this.consistency)

        this.relationSource = this.raw.relation_source_check ?? this.consistency
        assert.isBoolean(this.relationSource)

        this.relationTarget = this.raw.relation_target_check ?? this.consistency
        assert.isBoolean(this.relationTarget)

        this.ambiguousHosting = this.raw.ambiguous_hosting_check ?? this.consistency
        assert.isBoolean(this.ambiguousHosting)

        this.missingArtifactContainer = this.raw.missing_artifact_container_check ?? this.consistency
        assert.isBoolean(this.missingArtifactContainer)

        this.ambiguousArtifact = this.raw.ambiguous_artifact_check ?? this.consistency
        assert.isBoolean(this.ambiguousArtifact)

        this.missingPropertyContainer = this.raw.missing_property_container_check ?? this.consistency
        assert.isBoolean(this.missingPropertyContainer)

        this.ambiguousProperty = this.raw.ambiguous_property_check ?? this.consistency
        assert.isBoolean(this.ambiguousProperty)

        this.missingTypeContainer = this.raw.missing_type_container_check ?? this.consistency
        assert.isBoolean(this.missingTypeContainer)

        this.ambiguousType = this.raw.ambiguous_type_check ?? this.consistency
        assert.isBoolean(this.ambiguousType)

        this.semantic = this.raw.semantic_checks ?? this.checks
        assert.isBoolean(this.semantic)

        this.expectedHosting = this.raw.expected_hosting_check ?? this.semantic
        assert.isBoolean(this.expectedHosting)

        this.expectedIncomingRelation = this.raw.expected_incoming_relation_check ?? this.semantic
        assert.isBoolean(this.expectedIncomingRelation)

        this.expectedArtifact = this.raw.expected_artifact_check ?? this.semantic
        assert.isBoolean(this.expectedArtifact)

        this.anchor = this.raw.anchor_check ?? this.checks
        assert.isBoolean(this.anchor)

        this.expectedTechnology = this.raw.expected_technology_check ?? this.semantic
        assert.isBoolean(this.expectedTechnology)

        this.missingTechnologyContainer = this.raw.missing_technology_container_check ?? this.consistency
        assert.isBoolean(this.missingTechnologyContainer)

        this.ambiguousTechnology = this.raw.ambiguous_technology_check ?? this.consistency
        assert.isBoolean(this.ambiguousTechnology)

        this.requiredTechnology = this.raw.required_technology_check ?? this.semantic
        assert.isBoolean(this.expectedTechnology)

        this.ambiguousRelation = this.raw.ambiguous_relation_check ?? this.consistency
        assert.isBoolean(this.ambiguousRelation)

        this.ambiguousInput = this.raw.ambiguous_input_check ?? this.consistency
        assert.isBoolean(this.ambiguousInput)

        this.ambiguousOutput = this.raw.ambiguous_output_check ?? this.consistency
        assert.isBoolean(this.ambiguousOutput)

        if (this.v1 || this.v2) {
            /**
             * Case: tosca_simple_yaml_1_3, tosca_variability_1_0, tosca_variability_1_0_rc_1, tosca_variability_1_0_rc_2
             */
            this.unconsumedInput = this.raw.unconsumed_input_check ?? false
            assert.isBoolean(this.unconsumedInput)

            this.unproducedOutput = this.raw.unproduced_output_check ?? false
            assert.isBoolean(this.unproducedOutput)
        } else {
            /**
             * Case: tosca_variability_1_0_rc_3
             */
            this.unconsumedInput = this.raw.unconsumed_input_check ?? this.semantic
            assert.isBoolean(this.unconsumedInput)

            this.unproducedOutput = this.raw.unproduced_output_check ?? this.consistency
            assert.isBoolean(this.unproducedOutput)
        }
    }
}

class SolverOptions extends BaseOptions {
    readonly topology: SolverTopologyOptions
    readonly technologies: SolverTechnologiesOptions
    readonly scenarios: SolverScenariosOptions

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        this.topology = new SolverTopologyOptions(serviceTemplate)
        this.technologies = new SolverTechnologiesOptions(serviceTemplate)
        this.scenarios = new SolverScenariosOptions(serviceTemplate)
    }
}

class SolverTopologyOptions extends BaseOptions {
    readonly min: boolean
    readonly max: boolean
    readonly optimize: boolean
    readonly unique: boolean
    readonly uniqueBackward: boolean
    readonly mode: 'weight' | 'count'

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        if (this.v1) {
            /**
             * Case: tosca_simple_yaml_1_3, tosca_variability_1_0, tosca_variability_1_0_rc_1
             */
            const optimization = this.raw.optimization_topology ?? false
            if (!check.isBoolean(optimization) && !['min', 'max'].includes(optimization)) {
                throw new Error(`Option optimization_topology must be a boolean, "min", or "max"`)
            }

            this.optimize = optimization !== false
            assert.isBoolean(this.optimize)

            this.max = optimization === 'max'
            assert.isBoolean(this.max)

            this.min = optimization === 'min' || optimization === true
            assert.isBoolean(this.min)

            this.unique = this.raw.optimization_topology_unique ?? true
            assert.isBoolean(this.unique)

            this.uniqueBackward = this.raw.optimization_topology_unique_backward ?? false
            assert.isBoolean(this.uniqueBackward)

            const mode = this.raw.optimization_topology_mode ?? 'weight'
            if (!['weight', 'count'].includes(mode)) {
                throw new Error(`Option optimization_topology_mode must be "weight" or "count"`)
            }
            this.mode = mode
        } else {
            /**
             * Case: tosca_variability_1_0_rc_2, tosca_variability_1_0_rc_3
             */
            const optimization = this.raw.optimization_topology ?? true
            if (!check.isBoolean(optimization) && !['min', 'max'].includes(optimization)) {
                throw new Error(`Option optimization_topology must be a boolean, "min", or "max"`)
            }

            this.optimize = optimization !== false
            assert.isBoolean(this.optimize)

            this.max = optimization === 'max'
            assert.isBoolean(this.max)

            this.min = optimization === 'min' || optimization === true
            assert.isBoolean(this.min)

            this.unique = this.raw.optimization_topology_unique ?? true
            assert.isBoolean(this.unique)

            this.uniqueBackward = this.raw.optimization_topology_unique_backward ?? false
            assert.isBoolean(this.uniqueBackward)

            const mode = this.raw.optimization_topology_mode ?? 'weight'
            if (!['weight', 'count'].includes(mode)) {
                throw new Error(`Option optimization_topology_mode must be "weight" or "count"`)
            }
            this.mode = mode
        }
    }
}

class SolverTechnologiesOptions extends BaseOptions {
    readonly min: boolean
    readonly max: boolean
    readonly optimize: boolean
    readonly unique: boolean
    readonly mode: 'weight' | 'count' | 'weight-count'

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        if (this.v1) {
            /**
             * Case: tosca_simple_yaml_1_3, tosca_variability_1_0, tosca_variability_1_0_rc_1
             */
            const optimization = this.raw.optimization_technologies ?? false
            if (!check.isBoolean(optimization) && !['min', 'max'].includes(optimization)) {
                throw new Error(`Option optimization_technologies must be a boolean, "min", or "max"`)
            }

            this.optimize = optimization !== false
            assert.isBoolean(this.optimize)

            this.max = optimization === 'max'
            assert.isBoolean(this.max)

            this.min = optimization === 'min' || optimization === true
            assert.isBoolean(this.min)

            this.unique = this.raw.optimization_technologies_unique ?? false
            assert.isBoolean(this.unique)

            const mode = this.raw.optimization_technologies_mode ?? 'count'
            if (!['weight', 'count'].includes(mode)) {
                throw new Error(`Option optimization_technology_mode must be "weight" or "count"`)
            }
            this.mode = mode
        } else {
            /**
             * Case: tosca_variability_1_0_rc_2, tosca_variability_1_0_rc_3
             */
            const optimization = this.raw.optimization_technologies ?? true
            if (!check.isBoolean(optimization) && !['min', 'max'].includes(optimization)) {
                throw new Error(`Option optimization_technologies must be a boolean, "min", or "max"`)
            }

            this.optimize = optimization !== false
            assert.isBoolean(this.optimize)

            this.max = optimization === 'max' || optimization === true
            assert.isBoolean(this.max)

            this.min = optimization === 'min'
            assert.isBoolean(this.min)

            this.unique = this.raw.optimization_technologies_unique ?? false
            assert.isBoolean(this.unique)

            const mode = this.raw.optimization_technologies_mode ?? 'weight-count'
            if (!['weight', 'count', 'weight-count'].includes(mode)) {
                throw new Error(`Option optimization_technology_mode must be "weight", "count", or "weight-count"`)
            }
            this.mode = mode
        }
    }
}

class SolverScenariosOptions extends BaseOptions {
    readonly optimize: boolean
    readonly unique: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        this.optimize = this.raw.optimization_scenarios ?? false
        assert.isBoolean(this.optimize)

        this.unique = this.raw.optimization_scenarios_unique ?? false
        assert.isBoolean(this.unique)
    }
}

class ConstraintsOptions extends BaseOptions {
    readonly constraints: boolean

    readonly relationSource: boolean
    readonly relationTarget: boolean
    readonly relationEnhancedImplication: boolean
    readonly artifactContainer: boolean
    readonly propertyContainer: boolean
    readonly typeContainer: boolean

    readonly requiredHosting: boolean
    readonly singleHosting: boolean

    readonly requiredTechnology: boolean

    readonly uniqueProperty: boolean
    readonly uniqueArtifact: boolean
    readonly uniqueInput: boolean
    readonly uniqueOutput: boolean
    readonly uniqueRelation: boolean
    readonly uniqueTechnology: boolean

    readonly requiredArtifact: boolean
    readonly requiredIncomingRelation: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        this.constraints = this.raw.constraints ?? false
        assert.isBoolean(this.constraints)

        this.relationSource = this.raw.relation_source_constraint ?? this.constraints
        assert.isBoolean(this.relationSource)

        this.relationTarget = this.raw.relation_target_constraint ?? this.constraints
        assert.isBoolean(this.relationTarget)

        this.relationEnhancedImplication = this.raw.relation_enhanced_implication_mode ?? true
        assert.isBoolean(this.relationEnhancedImplication)

        this.artifactContainer = this.raw.artifact_container_constraint ?? this.constraints
        assert.isBoolean(this.artifactContainer)

        this.propertyContainer = this.raw.property_container_constraint ?? this.constraints
        assert.isBoolean(this.propertyContainer)

        this.typeContainer = this.raw.type_container_constraint ?? this.constraints
        assert.isBoolean(this.typeContainer)

        if (this.v1) {
            /**
             * Case: tosca_simple_yaml_1_3, tosca_variability_1_0, tosca_variability_1_0_rc_1
             */
            this.requiredHosting = this.raw.required_hosting_constraint ?? this.constraints
            assert.isBoolean(this.requiredHosting)

            this.singleHosting = this.raw.single_hosting_constraint ?? this.constraints
            assert.isBoolean(this.singleHosting)

            this.requiredTechnology = this.raw.required_technology_constraint ?? this.constraints
            assert.isBoolean(this.requiredTechnology)

            this.uniqueProperty = this.raw.unique_property_constraint ?? this.constraints
            assert.isBoolean(this.uniqueProperty)

            this.uniqueArtifact = this.raw.unique_artifact_constraint ?? this.constraints
            assert.isBoolean(this.uniqueArtifact)

            this.uniqueInput = this.raw.unique_input_constraint ?? this.constraints
            assert.isBoolean(this.uniqueInput)

            this.uniqueOutput = this.raw.unique_output_constraint ?? this.constraints
            assert.isBoolean(this.uniqueOutput)

            this.uniqueRelation = this.raw.unique_relation_constraint ?? this.constraints
            assert.isBoolean(this.uniqueRelation)

            this.uniqueTechnology = this.raw.unique_technology_constraint ?? this.constraints
            assert.isBoolean(this.uniqueTechnology)

            this.requiredIncomingRelation = this.raw.required_incoming_relation_constraint ?? this.constraints
            assert.isBoolean(this.requiredIncomingRelation)
        } else {
            /**
             * Case: tosca_variability_1_0_rc_2, tosca_variability_1_0_rc_3
             */
            this.requiredHosting = this.raw.required_hosting_constraint ?? this.raw.constraints ?? true
            assert.isBoolean(this.requiredHosting)

            this.singleHosting = this.raw.single_hosting_constraint ?? this.constraints ?? true
            assert.isBoolean(this.singleHosting)

            this.requiredTechnology = this.raw.required_technology_constraint ?? this.raw.constraints ?? true
            assert.isBoolean(this.requiredTechnology)

            this.uniqueProperty = this.raw.unique_property_constraint ?? this.raw.constraints ?? true
            assert.isBoolean(this.uniqueProperty)

            this.uniqueArtifact = this.raw.unique_artifact_constraint ?? this.raw.constraints ?? true
            assert.isBoolean(this.uniqueArtifact)

            this.uniqueInput = this.raw.unique_input_constraint ?? this.raw.constraints ?? true
            assert.isBoolean(this.uniqueInput)

            this.uniqueOutput = this.raw.unique_output_constraint ?? this.raw.constraints ?? true
            assert.isBoolean(this.uniqueOutput)

            this.uniqueRelation = this.raw.unique_relation_constraint ?? this.raw.constraints ?? true
            assert.isBoolean(this.uniqueRelation)

            this.uniqueTechnology = this.raw.unique_technology_constraint ?? this.raw.constraints ?? true
            assert.isBoolean(this.uniqueTechnology)

            this.requiredIncomingRelation =
                this.raw.required_incoming_relation_constraint ?? this.raw.constraints ?? false
            assert.isBoolean(this.requiredIncomingRelation)
        }

        this.requiredArtifact = this.raw.required_artifact_constraint ?? this.constraints
        assert.isBoolean(this.requiredArtifact)
    }
}

export class NormalizationOptions extends BaseOptions {
    readonly automaticDefaultAlternatives: boolean

    readonly fallbackPropertyDefaultAlternative: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        this.automaticDefaultAlternatives = this.raw.automatic_default_alternatives ?? false
        assert.isBoolean(this.automaticDefaultAlternatives)

        this.fallbackPropertyDefaultAlternative =
            this.raw.fallback_property_default_alternative ?? (this.v3 ? false : true)
        assert.isBoolean(this.fallbackPropertyDefaultAlternative)
    }
}

export class EnricherOptions extends BaseOptions {
    readonly inputCondition: boolean
    readonly technologies: boolean
    readonly technologiesBestOnly: boolean
    readonly implementations: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        this.inputCondition = this.raw.enrich_input_condition ?? true
        assert.isBoolean(this.inputCondition)

        if (this.v2 || this.v3) {
            /**
             * Case: tosca_variability_1_0_rc_2, tosca_variability_1_0_rc_3
             */
            this.technologies = this.raw.enrich_technologies ?? true
            this.technologiesBestOnly = this.raw.enrich_technologies_best_only ?? true
        } else {
            /**
             * Case: tosca_simple_yaml_1_3, tosca_variability_1_0, tosca_variability_1_0_rc_1
             */
            this.technologies = this.raw.enrich_technologies ?? false
            this.technologiesBestOnly = this.raw.enrich_technologies_best_only ?? true
        }
        assert.isBoolean(this.technologies)

        this.implementations = this.raw.enrich_implementations ?? true
        assert.isBoolean(this.implementations)
    }
}

function getPruningMode(options: BaseOptions) {
    const defaultModes = {
        [TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3]: 'manual',
        [TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0]: 'manual',
        [TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0_RC_1]: 'manual',
        [TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0_RC_2]: 'semantic-loose',
        [TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0_RC_3]: 'semantic-loose',
        [TOSCA_DEFINITIONS_VERSION.TOSCA_2_0]: 'manual',
    }
    const defaultMode = defaultModes[options.serviceTemplate.tosca_definitions_version]
    assert.isDefined(defaultMode, `Default mode for "${options.serviceTemplate.tosca_definitions_version}" unknown`)

    const mode = options.raw.mode ?? defaultMode

    let map
    if (options.v3) {
        /**
         * Case: tosca_variability_1_0_rc_3
         */
        map = PruningModesV2[mode]
    } else {
        /**
         * Case: tosca_simple_yaml_1_3, tosca_variability_1_0, tosca_variability_1_0_rc_1, tosca_variability_1_0_rc_2,
         */
        map = PruningModesV1[mode]
    }
    assert.isDefined(map, `Pruning mode "${mode}" unknown`)
    return map
}

const PruningModesV1: {[mode: string]: VariabilityOptions} = {
    strict: {
        input_default_condition: false,
        input_default_consistency_condition: false,
        input_default_semantic_condition: false,

        input_pruning: false,
        input_consistency_pruning: false,
        input_semantic_pruning: false,

        output_default_condition: false,
        output_default_consistency_condition: false,
        output_default_semantic_condition: false,

        output_pruning: false,
        output_consistency_pruning: false,
        output_semantic_pruning: false,
    },
    manual: {
        input_default_condition: false,
        input_default_consistency_condition: false,
        input_default_semantic_condition: false,

        input_pruning: false,
        input_consistency_pruning: false,
        input_semantic_pruning: false,

        output_default_condition: false,
        output_default_consistency_condition: false,
        output_default_semantic_condition: false,

        output_pruning: false,
        output_consistency_pruning: false,
        output_semantic_pruning: false,
    },
    'consistent-strict': {
        input_default_condition: false,
        input_default_consistency_condition: false,
        input_default_semantic_condition: false,

        node_default_condition: true,
        node_default_consistency_condition: true,
        node_default_semantic_condition: false,

        output_default_condition: false,
        output_default_consistency_condition: false,
        output_default_semantic_condition: false,

        relation_default_condition: true,
        relation_default_consistency_condition: true,
        relation_default_semantic_condition: false,

        policy_default_condition: true,
        policy_default_consistency_condition: true,
        policy_default_semantic_condition: false,

        group_default_condition: true,
        group_default_consistency_condition: true,
        group_default_semantic_condition: false,

        artifact_default_condition: true,
        artifact_default_consistency_condition: true,
        artifact_default_semantic_condition: false,

        property_default_condition: true,
        property_default_consistency_condition: true,
        property_default_semantic_condition: false,

        type_default_condition: true,
        type_default_consistency_condition: true,
        type_default_semantic_condition: false,

        technology_default_condition: true,
        technology_default_consistency_condition: true,
        technology_default_semantic_condition: false,
    },
    'consistent-loose': {
        input_pruning: false,
        input_consistency_pruning: false,
        input_semantic_pruning: false,

        node_pruning: true,
        node_consistency_pruning: true,
        node_semantic_pruning: false,

        output_pruning: false,
        output_consistency_pruning: false,
        output_semantic_pruning: false,

        relation_pruning: true,
        relation_consistency_pruning: true,
        relation_semantic_pruning: false,

        policy_pruning: true,
        policy_consistency_pruning: true,
        policy_semantic_pruning: false,

        group_pruning: true,
        group_consistency_pruning: true,
        group_semantic_pruning: false,

        artifact_pruning: true,
        artifact_consistency_pruning: true,
        artifact_semantic_pruning: false,

        property_pruning: true,
        property_consistency_pruning: true,
        property_semantic_pruning: false,

        type_pruning: true,
        type_consistency_pruning: true,
        type_semantic_pruning: false,

        technology_pruning: true,
        technology_consistency_pruning: true,
        technology_semantic_pruning: false,
    },
    default: {
        default_condition: true,

        input_default_condition: false,
        input_default_consistency_condition: false,
        input_default_semantic_condition: false,

        input_pruning: false,
        input_consistency_pruning: false,
        input_semantic_pruning: false,

        output_default_condition: false,
        output_default_consistency_condition: false,
        output_default_semantic_condition: false,

        output_pruning: false,
        output_consistency_pruning: false,
        output_semantic_pruning: false,
    },
    'semantic-strict': {
        default_condition: true,

        input_default_condition: false,
        input_default_consistency_condition: false,
        input_default_semantic_condition: false,

        input_pruning: false,
        input_consistency_pruning: false,
        input_semantic_pruning: false,

        output_default_condition: false,
        output_default_consistency_condition: false,
        output_default_semantic_condition: false,

        output_pruning: false,
        output_consistency_pruning: false,
        output_semantic_pruning: false,

        node_pruning: true,
        node_consistency_pruning: true,
        node_semantic_pruning: false,

        relation_pruning: true,
        relation_consistency_pruning: true,
        relation_semantic_pruning: false,

        policy_pruning: true,
        policy_consistency_pruning: true,
        policy_semantic_pruning: false,

        group_pruning: true,
        group_consistency_pruning: true,
        group_semantic_pruning: false,

        artifact_pruning: true,
        artifact_consistency_pruning: true,
        artifact_semantic_pruning: false,

        property_pruning: true,
        property_consistency_pruning: true,
        property_semantic_pruning: false,

        type_pruning: true,
        type_consistency_pruning: true,
        type_semantic_pruning: false,

        technology_pruning: true,
        technology_consistency_pruning: true,
        technology_semantic_pruning: false,
    },
    'semantic-loose': {
        pruning: true,

        input_default_condition: false,
        input_default_consistency_condition: false,
        input_default_semantic_condition: false,

        input_pruning: false,
        input_consistency_pruning: false,
        input_semantic_pruning: false,

        output_default_condition: false,
        output_default_consistency_condition: false,
        output_default_semantic_condition: false,

        output_pruning: false,
        output_consistency_pruning: false,
        output_semantic_pruning: false,
    },
    loose: {
        pruning: true,

        input_default_condition: false,
        input_default_consistency_condition: false,
        input_default_semantic_condition: false,

        input_pruning: false,
        input_consistency_pruning: false,
        input_semantic_pruning: false,

        output_default_condition: false,
        output_default_consistency_condition: false,
        output_default_semantic_condition: false,

        output_pruning: false,
        output_consistency_pruning: false,
        output_semantic_pruning: false,
    },
}

const PruningModesV2: {[mode: string]: VariabilityOptions} = {
    strict: {},
    manual: {},
    'consistent-strict': {
        input_default_condition: true,
        input_default_consistency_condition: true,
        input_default_semantic_condition: false,

        node_default_condition: true,
        node_default_consistency_condition: true,
        node_default_semantic_condition: false,

        output_default_condition: true,
        output_default_consistency_condition: true,
        output_default_semantic_condition: false,

        relation_default_condition: true,
        relation_default_consistency_condition: true,
        relation_default_semantic_condition: false,

        policy_default_condition: true,
        policy_default_consistency_condition: true,
        policy_default_semantic_condition: false,

        group_default_condition: true,
        group_default_consistency_condition: true,
        group_default_semantic_condition: false,

        artifact_default_condition: true,
        artifact_default_consistency_condition: true,
        artifact_default_semantic_condition: false,

        property_default_condition: true,
        property_default_consistency_condition: true,
        property_default_semantic_condition: false,

        type_default_condition: true,
        type_default_consistency_condition: true,
        type_default_semantic_condition: false,

        technology_default_condition: true,
        technology_default_consistency_condition: true,
        technology_default_semantic_condition: false,
    },
    'consistent-loose': {
        input_pruning: true,
        input_consistency_pruning: true,
        input_semantic_pruning: false,

        node_pruning: true,
        node_consistency_pruning: true,
        node_semantic_pruning: false,

        output_pruning: true,
        output_consistency_pruning: true,
        output_semantic_pruning: false,

        relation_pruning: true,
        relation_consistency_pruning: true,
        relation_semantic_pruning: false,

        policy_pruning: true,
        policy_consistency_pruning: true,
        policy_semantic_pruning: false,

        group_pruning: true,
        group_consistency_pruning: true,
        group_semantic_pruning: false,

        artifact_pruning: true,
        artifact_consistency_pruning: true,
        artifact_semantic_pruning: false,

        property_pruning: true,
        property_consistency_pruning: true,
        property_semantic_pruning: false,

        type_pruning: true,
        type_consistency_pruning: true,
        type_semantic_pruning: false,

        technology_pruning: true,
        technology_consistency_pruning: true,
        technology_semantic_pruning: false,
    },
    default: {
        default_condition: true,
    },
    'semantic-strict': {
        default_condition: true,

        input_pruning: true,
        input_consistency_pruning: true,
        input_semantic_pruning: false,

        node_pruning: true,
        node_consistency_pruning: true,
        node_semantic_pruning: false,

        output_pruning: true,
        output_consistency_pruning: true,
        output_semantic_pruning: false,

        relation_pruning: true,
        relation_consistency_pruning: true,
        relation_semantic_pruning: false,

        policy_pruning: true,
        policy_consistency_pruning: true,
        policy_semantic_pruning: false,

        group_pruning: true,
        group_consistency_pruning: true,
        group_semantic_pruning: false,

        artifact_pruning: true,
        artifact_consistency_pruning: true,
        artifact_semantic_pruning: false,

        property_pruning: true,
        property_consistency_pruning: true,
        property_semantic_pruning: false,

        type_pruning: true,
        type_consistency_pruning: true,
        type_semantic_pruning: false,

        technology_pruning: true,
        technology_consistency_pruning: true,
        technology_semantic_pruning: false,
    },
    'semantic-loose': {
        pruning: true,
    },
    loose: {
        pruning: true,
    },
}
