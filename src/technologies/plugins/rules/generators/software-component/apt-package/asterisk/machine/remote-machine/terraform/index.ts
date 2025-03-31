import {NodeType} from '#spec/node-type'
import {
    BashSoftwareApplicationAptPackageCreate,
    BashSoftwareApplicationAptPackageDelete,
    BashSoftwareApplicationConfigure,
    BashSoftwareApplicationDelete,
    BashSoftwareApplicationStart,
    BashSoftwareApplicationStop,
} from '#technologies/plugins/rules/generators/software-component/utils'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {TerraformSSHConnection, TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    ApplicationDirectory,
    MetadataGenerated,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'
import * as utils from '#utils'

class Generator extends GeneratorAbstract {
    component = 'software.component'
    technology = 'terraform'
    artifact = 'apt.package'
    hosting = ['*', 'remote.machine']
    weight = 0
    reason = 'Ansible is more specialized. Also using provisioners is a "last resort".'

    generate(name: string, type: NodeType) {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {
                ...OpenstackMachineCredentials(),
                ...OpenstackMachineHost(),
                ...ApplicationDirectory(),
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
                                                        content: BashSoftwareApplicationAptPackageCreate({
                                                            name,
                                                            type,
                                                            artifact: this.artifact,
                                                        }),
                                                        destination: `/tmp/create-${name}.sh`,
                                                    },
                                                    {
                                                        content: BashSoftwareApplicationConfigure(),
                                                        destination: `/tmp/configure-${name}.sh`,
                                                    },
                                                    {
                                                        content: BashSoftwareApplicationStart({assert: false}),
                                                        destination: `/tmp/start-${name}.sh`,
                                                    },
                                                    {
                                                        content: BashSoftwareApplicationStop({assert: false}),
                                                        destination: `/tmp/stop-${name}.sh`,
                                                    },
                                                    {
                                                        content: utils.concat([
                                                            BashSoftwareApplicationDelete(),
                                                            BashSoftwareApplicationAptPackageDelete(),
                                                        ]),
                                                        destination: `/tmp/delete-${name}.sh`,
                                                    },
                                                ],
                                                'remote-exec': [
                                                    {
                                                        inline: [
                                                            `sudo bash /tmp/create-${name}.sh`,
                                                            `sudo bash /tmp/configure-${name}.sh`,
                                                            `sudo bash /tmp/start-${name}.sh`,
                                                        ],
                                                    },
                                                    {
                                                        inline: [
                                                            `sudo bash /tmp/stop-${name}.sh`,
                                                            `sudo bash /tmp/delete-${name}.sh`,
                                                        ],
                                                        when: 'destroy',
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
    }
}

export default new Generator()
