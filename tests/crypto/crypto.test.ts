import Controller from '#controller'
import * as files from '#files'
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
