import {ServiceTemplate} from '../../specification/service-template'
import {Model} from '../../repository/model'
import {InputAssignmentMap} from '../../specification/topology-template'
import {Instance} from '../../repository/instances'
import * as files from '../../utils/files'
import {VariabilityResolver} from '../../repository/resolver'

export type TemplateResolveArguments = {
    instance?: string
    template?: string
    preset?: string
    inputs?: string
    output?: string
}

export default async function (options: TemplateResolveArguments) {
    let instance: Instance | undefined
    if (options.instance) instance = new Instance(options.instance)

    let template = options.template
    if (instance) template = instance.getVariableServiceTemplatePath()
    if (!template) throw new Error('Either instance or template must be set')

    let output = options.output
    if (instance) output = instance.generateServiceTemplatePath()
    if (!output) throw new Error('Either instance or output must be set')

    // Load service template
    const resolver = new VariabilityResolver(files.loadFile<ServiceTemplate>(template))
        .setVariabilityPreset(options.preset)
        .setVariabilityInputs(options.inputs ? files.loadFile<InputAssignmentMap>(options.inputs) : {})

    // Ensure correct TOSCA definitions version
    resolver.ensureCompatibility()

    // Resolve variability
    resolver.resolve()

    // Check consistency
    resolver.checkConsistency()

    // Transform to TOSCA compliant format
    const service = resolver.transform()
    files.storeFile(output, service)
}
