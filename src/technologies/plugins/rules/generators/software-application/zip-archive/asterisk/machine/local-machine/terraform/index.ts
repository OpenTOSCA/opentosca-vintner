import {NodeType} from '#spec/node-type'
import {
    BashSoftwareApplicationConfigure,
    BashSoftwareApplicationDelete,
    BashSoftwareApplicationSourceArchiveCreate,
    BashSoftwareApplicationStart,
    BashSoftwareApplicationStop,
} from '#technologies/plugins/rules/generators/software-application/utils'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    ApplicationDirectory,
    JinjaWhenSourceArchiveFile,
    MetadataGenerated,
    SourceArchiveFile,
} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'software.application'
    technology = 'terraform'
    artifact = 'zip.archive'
    hosting = ['*', 'local.machine']
    weight = 0
    reason = 'Ansible is more specialized. Also using provisioners is a "last resort".'
    details = '"local_file" module to create scripts and artifacts and "local-exec" provisioner to execute scripts.'

    generate(name: string, type: NodeType) {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {
                ...ApplicationDirectory(),
            },
            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            resource: {
                                local_file: {
                                    tmp_artifact: {
                                        source: SourceArchiveFile(this.artifact),
                                        filename: `/tmp/artifact-${name}`,
                                        count: `{{ (${JinjaWhenSourceArchiveFile(this.artifact)}) | ternary(1, 0) }}`,
                                    },
                                    tmp_create: {
                                        content: BashSoftwareApplicationSourceArchiveCreate({
                                            name,
                                            type,
                                            artifact: this.artifact,
                                        }),
                                        filename: `/tmp/create-${name}.sh`,
                                    },
                                    tmp_configure: {
                                        content: BashSoftwareApplicationConfigure(),
                                        filename: `/tmp/configure-${name}.sh`,
                                    },
                                    tmp_start: {
                                        content: BashSoftwareApplicationStart(),
                                        filename: `/tmp/start-${name}.sh`,
                                    },
                                    tmp_stop: {
                                        content: BashSoftwareApplicationStop(),
                                        filename: `/tmp/stop-${name}.sh`,
                                    },
                                    tmp_delete: {
                                        content: BashSoftwareApplicationDelete(),
                                        filename: `/tmp/delete-${name}.sh`,
                                    },
                                },
                                terraform_data: {
                                    local: [
                                        {
                                            depends_on: [
                                                'local_file.tmp_artifact',
                                                'local_file.tmp_create',
                                                'local_file.tmp_configure',
                                                'local_file.tmp_start',
                                                'local_file.tmp_stop',
                                                'local_file.tmp_delete',
                                            ],
                                            provisioner: {
                                                'local-exec': [
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
