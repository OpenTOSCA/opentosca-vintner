import Controller from '#controller'
import * as files from '#files'
import path from 'path'

describe('crypto', () => {
    it('sign-verify', async () => {
        const template = path.join(__dirname, 'csar.zip')
        const key = {
            private: path.join(__dirname, 'private.pem'),
            public: path.join(__dirname, 'public.pem'),
        }
        const signature = files.temporary()

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

        await files.deleteFile(signature)
    })
})
