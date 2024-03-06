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

// TODO: rename this
export async function optimize(options: ResolveOptions) {
    /**
     * Graph
     */
    const {graph, inputs} = await load(options)

    /**
     * Resolver
     */
    return new Resolver(graph, inputs).optimize()
}

async function load(options: ResolveOptions) {
    if (check.isUndefined(options.presets)) options.presets = []
    if (!check.isArray(options.presets)) throw new Error(`Presets must be a list`)

    /**
     * Service template
     */
    // TODO: where to load? inside enricher?
    if (check.isString(options.template)) options.template = await new Loader(options.template).load()

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
     * Graph
     */
    const graph = new Graph(options.template)

    return {graph, inputs: inputs.inputs}
}
