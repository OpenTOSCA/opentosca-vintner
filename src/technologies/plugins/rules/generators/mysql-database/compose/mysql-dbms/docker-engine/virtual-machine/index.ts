import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated, MetadataUnfurl, OpenstackMachineCredentials} from '#technologies/plugins/rules/utils'

// TODO: implement this

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'compose',
    hosting: ['mysql.dbms', 'docker.engine', 'virtual.machine'],
    weight: 0,
    comment:
        'One-time use docker container ("fake Kubernetes job") with imperative parts, while declarative other technologies provide declarative modules.',

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
