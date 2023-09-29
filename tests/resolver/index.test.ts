import * as files from '#files'
import Resolver from '#resolver'
import {expect} from 'chai'

describe('resolver', () => {
    it('load inputs', async () => {
        process.env.OPENTOSCA_VINTNER_VARIABILITY_INPUT_VARIABILITY_INPUT_ONE = 'variability_value_one'

        const inputs = files.temporary()
        files.storeYAML(inputs, {
            variability_input_one: 1,
            variability_input_two: 'variability_value_two',
        })

        const result = await Resolver.loadInputs(inputs)
        expect(result['variability_input_one']).to.equal(1)
        expect(result['variability_input_two']).to.equal('variability_value_two')

        delete process.env.OPENTOSCA_VINTNER_VARIABILITY_INPUT_VARIABILITY_INPUT_ONE
    })

    it('load presets: env', async () => {
        process.env.OPENTOSCA_VINTNER_VARIABILITY_PRESETS = JSON.stringify([
            'variability_preset_one',
            'variability_preset_two',
        ])

        const result = Resolver.loadPresets()
        expect(result[0]).to.equal('variability_preset_one')
        expect(result[1]).to.equal('variability_preset_two')

        delete process.env.OPENTOSCA_VINTNER_VARIABILITY_PRESETS
    })

    it('load presets: override', async () => {
        process.env.OPENTOSCA_VINTNER_VARIABILITY_PRESETS = JSON.stringify([
            'variability_preset_one',
            'variability_preset_two',
        ])

        const result = Resolver.loadPresets(['variability_preset_three'])
        expect(result.length).to.equal(1)
        expect(result[0]).to.equal('variability_preset_three')

        delete process.env.OPENTOSCA_VINTNER_VARIABILITY_PRESETS
    })
})
