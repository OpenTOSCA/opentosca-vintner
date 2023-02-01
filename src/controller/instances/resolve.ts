import {Instance} from '#repository/instances'
import * as utils from '#utils'
import resolve from '#controller/template/resolve'

export type InstanceResolveArguments = {
    instance: string
    preset?: string
    inputs?: string
    first?: boolean
    time?: string
}

export default async function (options: InstanceResolveArguments) {
    const time = options.time || utils.getTime()
    const instance = new Instance(options.instance)

    // Store used variability inputs
    // Basically only when used in the CLI as preparation for self-adaptation
    if (options.inputs && options.first) await instance.setVariabilityInputs(options.inputs, time)
    if (options.preset && options.first) instance.setVariabilityPreset(options.preset)

    // Resolve variability
    await resolve({
        template: instance.getVariableServiceTemplate(),
        inputs: options.inputs,
        preset: options.preset,
        output: instance.generateServiceTemplatePath(time),
    })
}
