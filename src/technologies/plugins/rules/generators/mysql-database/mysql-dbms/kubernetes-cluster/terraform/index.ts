import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    BASH_KUBECTL,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils/utils'

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
    weight: 0.25,

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
            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            mysql: {
                                                source: 'petoju/mysql',
                                                version: '3.0.48',
                                            },
                                        },
                                    ],
                                },
                            ],
                            provider: {
                                mysql: [
                                    {
                                        endpoint: '${terraform_data.forward_port.input}',
                                        password: '{{ HOST.dbms_password }}',
                                        username: 'root',
                                    },
                                ],
                            },
                            resource: {
                                terraform_data: {
                                    forward_port: [
                                        {
                                            input: '127.0.0.1:23306',
                                            provisioner: {
                                                'local-exec': {
                                                    command: [
                                                        `(nohup ${BASH_KUBECTL} port-forward service/{{ HOST.dbms_name }} 23306:3306 > /dev/null 2>&1 &)`,
                                                        'sleep 5s',
                                                    ].join('\n'),
                                                    interpreter: ['/bin/bash', '-c'],
                                                },
                                            },
                                        },
                                    ],
                                    unforward_port: [
                                        {
                                            depends_on: ['mysql_grant.user'],
                                            provisioner: {
                                                'local-exec': {
                                                    command: `pkill -f "port-forward service/{{ HOST.dbms_name }}"`,
                                                    interpreter: ['/bin/bash', '-c'],
                                                },
                                            },
                                        },
                                    ],
                                },
                                mysql_database: {
                                    database: [
                                        {
                                            name: '{{ SELF.database_name }}',
                                        },
                                    ],
                                },
                                mysql_user: {
                                    user: [
                                        {
                                            host: '%',
                                            plaintext_password: '{{ SELF.database_password }}',
                                            user: '{{ SELF.database_user }}',
                                        },
                                    ],
                                },
                                mysql_grant: {
                                    user: [
                                        {
                                            database: '{{ SELF.database_name }}',
                                            host: '%',
                                            table: '*',
                                            privileges: ['ALL'],
                                            user: '${mysql_user.user.user}',
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        }
    },
}

export default generator
