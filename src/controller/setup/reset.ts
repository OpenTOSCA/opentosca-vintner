import Controller from '#controller'

export type SetupResetOptions = {force: Boolean}

export default async function (options: SetupResetOptions) {
    await Controller.setup.clean(options)
    await Controller.setup.init()
}
