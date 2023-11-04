import {Key} from '#repository/keystore'

export type KeysInspectOptions = {template: string}

// TODO: but this also separately as own utils command ...

export default async function (options: KeysInspectOptions) {
    const key = new Key(options.template)
    if (key.exists()) throw new Error(`Key "${options.template}" already exists`)
    return key.generate()
}
