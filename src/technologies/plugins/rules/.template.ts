import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'ansible',
    artifact: 'source.archive',
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
