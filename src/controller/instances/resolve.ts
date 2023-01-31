import {Instance} from '#repository/instances'
import * as utils from '#utils'
import resolve from '#controller/template/resolve'
import * as files from '#files'

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
    // TODO: handle xml
    if (options.inputs && options.first) files.copy(options.inputs, instance.getVariabilityInputs(time))

    // Resolve variability
    await resolve({
        template: instance.getVariableServiceTemplate(),
        inputs: options.inputs,
        preset: options.preset,
        output: instance.generateServiceTemplatePath(time),
    })
}
