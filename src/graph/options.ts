import * as check from '#check'
import {ServiceTemplate} from '#spec/service-template'
import {ConsistencyOptions, DefaultOptions, PruningOptions, ResolverModes, VariabilityOptions} from '#spec/variability'
import _ from 'lodash'

export class Options {
    serviceTemplate: ServiceTemplate
    raw: VariabilityOptions

    default: DefaultOptions
    pruning: PruningOptions
    consistency: ConsistencyOptions
    solver: SolverOptions

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate

        const raw = serviceTemplate.topology_template?.variability?.options || {}
        this.raw = raw

        this.solver = new SolverOptions(serviceTemplate)

        // Get resolver mode
        const mode = raw.mode ?? 'strict'
        const map = ResolverModes[mode]
        if (check.isUndefined(map)) throw new Error(`Resolving mode "${mode}" unknown`)

        // Build default options
        this.default = propagateOptions<DefaultOptions>({
            base: ResolverModes.base.default,
            mode: map.default,
            flag: raw.default_condition,
            options: raw,
        })

        // Build pruning options
        this.pruning = propagateOptions<PruningOptions>({
            base: ResolverModes.base.pruning,
            mode: map.pruning,
            flag: raw.pruning,
            options: raw,
        })

        // Build consistency options
        this.consistency = propagateOptions<ConsistencyOptions>({
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
    }
}

class SolverOptions {
    serviceTemplate: ServiceTemplate
    raw: VariabilityOptions

    isMin: boolean
    isMax: boolean
    isEnabled: boolean

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate

        const raw = serviceTemplate.topology_template?.variability?.options || {}
        this.raw = raw

        // Build optimization options
        const optimization = raw.optimization ?? 'min'
        if (check.isDefined(optimization) && !check.isBoolean(optimization) && !['min', 'max'].includes(optimization)) {
            throw new Error(`Solver option optimization "${optimization}" must be a boolean, "min", or "max"`)
        }

        this.isEnabled = optimization !== false
        this.isMax = optimization === 'max'
        this.isMin = optimization === true || optimization === 'min'
    }
}

function propagateOptions<T>(data: {base: T; flag?: boolean; mode?: T; options: T}) {
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
