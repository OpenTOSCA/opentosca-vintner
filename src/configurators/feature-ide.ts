import {Configurator} from '#configurators/index'
import * as files from '#files'
import {InputAssignmentMap} from '#spec/topology-template'
import * as utils from '#utils'

type Feature = {
    automatic?: 'undefined' | 'selected'
    manual?: 'undefined' | 'selected'
    name: string
}

type Attribute = {
    name: string
    value: string
}

type Configuration = {
    extendedConfiguration: {
        feature?: {
            $: Feature
            attribute?: {
                $: Attribute
            }[]
        }[]
    }
}

export default class FeatureIDE implements Configurator {
    async load(file: string): Promise<InputAssignmentMap> {
        const data = await files.loadXML<Configuration>(file)

        const result: InputAssignmentMap = {}
        data.extendedConfiguration.feature?.forEach(feature => {
            const originalFeatureName = utils.normalizeString(feature.$.name)
            const overrideFeatureName = feature.attribute?.find(attribute => attribute.$.name === '__name')?.$.value

            const effectiveFeatureName = overrideFeatureName ?? originalFeatureName
            result[effectiveFeatureName] = feature.$.automatic === 'selected' || feature.$.manual === 'selected'

            feature.attribute
                ?.filter(attribute => !attribute.$.name.startsWith('__'))
                .forEach(attribute => {
                    const originalAttributeName = utils.normalizeString(attribute.$.name)

                    const overrideAttributeName = feature.attribute?.find(
                        it => it.$.name === `__name_${originalAttributeName}`
                    )?.$.value

                    const fullOverrideAttributeName = feature.attribute?.find(
                        it => it.$.name === `__full_name_${originalAttributeName}`
                    )?.$.value

                    const effectiveAttributeName = utils.normalizeString(
                        fullOverrideAttributeName ??
                            `${effectiveFeatureName}_${overrideAttributeName ?? originalAttributeName}`
                    )

                    result[effectiveAttributeName] = utils.looseParse(attribute.$.value)
                })
        })

        return result
    }
}
