import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated, OpenstackMachineCredentials, OpenstackMachineHost} from '#technologies/plugins/rules/utils'

// TODO: next: implement this

const generator: ImplementationGenerator = {
    component: 'software.application',
    technology: 'terraform',
    artifact: 'zip.archive',
    hosting: ['*', 'virtual.machine'],
    weight: 0,
    reason: 'Ansible is more specialized. Also using Remote-Exec Executor is a "last resort".',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {
                ...OpenstackMachineCredentials(),
                ...OpenstackMachineHost(),
            },
        }
    },
}

export default generator
