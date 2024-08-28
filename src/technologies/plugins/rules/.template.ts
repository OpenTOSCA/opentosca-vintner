import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    reasoning: '',
    weight: 0,
    component: 'service.application',
    technology: 'ansible',
    artifact: 'zip.archive',
    hosting: ['virtual.machine'],

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {},
        }
    },
}

export default generator
