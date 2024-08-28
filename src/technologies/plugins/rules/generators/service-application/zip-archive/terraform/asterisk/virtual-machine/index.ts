import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated} from '#technologies/plugins/rules/utils'

// TODO: implement this

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'terraform',
    artifact: 'zip.archive',
    hosting: ['*', 'virtual.machine'],
    weight: 0,
    reasoning: 'Ansible is more specialized. Also using Remote-Exec Executor is a "last resort".',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {},
        }
    },
}

export default generator
