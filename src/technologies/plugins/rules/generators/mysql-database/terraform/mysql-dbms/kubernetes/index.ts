import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {KubernetesCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils'

// TODO: implement this

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'terraform',
    hosting: ['mysql.dbms', 'kubernetes.cluster'],
    weight: 1,
    comment: 'Terraform provides a declarative module.',

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
