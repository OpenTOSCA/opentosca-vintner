import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    weight: 0,
    component: 'service.component',
    technology: 'ansible',
    artifact: 'zip.archive',
    hosting: ['remote.machine'],

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {},
        }
    },
}

export default generator
