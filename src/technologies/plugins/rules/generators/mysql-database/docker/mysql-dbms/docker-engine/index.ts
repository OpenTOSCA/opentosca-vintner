import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated, MetadataUnfurl, OpenstackMachineCredentials} from '#technologies/plugins/rules/utils'

// TODO:  mysql.database::docker::mysql.dbms::docker.engine

const generator: ImplementationGenerator = {
    id: 'mysql.database::docker::mysql.dbms::docker.engine',
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
