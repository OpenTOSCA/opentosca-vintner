import * as files from '#files'
import * as featureIDE from '#utils/feature-ide'
import {expect} from 'chai'
import path from 'path'

describe('feature-id', () => {
    it('xml', async () => {
        const result = await featureIDE.loadConfiguration(path.join(__dirname, 'inputs.xml'))
        expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'inputs.yaml')))
    })
})
