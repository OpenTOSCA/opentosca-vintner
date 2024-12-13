import {BashIngressInstallationScript} from '#technologies/plugins/rules/generators/ingress/machine/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'ingress',
    technology: 'terraform',
    hosting: ['local.machine'],
    weight: 0,

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: {eval: '.::.requirements::[.name=host]::.target::application_address'},
                },
            },
            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            resource: {
                                local_file: {
                                    tmp_script: {
                                        content: BashIngressInstallationScript,
                                        destination: '/tmp/install-ingress.sh',
                                    },
                                },
                                terraform_data: {
                                    local: [
                                        {
                                            depends_on: ['local_file.tmp_script'],
                                            provisioner: {
                                                'local-exec': [
                                                    {
                                                        inline: ['sudo bash /tmp/install-ingress.sh'],
                                                    },
                                                ],
                                            },
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
