import * as files from '#files'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'
import {InputAssignmentMap} from '#spec/topology-template'
import * as featureIDE from '#utils/feature-ide'
import * as validator from '#validator'
import Checker from './checker'
import Solver from './solver'
import Transformer from './transformer'

export default {
    resolve,
    loadInputs,
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
    if (validator.isUndefined(options.presets)) options.presets = []
    if (!validator.isArray(options.presets)) throw new Error(`Presets must be a list`)

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
    if (validator.isUndefined(file)) return {}
    if (file.endsWith('.xml')) return featureIDE.loadConfiguration(file)
    return files.loadYAML<InputAssignmentMap>(file)
}
