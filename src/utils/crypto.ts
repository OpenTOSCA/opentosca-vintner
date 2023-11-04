import crypto from 'crypto'
import * as fs from 'fs'
import {v4 as uuid4} from 'uuid'

export function checksum(data: {content: string}) {
    const hash = crypto.createHash('sha256')
    hash.update(data.content)
    return hash.digest('hex')
}

export function signatureFile(file: string) {
    return file + '.asc'
}

export async function sign(data: {file: string; key: string}): Promise<string> {
    return new Promise((resolve, reject) => {
        const signer = crypto.createSign('sha256')
        fs.createReadStream(data.file)
            .pipe(signer)
            .on('error', error => reject(error))
            .on('finish', () => resolve(signer.sign(data.key).toString('hex')))
    })
}

export async function verify(data: {file: string; key: string; signature: string}): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const verifier = crypto.createVerify('sha256')
        fs.createReadStream(data.file)
            .pipe(verifier)
            .on('error', error => reject(error))
            .on('finish', () => resolve(verifier.verify(data.key, data.signature)))
    })
}

export function generateNonce() {
    return uuid4()
}
