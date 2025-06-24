import Controller from '#controller'

export type SetupResetOptions = {force: boolean}

export default async function (options: SetupResetOptions) {
    await Controller.setup.clean(options)
    await Controller.setup.init()
}
