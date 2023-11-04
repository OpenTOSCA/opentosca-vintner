import * as check from '#check'
import {UnexpectedError} from '#utils/error'
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

export async function sign(data: {file?: string; content?: string; key: string}): Promise<string> {
    if (check.isDefined(data.file)) {
        return new Promise((resolve, reject) => {
            const signer = crypto.createSign('sha256')
            fs.createReadStream(data.file!)
                .pipe(signer)
                .on('error', error => reject(error))
                .on('finish', () => resolve(signer.sign(data.key, 'hex')))
        })
    }

    if (check.isDefined(data.content)) {
        const signer = crypto.createSign('sha256')
        signer.update(data.content)
        return signer.sign(data.key, 'hex')
    }

    throw new UnexpectedError()
}

export async function verify(data: {
    file?: string
    content?: string
    key: string
    signature: string
}): Promise<boolean> {
    if (check.isDefined(data.file)) {
        return new Promise((resolve, reject) => {
            const verifier = crypto.createVerify('rsa-sha256')
            fs.createReadStream(data.file!)
                .pipe(verifier)
                .on('error', error => reject(error))
                .on('finish', () => resolve(verifier.verify(data.key, data.signature, 'hex')))
        })
    }

    if (check.isDefined(data.content)) {
        const verifier = crypto.createVerify('sha256')
        verifier.update(data.content)
        return verifier.verify(data.key, data.signature, 'hex')
    }

    throw new UnexpectedError()
}

export function generateNonce() {
    return uuid4()
}

export function generateKey(): Promise<{public: string; private: string}> {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair(
            'rsa',
            {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem',
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                },
            },
            (error, publicKey, privateKey) => {
                if (check.isDefined(error)) return reject(error)
                return resolve({
                    public: publicKey,
                    private: privateKey,
                })
            }
        )
    })
}
