import path from 'path'
import {expect} from 'chai'
import * as featureIDE from '../src/utils/feature-ide'
import * as files from '../src/utils/files'

it('feature-ide', async () => {
    const result = await featureIDE.loadConfiguration(path.join(__dirname, 'feature-ide', 'inputs.xml'))
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'feature-ide', 'inputs.yaml')))
})
