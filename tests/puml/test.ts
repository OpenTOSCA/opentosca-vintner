import Controller from '#controller'
import * as files from '#files'
import {expect} from 'chai'
import * as path from 'path'

describe('puml', () => {
    it('topology', async () => {
        const input = path.join(__dirname, 'topology', 'service-template.yaml')
        const output = files.temporaryDirent('service-template.topology.puml')

        await Controller.template.puml.topology({path: input, output})

        const result = files.loadFile(output)
        const expected = files.loadFile(path.join(__dirname, 'topology', 'service-template.topology.puml'))
        expect(result).to.equal(expected)
    })

    it('types', async () => {
        const input = path.join(__dirname, 'types', 'service-template.yaml')
        const output = files.temporaryDirent()
        files.createDirectory(output)

        await Controller.template.puml.types({path: input, output})

        const result = files.loadFile(path.join(output, 'service-template.node-types.puml'))
        const expected = files.loadFile(path.join(__dirname, 'types', 'service-template.node-types.puml'))
        expect(result).to.equal(expected)
    })
})
