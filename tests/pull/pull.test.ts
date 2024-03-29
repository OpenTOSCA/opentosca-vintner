import Controller from '#controller'
import * as files from '#files'
import {expect} from 'chai'
import path from 'path'

describe('pull', () => {
    it('pull', async () => {
        const file = path.join(__dirname, 'template', 'lib', 'file.yaml')
        expect(files.exists(file), 'File already exists ...').to.be.false

        await Controller.template.pull({dir: path.join(__dirname, 'template')})

        expect(files.exists(file), 'File does not exists ...').to.be.true

        files.removeDirectory(path.join(__dirname, 'template', 'lib'))
    })
})
