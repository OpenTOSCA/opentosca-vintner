import * as assert from '#assert'
import * as check from '#check'
import {PERFORMANCE_RESOLVER_READ} from '#controller/study/performance'
import Enricher from '#enricher'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import Inputs from '#resolver/inputs'
import Resolver from '#resolver/resolver'
import {ServiceTemplate} from '#spec/service-template'
import {InputAssignmentMap} from '#spec/topology-template'
import {InputAssignmentPreset} from '#spec/variability'
import performance from '#utils/performance'

export type ResolveOptions = {
    template: ServiceTemplate | string
    presets?: string[]
    inputs?: InputAssignmentMap | string
    enrich: boolean
    edmm?: boolean
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
    new Resolver(graph, inputs).run({edmm: options.edmm})

    return {
        inputs: inputs,
        template: graph.serviceTemplate,
    }
}

export async function load(options: ResolveOptions, override?: Partial<ServiceTemplate>) {
    if (check.isUndefined(options.presets)) options.presets = []
    if (!check.isArray(options.presets)) throw new Error(`Presets must be a list`)

    /**
     * Service template
     */
    // TODO: where to load? inside enricher?
    if (check.isString(options.template)) {
        performance.start(PERFORMANCE_RESOLVER_READ)
        options.template = await new Loader(options.template, override).load()
        performance.stop(PERFORMANCE_RESOLVER_READ)
    }

    /**
     * Enricher
     */
    // TODO: maybe enriching should not happen here ...
    if (options.enrich) await new Enricher(options.template, {cleanTypes: false}).run()

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
    hotfixBratans(options.template)

    /**
     * Graph
     */
    const graph = new Graph(options.template)

    return {graph, inputs: inputs.inputs}
}

/**
 * TODO: Hotfix Bratans Unknown
 *  the populator will add new undefined default alternatives
 *  but the solver does not know this concept
 *  default alternatives are handeled by the enricher
 *  hence multiple properties with no conditions assigned are possible which results in UNSAT
 */
export function hotfixBratans(template: ServiceTemplate) {
    if (check.isDefined(template.topology_template)) {
        if (check.isUndefined(template.topology_template.variability)) {
            template.topology_template.variability = {}
        }

        if (check.isUndefined(template.topology_template.variability.options)) {
            template.topology_template.variability.options = {}
        }

        template.topology_template.variability.options.bratans_unknown = true
    }
}
