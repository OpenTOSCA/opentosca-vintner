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
     * TODO: Hotfix:
     *  rc2 sets "incomingnaive-aritfact-host"
     *  this triggers the persistent component check
     *  however, this check is only relevant during enriching
     *  also can not set version to rc1 since we require, e.g., the rc2 optimization defaults
     */
    if (check.isDefined(options.template.topology_template)) {
        if (check.isUndefined(options.template.topology_template.variability)) {
            options.template.topology_template.variability = {}
        }

        if (check.isUndefined(options.template.topology_template.variability.options)) {
            options.template.topology_template.variability.options = {}
        }

        options.template.topology_template.variability.options.persistent_check = false
    }

    /**
     * Graph
     */
    const graph = new Graph(options.template)

    /**
     * Resolver
     */
    new Resolver(graph, inputs.inputs).run()

    return {
        inputs: inputs.inputs,
        template: options.template,
    }
}
