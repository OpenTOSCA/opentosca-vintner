import * as files from '#files'
import {expect} from 'chai'
import path from 'path'
import Controller from '../../src/controller'

describe('feature-id', () => {
    it('xml', async () => {
        const result = await Controller.template.inputs({path: path.join(__dirname, 'inputs.xml')})
        expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'inputs.yaml')))
    })
})
