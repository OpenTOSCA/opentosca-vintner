import * as assert from '#assert'
import * as check from '#check'
import {ServiceTemplate} from '#spec/service-template'
import {
    NodeDefaultConditionMode,
    RelationDefaultConditionMode,
    ResolverModes,
    ChecksOptions as TChecksOptions,
    DefaultOptions as TDefaultOptions,
    PruningOptions as TPruningOptions,
    VariabilityOptions,
} from '#spec/variability'
import _ from 'lodash'

export class Options {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    default: DefaultOptions
    pruning: PruningOptions
    checks: ChecksOptions
    solver: SolverOptions

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}

        this.default = new DefaultOptions(serviceTemplate)
        this.pruning = new PruningOptions(serviceTemplate)
        this.checks = new ChecksOptions(serviceTemplate)
        this.solver = new SolverOptions(serviceTemplate)
    }
}

function getResolvingMode(raw: VariabilityOptions) {
    const mode = raw.mode ?? 'strict'
    const map = ResolverModes[mode]
    assert.isDefined(map, `Resolving mode "${mode}" unknown`)
    return map
}

class PruningOptions {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    pruning: boolean
    consistencyPruning: boolean
    semanticPruning: boolean

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

        const raw = serviceTemplate.topology_template?.variability?.options || {}
        this.raw = raw

        // Mode
        const mode = getResolvingMode(this.raw)

        // Base
        const base: Required<TPruningOptions> = {
            pruning: false,
            consistency_pruning: false,
            semantic_pruning: false,

            node_pruning: false,
            node_consistency_pruning: false,
            node_semantic_pruning: false,

            relation_pruning: false,
            relation_consistency_pruning: false,
            relation_semantic_pruning: false,

            policy_pruning: false,
            policy_consistency_pruning: false,
            policy_semantic_pruning: false,

            group_pruning: false,
            group_consistency_pruning: false,
            group_semantic_pruning: false,

            artifact_pruning: false,
            artifact_consistency_pruning: false,
            artifact_semantic_pruning: false,

            property_pruning: false,
            property_consistency_pruning: false,
            property_semantic_pruning: false,

            type_pruning: false,
            type_consistency_pruning: false,
            type_semantic_pruning: false,
        }

        // Moded
        const moded = propagate(base, [mode, this.raw])

        // Chain
        const chain: TPruningOptions[] = []

        // Propagate pruning
        if (check.isTrue(moded.pruning)) {
            chain.push({
                consistency_pruning: true,
                semantic_pruning: true,

                node_pruning: true,
                relation_pruning: true,
                policy_pruning: true,
                group_pruning: true,
                artifact_pruning: true,
                property_pruning: true,
                type_pruning: true,
            })
        }

        // Propagate consistency_pruning
        if (check.isTrue(moded.consistency_pruning)) {
            chain.push({
                node_consistency_pruning: true,
                relation_consistency_pruning: true,
                policy_consistency_pruning: true,
                group_consistency_pruning: true,
                artifact_consistency_pruning: true,
                property_consistency_pruning: true,
                type_consistency_pruning: true,
            })
        }

        // Propagate semantic_pruning
        if (check.isTrue(moded.semantic_pruning)) {
            chain.push({
                node_semantic_pruning: true,
                relation_semantic_pruning: true,
                policy_semantic_pruning: true,
                group_semantic_pruning: true,
                artifact_semantic_pruning: true,
                property_semantic_pruning: true,
                type_semantic_pruning: true,
            })
        }

        // Merge back original to keep overrides
        chain.push(this.raw)

        // Propagated
        const propagated = propagate(moded, chain)

        this.pruning = propagated.pruning
        this.consistencyPruning = propagated.consistency_pruning
        this.semanticPruning = propagated.semantic_pruning

        this.nodePruning = propagated.node_pruning
        this.nodeConsistencyPruning = propagated.node_consistency_pruning
        this.nodeSemanticPruning = propagated.node_semantic_pruning

        this.relationPruning = propagated.relation_pruning
        this.relationConsistencyPruning = propagated.relation_consistency_pruning
        this.relationSemanticPruning = propagated.relation_semantic_pruning

        this.policyPruning = propagated.policy_pruning
        this.policyConsistencyPruning = propagated.policy_consistency_pruning
        this.policySemanticPruning = propagated.policy_semantic_pruning

        this.groupPruning = propagated.group_pruning
        this.groupConsistencyPruning = propagated.group_consistency_pruning
        this.groupSemanticPruning = propagated.group_semantic_pruning

        this.artifactPruning = propagated.artifact_pruning
        this.artifactConsistencyPruning = propagated.artifact_consistency_pruning
        this.artifactSemanticPruning = propagated.artifact_semantic_pruning

        this.propertyPruning = propagated.property_pruning
        this.propertyConsistencyPruning = propagated.property_consistency_pruning
        this.propertySemanticPruning = propagated.property_semantic_pruning

        this.typePruning = propagated.type_pruning
        this.typeConsistencyPruning = propagated.type_consistency_pruning
        this.typeSemanticPruning = propagated.type_semantic_pruning
    }
}

class DefaultOptions {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    defaultCondition: boolean
    defaultConsistencyCondition: boolean
    defaultSemanticCondition: boolean

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

        // Mode
        const mode = getResolvingMode(this.raw)

        // Base
        const base: Required<TDefaultOptions> = {
            default_condition: false,
            default_consistency_condition: false,
            default_semantic_condition: false,

            node_default_condition: false,
            node_default_condition_mode: 'incoming-artifact',
            node_default_consistency_condition: false,
            node_default_semantic_condition: false,

            relation_default_condition: false,
            relation_default_condition_mode: 'source-target',
            relation_default_consistency_condition: false,
            relation_default_semantic_condition: false,

            policy_default_condition: false,
            policy_default_consistency_condition: false,
            policy_default_semantic_condition: false,

            group_default_condition: false,
            group_default_consistency_condition: false,
            group_default_semantic_condition: false,

            artifact_default_condition: false,
            artifact_default_consistency_condition: false,
            artifact_default_semantic_condition: false,

            property_default_condition: false,
            property_default_consistency_condition: false,
            property_default_semantic_condition: false,

            type_default_condition: false,
            type_default_consistency_condition: false,
            type_default_semantic_condition: false,
        }

        // Moded
        const moded = propagate(base, [mode, this.raw])

        // Chain
        const chain: TDefaultOptions[] = []

        // Propagate default_condition
        if (check.isTrue(moded.default_condition)) {
            chain.push({
                default_consistency_condition: true,
                default_semantic_condition: true,

                node_default_condition: true,
                relation_default_condition: true,
                policy_default_condition: true,
                group_default_condition: true,
                artifact_default_condition: true,
                property_default_condition: true,
                type_default_condition: true,
            })
        }

        // Propagate default_consistency_condition
        if (check.isTrue(moded.default_consistency_condition)) {
            chain.push({
                node_default_consistency_condition: true,
                relation_default_consistency_condition: true,
                policy_default_consistency_condition: true,
                group_default_consistency_condition: true,
                artifact_default_consistency_condition: true,
                property_default_consistency_condition: true,
                type_default_consistency_condition: true,
            })
        }

        // Propagate default_semantic_condition
        if (check.isTrue(moded.default_semantic_condition)) {
            chain.push({
                node_default_semantic_condition: true,
                relation_default_semantic_condition: true,
                policy_default_semantic_condition: true,
                group_default_semantic_condition: true,
                artifact_default_semantic_condition: true,
                property_default_semantic_condition: true,
                type_default_semantic_condition: true,
            })
        }

        // Merge back original to keep overrides
        chain.push(this.raw)

        // Propagated
        const propagated = propagate(moded, chain)

        this.defaultCondition = propagated.default_condition
        this.defaultConsistencyCondition = propagated.default_consistency_condition
        this.defaultSemanticCondition = propagated.default_semantic_condition

        this.nodeDefaultCondition = propagated.node_default_condition
        this.nodeDefaultConditionMode = propagated.node_default_condition_mode
        this.nodeDefaultConsistencyCondition = propagated.node_default_consistency_condition
        this.nodeDefaultSemanticCondition = propagated.node_default_semantic_condition

        this.relationDefaultCondition = propagated.relation_default_condition
        this.relationDefaultConditionMode = propagated.relation_default_condition_mode
        this.relationDefaultConsistencyCondition = propagated.relation_default_consistency_condition
        this.relationDefaultSemanticCondition = propagated.relation_default_semantic_condition

        this.policyDefaultCondition = propagated.policy_default_condition
        this.policyDefaultConsistencyCondition = propagated.policy_default_consistency_condition
        this.policyDefaultSemanticCondition = propagated.policy_default_semantic_condition

        this.groupDefaultCondition = propagated.group_default_condition
        this.groupDefaultConsistencyCondition = propagated.group_default_consistency_condition
        this.groupDefaultSemanticCondition = propagated.group_default_semantic_condition

        this.artifactDefaultCondition = propagated.artifact_default_condition
        this.artifactDefaultConsistencyCondition = propagated.artifact_default_consistency_condition
        this.artifactDefaultSemanticCondition = propagated.artifact_default_semantic_condition

        this.propertyDefaultCondition = propagated.property_default_condition
        this.propertyDefaultConsistencyCondition = propagated.property_default_consistency_condition
        this.propertyDefaultSemanticCondition = propagated.property_default_semantic_condition

        this.typeDefaultCondition = propagated.type_default_condition
        this.typeDefaultConsistencyCondition = propagated.type_default_consistency_condition
        this.typeDefaultSemanticCondition = propagated.type_default_semantic_condition
    }
}

class ChecksOptions {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    relationSourceConsistencyCheck: boolean
    relationTargetConsistencyCheck: boolean
    ambiguousHostingConsistencyCheck: boolean
    expectedHostingConsistencyCheck: boolean
    missingArtifactParentConsistencyCheck: boolean
    ambiguousArtifactConsistencyCheck: boolean
    missingPropertyParentConsistencyCheck: boolean
    ambiguousPropertyConsistencyCheck: boolean
    missingTypeContainerConsistencyCheck: boolean
    ambiguousTypeConsistencyCheck: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}

        this.raw.consistency_checks = this.raw.consistency_checks ?? true
        assert.isBoolean(this.raw.consistency_checks)

        const propagated = propagateOld<TChecksOptions>({
            base: {
                consistency_checks: true,
                relation_source_consistency_check: true,
                relation_target_consistency_check: true,
                ambiguous_hosting_consistency_check: true,
                expected_hosting_consistency_check: true,
                missing_artifact_parent_consistency_check: true,
                ambiguous_artifact_consistency_check: true,
                missing_property_parent_consistency_check: true,
                ambiguous_property_consistency_check: true,
                missing_type_container_consistency_check: true,
                ambiguous_type_consistency_check: true,
            },
            flag: this.raw.consistency_checks,
            options: this.raw,
        })

        this.relationSourceConsistencyCheck = propagated.relation_source_consistency_check
        this.relationTargetConsistencyCheck = propagated.relation_target_consistency_check
        this.ambiguousHostingConsistencyCheck = propagated.ambiguous_hosting_consistency_check
        this.expectedHostingConsistencyCheck = propagated.expected_hosting_consistency_check
        this.missingArtifactParentConsistencyCheck = propagated.missing_artifact_parent_consistency_check
        this.ambiguousArtifactConsistencyCheck = propagated.ambiguous_artifact_consistency_check
        this.missingPropertyParentConsistencyCheck = propagated.missing_property_parent_consistency_check
        this.ambiguousPropertyConsistencyCheck = propagated.ambiguous_property_consistency_check
        this.missingTypeContainerConsistencyCheck = propagated.missing_type_container_consistency_check
        this.ambiguousTypeConsistencyCheck = propagated.ambiguous_type_consistency_check
    }
}

class SolverOptions {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    min: boolean
    max: boolean
    enabled: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
        this.raw = serviceTemplate.topology_template?.variability?.options || {}

        const optimization = this.raw.optimization ?? 'min'
        if (check.isDefined(optimization) && !check.isBoolean(optimization) && !['min', 'max'].includes(optimization)) {
            throw new Error(`Solver option optimization "${optimization}" must be a boolean, "min", or "max"`)
        }

        this.enabled = optimization !== false
        this.max = optimization === 'max'
        this.min = optimization === true || optimization === 'min'
    }
}

function propagate<T>(base: Required<T>, chain: T[]): Required<T> {
    return _.merge(_.clone(base), ...chain.map(_.clone))
}

// TODO: remove this
function propagateOld<T>(data: {base: Required<T>; flag?: boolean; mode?: T; options: T}) {
    let result = _.clone(data.base)

    if (check.isDefined(data.mode)) result = _.merge(result, _.clone(data.mode))

    if (check.isDefined(data.flag)) {
        // @ts-ignore
        for (const key of Object.keys(data.base)) {
            // @ts-ignore
            result[key] = data.flag
        }
    }

    result = _.merge(result, _.clone(data.options))
    return result
}
