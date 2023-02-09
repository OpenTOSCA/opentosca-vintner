import {Instance} from '#repository/instances'
import * as utils from '#utils'
import resolve from '#controller/template/resolve'
import {InputAssignmentMap} from '#spec/topology-template'

export type InstanceResolveOptions = {
    instance: string
    preset?: string
    inputs?: string | InputAssignmentMap
    time?: string
}

export default async function (options: InstanceResolveOptions) {
    const time = options.time || utils.getTime()
    const instance = new Instance(options.instance)

    // Resolve variability
    await resolve({
        template: instance.getVariableServiceTemplate(),
        inputs: options.inputs,
        preset: options.preset,
        output: instance.generateServiceTemplatePath(time),
    })

    // Store used variability inputs
    // Basically only when used in the CLI as preparation for self-adaptation
    await instance.setVariabilityInputs(options.inputs || {}, time)
    if (options.preset) instance.setVariabilityPreset(options.preset)
    // Note, variability-resolved service template is stored inside resolve function
}
