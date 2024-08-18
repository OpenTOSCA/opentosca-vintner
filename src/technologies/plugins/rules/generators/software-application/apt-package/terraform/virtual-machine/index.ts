import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated} from '#technologies/plugins/rules/utils'

// TODO: next: implement this

const generator: ImplementationGenerator = {
    component: 'software.application',
    technology: 'terraform',
    artifact: 'apt.package',
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
