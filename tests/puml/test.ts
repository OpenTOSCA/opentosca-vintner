import Controller from '#controller'
import * as files from '#files'
import {expect} from 'chai'
import * as path from 'path'

describe('puml', () => {
    it('generate puml', async () => {
        const input = path.join(__dirname, 'service-template.yaml')
        const output = files.temporary('service-template.puml')

        await Controller.template.puml({path: input, output: output})

        const result = files.loadFile(output)
        const expected = files.loadFile(path.join(__dirname, 'service-template.puml'))
        expect(result).to.equal(expected)
    })
})
