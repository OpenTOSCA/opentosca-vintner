import * as assert from '#assert'
import * as check from '#check'
import {ServiceTemplate} from '#spec/service-template'
import {ConsistencyOptions, DefaultOptions, PruningOptions, ResolverModes, VariabilityOptions} from '#spec/variability'
import _ from 'lodash'

export class Options {
    private readonly serviceTemplate: ServiceTemplate
    private readonly raw: VariabilityOptions

    default: DefaultOptions
    pruning: PruningOptions
    consistency: ConsistencyCheckOptions
    solver: SolverOptions

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate

        const raw = serviceTemplate.topology_template?.variability?.options || {}
        this.raw = raw

        this.solver = new SolverOptions(serviceTemplate)
        this.consistency = new ConsistencyCheckOptions(serviceTemplate)

        // Get resolver mode
        const mode = raw.mode ?? 'strict'
        const map = ResolverModes[mode]
        if (check.isUndefined(map)) throw new Error(`Resolving mode "${mode}" unknown`)

        // Build default options
        this.default = propagate<DefaultOptions>({
            base: ResolverModes.base.default,
            mode: map.default,
            flag: raw.default_condition,
            options: raw,
        })

        // Build pruning options
        this.pruning = propagate<PruningOptions>({
            base: ResolverModes.base.pruning,
            mode: map.pruning,
            flag: raw.pruning,
            options: raw,
        })
    }
}

class ConsistencyCheckOptions {
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

        const raw = serviceTemplate.topology_template?.variability?.options || {}
        this.raw = raw

        raw.consistency_checks = raw.consistency_checks ?? true
        assert.isBoolean(raw.consistency_checks)

        const propagated = propagate<ConsistencyOptions>({
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
            flag: raw.consistency_checks,
            options: raw,
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

        const raw = serviceTemplate.topology_template?.variability?.options || {}
        this.raw = raw

        const optimization = raw.optimization ?? 'min'
        if (check.isDefined(optimization) && !check.isBoolean(optimization) && !['min', 'max'].includes(optimization)) {
            throw new Error(`Solver option optimization "${optimization}" must be a boolean, "min", or "max"`)
        }

        this.enabled = optimization !== false
        this.max = optimization === 'max'
        this.min = optimization === true || optimization === 'min'
    }
}

function propagate<T>(data: {base: Required<T>; flag?: boolean; mode?: T; options: T}) {
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
