import * as validator from '#validator'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import * as featureIDE from '#utils/feature-ide'
import {InputAssignmentMap} from '#spec/topology-template'
import {Graph} from '#/resolver/graph'
import {check} from '#/resolver/check'
import {transform} from '#/resolver/transform'
import {Solver} from '#resolver/solver'

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

    // Load service template
    const solver = new Solver(graph, options.template.topology_template?.variability)

    // Apply variability presets
    for (const preset of options.presets) {
        solver.setVariabilityPreset(preset)
    }

    // Apply variability inputs
    solver.setVariabilityInputs(options.inputs)

    // Resolve variability
    solver.run()

    // Check consistency
    check(graph, options.template.topology_template?.variability?.options)

    // Transform to TOSCA compliant format
    transform(graph, solver)

    return {
        inputs: solver.getVariabilityInputs(),
        template: options.template,
    }
}

async function loadInputs(file?: string) {
    if (validator.isUndefined(file)) return {}
    if (file.endsWith('.xml')) return featureIDE.loadConfiguration(file)
    return files.loadYAML<InputAssignmentMap>(file)
}
