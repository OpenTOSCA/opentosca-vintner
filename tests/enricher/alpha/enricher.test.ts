import Controller from '#controller'
import * as files from '#files'
import {expect} from 'chai'
import path from 'path'

// TODO: more enricher tests

describe('enricher', () => {
    it('test', async () => {
        const output = files.temporary()

        await Controller.template.enrich({template: path.join(__dirname, 'template.yaml'), output})

        const result = await files.loadYAML(path.join(output))

        expect(result).to.deep.equal(await files.loadYAML(path.join(__dirname, 'expected.yaml')))
    })
})
