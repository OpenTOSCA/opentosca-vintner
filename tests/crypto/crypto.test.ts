import Controller from '#controller'
import * as files from '#files'
import {expect} from 'chai'
import * as fs from 'fs'
import http from 'http'
import {AddressInfo} from 'net'
import path from 'path'

const template = path.join(__dirname, 'csar.zip')
const key = {
    private: path.join(__dirname, 'private.pem'),
    public: path.join(__dirname, 'public.pem'),
}

describe('crypto', () => {
    it('sign-verify', async () => {
        const signature = files.temporaryDirent()

        await Controller.template.sign({
            template,
            key: key.private,
            output: signature,
        })

        await Controller.template.verify({
            template,
            key: key.public,
            signature,
        })

        files.removeFile(signature)
    })

    it('import', async () => {
        await Controller.setup.reset({force: true})

        await Controller.assets.import({name: 'public', file: key.public})
        await Controller.templates.import({
            template: 'template',
            path: template,
            key: 'public',
        })
    })
})

describe('crypto: import link', () => {
    let server: http.Server
    let base: string
    const served: {[path: string]: string} = {}

    before(async () => {
        await Controller.setup.reset({force: true})
        await Controller.assets.import({name: 'public', file: key.public})

        // Archive
        const source = files.temporaryDirent()
        files.createDirectory(source)
        files.storeFile(path.join(source, 'variable-service-template.yaml'), 'tosca_definitions_version: tosca_v2_0')
        served['/csar.zip'] = files.temporaryDirent()
        await files.createArchive(source, served['/csar.zip'])

        // Valid signature
        served['/csar.zip.asc'] = files.temporaryDirent()
        await Controller.template.sign({
            template: served['/csar.zip'],
            key: key.private,
            output: served['/csar.zip.asc'],
        })

        // Archive which does not match the signature
        served['/tampered.zip'] = files.temporaryDirent()
        files.storeFile(path.join(source, 'variable-service-template.yaml'), 'tampered')
        await files.createArchive(source, served['/tampered.zip'])
        served['/tampered.zip.asc'] = served['/csar.zip.asc']

        served['/unsigned.zip'] = served['/csar.zip']

        server = http.createServer((req, res) => {
            const file = served[req.url!]
            if (file === undefined) {
                res.statusCode = 404
                return res.end()
            }
            fs.createReadStream(file).pipe(res)
        })
        await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
        base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    })

    after(() => server.close())

    it('valid signature', async () => {
        await Controller.templates.import({template: 'link-valid', path: `${base}/csar.zip`, key: 'public'})
    })

    it('invalid signature', async () => {
        const error = await failure(() =>
            Controller.templates.import({template: 'link-tampered', path: `${base}/tampered.zip`, key: 'public'})
        )
        expect(error?.message).to.equal('Signature not valid')
    })

    it('missing signature', async () => {
        const error = await failure(() =>
            Controller.templates.import({template: 'link-unsigned', path: `${base}/unsigned.zip`, key: 'public'})
        )
        expect(error?.message).to.equal('Request failed with status code 404')
    })

    it('directory', async () => {
        const directory = files.temporaryDirent()
        files.createDirectory(directory)
        const error = await failure(() =>
            Controller.templates.import({template: 'directory', path: directory, key: 'public'})
        )
        expect(error?.message).to.equal('Signature verification is only supported for archives')
    })
})

async function failure(fn: () => Promise<unknown>) {
    try {
        await fn()
    } catch (e) {
        return e as Error
    }
}
