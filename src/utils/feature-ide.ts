import {InputAssignmentMap} from '../specification/topology-template'
import * as validator from './validator'
import * as files from './files'
import * as utils from './utils'

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

export async function loadConfiguration(file: string): Promise<InputAssignmentMap> {
    const data = await files.loadXML<Configuration>(file)

    const result: InputAssignmentMap = {}
    data.extendedConfiguration.feature?.forEach(feature => {
        const originalFeatureName = utils.normalizeString(feature.$.name)
        const overrideFeatureName = feature.attribute?.find(attribute => attribute.$.name === '__name')?.$.value

        const effectiveFeatureName = validator.isDefined(overrideFeatureName)
            ? utils.normalizeString(overrideFeatureName)
            : originalFeatureName
        result[effectiveFeatureName] = feature.$.automatic === 'selected' || feature.$.manual === 'selected'

        feature.attribute
            ?.filter(attribute => !attribute.$.name.startsWith('__'))
            .forEach(attribute => {
                const originalAttributeName = utils.normalizeString(attribute.$.name)

                const overrideAttributeName = feature.attribute?.find(
                    attribute => attribute.$.name === `__name_${originalAttributeName}`
                )?.$.value

                const fullOverrideAttributeName = feature.attribute?.find(
                    attribute => attribute.$.name === `__full_name_${originalAttributeName}`
                )?.$.value

                const effectiveAttributeName = utils.normalizeString(
                    fullOverrideAttributeName ||
                        `${effectiveFeatureName}_${overrideAttributeName || originalAttributeName}`
                )

                let value = attribute.$.value
                try {
                    value = JSON.parse(value)
                } catch (e) {
                    // Ignore
                    // Value will be treated as string
                }

                result[effectiveAttributeName] = value
            })
    })

    return result
}
