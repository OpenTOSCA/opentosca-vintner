import * as crypto from '#crypto'

export type NonceOptions = {}

export default async function (options: NonceOptions) {
    return crypto.generateNonce()
}
