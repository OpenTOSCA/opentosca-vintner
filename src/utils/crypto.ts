import crypto from 'crypto'

export function checksum(content: string) {
    const hash = crypto.createHash('sha256')
    hash.update(content)
    return hash.digest('hex')
}
