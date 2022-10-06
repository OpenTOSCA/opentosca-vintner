import * as files from '../../src/utils/files'
import path from 'path'
import * as util from 'util'

it('feature-ide', async () => {
    type FeatureIDESelection = {
        automatic?: 'undefined' | 'selected'
        manual?: 'undefined' | 'selected'
        name: string
    }

    type FeatureIDEConfiguration = {
        extendedConfiguration: {
            feature: {
                $: FeatureIDESelection
            }[]
        }
    }

    const data = await files.loadXML<FeatureIDEConfiguration>(path.join(__dirname, './configuration.xml'))
    console.log(util.inspect(data, false, null))

    const inputs: {[key: string]: boolean} = {}
    data.extendedConfiguration.feature.forEach(f => (inputs[f.$.name] = true))
    console.log(inputs)
})
