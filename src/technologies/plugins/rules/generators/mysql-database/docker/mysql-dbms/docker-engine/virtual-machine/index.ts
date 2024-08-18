import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated, MetadataUnfurl, OpenstackMachineCredentials} from '#technologies/plugins/rules/utils'

// TODO: implement this

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'docker',
    hosting: ['mysql.dbms', 'docker.engine', 'virtual.machine'],

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
            },
        }
    },
}

export default generator
