import crypto from 'crypto'
import {v4 as uuid4} from 'uuid'

export function checksum(content: string) {
    const hash = crypto.createHash('sha256')
    hash.update(content)
    return hash.digest('hex')
}

export function generateNonce() {
    return uuid4()
}
