import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {KubernetesCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils'

// TODO: implement this

/**
 * Official Kubernetes provider does not provide "kubectl exec", https://registry.terraform.io/providers/hashicorp/kubernetes
 */

// use jobs?
// use https://registry.terraform.io/modules/magnolia-sre/kubectl-cmd/kubernetes/latest

// use https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/ ?

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'terraform',
    hosting: ['mysql.dbms', 'kubernetes.cluster'],
    weight: 0,
    reasoning: 'Ansible is more specialized.',

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
