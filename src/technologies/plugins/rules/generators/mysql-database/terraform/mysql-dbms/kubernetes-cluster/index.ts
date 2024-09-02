import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {KubernetesCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils'

// TODO: next: implement this

/**
 * Official Kubernetes provider does not provide "kubectl exec", https://registry.terraform.io/providers/hashicorp/kubernetes
 */

// use jobs?
// use https://registry.terraform.io/modules/magnolia-sre/kubectl-cmd/kubernetes/latest

// use https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/ ?

// https://github.com/hashicorp/terraform-provider-kubernetes/issues/812

// https://www.reddit.com/r/Terraform/comments/nj06y5/need_to_do_kubectl_portforward_in_the_middle_of

// https://stackoverflow.com/questions/67650339/is-it-possible-to-run-kubectl-port-forward-in-terraform-null-resource-block

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'terraform',
    hosting: ['mysql.dbms', 'kubernetes.cluster'],
    weight: 0,
    reason: 'Ansible is more specialized.',

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
