import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'
import {InputAssignmentMap} from '#spec/topology-template'
import * as utils from '#utils'
import * as featureIDE from '#utils/feature-ide'
import * as _ from 'lodash'
import * as process from 'process'
import Checker from './checker'
import Solver from './solver'
import Transformer from './transformer'

export default {
    resolve,
    loadInputs,
    loadPresets,
}

export type ResolveOptions = {
    template: ServiceTemplate
    presets?: string[]
    inputs?: InputAssignmentMap
}

export type ResolveResult = {
    inputs: InputAssignmentMap
    template: ServiceTemplate
}

async function resolve(options: ResolveOptions): Promise<ResolveResult> {
    if (check.isUndefined(options.presets)) options.presets = []
    if (!check.isArray(options.presets)) throw new Error(`Presets must be a list`)

    // Generate graph
    const graph = new Graph(options.template)

    // Create solver
    const solver = new Solver(graph)

    // Apply variability presets
    for (const preset of options.presets) {
        solver.setPreset(preset)
    }

    // Apply variability inputs
    solver.setInputs(options.inputs)

    // Resolve variability
    solver.run()

    // Check consistency
    new Checker(graph).run()

    // Transform to TOSCA compliant format
    new Transformer(graph).run()

    return {
        inputs: solver.getInputs(),
        template: options.template,
    }
}

async function loadInputs(file?: string) {
    const inputs = utils.getPrefixedEnv('OPENTOSCA_VINTNER_VARIABILITY_INPUT_')

    if (check.isDefined(file)) {
        if (file.endsWith('.xml')) return featureIDE.loadConfiguration(file)
        _.merge(inputs, files.loadYAML<InputAssignmentMap>(file))
    }

    return inputs
}

function loadPresets(presets: string[] = []): string[] {
    if (utils.isEmpty(presets)) {
        const entry = Object.entries(process.env).find(it => it[0] === 'OPENTOSCA_VINTNER_VARIABILITY_PRESETS')
        if (!check.isDefined(entry)) return []
        if (!check.isDefined(entry[1])) return []
        return utils.looseParse(entry[1])
    }
    return presets
}
