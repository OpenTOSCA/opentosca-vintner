import * as files from '../../src/utils/files'
import path from 'path'
import {expect} from 'chai'

it('feature-ide', async () => {
    const result = await files.loadFeatureIDEConfiguration(path.join(__dirname, './inputs.xml'))
    expect(result).to.deep.equal({
        model: true,
        feature_a: true,
        feature_a_attr_overridden: 1,
        feature_a_attr_string: 'hello world',
        feature_a_attr_double: 2.5,
        feature_a_attr_bool_true: true,
        feature_a_attr_bool_false: false,
        feature_b: true,
        feature_b_attr_long: 3,
        feature_c: true,
        feature_overridden: true,
    })
})
