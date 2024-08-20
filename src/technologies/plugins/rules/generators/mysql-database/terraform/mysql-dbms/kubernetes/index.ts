import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {KubernetesCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils'

// TODO: next: implement this

/**
 * Official Kubernetes provider does not provide "kubectl exec", https://registry.terraform.io/providers/hashicorp/kubernetes
 */

// use jobs?
// use https://registry.terraform.io/modules/magnolia-sre/kubectl-cmd/kubernetes/latest

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'terraform',
    hosting: ['mysql.dbms', 'kubernetes.cluster'],
    weight: 0,
    comment: 'Ansible is more specialized.',

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
