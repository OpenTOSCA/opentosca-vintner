import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {KubernetesCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils'

// TODO: mysql.database::terraform::mysql.dbms::kubernetes

const generator: ImplementationGenerator = {
    id: 'mysql.database::terraform::mysql.dbms::kubernetes',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...KubernetesCredentials(),
            },
        }
    },
}

export default generator
