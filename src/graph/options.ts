import * as assert from '#assert'
import * as check from '#check'
import {ServiceTemplate} from '#spec/service-template'
import {
    NodeDefaultConditionMode,
    RelationDefaultConditionMode,
    ResolverModes,
    TechnologyDefaultConditionMode,
    VariabilityOptions,
} from '#spec/variability'

abstract class BaseOptions {
    protected readonly serviceTemplate: ServiceTemplate
    protected readonly raw: VariabilityOptions

    protected constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}
    }
}

export class Options extends BaseOptions {
    readonly default: DefaultOptions
    readonly pruning: PruningOptions
    readonly checks: ChecksOptions
    readonly solver: SolverOptions
    readonly constraints: ConstraintsOptions

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        this.default = new DefaultOptions(serviceTemplate)
        this.pruning = new PruningOptions(serviceTemplate)
        this.checks = new ChecksOptions(serviceTemplate)
        this.solver = new SolverOptions(serviceTemplate)
        this.constraints = new ConstraintsOptions(serviceTemplate)
    }
}

class DefaultOptions extends BaseOptions {
    readonly defaultCondition: boolean

    readonly nodeDefaultCondition: boolean
    readonly nodeDefaultConditionMode: NodeDefaultConditionMode
    readonly nodeDefaultConsistencyCondition: boolean
    readonly nodeDefaultSemanticCondition: boolean

    readonly relationDefaultCondition: boolean
    readonly relationDefaultConditionMode: RelationDefaultConditionMode
    readonly relationDefaultConsistencyCondition: boolean
    readonly relationDefaultSemanticCondition: boolean

    readonly policyDefaultCondition: boolean
    readonly policyDefaultConsistencyCondition: boolean
    readonly policyDefaultSemanticCondition: boolean

    readonly groupDefaultCondition: boolean
    readonly groupDefaultConsistencyCondition: boolean
    readonly groupDefaultSemanticCondition: boolean

    readonly artifactDefaultCondition: boolean
    readonly artifactDefaultConsistencyCondition: boolean
    readonly artifactDefaultSemanticCondition: boolean

    readonly propertyDefaultCondition: boolean
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

        const mode = getPruningMode(this.raw)

        this.defaultCondition = this.raw.default_condition ?? mode.default_condition ?? false
        assert.isBoolean(this.defaultCondition)

        this.nodeDefaultCondition =
            this.raw.node_default_condition ?? mode.node_default_condition ?? this.defaultCondition
        assert.isBoolean(this.nodeDefaultCondition)

        this.nodeDefaultConditionMode =
            this.raw.node_default_condition_mode ?? mode.node_default_condition_mode ?? 'incoming-artifact'
        assert.isString(this.nodeDefaultConditionMode)

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

        this.relationDefaultCondition =
            this.raw.relation_default_condition ?? mode.relation_default_condition ?? this.defaultCondition
        assert.isBoolean(this.relationDefaultCondition)

        this.relationDefaultConditionMode =
            this.raw.relation_default_condition_mode ?? mode.relation_default_condition_mode ?? 'source-target'
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

        this.artifactDefaultCondition =
            this.raw.artifact_default_condition ?? mode.artifact_default_condition ?? this.defaultCondition
        assert.isBoolean(this.artifactDefaultCondition)

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

        this.propertyDefaultCondition =
            this.raw.property_default_condition ?? mode.property_default_condition ?? this.defaultCondition
        assert.isBoolean(this.propertyDefaultCondition)

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

        this.technologyDefaultCondition =
            this.raw.technology_default_condition ?? mode.technology_default_condition ?? this.defaultCondition
        assert.isBoolean(this.technologyDefaultCondition)

        this.technologyDefaultConditionMode =
            this.raw.technology_default_condition_mode ?? mode.technology_default_condition_mode ?? 'container-other'
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

    readonly nodePruning: boolean
    readonly nodeConsistencyPruning: boolean
    readonly nodeSemanticPruning: boolean

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

        const mode = getPruningMode(this.raw)

        this.pruning = this.raw.pruning ?? mode.pruning ?? false
        assert.isBoolean(this.pruning)

        this.nodePruning = this.raw.node_pruning ?? mode.node_pruning ?? this.pruning
        assert.isBoolean(this.nodePruning)

        this.nodeConsistencyPruning =
            this.raw.node_consistency_pruning ?? mode.node_consistency_pruning ?? this.nodePruning
        assert.isBoolean(this.nodeConsistencyPruning)

        this.nodeSemanticPruning = this.raw.node_semantic_pruning ?? mode.node_semantic_pruning ?? this.nodePruning
        assert.isBoolean(this.nodeSemanticPruning)

        this.relationPruning = this.raw.relation_pruning ?? mode.relation_pruning ?? this.pruning
        assert.isBoolean(this.relationPruning)

        this.relationConsistencyPruning =
            this.raw.relation_consistency_pruning ?? mode.relation_consistency_pruning ?? this.relationPruning
        assert.isBoolean(this.relationConsistencyPruning)

        this.relationSemanticPruning =
            this.raw.relation_semantic_pruning ?? mode.relation_semantic_pruning ?? this.relationPruning
        assert.isBoolean(this.relationSemanticPruning)

        this.policyPruning = this.raw.policy_pruning ?? mode.policy_pruning ?? this.pruning
        assert.isBoolean(this.policyPruning)

        this.policyConsistencyPruning =
            this.raw.policy_consistency_pruning ?? mode.policy_consistency_pruning ?? this.policyPruning
        assert.isBoolean(this.policyConsistencyPruning)

        this.policySemanticPruning =
            this.raw.policy_semantic_pruning ?? mode.policy_semantic_pruning ?? this.policyPruning
        assert.isBoolean(this.policySemanticPruning)

        this.groupPruning = this.raw.group_pruning ?? mode.group_pruning ?? this.pruning
        assert.isBoolean(this.groupPruning)

        this.groupConsistencyPruning =
            this.raw.group_consistency_pruning ?? mode.group_consistency_pruning ?? this.groupPruning
        assert.isBoolean(this.groupConsistencyPruning)

        this.groupSemanticPruning = this.raw.group_semantic_pruning ?? mode.group_semantic_pruning ?? this.groupPruning
        assert.isBoolean(this.groupSemanticPruning)

        this.artifactPruning = this.raw.artifact_pruning ?? mode.artifact_pruning ?? this.pruning
        assert.isBoolean(this.artifactPruning)

        this.artifactConsistencyPruning =
            this.raw.artifact_consistency_pruning ?? mode.artifact_consistency_pruning ?? this.artifactPruning
        assert.isBoolean(this.artifactConsistencyPruning)

        this.artifactSemanticPruning =
            this.raw.artifact_semantic_pruning ?? mode.artifact_semantic_pruning ?? this.artifactPruning
        assert.isBoolean(this.artifactSemanticPruning)

        this.propertyPruning = this.raw.property_pruning ?? mode.property_pruning ?? this.pruning
        assert.isBoolean(this.propertyPruning)

        this.propertyConsistencyPruning =
            this.raw.property_consistency_pruning ?? mode.property_consistency_pruning ?? this.propertyPruning
        assert.isBoolean(this.propertyConsistencyPruning)

        this.propertySemanticPruning =
            this.raw.property_semantic_pruning ?? mode.property_semantic_pruning ?? this.propertyPruning
        assert.isBoolean(this.propertySemanticPruning)

        this.typePruning = this.raw.type_pruning ?? mode.type_pruning ?? this.pruning
        assert.isBoolean(this.typePruning)

        this.typeConsistencyPruning =
            this.raw.type_consistency_pruning ?? mode.type_consistency_pruning ?? this.typePruning
        assert.isBoolean(this.typeConsistencyPruning)

        this.typeSemanticPruning = this.raw.type_semantic_pruning ?? mode.type_semantic_pruning ?? this.typePruning
        assert.isBoolean(this.typeSemanticPruning)

        this.technologyPruning = this.raw.technology_pruning ?? mode.technology_pruning ?? this.pruning
        assert.isBoolean(this.technologyPruning)

        this.technologyConsistencyPruning =
            this.raw.technology_consistency_pruning ?? mode.technology_consistency_pruning ?? this.technologyPruning
        assert.isBoolean(this.technologyConsistencyPruning)

        this.technologySemanticPruning =
            this.raw.technology_semantic_pruning ?? mode.technology_semantic_pruning ?? this.typePruning
        assert.isBoolean(this.technologySemanticPruning)
    }
}

class ChecksOptions extends BaseOptions {
    readonly checks: boolean

    readonly consistency: boolean
    readonly relationSource: boolean
    readonly relationTarget: boolean

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

    readonly persistent: boolean

    readonly expectedTechnology: boolean
    readonly missingTechnologyContainer: boolean
    readonly ambiguousTechnology: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        this.checks = this.raw.checks ?? true
        assert.isBoolean(this.checks)

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

        this.persistent = this.raw.persistent_check ?? this.checks
        assert.isBoolean(this.persistent)

        this.expectedTechnology = this.raw.expected_technology_check ?? this.semantic
        assert.isBoolean(this.expectedTechnology)

        this.missingTechnologyContainer = this.raw.missing_technology_container_check ?? this.consistency
        assert.isBoolean(this.missingTechnologyContainer)

        this.ambiguousTechnology = this.raw.ambiguous_technology_check ?? this.consistency
        assert.isBoolean(this.ambiguousTechnology)
    }
}

class SolverOptions extends BaseOptions {
    readonly topology: SolverTopologyOptions
    readonly technologies: SolverTechnologyOptions

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        this.topology = new SolverTopologyOptions(serviceTemplate)
        this.technologies = new SolverTechnologyOptions(serviceTemplate)
    }
}

class SolverTopologyOptions extends BaseOptions {
    readonly min: boolean
    readonly max: boolean
    readonly optimize: boolean
    readonly unique: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        const optimization = this.raw.optimization ?? false
        if (!check.isBoolean(optimization) && !['min', 'max'].includes(optimization)) {
            throw new Error(`Solver option optimization "${optimization}" must be a boolean, "min", or "max"`)
        }

        this.optimize = optimization !== false
        this.max = optimization === 'max'
        this.min = optimization === 'min' || optimization === true

        // TODO: count vs weight

        this.unique = this.raw.unique ?? true
        assert.isBoolean(this.unique)
    }
}

class SolverTechnologyOptions extends BaseOptions {
    readonly min: boolean
    readonly max: boolean
    readonly optimize: boolean
    readonly unique: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        // TODO: count vs weight

        this.min = true
        this.max = false

        this.optimize = this.raw.optimization_technologies ?? false
        assert.isBoolean(this.optimize)

        this.unique = this.raw.optimization_technologies_unique ?? false
        assert.isBoolean(this.unique)
    }
}

class ConstraintsOptions extends BaseOptions {
    readonly constraints: boolean

    readonly relationSource: boolean
    readonly relationTarget: boolean
    readonly artifactContainer: boolean
    readonly propertyContainer: boolean
    readonly typeContainer: boolean
    readonly hostingStack: boolean
    readonly technology: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        super(serviceTemplate)

        // TODO: set this by default to true (check backwards compatibility first)
        this.constraints = this.raw.constraints ?? false
        assert.isBoolean(this.constraints)

        this.relationSource = this.raw.relation_source_constraint ?? this.constraints
        assert.isBoolean(this.relationSource)

        this.relationTarget = this.raw.relation_target_constraint ?? this.constraints
        assert.isBoolean(this.relationTarget)

        this.artifactContainer = this.raw.artifact_container_constraint ?? this.constraints
        assert.isBoolean(this.artifactContainer)

        this.propertyContainer = this.raw.property_container_constraint ?? this.constraints
        assert.isBoolean(this.propertyContainer)

        this.typeContainer = this.raw.type_container_constraint ?? this.constraints
        assert.isBoolean(this.typeContainer)

        this.hostingStack = this.raw.hosting_stack_constraint ?? this.constraints
        assert.isBoolean(this.hostingStack)

        this.technology = this.raw.technology_constraint ?? this.constraints
        assert.isBoolean(this.technology)
    }
}

function getPruningMode(raw: VariabilityOptions) {
    const mode = raw.mode ?? 'manual'
    const map = ResolverModes[mode]
    assert.isDefined(map, `Pruning mode "${mode}" unknown`)
    return map
}
