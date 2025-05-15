import configurators from '#/configurators'
import * as check from '#check'
import {PERFORMANCE_RESOLVER_READ} from '#controller/study/performance'
import {InputAssignmentMap} from '#spec/topology-template'
import * as utils from '#utils'
import performance from '#utils/performance'
import * as _ from 'lodash'
import process from 'process'

export default class Inputs {
    inputs: InputAssignmentMap = {}

    async loadInputs(file?: string) {
        const inputs = utils.getPrefixedEnv('OPENTOSCA_VINTNER_VARIABILITY_INPUT_')

        if (check.isDefined(file)) {
            performance.start(PERFORMANCE_RESOLVER_READ)
            const configurator = configurators.get(file)
            const data = await configurator.load(file)
            performance.stop(PERFORMANCE_RESOLVER_READ)
            _.merge(inputs, data)
        }

        return inputs
    }

    loadPresets(presets: string[] = []): string[] {
        if (utils.isEmpty(presets)) {
            const entry = Object.entries(process.env).find(it => it[0] === 'OPENTOSCA_VINTNER_VARIABILITY_PRESETS')
            if (!check.isDefined(entry)) return []
            if (!check.isDefined(entry[1])) return []
            return utils.looseParse(entry[1])
        }
        return presets
    }

    setInputs(inputs?: InputAssignmentMap) {
        if (check.isUndefined(inputs)) return this
        this.inputs = _.merge(this.inputs, inputs)
        return this
    }
}
