import * as assert from '#assert'
import * as check from '#check'
import {ServiceTemplate} from '#spec/service-template'
import {
    NodeDefaultConditionMode,
    RelationDefaultConditionMode,
    ResolverModes,
    VariabilityOptions,
} from '#spec/variability'

export class Options {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    default: DefaultOptions
    pruning: PruningOptions
    checks: ChecksOptions
    solver: SolverOptions
    constraints: ConstraintsOptions

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}

        this.default = new DefaultOptions(serviceTemplate)
        this.pruning = new PruningOptions(serviceTemplate)
        this.checks = new ChecksOptions(serviceTemplate)
        this.solver = new SolverOptions(serviceTemplate)
        this.constraints = new ConstraintsOptions(serviceTemplate)
    }
}

class DefaultOptions {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    defaultCondition: boolean

    nodeDefaultCondition: boolean
    nodeDefaultConditionMode: NodeDefaultConditionMode
    nodeDefaultConsistencyCondition: boolean
    nodeDefaultSemanticCondition: boolean

    relationDefaultCondition: boolean
    relationDefaultConditionMode: RelationDefaultConditionMode
    relationDefaultConsistencyCondition: boolean
    relationDefaultSemanticCondition: boolean

    policyDefaultCondition: boolean
    policyDefaultConsistencyCondition: boolean
    policyDefaultSemanticCondition: boolean

    groupDefaultCondition: boolean
    groupDefaultConsistencyCondition: boolean
    groupDefaultSemanticCondition: boolean

    artifactDefaultCondition: boolean
    artifactDefaultConsistencyCondition: boolean
    artifactDefaultSemanticCondition: boolean

    propertyDefaultCondition: boolean
    propertyDefaultConsistencyCondition: boolean
    propertyDefaultSemanticCondition: boolean

    typeDefaultCondition: boolean
    typeDefaultConsistencyCondition: boolean
    typeDefaultSemanticCondition: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}

        const mode = getResolvingMode(this.raw)

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
    }
}

class PruningOptions {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    pruning: boolean

    nodePruning: boolean
    nodeConsistencyPruning: boolean
    nodeSemanticPruning: boolean

    relationPruning: boolean
    relationConsistencyPruning: boolean
    relationSemanticPruning: boolean

    policyPruning: boolean
    policyConsistencyPruning: boolean
    policySemanticPruning: boolean

    groupPruning: boolean
    groupConsistencyPruning: boolean
    groupSemanticPruning: boolean

    artifactPruning: boolean
    artifactConsistencyPruning: boolean
    artifactSemanticPruning: boolean

    propertyPruning: boolean
    propertyConsistencyPruning: boolean
    propertySemanticPruning: boolean

    typePruning: boolean
    typeConsistencyPruning: boolean
    typeSemanticPruning: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}

        const mode = getResolvingMode(this.raw)

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
    }
}

class ChecksOptions {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    checks: boolean

    consistencyChecks: boolean
    relationSourceConsistencyCheck: boolean
    relationTargetConsistencyCheck: boolean
    ambiguousHostingConsistencyCheck: boolean
    missingArtifactContainerConsistencyCheck: boolean
    ambiguousArtifactConsistencyCheck: boolean
    missingPropertyContainerConsistencyCheck: boolean
    ambiguousPropertyConsistencyCheck: boolean
    missingTypeContainerConsistencyCheck: boolean
    ambiguousTypeConsistencyCheck: boolean

    semanticChecks: boolean
    expectedHostingSemanticCheck: boolean
    expectedIncomingRelationSemanticCheck: boolean
    expectedArtifactSemanticCheck: boolean

    consumedCheck: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}

        this.checks = this.raw.checks ?? true
        assert.isBoolean(this.checks)

        this.consistencyChecks = this.raw.consistency_checks ?? this.checks
        assert.isBoolean(this.consistencyChecks)

        this.relationSourceConsistencyCheck = this.raw.relation_source_consistency_check ?? this.consistencyChecks
        assert.isBoolean(this.relationSourceConsistencyCheck)

        this.relationTargetConsistencyCheck = this.raw.relation_target_consistency_check ?? this.consistencyChecks
        assert.isBoolean(this.relationTargetConsistencyCheck)

        this.ambiguousHostingConsistencyCheck = this.raw.ambiguous_hosting_consistency_check ?? this.consistencyChecks
        assert.isBoolean(this.ambiguousHostingConsistencyCheck)

        this.missingArtifactContainerConsistencyCheck =
            this.raw.missing_artifact_container_consistency_check ?? this.consistencyChecks
        assert.isBoolean(this.missingArtifactContainerConsistencyCheck)

        this.ambiguousArtifactConsistencyCheck = this.raw.ambiguous_artifact_consistency_check ?? this.consistencyChecks
        assert.isBoolean(this.ambiguousArtifactConsistencyCheck)

        this.missingPropertyContainerConsistencyCheck =
            this.raw.missing_property_container_consistency_check ?? this.consistencyChecks
        assert.isBoolean(this.missingPropertyContainerConsistencyCheck)

        this.ambiguousPropertyConsistencyCheck = this.raw.ambiguous_property_consistency_check ?? this.consistencyChecks
        assert.isBoolean(this.ambiguousPropertyConsistencyCheck)

        this.missingTypeContainerConsistencyCheck =
            this.raw.missing_type_container_consistency_check ?? this.consistencyChecks
        assert.isBoolean(this.missingTypeContainerConsistencyCheck)

        this.ambiguousTypeConsistencyCheck = this.raw.ambiguous_type_consistency_check ?? this.consistencyChecks
        assert.isBoolean(this.ambiguousTypeConsistencyCheck)

        this.semanticChecks = this.raw.semantic_checks ?? this.checks
        assert.isBoolean(this.semanticChecks)

        this.expectedHostingSemanticCheck = this.raw.expected_hosting_semantic_check ?? this.semanticChecks
        assert.isBoolean(this.expectedHostingSemanticCheck)

        this.expectedIncomingRelationSemanticCheck =
            this.raw.expected_incoming_relation_semantic_check ?? this.semanticChecks
        assert.isBoolean(this.expectedIncomingRelationSemanticCheck)

        this.expectedArtifactSemanticCheck = this.raw.expected_artifact_semantic_check ?? this.semanticChecks
        assert.isBoolean(this.expectedArtifactSemanticCheck)

        this.consumedCheck = this.raw.consumed_check ?? this.checks
        assert.isBoolean(this.consumedCheck)
    }
}

class SolverOptions {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    min: boolean
    max: boolean
    optimize: boolean
    unique: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}

        const optimization = this.raw.optimization ?? 'min'
        if (!check.isBoolean(optimization) && !['min', 'max'].includes(optimization)) {
            throw new Error(`Solver option optimization "${optimization}" must be a boolean, "min", or "max"`)
        }

        this.optimize = optimization !== false
        this.max = optimization === 'max'
        this.min = optimization === 'min' || optimization === true

        this.unique = this.raw.unique ?? true
        assert.isBoolean(this.unique)
    }
}

class ConstraintsOptions {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    constraints: boolean

    relationSourceConstraint: boolean
    relationTargetConstraint: boolean
    artifactContainerConstraint: boolean
    propertyContainerConstraint: boolean
    typeContainerConstraint: boolean
    hostingStackConstraint: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}

        // TODO: set this by default to true (check backwards compatibility first)
        this.constraints = this.raw.constraints ?? false
        assert.isBoolean(this.constraints)

        this.relationSourceConstraint = this.raw.relation_source_constraint ?? this.constraints
        assert.isBoolean(this.relationSourceConstraint)

        this.relationTargetConstraint = this.raw.relation_target_constraint ?? this.constraints
        assert.isBoolean(this.relationTargetConstraint)

        this.artifactContainerConstraint = this.raw.artifact_container_constraint ?? this.constraints
        assert.isBoolean(this.artifactContainerConstraint)

        this.propertyContainerConstraint = this.raw.property_container_constraint ?? this.constraints
        assert.isBoolean(this.propertyContainerConstraint)

        this.typeContainerConstraint = this.raw.type_container_constraint ?? this.constraints
        assert.isBoolean(this.typeContainerConstraint)

        this.hostingStackConstraint = this.raw.hosting_stack_constraint ?? this.raw.constraints ?? true
        assert.isBoolean(this.hostingStackConstraint)
    }
}

function getResolvingMode(raw: VariabilityOptions) {
    const mode = raw.mode ?? 'strict'
    const map = ResolverModes[mode]
    assert.isDefined(map, `Resolving mode "${mode}" unknown`)
    return map
}
