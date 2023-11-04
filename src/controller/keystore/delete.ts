import {Key} from '#repository/keystore'

export type KeysDeleteOptions = {key: string}

export default async function (options: KeysDeleteOptions) {
    const key = new Key(options.key)
    await key.delete()
}
