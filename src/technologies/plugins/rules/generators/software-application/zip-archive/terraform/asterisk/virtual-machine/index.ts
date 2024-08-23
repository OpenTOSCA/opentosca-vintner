import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated, OpenstackMachineCredentials, OpenstackMachineHost} from '#technologies/plugins/rules/utils'

// TODO: next: implement this

/**
 * create application directory
 * copy deployment artifact
 * extract deployment artifact
 * create vintner directory
 *
 * create env
 *
 * copy create
 * call create with env
 *
 * copy configure
 * call configure with env
 *
 * assert start
 * copy start
 * call start with env
 */

/**
 * assert stop
 * copy stop
 * call stop with env
 *
 * copy delete
 * call delete with env
 *
 * delete application directory
 */

const generator: ImplementationGenerator = {
    component: 'software.application',
    technology: 'terraform',
    artifact: 'zip.archive',
    hosting: ['*', 'virtual.machine'],
    weight: 0,
    comment: 'Ansible is more specialized. Also using Remote-Exec Executor is a "last resort".',

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
