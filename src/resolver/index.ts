import * as assert from '#assert'
import * as check from '#check'
import Enricher from '#enricher'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import Inputs from '#resolver/inputs'
import Resolver from '#resolver/resolver'
import {ServiceTemplate} from '#spec/service-template'
import {InputAssignmentMap} from '#spec/topology-template'
import {InputAssignmentPreset} from '#spec/variability'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'

export type ResolveOptions = {
    template: ServiceTemplate | string
    presets?: string[]
    inputs?: InputAssignmentMap | string
}

export type ResolveResult = {
    inputs: InputAssignmentMap
    template: ServiceTemplate
}

export async function run(options: ResolveOptions): Promise<ResolveResult> {
    /**
     * Graph
     */
    const {graph, inputs} = await load(options)

    /**
     * Resolver
     */
    new Resolver(graph, inputs).run()

    return {
        inputs: inputs,
        template: graph.serviceTemplate,
    }
}

export async function minMaxQuality(options: ResolveOptions) {
    /**
     * Graph (for checking options)
     */
    const {graph} = await load(utils.copy(options))

    /**
     * Quality
     *
     * Get the result with the quality of all results (min or max is not overridden)
     */
    if (graph.options.solver.technologies.optimize && graph.options.solver.technologies.mode === 'weight') {
        const loaded = await load(utils.copy(options))
        const optimized = new Resolver(loaded.graph, loaded.inputs).optimize()
        if (optimized.length !== 1) throw new Error(`Did not return correct quality`)
        return utils.first(optimized).quality.average
    }

    /**
     * Counting
     *
     * Get the min and max quality of the results which have the min number of technologies
     */
    if (graph.options.solver.technologies.optimize && graph.options.solver.technologies.mode === 'count') {
        const loaded = await load(utils.copy(options), {
            topology_template: {
                variability: {
                    options: {
                        optimization_technologies: 'min',
                    },
                },
            },
        })
        const all = new Resolver(loaded.graph, loaded.inputs).optimize({all: true})

        const min = Math.min(...all.map(it => it.technologies.count))
        const candidates = all.filter(it => it.technologies.count === min)
        return {
            min: utils.first(candidates).quality.average,
            max: utils.last(candidates).quality.average,
        }
    }

    /**
     * Random
     *
     * Get the min and max quality of all results
     */
    if (!graph.options.solver.technologies.optimize) {
        /**
         * Min
         */
        const minLoad = await load(utils.copy(options), {
            topology_template: {
                variability: {
                    options: {
                        optimization_technologies: 'min',
                    },
                },
            },
        })
        const min = new Resolver(minLoad.graph, minLoad.inputs).optimize()
        if (min.length !== 1) throw new Error(`Did not return correct quality`)

        /**
         * Max
         */
        const maxLoad = await load(utils.copy(options), {
            topology_template: {
                variability: {
                    options: {
                        optimization_technologies: 'max',
                    },
                },
            },
        })
        const max = new Resolver(maxLoad.graph, maxLoad.inputs).optimize()
        if (max.length !== 1) throw new Error(`Did not return correct quality`)

        return {min: utils.first(min).quality.average, max: utils.first(max).quality.average}
    }

    /**
     * Sanity check
     */
    throw new UnexpectedError()
}

async function load(options: ResolveOptions, override?: Partial<ServiceTemplate>) {
    if (check.isUndefined(options.presets)) options.presets = []
    if (!check.isArray(options.presets)) throw new Error(`Presets must be a list`)

    /**
     * Service template
     */
    // TODO: where to load? inside enricher?
    if (check.isString(options.template)) options.template = await new Loader(options.template, override).load()

    /**
     * Enricher
     */
    await new Enricher(options.template).run()

    /**
     * Inputs
     */
    const inputs = new Inputs()

    /**
     * Variability presets
     */
    options.presets = inputs.loadPresets(options.presets)
    for (const preset of options.presets) {
        const set: InputAssignmentPreset | undefined = (options.template.topology_template?.variability?.presets || {})[
            preset
        ]
        assert.isDefined(set, `Did not find variability preset "${preset}"`)
        inputs.setInputs(set.inputs)
    }

    /**
     * Variability inputs
     */
    if (check.isString(options.inputs)) {
        options.inputs = await inputs.loadInputs(options.inputs)
    }
    inputs.setInputs(options.inputs)

    /**
     * Hotfix
     */
    hotfixPersistentCheck(options.template)

    /**
     * Graph
     */
    const graph = new Graph(options.template)

    return {graph, inputs: inputs.inputs}
}

/**
 * TODO: Hotfix Persistent Check
 *  rc2 sets "incomingnaive-artifact-host"
 *  this triggers the persistent component check
 *  however, this check is only relevant during enriching
 *  also cannot set version to rc1 since we require, e.g., the rc2 optimization defaults
 */
export function hotfixPersistentCheck(template: ServiceTemplate) {
    if (check.isDefined(template.topology_template)) {
        if (check.isUndefined(template.topology_template.variability)) {
            template.topology_template.variability = {}
        }

        if (check.isUndefined(template.topology_template.variability.options)) {
            template.topology_template.variability.options = {}
        }

        template.topology_template.variability.options.persistent_check = false
    }
}
