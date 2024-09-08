import {NodeType} from '#spec/node-type'
import {
    BashSoftwareApplicationConfigure,
    BashSoftwareApplicationDelete,
    BashSoftwareApplicationSourceArchiveCreate,
    BashSoftwareApplicationStart,
    BashSoftwareApplicationStop,
} from '#technologies/plugins/rules/generators/software-application/utils'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {TerraformSSHConnection, TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    ApplicationDirectory,
    JinjaWhenSourceArchiveFile,
    MetadataGenerated,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
    SourceArchiveFile,
} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'software.application'
    technology = 'terraform'
    artifact = 'tar.archive'
    hosting = ['*', 'remote.machine']
    weight = 0
    reason = 'Ansible is more specialized. Also using provisioners is a "last resort".'
    details = '"file" provisioner to upload artifacts and scripts and "remote-exec" to execute scripts'

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
                                                        source: SourceArchiveFile(this.artifact),
                                                        destination: `/tmp/artifact-${name}`,
                                                        count: `{{ (${JinjaWhenSourceArchiveFile(
                                                            this.artifact
                                                        )}) | ternary(1, 0) }}`,
                                                    },
                                                    {
                                                        content: BashSoftwareApplicationSourceArchiveCreate({
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
                                                        content: BashSoftwareApplicationStart(),
                                                        destination: `/tmp/start-${name}.sh`,
                                                    },
                                                    {
                                                        content: BashSoftwareApplicationStop(),
                                                        destination: `/tmp/stop-${name}.sh`,
                                                    },
                                                    {
                                                        content: BashSoftwareApplicationDelete(),
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
