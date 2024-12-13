import {BashIngressInstallationScript} from '#technologies/plugins/rules/generators/ingress/machine/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformSSHConnection, TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'ingress',
    technology: 'terraform',
    hosting: ['remote.machine'],
    weight: 0,

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...OpenstackMachineCredentials(), ...OpenstackMachineHost()},
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
                                terraform_data: {
                                    vm: [
                                        {
                                            connection: [
                                                {
                                                    ...TerraformSSHConnection(),
                                                },
                                            ],
                                            provisioner: {
                                                file: [
                                                    {
                                                        content: BashIngressInstallationScript,
                                                        destination: '/tmp/install-ingress.sh',
                                                    },
                                                ],
                                                'remote-exec': [
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
