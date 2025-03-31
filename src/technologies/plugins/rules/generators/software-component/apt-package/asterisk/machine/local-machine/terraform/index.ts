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
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {ApplicationDirectory, MetadataGenerated} from '#technologies/plugins/rules/utils/utils'
import * as utils from '#utils'

class Generator extends GeneratorAbstract {
    component = 'software.component'
    technology = 'terraform'
    artifact = 'apt.package'
    hosting = ['*', 'local.machine']
    weight = 0
    reason = 'Ansible is more specialized. Also using provisioners is a "last resort".'

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
                                    tmp_create: {
                                        content: BashSoftwareApplicationAptPackageCreate({
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
                                        content: BashSoftwareApplicationStart({assert: false}),
                                        filename: `/tmp/start-${name}.sh`,
                                    },
                                    tmp_stop: {
                                        content: BashSoftwareApplicationStop({assert: false}),
                                        filename: `/tmp/stop-${name}.sh`,
                                    },
                                    tmp_delete: {
                                        content: utils.concat([
                                            BashSoftwareApplicationDelete(),
                                            BashSoftwareApplicationAptPackageDelete(),
                                        ]),
                                        filename: `/tmp/delete-${name}.sh`,
                                    },
                                },
                                terraform_data: {
                                    local: [
                                        {
                                            provisioner: {
                                                depends_on: [
                                                    'local_file.tmp_artifact',
                                                    'local_file.tmp_create',
                                                    'local_file.tmp_configure',
                                                    'local_file.tmp_start',
                                                    'local_file.tmp_stop',
                                                    'local_file.tmp_delete',
                                                ],
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
