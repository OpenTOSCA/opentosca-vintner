import {Instance} from '#repository/instances'
import {Orchestrator} from '#repository/orchestrators'
import {joinNotNull} from '#utils'
import {Shell} from '#shell'

export type OperaConfig = (OperaNativeConfig & {wsl: false}) | (OperaWLSConfig & {wsl: true})

export type OperaNativeConfig = {
    venv: boolean
    dir: string
}

export type OperaWLSConfig = OperaNativeConfig

export class Opera implements Orchestrator {
    private readonly config: OperaConfig
    private readonly binary: string
    private readonly shell: Shell

    constructor(config: OperaConfig) {
        this.config = config
        this.binary = joinNotNull(
            [
                this.config.venv ? `cd ${this.config.dir}` : undefined,
                this.config.venv ? '. .venv/bin/activate' : undefined,
                'opera',
            ],
            ' && '
        )
        this.shell = new Shell(config.wsl)
    }

    async deploy(instance: Instance) {
        const command = [
            this.binary,
            'deploy',
            this.shell.resolve(instance.getServiceTemplatePath()),
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
        ]

        if (instance.hasServiceInput()) command.push('--inputs', this.shell.resolve(instance.getServiceInputPath()))
        await this.shell.execute(command)
    }

    async update(instance: Instance) {
        const command = [
            this.binary,
            'update',
            this.shell.resolve(instance.getServiceTemplatePath()),
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
        ]
        if (instance.hasServiceInput()) command.push('--inputs', this.shell.resolve(instance.getServiceInputPath()))

        await this.shell.execute(command)
    }

    async undeploy(instance: Instance) {
        await this.shell.execute([
            this.binary,
            'undeploy',
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
            '--resume',
            '--force',
        ])
    }
}
