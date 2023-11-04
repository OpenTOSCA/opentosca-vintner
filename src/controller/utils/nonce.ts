import * as crypto from '#crypto'
export type PasswordOptions = {}

export default async function (options: PasswordOptions) {
    return crypto.generateNonce()
}
